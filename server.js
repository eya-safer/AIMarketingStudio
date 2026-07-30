require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { generateImage } = require('./src/services/replicateService');
const { generatePostCopy } = require('./src/services/geminiService');

const app = express();
const PORT = process.env.PORT || 3000;

// =========================================================
// PERSISTENT JSON STORAGE (NO NATIVE BUILD NEEDED)
// =========================================================
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

function loadStore() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const initialStore = { users: [], products: [], history: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialStore, null, 2));
    return initialStore;
  }

  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (error) {
    console.warn('⚠️  Store file was invalid, resetting it.');
    const freshStore = { users: [], products: [], history: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(freshStore, null, 2));
    return freshStore;
  }
}

function saveStore(store) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

let store = loadStore();

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function getUserById(userId) {
  return store.users.find((user) => user.id === Number(userId)) || null;
}

function getUserByEmail(email) {
  return store.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase()) || null;
}

function createUser({ full_name, email, password_hash }) {
  const user = {
    id: nextId(store.users),
    full_name,
    email: email.toLowerCase(),
    password_hash,
    created_at: new Date().toISOString()
  };
  store.users.push(user);
  saveStore(store);
  return user;
}

function listProductsByUser(userId) {
  return store.products
    .filter((product) => product.user_id === Number(userId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function createProduct({ user_id, name, brand, category, image_path }) {
  const product = {
    id: nextId(store.products),
    user_id: Number(user_id),
    name,
    brand,
    category,
    image_path,
    created_at: new Date().toISOString()
  };
  store.products.push(product);
  saveStore(store);
  return product;
}

function deleteProduct(productId, userId) {
  const index = store.products.findIndex((product) => product.id === Number(productId) && product.user_id === Number(userId));
  if (index === -1) return false;
  const [removed] = store.products.splice(index, 1);
  saveStore(store);
  return removed;
}

function listHistoryByUser(userId, typeFilter) {
  let items = store.history.filter((item) => item.user_id === Number(userId));
  if (typeFilter && typeFilter !== 'all') {
    const normalized = typeFilter === 'images' ? 'image' : 'post';
    items = items.filter((item) => item.type === normalized);
  }
  return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function createHistory({ user_id, type, title, prompt, preview_path, content, status = 'Completed' }) {
  const item = {
    id: nextId(store.history),
    user_id: Number(user_id),
    type,
    title,
    prompt: prompt || '',
    preview_path: preview_path || '',
    content: content || '',
    status,
    created_at: new Date().toISOString()
  };
  store.history.push(item);
  saveStore(store);
  return item;
}

function deleteHistory(historyId, userId) {
  const index = store.history.findIndex((item) => item.id === Number(historyId) && item.user_id === Number(userId));
  if (index === -1) return false;
  store.history.splice(index, 1);
  saveStore(store);
  return true;
}

function getAnalytics(userId) {
  const userHistory = listHistoryByUser(userId);
  const monthly = [];
  const map = new Map();

  userHistory.forEach((item) => {
    const month = item.created_at.slice(0, 7);
    if (!map.has(month)) {
      map.set(month, { month, images: 0, posts: 0 });
    }
    const entry = map.get(month);
    if (item.type === 'image') entry.images += 1;
    if (item.type === 'post') entry.posts += 1;
  });

  Array.from(map.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-7)
    .forEach((entry) => monthly.push(entry));

  const categories = Object.entries(
    store.products
      .filter((product) => product.user_id === Number(userId))
      .reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {})
  ).map(([category, count]) => ({ category, count }));

  return { monthly, categories };
}

console.log('✅ Local data store initialized.');

// =========================================================
// MIDDLEWARE
// =========================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'ai-marketing-studio-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    secure: false,
    sameSite: 'lax'
  }
}));

// Auth guard middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    // For API routes return JSON 401 so client-side fetch gets JSON
    if (req.path && req.path.startsWith('/api/')) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    return res.redirect('/auth');
  }
  next();
};

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'assets', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer config for product image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// =========================================================
// PAGE ROUTES
// =========================================================

// Landing page
app.get('/', (req, res) => {
  const user = req.session.userId ? getUserById(req.session.userId) : null;
  res.render('landing', { user });
});

// Auth page (Login / Register combined)
app.get('/auth', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('auth', { error: null, success: null, tab: 'login' });
});

// Dashboard (protected)
app.get('/dashboard', requireAuth, (req, res) => {
  const user = getUserById(req.session.userId);
  if (!user) { req.session.destroy(); return res.redirect('/auth'); }

  const products = listProductsByUser(user.id);
  const history = listHistoryByUser(user.id).slice(0, 50);
  const stats = {
    productsCount: products.length,
    imagesCount: history.filter((item) => item.type === 'image').length,
    postsCount: history.filter((item) => item.type === 'post').length,
  };

  res.render('dashboard', { user, products, history, stats });
});

// =========================================================
// AUTH ROUTES
// =========================================================

// Register
app.post('/auth/register', async (req, res) => {
  const { full_name, email, password, confirm_password } = req.body;

  if (!full_name || !email || !password) {
    return res.render('auth', { error: 'All fields are required.', success: null, tab: 'register' });
  }
  if (password !== confirm_password) {
    return res.render('auth', { error: 'Passwords do not match.', success: null, tab: 'register' });
  }
  if (password.length < 6) {
    return res.render('auth', { error: 'Password must be at least 6 characters.', success: null, tab: 'register' });
  }

  if (getUserByEmail(email)) {
    return res.render('auth', { error: 'An account with this email already exists.', success: null, tab: 'register' });
  }

  const hash = await bcrypt.hash(password, 12);
  const user = createUser({ full_name, email, password_hash: hash });

  req.session.userId = user.id;
  res.redirect('/dashboard');
});

// Login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = getUserByEmail(email);
  if (!user) {
    return res.render('auth', { error: 'Invalid email or password.', success: null, tab: 'login' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.render('auth', { error: 'Invalid email or password.', success: null, tab: 'login' });
  }

  req.session.userId = user.id;
  res.redirect('/dashboard');
});

// Logout
app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// =========================================================
// API ROUTES - PRODUCTS
// =========================================================

app.get('/api/products', requireAuth, (req, res) => {
  const products = listProductsByUser(req.session.userId);
  res.json({ success: true, products });
});

app.post('/api/products', requireAuth, upload.single('image'), (req, res) => {
  const { name, brand, category } = req.body;
  if (!name || !brand || !category) {
    return res.status(400).json({ success: false, error: 'All fields required.' });
  }
  const image_path = req.file ? `/assets/uploads/${req.file.filename}` : '/assets/perfume.png';
  const product = createProduct({
    user_id: req.session.userId,
    name,
    brand,
    category,
    image_path
  });

  res.json({ success: true, product });
});

app.delete('/api/products/:id', requireAuth, (req, res) => {
  const product = store.products.find((item) => item.id === Number(req.params.id) && item.user_id === Number(req.session.userId));
  if (!product) return res.status(404).json({ success: false, error: 'Product not found.' });

  if (product.image_path && product.image_path.startsWith('/assets/uploads/')) {
    const filePath = path.join(__dirname, 'public', product.image_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  deleteProduct(req.params.id, req.session.userId);
  res.json({ success: true });
});

// =========================================================
// API ROUTES - HISTORY
// =========================================================

app.get('/api/history', requireAuth, (req, res) => {
  const { type } = req.query;
  const history = listHistoryByUser(req.session.userId, type || 'all');
  res.json({ success: true, history });
});

app.post('/api/history', requireAuth, (req, res) => {
  const { type, title, prompt, preview_path, content } = req.body;
  if (!type || !title) return res.status(400).json({ success: false, error: 'type and title required.' });

  const item = createHistory({
    user_id: req.session.userId,
    type,
    title,
    prompt,
    preview_path,
    content
  });

  res.json({ success: true, item });
});

app.delete('/api/history/:id', requireAuth, (req, res) => {
  const removed = deleteHistory(req.params.id, req.session.userId);
  if (!removed) return res.status(404).json({ success: false, error: 'Not found.' });
  res.json({ success: true });
});

// =========================================================
// API ROUTES - ANALYTICS
// =========================================================

app.get('/api/analytics', requireAuth, (req, res) => {
  const { monthly, categories } = getAnalytics(req.session.userId);
  res.json({ success: true, monthly, categories });
});

// =========================================================
// IMAGE GENERATION PROXY (to external Python/StableDiffusion service)
// Set GENERATOR_URL env var to the public base URL of the generator service
// e.g. https://xxxx.ngrok-free.app
// =========================================================
const GENERATOR_URL = process.env.GENERATOR_URL || null;

app.post('/api/generate', requireAuth, async (req, res) => {
  const { prompt, imageDataUrl } = req.body || {};
  if (!imageDataUrl && !prompt) return res.status(400).json({ success: false, error: 'prompt or image required' });

  try {
    let imageBase64;
    let outputUrl = null;

    if (imageDataUrl) {
      const generated = await generateImage(prompt || 'Gemini advertisement generation', { imageDataUrl });
      imageBase64 = generated.base64;
      outputUrl = generated.outputUrl;
    } else {
      const generated = await generateImage(prompt || 'Gemini advertisement generation');
      imageBase64 = generated.base64;
      outputUrl = generated.outputUrl;
    }

    const buffer = Buffer.from(imageBase64, 'base64');
    const filename = `${Date.now()}-${Math.round(Math.random()*1e6)}.png`;
    const savePath = path.join(uploadsDir, filename);
    fs.writeFileSync(savePath, buffer);
    const preview_path = `/assets/uploads/${filename}`;

    const item = createHistory({
      user_id: req.session.userId,
      type: 'image',
      title: `AI Image — ${new Date().toLocaleString()}`,
      prompt: prompt || 'Replicate advertisement generation',
      preview_path,
      content: outputUrl ? `Replicate output: ${outputUrl}` : ''
    });

    res.json({ success: true, item, imageBase64 });
  } catch (err) {
    console.error('Generate proxy error', err);
    res.status(500).json({ success: false, error: err.message || 'Generation failed' });
  }
});

app.post('/api/generate-post', requireAuth, async (req, res) => {
  const { product, platform, language, tone, description } = req.body || {};
  if (!product || !platform || !language || !tone) {
    return res.status(400).json({ success: false, error: 'Missing product, platform, language, or tone.' });
  }

  try {
    const generatedText = await generatePostCopy({ product, platform, language, tone, description });

    res.json({ success: true, generatedText });
  } catch (err) {
    console.error('Generate post error', err);
    res.status(500).json({ success: false, error: err.message || 'Post generation failed' });
  }
});

// =========================================================
// START SERVER
// =========================================================
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, error: 'Request payload too large. Please upload a smaller image or increase the server limit.' });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`\n🚀 AI Marketing Studio running at http://localhost:${PORT}\n`);
});
