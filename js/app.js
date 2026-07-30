/* AI Marketing Studio Main Application Controller */
import MockData from './mockData.js';
import { initDashboardCharts, initAnalyticsCharts } from './charts.js';
import { GenerationManager } from './generator.js';

class AppController {
    constructor() {
        this.credits = 85;
        this.products = [...MockData.products];
        this.history = [...MockData.history];
        this.activities = [...MockData.activities];
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.activeView = 'home';
        
        this.init();
    }
    
    init() {
        // Apply Initial Theme
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeToggleUI();
        
        // Initial Renderings
        this.renderProducts();
        this.renderHistory();
        this.renderActivities();
        this.updateCreditsUI();
        this.populateProductSelectors();
        
        // Bind UI Event Listeners
        this.bindEvents();
        
        // Init Sub-Manager
        GenerationManager.init(this);
    }
    
    bindEvents() {
        // Navigation Transitions (Landing to App)
        const startFreeBtn = document.getElementById('hero-start-free');
        const landingView = document.getElementById('landing-page');
        const appLayout = document.getElementById('app-layout');
        const logoutBtn = document.getElementById('sidebar-logout-btn');
        const logoLanding = document.getElementById('landing-nav-logo');
        const logoApp = document.getElementById('sidebar-logo-link');
        
        if (startFreeBtn && landingView && appLayout) {
            startFreeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                landingView.style.display = 'none';
                appLayout.style.display = 'flex';
                this.switchView('home');
            });
        }
        
        if (logoutBtn && landingView && appLayout) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                appLayout.style.display = 'none';
                landingView.style.display = 'block';
                window.scrollTo(0, 0);
            });
        }
        
        if (logoLanding && logoApp) {
            logoLanding.addEventListener('click', (e) => {
                e.preventDefault();
                appLayout.style.display = 'none';
                landingView.style.display = 'block';
                window.scrollTo(0, 0);
            });
            logoApp.addEventListener('click', (e) => {
                e.preventDefault();
                appLayout.style.display = 'none';
                landingView.style.display = 'block';
                window.scrollTo(0, 0);
            });
        }
        
        // Sidebar View Routing
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            const viewTarget = item.dataset.view;
            if (viewTarget) {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Highlight active nav item
                    document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => nav.classList.remove('active'));
                    item.classList.add('active');
                    
                    this.switchView(viewTarget);
                });
            }
        });
        
        // Theme Toggler
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', this.currentTheme);
                localStorage.setItem('theme', this.currentTheme);
                this.updateThemeToggleUI();
                
                // Redraw line charts on theme switch for gridlines colors
                if (this.activeView === 'home') initDashboardCharts();
                if (this.activeView === 'analytics') initAnalyticsCharts();
            });
        }
        
        // Sidebar Collapse/Expand
        const sidebarToggle = document.getElementById('sidebar-toggle-btn');
        const sidebar = document.querySelector('.sidebar');
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }
        
        // Hamburger Drawer for mobile
        const hamburgerBtn = document.getElementById('hamburger-menu-btn');
        if (hamburgerBtn && sidebar) {
            hamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebar.classList.toggle('mobile-active');
            });
            
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && sidebar.classList.contains('mobile-active')) {
                    sidebar.classList.remove('mobile-active');
                }
            });
        }
        
        // Quick Action Shortcuts Binders
        const qaUpload = document.getElementById('qa-upload-prod');
        const qaImage = document.getElementById('qa-gen-image');
        const qaPost = document.getElementById('qa-gen-post');
        
        if (qaUpload) qaUpload.addEventListener('click', () => this.openAddProductModal());
        if (qaImage) {
            qaImage.addEventListener('click', () => {
                this.activateNavRoute('generator');
                this.switchView('generator');
            });
        }
        if (qaPost) {
            qaPost.addEventListener('click', () => {
                this.activateNavRoute('post-generator');
                this.switchView('post-generator');
            });
        }
        
        // Add Product Modal & Floating Action
        const floatAddProd = document.getElementById('float-add-product-btn');
        const modal = document.getElementById('add-product-modal');
        const modalClose = document.getElementById('close-product-modal');
        const cancelBtn = document.getElementById('cancel-product-form');
        const productForm = document.getElementById('add-product-form');
        
        if (floatAddProd) floatAddProd.addEventListener('click', () => this.openAddProductModal());
        if (modalClose) modalClose.addEventListener('click', () => this.closeAddProductModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeAddProductModal());
        
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddProductSubmit(productForm);
            });
        }
        
        // Product Photo preview inside Modal
        const photoInput = document.getElementById('prod-photo-input');
        const photoPreview = document.getElementById('prod-photo-preview');
        if (photoInput && photoPreview) {
            photoInput.addEventListener('change', () => {
                if (photoInput.files.length) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        photoPreview.src = e.target.result;
                        photoPreview.style.display = 'block';
                    };
                    reader.readAsDataURL(photoInput.files[0]);
                }
            });
        }
        
        // History Filter tab togglers
        document.querySelectorAll('#history-filter-tabs .badge').forEach(badge => {
            badge.addEventListener('click', () => {
                document.querySelectorAll('#history-filter-tabs .badge').forEach(b => {
                    b.classList.remove('badge-primary');
                    b.classList.add('badge-muted');
                });
                badge.classList.add('badge-primary');
                badge.classList.remove('badge-muted');
                
                const filter = badge.dataset.filter;
                this.renderHistory(filter);
            });
        });
        
        // Platform Selector inside Post Generator
        document.querySelectorAll('#post-platform-tabs .badge').forEach(badge => {
            badge.addEventListener('click', () => {
                document.querySelectorAll('#post-platform-tabs .badge').forEach(b => {
                    b.classList.remove('badge-primary');
                    b.classList.add('badge-muted');
                });
                badge.classList.add('badge-primary');
                badge.classList.remove('badge-muted');
            });
        });
        
        // Settings Tab Switcher
        document.querySelectorAll('.settings-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
                
                btn.classList.add('active');
                const panelId = `settings-panel-${btn.dataset.tab}`;
                const panel = document.getElementById(panelId);
                if (panel) panel.classList.add('active');
            });
        });
        
        // Landing Page FAQ accordion accordions
        document.querySelectorAll('.faq-question').forEach(q => {
            q.addEventListener('click', () => {
                const item = q.parentElement;
                item.classList.toggle('active');
            });
        });
    }
    
    switchView(viewTarget) {
        this.activeView = viewTarget;
        
        // Hide all views
        document.querySelectorAll('.content-pane').forEach(pane => {
            pane.style.display = 'none';
        });
        
        // Show target view
        const targetPane = document.getElementById(`view-${viewTarget}`);
        if (targetPane) {
            targetPane.style.display = 'block';
            
            // Trigger specific view setups
            if (viewTarget === 'home') {
                setTimeout(() => initDashboardCharts(), 50);
                this.renderActivities();
            } else if (viewTarget === 'analytics') {
                setTimeout(() => initAnalyticsCharts(), 50);
            } else if (viewTarget === 'products') {
                this.renderProducts();
            } else if (viewTarget === 'history') {
                this.renderHistory();
            }
        }
    }
    
    activateNavRoute(viewName) {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => {
            nav.classList.remove('active');
            if (nav.dataset.view === viewName) {
                nav.classList.add('active');
            }
        });
    }
    
    updateThemeToggleUI() {
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (!themeBtn) return;
        
        if (this.currentTheme === 'light') {
            themeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:20px;height:20px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
            `;
        } else {
            themeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:20px;height:20px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.58 1.58m12.42 12.42l1.58 1.58M3 12h2.25m13.5 0H21M6.3 17.7a9 9 0 1112.4 0H6.3z" />
                </svg>
            `;
        }
    }
    
    updateCreditsUI() {
        document.querySelectorAll('.credits-count').forEach(el => {
            el.textContent = this.credits;
        });
        document.querySelectorAll('.credits-progress').forEach(el => {
            el.style.width = `${(this.credits / 100) * 100}%`;
        });
    }
    
    deductCredits(amount) {
        this.credits = Math.max(0, this.credits - amount);
        this.updateCreditsUI();
    }
    
    // Dynamic products rendering
    renderProducts() {
        const prodGrid = document.getElementById('products-grid-list');
        if (!prodGrid) return;
        
        prodGrid.innerHTML = '';
        this.products.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'card product-card';
            card.innerHTML = `
                <div class="product-img-wrapper">
                    <img src="${prod.image}" alt="${prod.name}">
                    <div class="product-card-actions">
                        <button class="product-card-btn edit" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:16px;height:16px;">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                        </button>
                        <button class="product-card-btn delete" title="Delete" data-id="${prod.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:16px;height:16px;">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.24 9m4.788 0L12 21.75m0-18.75h-.008A2.25 2.25 0 009.75 4.5H5.25a.75.75 0 010-1.5h4.5a2.25 2.25 0 012.25 2.25h1.5a2.25 2.25 0 012.25-2.25h4.5a.75.75 0 010 1.5h-4.5a2.25 2.25 0 01-2.25-2.25z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="product-details">
                    <div>
                        <h4 class="product-name">${prod.name}</h4>
                        <div class="product-meta">
                            <span>${prod.brand}</span>
                            <span>${prod.category}</span>
                        </div>
                    </div>
                    <button class="btn btn-secondary btn-sm btn-full generate-btn" data-id="${prod.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:14px;height:14px;">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.982-11.825a.9.9 0 00-1.347-1.17l-5.94 4.028a.9.9 0 01-1.17-.187l-3.51-3.51A.9.9 0 004.5 9.75h5.313" />
                        </svg>
                        Generate Content
                    </button>
                </div>
            `;
            
            // Delete product event
            card.querySelector('.delete').addEventListener('click', (e) => {
                e.stopPropagation();
                const id = e.currentTarget.dataset.id;
                this.products = this.products.filter(p => p.id !== id);
                this.renderProducts();
                this.populateProductSelectors();
            });
            
            // Generate content redirect
            card.querySelector('.generate-btn').addEventListener('click', () => {
                this.activateNavRoute('generator');
                this.switchView('generator');
                
                // Select product inside selectors
                const prodSelect = document.getElementById('post-product-select');
                if (prodSelect) prodSelect.value = prod.id;
            });
            
            prodGrid.appendChild(card);
        });
    }
    
    // Dynamic history timelines rendering
    renderHistory(filter = 'all') {
        const histContainer = document.getElementById('history-timeline-list');
        if (!histContainer) return;
        
        histContainer.innerHTML = '';
        
        let filteredHist = this.history;
        if (filter === 'images') filteredHist = this.history.filter(h => h.type === 'image');
        if (filter === 'posts') filteredHist = this.history.filter(h => h.type === 'post');
        
        if (filteredHist.length === 0) {
            histContainer.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3>No history found</h3>
                    <p>Get started by generating some content using the AI Marketing Studio.</p>
                </div>
            `;
            return;
        }
        
        filteredHist.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card history-item-card';
            card.style.marginBottom = '1.25rem';
            
            let typeBadge = `<span class="badge badge-primary">Image</span>`;
            let contentBody = `<div class="product-img-wrapper" style="height:120px;max-width:180px;border-radius:var(--radius-sm)"><img src="${item.preview}" style="width:100%;height:100%;object-fit:cover"></div>`;
            
            if (item.type === 'post') {
                typeBadge = `<span class="badge badge-accent">Post</span>`;
                contentBody = `<div style="padding:1rem;background:var(--bg-app);border-radius:var(--radius-md);font-family:monospace;font-size:0.825rem;white-space:pre-wrap;max-height:120px;overflow-y:auto;border:1px solid var(--border-color)">${item.content}</div>`;
            }
            
            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:1rem">
                    <div>
                        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.25rem">
                            <h4 style="font-weight:600;font-size:0.95rem">${item.title}</h4>
                            ${typeBadge}
                        </div>
                        <span style="font-size:0.75rem;color:var(--text-muted)">${item.date}</span>
                    </div>
                    <button class="product-card-btn delete-hist" data-id="${item.id}" title="Delete Log">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:14px;height:14px">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div style="display:grid;grid-template-columns:1fr auto;gap:1.5rem">
                    <div>
                        <div style="font-size:0.825rem;color:var(--text-secondary);line-height:1.5;margin-bottom:0.75rem">
                            <strong>Prompt: </strong> ${item.prompt}
                        </div>
                        <div style="display:flex;gap:0.5rem">
                            <button class="btn btn-secondary btn-sm">Download</button>
                            <button class="btn btn-outline btn-sm">Reuse Configuration</button>
                        </div>
                    </div>
                    ${item.type === 'image' ? contentBody : ''}
                </div>
                ${item.type === 'post' ? `<div style="margin-top:1rem">${contentBody}</div>` : ''}
            `;
            
            card.querySelector('.delete-hist').addEventListener('click', () => {
                this.history = this.history.filter(h => h.id !== item.id);
                this.renderHistory(filter);
            });
            
            histContainer.appendChild(card);
        });
    }
    
    // Dynamic activities feed on Home View
    renderActivities() {
        const feed = document.getElementById('recent-activity-list');
        if (!feed) return;
        
        feed.innerHTML = '';
        this.activities.forEach(act => {
            const li = document.createElement('div');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.padding = '0.75rem 0';
            li.style.borderBottom = '1px solid var(--border-color)';
            
            let iconSvg = '';
            if (act.type === 'image') {
                iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="var(--primary)" style="width:16px;height:16px"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" /></svg>`;
            } else if (act.type === 'post') {
                iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="var(--accent)" style="width:16px;height:16px"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>`;
            } else {
                iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="var(--text-muted)" style="width:16px;height:16px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
            }
            
            li.innerHTML = `
                <div style="display:flex;align-items:center;gap:0.75rem">
                    <div style="width:28px;height:28px;border-radius:var(--radius-sm);background:var(--bg-app);display:flex;align-items:center;justify-content:center">
                        ${iconSvg}
                    </div>
                    <div>
                        <span style="font-size:0.85rem;font-weight:600">${act.action}</span>
                        <p style="font-size:0.75rem;color:var(--text-secondary)">${act.target}</p>
                    </div>
                </div>
                <span style="font-size:0.75rem;color:var(--text-muted)">${act.time}</span>
            `;
            feed.appendChild(li);
        });
    }
    
    // Templates removed
    
    logActivity(action, target, time, type) {
        this.activities.unshift({ action, target, time, type });
        if (this.activities.length > 5) this.activities.pop();
        this.renderActivities();
    }
    
    populateProductSelectors() {
        const prodSelect = document.getElementById('post-product-select');
        if (!prodSelect) return;
        
        prodSelect.innerHTML = '';
        this.products.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name;
            prodSelect.appendChild(opt);
        });
    }
    
    // Add product Modal controls
    openAddProductModal() {
        const modal = document.getElementById('add-product-modal');
        if (modal) modal.classList.add('active');
    }
    
    closeAddProductModal() {
        const modal = document.getElementById('add-product-modal');
        const form = document.getElementById('add-product-form');
        const previewImg = document.getElementById('prod-photo-preview');
        
        if (modal) modal.classList.remove('active');
        if (form) form.reset();
        if (previewImg) {
            previewImg.style.display = 'none';
            previewImg.src = '';
        }
    }
    
    handleAddProductSubmit(form) {
        const name = document.getElementById('prod-name-input').value;
        const brand = document.getElementById('prod-brand-input').value;
        const category = document.getElementById('prod-category-select').value;
        const previewImg = document.getElementById('prod-photo-preview');
        
        const newProduct = {
            id: `prod-${Date.now()}`,
            name,
            brand,
            category,
            image: previewImg.src || './assets/perfume.png',
            createdAt: new Date().toISOString().substring(0, 10)
        };
        
        this.products.push(newProduct);
        this.renderProducts();
        this.populateProductSelectors();
        this.closeAddProductModal();
        this.logActivity('Added Product', name, 'Just now', 'prod');
    }
}

// Instantiate core Application logic on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.App = new AppController();
});
