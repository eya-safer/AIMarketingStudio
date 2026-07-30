/* Mock Data & Configs for AI Marketing Studio */

const MockData = {
    // Initial products database
    products: [
        {
            id: 'prod-1',
            name: 'Aura Eau de Parfum',
            category: 'Cosmetics',
            brand: 'Luxe Parfum',
            image: './assets/perfume.png',
            createdAt: '2026-07-01'
        },
        {
            id: 'prod-2',
            name: 'Apex Sound ANC Headphones',
            category: 'Technology',
            brand: 'ApexAudio',
            image: './assets/headphones.png',
            createdAt: '2026-07-03'
        },
        {
            id: 'prod-3',
            name: 'Hydra Glow Face Cream',
            category: 'Cosmetics',
            brand: 'Pure Skin',
            image: './assets/cream.png',
            createdAt: '2026-07-05'
        },
        {
            id: 'prod-4',
            name: 'Vanguard Chronograph Watch',
            category: 'Fashion',
            brand: 'Vanguard Co.',
            image: './assets/watch.png',
            createdAt: '2026-07-07'
        }
    ],

    // Style presets for image generation
    styles: [
        { id: 'luxury', name: 'Luxury' },
        { id: 'minimalist', name: 'Minimalist' },
        { id: 'nature', name: 'Nature' },
        { id: 'technology', name: 'Technology' },
        { id: 'food', name: 'Food' },
        { id: 'fashion', name: 'Fashion' },
        { id: 'cosmetics', name: 'Cosmetics' }
    ],

    // Background presets for image generation
    backgrounds: [
        { id: 'studio', name: 'Studio Solid' },
        { id: 'marble', name: 'Luxury Marble' },
        { id: 'wood', name: 'Warm Wood' },
        { id: 'glass', name: 'Glassmorphism' },
        { id: 'nature_bg', name: 'Nature Forest' },
        { id: 'gradient', name: 'Soft Gradient' }
    ],

    // Lighting presets for image generation
    lighting: [
        { id: 'golden', name: 'Golden Hour' },
        { id: 'studio_light', name: 'Studio Bright' },
        { id: 'soft', name: 'Soft Shadows' },
        { id: 'neon', name: 'Neon Glow' },
        { id: 'cinematic', name: 'Cinematic' }
    ],

    // Marketing design templates
    templates: [
        {
            id: 'temp-1',
            title: 'Luxury Cosmetics',
            category: 'Cosmetics',
            image: './assets/perfume_studio.png',
            prompt: 'High-end cosmetics bottle sitting on a floating marble pedestal, water splash ripples around, soft morning sunlight, premium photography, elegant look, white and lavender color grading.',
            style: 'luxury',
            background: 'marble',
            lighting: 'golden'
        },
        {
            id: 'temp-2',
            title: 'Modern Tech Concept',
            category: 'Technology',
            image: './assets/headphones.png',
            prompt: 'Premium wireless headphones centered in front of abstract floating geometric shapes, matte neon light highlights, reflection on black glass base, minimal future background.',
            style: 'technology',
            background: 'glass',
            lighting: 'neon'
        },
        {
            id: 'temp-3',
            title: 'Minimalist Organic Skincare',
            category: 'Cosmetics',
            image: './assets/cream.png',
            prompt: 'Skincare cream jar on smooth beige clay stone, soft shadow from palm leaves, neutral organic background, gentle natural side-lighting, clean, green wellness studio.',
            style: 'minimalist',
            background: 'nature_bg',
            lighting: 'soft'
        },
        {
            id: 'temp-4',
            title: 'Elegant Watch Chrono',
            category: 'Fashion',
            image: './assets/watch.png',
            prompt: 'Luxury steel watch on dark slate stone background, cinematic dramatic key lighting, rain droplets on surfaces, dark low key color grading, premium high-end styling.',
            style: 'luxury',
            background: 'wood',
            lighting: 'cinematic'
        }
    ],

    // History logs of generations
    history: [
        {
            id: 'hist-1',
            type: 'image',
            title: 'Aura Eau de Parfum - Studio Glow',
            preview: './assets/perfume_studio.png',
            prompt: 'Luxury perfume bottle on marble, soft water ripples, golden lighting, cosmetics backdrop',
            date: '2026-07-09 11:45',
            status: 'Completed'
        },
        {
            id: 'hist-2',
            type: 'post',
            title: 'Aura Parfum Launch Post',
            preview: '',
            prompt: 'Instagram post, Luxury, Professional tone, English.',
            date: '2026-07-09 11:40',
            status: 'Completed',
            content: `✨ Introducing AURA - The essence of timeless elegance. ✨\n\nCrafted for those who dare to inspire, Aura blends delicate floral notes with deep, mysterious wood undertones. A scent that doesn't just trail; it lingers.\n\nElevate your everyday presence. Available now in boutiques worldwide.\n\n#AuraParfum #LuxeFragrance #LuxuryLifestyle #FinePerfumes`
        },
        {
            id: 'hist-3',
            type: 'image',
            title: 'Apex Sound - Neon Synthwave',
            preview: './assets/headphones.png',
            prompt: 'Wireless headphones with neon backlights, dark wood panel surface, cinematic studio lighting',
            date: '2026-07-08 09:12',
            status: 'Completed'
        }
    ],

    // Recent Activity feeds
    activities: [
        { action: 'Generated Ad Image', target: 'Aura Eau de Parfum', time: '5 mins ago', type: 'image' },
        { action: 'Copied Ad Post Copy', target: 'Apex Sound ANC Headphones', time: '12 mins ago', type: 'post' },
        { action: 'Added New Product', target: 'Vanguard Chronograph Watch', time: '2 hours ago', type: 'prod' },
        { action: 'Upgraded Subscription', target: 'Premium Plan active', time: '1 day ago', type: 'user' }
    ]
};
export default MockData;
