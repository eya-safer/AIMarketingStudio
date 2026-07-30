/* AI Marketing Studio - Main Application Controller (Node.js API Version) */
import { initDashboardCharts, initAnalyticsCharts } from './charts.js';
import { GenerationManager } from './generator.js';

// Templates config (static)
const TEMPLATES = [
    { id: 'temp-1', title: 'Luxury Cosmetics', category: 'Cosmetics', image: '/assets/perfume_studio.png', prompt: 'High-end perfume bottle on floating marble, water splash ripples, golden light, orchid flowers background.', style: 'luxury', background: 'marble', lighting: 'golden' },
    { id: 'temp-2', title: 'Modern Tech Concept', category: 'Technology', image: '/assets/headphones.png', prompt: 'Premium wireless headphones with neon geometric shapes, dark matte background, futuristic neon glow.', style: 'technology', background: 'glass', lighting: 'neon' },
    { id: 'temp-3', title: 'Organic Skincare', category: 'Cosmetics', image: '/assets/cream.png', prompt: 'Skincare jar on beige travertine stone, palm leaf shadow, neutral organic plaster background, soft light.', style: 'minimalist', background: 'nature_bg', lighting: 'soft' },
    { id: 'temp-4', title: 'Luxury Watch Chrono', category: 'Fashion', image: '/assets/watch.png', prompt: 'Chronograph steel watch on dark wet slate stone, dramatic neon cyan light, rain droplets, cinematic.', style: 'luxury', background: 'wood', lighting: 'cinematic' }
];

class AppController {
    constructor() {
        // Load server-side data injected by EJS
        const serverData = window.__SERVER_DATA__ || {};
        this.user = serverData.user || {};
        this.products = serverData.products || [];
        this.history = serverData.history || [];
        this.stats = serverData.stats || {};
        this.activeView = 'home';
        this.currentTheme = localStorage.getItem('theme') || 'light';

        this.init();
    }

    init() {
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeToggleUI();

        // Initial renders
        this.renderProducts();
        this.renderHistory('all');
        this.renderTemplates();
        this.renderAnalyticsTable();
        this.populateProductSelectors();

        // Bind all events
        this.bindEvents();

        // Init generation manager
        GenerationManager.init(this);

        // Init home charts
        setTimeout(() => initDashboardCharts(this.history), 100);
    }

    bindEvents() {
        // Sidebar nav routing
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));
                item.classList.add('active');
                this.switchView(item.dataset.view);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
            this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', this.currentTheme);
            localStorage.setItem('theme', this.currentTheme);
            this.updateThemeToggleUI();
            if (this.activeView === 'home') initDashboardCharts(this.history);
            if (this.activeView === 'analytics') this.loadAndRenderAnalytics();
        });

        // Sidebar collapse
        document.getElementById('sidebar-toggle-btn')?.addEventListener('click', () => {
            document.getElementById('app-sidebar')?.classList.toggle('collapsed');
        });

        // Mobile hamburger
        document.getElementById('hamburger-menu-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('app-sidebar')?.classList.toggle('mobile-active');
        });

        // Quick Actions
        document.getElementById('qa-upload-prod')?.addEventListener('click', () => this.openAddProductModal());
        document.getElementById('qa-gen-image')?.addEventListener('click', () => { this.activateNav('generator'); this.switchView('generator'); });
        document.getElementById('qa-gen-post')?.addEventListener('click', () => { this.activateNav('post-generator'); this.switchView('post-generator'); });

        // Add Product Modal
        document.getElementById('float-add-product-btn')?.addEventListener('click', () => this.openAddProductModal());
        document.getElementById('close-product-modal')?.addEventListener('click', () => this.closeAddProductModal());
        document.getElementById('cancel-product-form')?.addEventListener('click', () => this.closeAddProductModal());

        // Photo preview in modal
        const photoInput = document.getElementById('prod-photo-input');
        const modalZone = document.getElementById('modal-upload-zone');
        modalZone?.addEventListener('click', () => photoInput?.click());
        photoInput?.addEventListener('change', () => {
            if (photoInput.files.length) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.getElementById('prod-photo-preview');
                    const placeholder = document.getElementById('modal-upload-placeholder');
                    if (preview) { preview.src = e.target.result; preview.style.display = 'block'; }
                    if (placeholder) placeholder.style.display = 'none';
                };
                reader.readAsDataURL(photoInput.files[0]);
            }
        });

        // Add Product Form Submit
        document.getElementById('add-product-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddProduct(e.target);
        });

        // History filters
        document.querySelectorAll('#history-filter-tabs .badge').forEach(b => {
            b.addEventListener('click', () => {
                document.querySelectorAll('#history-filter-tabs .badge').forEach(x => { x.classList.remove('badge-primary'); x.classList.add('badge-muted'); });
                b.classList.add('badge-primary'); b.classList.remove('badge-muted');
                this.renderHistory(b.dataset.filter);
            });
        });

        // Platform tabs in Post Generator
        document.querySelectorAll('#post-platform-tabs .badge').forEach(b => {
            b.addEventListener('click', () => {
                document.querySelectorAll('#post-platform-tabs .badge').forEach(x => { x.classList.remove('badge-primary'); x.classList.add('badge-muted'); });
                b.classList.add('badge-primary'); b.classList.remove('badge-muted');
            });
        });

        // Settings tabs
        document.querySelectorAll('.settings-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`settings-panel-${btn.dataset.tab}`)?.classList.add('active');
            });
        });

        // Appearance settings
        document.getElementById('set-light-theme')?.addEventListener('click', () => { this.currentTheme = 'light'; document.documentElement.setAttribute('data-theme', 'light'); localStorage.setItem('theme', 'light'); this.updateThemeToggleUI(); });
        document.getElementById('set-dark-theme')?.addEventListener('click', () => { this.currentTheme = 'dark'; document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('theme', 'dark'); this.updateThemeToggleUI(); });

        // Generator regen button
        document.getElementById('generator-regen-btn')?.addEventListener('click', () => GenerationManager.generateImage());
    }

    switchView(viewTarget) {
        this.activeView = viewTarget;
        document.querySelectorAll('.content-pane').forEach(p => p.style.display = 'none');
        const pane = document.getElementById(`view-${viewTarget}`);
        if (pane) pane.style.display = 'block';

        if (viewTarget === 'home') setTimeout(() => initDashboardCharts(this.history), 50);
        if (viewTarget === 'analytics') this.loadAndRenderAnalytics();
        if (viewTarget === 'history') this.loadHistory();
        if (viewTarget === 'products') this.loadProducts();
    }

    activateNav(viewName) {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => {
            n.classList.remove('active');
            if (n.dataset.view === viewName) n.classList.add('active');
        });
    }

    updateThemeToggleUI() {
        const btn = document.getElementById('theme-toggle-btn');
        if (!btn) return;
        btn.innerHTML = this.currentTheme === 'light'
            ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:20px;height:20px;"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:20px;height:20px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.58 1.58m12.42 12.42l1.58 1.58M3 12h2.25m13.5 0H21M6.3 17.7a9 9 0 1112.4 0H6.3z" /></svg>`;
    }

    // =========================================================
    // PRODUCTS (API-backed)
    // =========================================================
    async loadProducts() {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) { this.products = data.products; this.renderProducts(); this.populateProductSelectors(); }
        } catch (err) { console.error('Load products error:', err); }
    }

    renderProducts() {
        const grid = document.getElementById('products-grid-list');
        if (!grid) return;
        grid.innerHTML = '';

        if (this.products.length === 0) {
            grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                <h3>No products yet</h3>
                <p>Add your first product to start generating marketing content.</p>
                <button class="btn btn-primary" onclick="window.App?.openAddProductModal()">Add Product</button>
            </div>`;
            return;
        }

        this.products.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'card product-card card-hover';
            card.innerHTML = `
                <div class="product-img-wrapper">
                    <img src="${prod.image_path || '/assets/perfume.png'}" alt="${prod.name}" onerror="this.src='/assets/perfume.png'">
                    <div class="product-card-actions">
                        <button class="product-card-btn delete-prod" data-id="${prod.id}" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:14px;height:14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.24 9m9.911-3.75H4.913M14.25 3.75a2.25 2.25 0 00-4.5 0H3.75M17.25 3.75l-.75 16.5H7.5L6.75 3.75"/></svg>
                        </button>
                    </div>
                </div>
                <div class="product-details">
                    <div>
                        <h4 class="product-name">${prod.name}</h4>
                        <div class="product-meta"><span>${prod.brand}</span><span class="badge badge-muted" style="font-size:0.7rem;">${prod.category}</span></div>
                    </div>
                    <button class="btn btn-secondary btn-sm btn-full generate-from-product" data-id="${prod.id}" data-name="${prod.name}">Generate Content</button>
                </div>
            `;
            card.querySelector('.delete-prod').addEventListener('click', (e) => { e.stopPropagation(); this.deleteProduct(prod.id); });
            card.querySelector('.generate-from-product').addEventListener('click', () => { this.activateNav('generator'); this.switchView('generator'); });
            grid.appendChild(card);
        });
    }

    async handleAddProduct(form) {
        const btn = document.getElementById('submit-product-btn');
        if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

        const formData = new FormData(form);
        try {
            const res = await fetch('/api/products', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                this.products.push(data.product);
                this.renderProducts();
                this.populateProductSelectors();
                this.closeAddProductModal();
                this.updateStat('stat-products', this.products.length);
            } else {
                alert(data.error || 'Failed to add product.');
            }
        } catch (err) {
            alert('Network error. Please try again.');
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = 'Add Product'; }
        }
    }

    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                this.products = this.products.filter(p => p.id !== id);
                this.renderProducts();
                this.populateProductSelectors();
                this.updateStat('stat-products', this.products.length);
            }
        } catch (err) { console.error('Delete product error:', err); }
    }

    populateProductSelectors() {
        const sel = document.getElementById('post-product-select');
        if (!sel) return;
        sel.innerHTML = this.products.length === 0
            ? '<option value="">No products — add one first</option>'
            : this.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    openAddProductModal() {
        document.getElementById('add-product-modal')?.classList.add('active');
    }

    closeAddProductModal() {
        document.getElementById('add-product-modal')?.classList.remove('active');
        document.getElementById('add-product-form')?.reset();
        const preview = document.getElementById('prod-photo-preview');
        const placeholder = document.getElementById('modal-upload-placeholder');
        if (preview) { preview.style.display = 'none'; preview.src = ''; }
        if (placeholder) placeholder.style.display = 'block';
    }

    // =========================================================
    // HISTORY (API-backed)
    // =========================================================
    async loadHistory() {
        try {
            const res = await fetch('/api/history');
            const data = await res.json();
            if (data.success) { this.history = data.history; this.renderHistory('all'); }
        } catch (err) { console.error('Load history error:', err); }
    }

    renderHistory(filter = 'all') {
        const container = document.getElementById('history-timeline-list');
        if (!container) return;
        container.innerHTML = '';

        let filtered = this.history;
        if (filter === 'images') filtered = this.history.filter(h => h.type === 'image');
        if (filter === 'posts') filtered = this.history.filter(h => h.type === 'post');

        if (filtered.length === 0) {
            container.innerHTML = `<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><h3>No history yet</h3><p>Generated content will appear here.</p></div>`;
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.marginBottom = '1.25rem';

            const dateStr = new Date(item.created_at).toLocaleString();
            const badgeClass = item.type === 'image' ? 'badge-primary' : 'badge-accent';

            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:1rem;">
                    <div>
                        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.25rem;">
                            <h4 style="font-weight:600;font-size:0.95rem;">${item.title}</h4>
                            <span class="badge ${badgeClass}">${item.type}</span>
                        </div>
                        <span style="font-size:0.75rem;color:var(--text-muted);">${dateStr}</span>
                    </div>
                    <button class="product-card-btn delete-hist" data-id="${item.id}" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:14px;height:14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <p style="font-size:0.825rem;color:var(--text-secondary);margin-bottom:0.75rem;"><strong>Prompt:</strong> ${item.prompt || '—'}</p>
                ${item.type === 'image' && item.preview_path ? `<img src="${item.preview_path}" style="width:100%;max-height:200px;object-fit:contain;border-radius:var(--radius-md);border:1px solid var(--border-color);">` : ''}
                ${item.type === 'post' && item.content ? `<div style="background:var(--bg-app);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:1rem;font-size:0.85rem;white-space:pre-wrap;max-height:120px;overflow-y:auto;">${item.content}</div>` : ''}
            `;
            card.querySelector('.delete-hist').addEventListener('click', () => this.deleteHistory(item.id));
            container.appendChild(card);
        });
    }

    async deleteHistory(id) {
        try {
            const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                this.history = this.history.filter(h => h.id !== id);
                this.renderHistory('all');
                this.renderAnalyticsTable();
            }
        } catch (err) { console.error('Delete history error:', err); }
    }

    // Save new history entry via API
    async saveHistory(entry) {
        try {
            const res = await fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry)
            });
            const data = await res.json();
            if (data.success) {
                this.history.unshift(data.item);
                this.renderHistory('all');
                this.renderAnalyticsTable();
                const total = this.history.filter(h => h.type === 'image').length;
                const posts = this.history.filter(h => h.type === 'post').length;
                this.updateStat('stat-images', total);
                this.updateStat('stat-posts', posts);
                this.updateStat('stat-total', total + posts);
            }
        } catch (err) { console.error('Save history error:', err); }
    }

    // =========================================================
    // ANALYTICS (API-backed)
    // =========================================================
    async loadAndRenderAnalytics() {
        try {
            const res = await fetch('/api/analytics');
            const data = await res.json();
            if (data.success) {
                setTimeout(() => initAnalyticsCharts(data.monthly, data.categories), 50);
            }
        } catch (err) {
            // Fallback to local history data
            setTimeout(() => initAnalyticsCharts(null, null), 50);
        }
    }

    renderAnalyticsTable() {
        const tbody = document.getElementById('analytics-table-body');
        if (!tbody) return;
        tbody.innerHTML = this.history.slice(0, 20).map(item => `
            <tr>
                <td>${item.title}</td>
                <td><span class="badge ${item.type === 'image' ? 'badge-primary' : 'badge-accent'}">${item.type}</span></td>
                <td>${new Date(item.created_at).toLocaleDateString()}</td>
                <td><span class="badge badge-accent">${item.status || 'Completed'}</span></td>
            </tr>
        `).join('');
    }

    renderTemplates() {
        const grid = document.getElementById('templates-grid-list');
        if (!grid) return;
        TEMPLATES.forEach(temp => {
            const card = document.createElement('div');
            card.className = 'card template-card card-hover';
            card.innerHTML = `<div class="template-img-wrapper"><img src="${temp.image}" alt="${temp.title}"></div><div class="template-info"><h4>${temp.title}</h4><p>${temp.category}</p></div>`;
            card.addEventListener('click', () => {
                this.activateNav('generator');
                this.switchView('generator');
                const promptInput = document.getElementById('generator-prompt-input');
                const styleCard = document.querySelector(`#style-selector .style-card[data-value="${temp.style}"]`);
                if (promptInput) promptInput.value = temp.prompt;
                if (styleCard) {
                    document.querySelectorAll('#style-selector .style-card').forEach(c => c.classList.remove('active'));
                    styleCard.classList.add('active');
                }
                const bgSel = document.getElementById('generator-bg-select');
                const lightSel = document.getElementById('generator-light-select');
                if (bgSel) bgSel.value = temp.background;
                if (lightSel) lightSel.value = temp.lighting;
                if (GenerationManager) { GenerationManager.selectedStyle = temp.style; GenerationManager.selectedBg = temp.background; GenerationManager.selectedLighting = temp.lighting; }
            });
            grid.appendChild(card);
        });
    }

    updateStat(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.App = new AppController();
});
