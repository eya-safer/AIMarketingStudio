/* Generator Logic - Saves results to the database via API */

const MarketingCopy = {
    default: {
        'English': {
            'Luxury': `✨ Elevate your brand presence with an extraordinary experience.\n\nCrafted for those who appreciate the finest details, this is not just a product — it is a statement. A statement of elegance, quality, and timeless sophistication.\n\nDiscover the difference that premium makes.\n\n#LuxuryBrand #PremiumQuality #Elegance`,
            'Professional': `Introducing a new standard in product excellence. Designed with precision engineering and crafted from premium materials, this represents the pinnacle of professional performance.\n\nElevate your workflow. Experience the difference quality makes.\n\n#Professional #Quality #Innovation`,
            'Friendly': `Hey friends! 🌟 We are SO excited to share our latest product with you! It's absolutely amazing and you're going to love it.\n\nTrust us — once you try it, you won't want anything else. Grab yours today before it sells out!\n\n#NewProduct #MustHave #TreatYourself`,
            'Minimal': `New arrival.\n\nSimple. Quality. Yours.\n\nShop now.`
        },
        'French': {
            'Luxury': `✨ Élevez votre présence à un niveau d'excellence inégalé.\n\nConçu pour ceux qui apprécient les détails les plus fins — ce n'est pas simplement un produit, c'est une déclaration d'élégance et de sophistication intemporelle.\n\nDécouvrez la différence du premium.\n\n#LuxeFrançais #Excellence #Raffinement`,
            'Professional': `Un nouveau standard d'excellence professionnelle. Conçu avec précision et fabriqué à partir de matériaux haut de gamme, ce produit représente le summum de la performance professionnelle.\n\n#Professionnel #Qualité #Innovation`,
            'Friendly': `Coucou tout le monde ! 🌟 On est trop heureux de partager notre nouveau produit avec vous ! Vous allez l'adorer, promis.\n\nCommandez vite avant la rupture de stock !\n\n#NouveauProduit #CoupDeCoeur`,
            'Minimal': `Nouvelle arrivée.\n\nSimple. Qualité. À vous.\n\nCommandez maintenant.`
        },
        'Arabic': {
            'Luxury': `✨ ارتقِ بوجودك إلى مستوى استثنائي من التميز.\n\nمصنوع لمن يقدّر أدق التفاصيل — هذا ليس مجرد منتج، بل هو تعبير عن الأناقة والرقي الخالد.\n\nاكتشف الفارق الذي يصنعه التميز.\n\n#فخامة #جودة_عالية #أناقة`,
            'Professional': `معيار جديد في التميز المهني. مصمم بدقة متناهية من أجود المواد، يمثل هذا المنتج قمة الأداء الاحترافي.\n\n#احترافية #جودة #ابتكار`,
            'Friendly': `مرحبا يا أصدقاء! 🌟 يسعدنا جداً أن نشاركم منتجنا الجديد الرائع! ستحبونه بالتأكيد.\n\nسارعوا بالطلب قبل نفاد الكمية!\n\n#منتج_جديد #لازم_تجربه`,
            'Minimal': `وصل حديثاً.\n\nبساطة. جودة. لك.\n\nاطلب الآن.`
        }
    }
};

export class GenerationManager {
    static selectedStyle = 'luxury';
    static selectedBg = 'marble';
    static selectedLighting = 'golden';
    static uploadedFile = null;

    static init(app) {
        this.app = app;
        this.bindEvents();
    }

    static bindEvents() {
        // Style selector cards
        document.querySelectorAll('#style-selector .style-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('#style-selector .style-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.selectedStyle = card.dataset.value;
            });
        });

        // Background & lighting selects
        document.getElementById('generator-bg-select')?.addEventListener('change', e => this.selectedBg = e.target.value);
        document.getElementById('generator-light-select')?.addEventListener('change', e => this.selectedLighting = e.target.value);

        // Upload zone
        const dropZone = document.getElementById('generator-upload-zone');
        const fileInput = document.getElementById('generator-file-input');
        const previewImg = document.getElementById('generator-preview-img');
        const clearBtn = document.getElementById('generator-clear-upload');

        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());
            dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
            dropZone.addEventListener('drop', e => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                if (e.dataTransfer.files.length) this.handleUpload(e.dataTransfer.files[0], previewImg, clearBtn, dropZone);
            });
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length) this.handleUpload(fileInput.files[0], previewImg, clearBtn, dropZone);
            });
        }

        clearBtn?.addEventListener('click', e => {
            e.stopPropagation();
            this.uploadedFile = null;
            if (fileInput) fileInput.value = '';
            if (previewImg) { previewImg.style.display = 'none'; previewImg.src = ''; }
            clearBtn.style.display = 'none';
            dropZone?.querySelector('div')?.style && (dropZone.querySelector('div').style.display = 'block');
        });

        // Generate buttons
        document.getElementById('generator-submit-btn')?.addEventListener('click', () => this.generateImage());
        document.getElementById('post-submit-btn')?.addEventListener('click', () => this.generatePost());
        document.getElementById('post-copy-btn')?.addEventListener('click', () => this.copyPost());
    }

    static handleUpload(file, previewImg, clearBtn, dropZone) {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = e => {
            if (previewImg) { previewImg.src = e.target.result; previewImg.style.display = 'block'; }
            if (clearBtn) clearBtn.style.display = 'block';
            const placeholder = dropZone?.querySelector('div');
            if (placeholder) placeholder.style.display = 'none';
            this.uploadedFile = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    static async generateImage() {
        const promptInput = document.getElementById('generator-prompt-input');
        const userPrompt = promptInput?.value.trim() || '';
        const placeholder = document.getElementById('generator-result-placeholder');
        const loader = document.getElementById('generator-result-loader');
        const resultImg = document.getElementById('generator-result-image');
        const progressBar = document.getElementById('generator-progress-bar');
        const downloadBtn = document.getElementById('generator-download-btn');

        if (!loader || !resultImg) return;

        if (placeholder) placeholder.style.display = 'none';
        resultImg.style.display = 'none';
        loader.style.display = 'flex';
        if (progressBar) progressBar.style.width = '0%';

        let progress = 0;
        let fetchError = null;
        let generatedPath = null;
        let generatedBase64 = null;
        let title = 'Generated Advertisement';

        const requestPromise = (async () => {
            try {
                const body = this.uploadedFile
                    ? { imageDataUrl: this.uploadedFile }
                    : { prompt: userPrompt || `${this.selectedStyle} style, ${this.selectedBg} background` };

                const response = await fetch('/api/generate', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                const contentType = response.headers.get('content-type') || '';
                const text = await response.text();
                const json = contentType.includes('application/json') ? JSON.parse(text) : null;

                if (!response.ok) {
                    const errorMessage = (json && (json.error || json.message)) || text || 'Generation request failed.';
                    throw new Error(errorMessage.trim());
                }

                if (!json || !json.success) {
                    const errorMessage = (json && (json.error || json.message)) || 'Generation request failed.';
                    throw new Error(errorMessage.trim());
                }

                generatedPath = json.item?.preview_path || null;
                generatedBase64 = json.imageBase64 || null;
                title = json.item?.title || title;
            } catch (err) {
                fetchError = err;
            }
        })();

        const interval = setInterval(() => {
            if (progress < 92) {
                progress += Math.floor(Math.random() * 8) + 4;
            } else {
                progress += 1;
            }
            progress = Math.min(progress, 98);
            if (progressBar) progressBar.style.width = `${progress}%`;
        }, 120);

        await requestPromise;
        clearInterval(interval);
        if (progressBar) progressBar.style.width = '100%';

        if (fetchError) {
            loader.style.display = 'none';
            alert(`Image generation failed: ${fetchError.message}`);
            return;
        }

        let outImg = '/assets/perfume_studio.png';
        if (generatedPath) {
            outImg = generatedPath;
        } else if (generatedBase64) {
            outImg = `data:image/png;base64,${generatedBase64}`;
        }

        loader.style.display = 'none';
        resultImg.src = outImg;
        resultImg.style.display = 'block';
        if (downloadBtn) {
            downloadBtn.href = outImg;
            downloadBtn.style.display = 'inline-flex';
        }

        if (this.uploadedFile) {
            this.app?.saveHistory({
                type: 'image',
                title: `${title} — ${this.selectedStyle} / ${this.selectedBg}`,
                prompt: 'Gemini advertisement generation',
                preview_path: generatedPath || '',
                content: ''
            });
        } else {
            this.app?.loadHistory();
            const total = this.app?.history?.filter(h => h.type === 'image').length || 0;
            this.app?.updateStat && this.app.updateStat('stat-images', total);
        }
    }

    static async generatePost() {
        const outputCard = document.getElementById('post-output-card');
        const charCounter = document.getElementById('post-char-counter');
        const tagsContainer = document.getElementById('post-tags-container');
        const langSelect = document.getElementById('post-lang-select');
        const toneSelect = document.getElementById('post-tone-select');
        const prodSel = document.getElementById('post-product-select');
        const productNameInput = document.getElementById('post-product-name');
        const productDescriptionInput = document.getElementById('post-product-description');

        if (!outputCard) return;

        const language = langSelect?.value || 'English';
        const tone = toneSelect?.value || 'Luxury';
        const platform = document.querySelector('#post-platform-tabs .badge-primary')?.dataset.platform || 'Instagram';
        const product = productNameInput?.value?.trim() || prodSel?.options[prodSel.selectedIndex]?.text || 'your product';
        const description = productDescriptionInput?.value?.trim() || '';

        outputCard.textContent = 'Generating marketing copy...';
        outputCard.style.opacity = '0.5';
        if (tagsContainer) tagsContainer.innerHTML = '';

        try {
            const response = await fetch('/api/generate-post', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product, platform, language, tone, description })
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Unable to generate post copy.');
            }

            const copyText = (data.generatedText || '').trim();
            outputCard.style.opacity = '1';
            outputCard.textContent = copyText || 'No content returned from AI.';

            if (charCounter) charCounter.textContent = `${outputCard.textContent.length} characters`;
            const tags = copyText.match(/#[\w\u0600-\u06FF]+/g) || [];
            if (tagsContainer) {
                tagsContainer.innerHTML = tags.map(t => `<span class="post-tag">${t}</span>`).join('');
            }

            this.app?.saveHistory({
                type: 'post',
                title: `${product} — ${platform} ${tone}`,
                prompt: `Product: ${product} | Description: ${description} | Platform: ${platform} | Tone: ${tone} | Language: ${language}`,
                preview_path: '',
                content: copyText
            });
        } catch (err) {
            outputCard.style.opacity = '1';
            outputCard.textContent = 'Failed to generate post. Please try again.';
            if (charCounter) charCounter.textContent = '0 characters';
            console.error('Post generation failed:', err);
            alert(`Post generation failed: ${err.message}`);
        }
    }

    static copyPost() {
        const outputCard = document.getElementById('post-output-card');
        const copyBtn = document.getElementById('post-copy-btn');
        const text = outputCard?.textContent || '';
        if (!text || text.startsWith('Press Generate') || text.startsWith('Generating')) return;
        navigator.clipboard.writeText(text).then(() => {
            if (copyBtn) {
                const orig = copyBtn.innerHTML;
                copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width:14px;height:14px;stroke:var(--accent)"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg> Copied!`;
                copyBtn.style.borderColor = 'var(--accent)';
                setTimeout(() => { copyBtn.innerHTML = orig; copyBtn.style.borderColor = ''; }, 2000);
            }
        });
    }
}
