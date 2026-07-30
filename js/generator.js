/* AI Marketing Studio Generator & Simulation Logic */
import MockData from './mockData.js';

// Pre-defined copywriting assets to output beautiful realistic results
const MarketingCopy = {
    'prod-1': { // Aura Perfume
        'English': {
            'Luxury': `✨ Rediscover elegance. Aura Eau de Parfum ✨\n\nA sensory masterpiece meticulously crafted for the modern visionary. Infused with fresh floral highlights and a warm, woody base, Aura isn't just a fragrance; it is your signature.\n\nExperience luxury in every droplet.\n\n🛒 Order now at luxeparfum.com`,
            'Professional': `Introducing the new Aura Eau de Parfum by Luxe Parfum. Designed to deliver a sophisticated olfactive experience, Aura combines premium botanicals and sustainable ingredients to meet the standards of executive wear. Elevate your presence in the boardroom and beyond.\n\nRead our scent design case study at luxeparfum.com/design.`,
            'Friendly': `Hey friends! 🌸 We are so excited to show you our new favorite scent: Aura! It's light, fresh, and has this super cozy woody vibe that lasts all day. Seriously, you'll get compliments everywhere you go. Grab yours today!`,
            'Minimal': `Aura. Timeless fragrance.\n\nNotes of white jasmine, rosewood, and amber.\n\nShop Luxe Parfum.`
        },
        'French': {
            'Luxury': `✨ Redécouvrez l'élégance. Aura Eau de Parfum ✨\n\nUn chef-d'œuvre olfactif minutieusement conçu pour l'esprit moderne. Sublimé par des éclats floraux frais et un fond boisé chaleureux, Aura n'est pas qu'un parfum ; c'est votre signature.\n\nL'expérience du luxe à chaque instant.\n\n🛒 Disponible dès maintenant sur luxeparfum.fr`,
            'Professional': `Lancement officiel de la nouvelle fragrance professionnelle Aura par Luxe Parfum. Conçue pour une tenue parfaite en milieu de travail, Aura allie raffinement et sobriété pour parfaire votre image au quotidien.\n\nDécouvrez la note de synthèse sur luxeparfum.fr/design.`,
            'Friendly': `Coucou tout le monde ! 🌸 Trop hâte de vous présenter notre coup de cœur : Aura ! Un parfum léger, frais avec des notes boisées super cocooning pour toute la journée. Vous allez l'adorer !\n\nLien en bio pour commander.`,
            'Minimal': `Aura. L'essence de la simplicité.\n\nJasmin, bois de rose, et ambre.\n\nLuxe Parfum.`
        },
        'Arabic': {
            'Luxury': `✨ أعد تعريف الأناقة مع عطر أورا الخلاب ✨\n\nتحفة عطرية مصممة خصيصاً للشخصية العصرية. يمزج أورا بين نغمات الزهور المنعشة وقاعدة خشبية دافئة ليمنحك حضوراً لا ينسى.\n\nعش تجربة الفخامة مع كل رشة.\n\n🛒 اطلب الآن عبر luxeparfum.com`,
            'Professional': `نقدم لكم عطر أورا الجديد من لوكس بارفيوم. صمم هذا العطر ليمنحك حضوراً واثقاً ومحترفاً طوال اليوم، بمزيج متوازن يلائم بيئة العمل والمناسبات الرسمية.\n\nللمزيد تفضل بزيارة موقعنا.`,
            'Friendly': `يا أصدقاء! 🌸 متحمسين جداً نشارككم عطرنا المفضل الجديد: أورا! خفيف، منعش، وريحته تاخذ العقل وتدوم معاكم طول اليوم. جربوه الحين وقولوا لنا رايكم!`,
            'Minimal': `أورا. عبير البساطة.\n\nالياسمين، خشب الورد، والعنبر.\n\nلوكس بارفيوم.`
        }
    },
    'prod-2': { // Apex Headphones
        'English': {
            'Luxury': `🎧 Silence the Noise. Elevate the Sound.\n\nPresenting Apex Sound ANC Headphones. Featuring custom-tuned 40mm beryllium drivers, high-fidelity noise cancellation, and a hand-crafted carbon frame, Apex sets a new standard for luxury audio.\n\nIndulge in sound purity.\n\n💎 Discover the collection: apexaudio.com`,
            'Professional': `Apex Sound Active Noise Cancelling headphones deliver class-leading acoustic separation for professionals. Ideal for remote collaboration, virtual meetings, and focused workspaces, Apex features 40 hours of battery life and studio-grade microphone arrays.\n\nOptimize your workflow today at apexaudio.com.`,
            'Friendly': `Ready to block out the noise? 🤫 The new Apex Sound headphones are a total game-changer. The cushions feel like clouds, the noise cancellation is unreal, and the sound is SO crisp! Perfect for study sessions, working out, or just zoning out.`,
            'Minimal': `Apex Sound ANC.\n\n40h Battery. Active Noise Cancellation. Beryllium Drivers.\n\nPure Audio. apexaudio.com`
        },
        'French': {
            'Luxury': `🎧 Le silence absolu. Le son sublimé.\n\nDécouvrez le casque à réduction de bruit Apex Sound. Doté de transducteurs en béryllium de 40 mm et de finitions en carbone, Apex redéfinit l'écoute haut de gamme.\n\nSuccombez à la pureté sonore.\n\n💎 Collection exclusive sur apexaudio.fr`,
            'Professional': `Le casque Apex Sound ANC offre une isolation acoustique optimale pour les professionnels. Idéal pour le télétravail, les visioconférences et la concentration, il intègre un micro de qualité studio et 40 heures d'autonomie.\n\nÉquipez vos collaborateurs sur apexaudio.fr.`,
            'Friendly': `Besoin de déconnecter ? 🤫 Le nouveau casque Apex Sound est juste incroyable ! Super confortable, isolation au top et un son ultra net. Bref, le compagnon idéal pour bosser ou chiller en musique.`,
            'Minimal': `Apex Sound ANC.\n\nAutonomie 40h. Réduction de bruit active.\n\nL'audio pur.`
        },
        'Arabic': {
            'Luxury': `🎧 اعزل الضوضاء. واستمتع بنقاء الصوت.\n\nنقدم لكم سماعات أيبكس ساوند الفاخرة مع ميزة عزل الضوضاء النشط. إطار مريح من ألياف الكربون ونقاء صوتي لا مثيل له لترتقي بتجربتك الموسيقية.\n\nاستمع بأسلوب راقٍ.\n\n💎 اكتشف المزيد: apexaudio.com`,
            'Professional': `توفر سماعات Apex Sound ANC عزلاً صوتياً متطوراً للمهنيين والمبدعين. مثالية للعمل عن بعد والاجتماعات الافتراضية، مع بطارية تدوم 40 ساعة وميكروفون نقي.\n\nارتقِ بإنتاجيتك اليوم عبر موقعنا.`,
            'Friendly': `تبغى تفصل عن العالم وتسمع بوضوح؟ 🤫 سماعات أيبكس الجديدة رهيبة بشكل مو طبيعي! مريحة جداً على الأذن وعزلها خيالي. مناسبة جداً للعمل، الدراسة، أو السفر.`,
            'Minimal': `أيبكس ساوند ANC.\n\nبطارية 40 ساعة. عزل ضوضاء فعال.\n\nنقاوة الصوت.`
        }
    }
};

const DefaultCopy = {
    'English': `🚀 Boost your brand presence with our new AI Marketing tools!\n\nGenerate stunning visuals, write premium copy instantly, and launch high-converting campaigns in minutes. Join over 10,000+ businesses growing faster.\n\nGet started free today!\n\n#AIMarketing #SaaS #GrowthHacking #AIStartups`,
    'French': `🚀 Propulsez votre marque grâce à nos nouveaux outils marketing IA !\n\nGénérez des visuels époustouflants, rédigez des textes captivants et lancez des campagnes ultra-performantes en quelques minutes.\n\nCommencez gratuitement dès aujourd'hui !\n\n#MarketingIA #SaaS #MarketingDigital`,
    'Arabic': `🚀 ارتقِ بعلامتك التجارية اليوم مع أدوات التسويق الذكي الجديدة!\n\nصمم صوراً احترافية، واكتب نصوصاً تسويقية جذابة فوراً، وأطلق حملاتك الإعلانية خلال دقائق.\n\nابدأ مجاناً اليوم!\n\n#الذكاء_الاصطناعي #تسويق #ريادة_الأعمال`
};

export class GenerationManager {
    static init(appController) {
        this.app = appController;
        this.selectedStyle = 'luxury';
        this.selectedBg = 'marble';
        this.selectedLighting = 'golden';
        this.uploadedFile = null;
        
        this.bindEvents();
    }
    
    static bindEvents() {
        // Image Generator Style Selectors
        document.querySelectorAll('#style-selector .style-card').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('#style-selector .style-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.selectedStyle = card.dataset.value;
            });
        });
        
        // Background selector
        const bgSelect = document.getElementById('generator-bg-select');
        if (bgSelect) {
            bgSelect.addEventListener('change', (e) => {
                this.selectedBg = e.target.value;
            });
        }
        
        // Lighting selector
        const lightSelect = document.getElementById('generator-light-select');
        if (lightSelect) {
            lightSelect.addEventListener('change', (e) => {
                this.selectedLighting = e.target.value;
            });
        }
        
        // File Drag & Drop
        const dropZone = document.getElementById('generator-upload-zone');
        const fileInput = document.getElementById('generator-file-input');
        const previewImg = document.getElementById('generator-preview-img');
        const clearBtn = document.getElementById('generator-clear-upload');
        
        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());
            
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });
            
            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('dragover');
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                if (e.dataTransfer.files.length) {
                    this.handleUpload(e.dataTransfer.files[0], previewImg, clearBtn, dropZone);
                }
            });
            
            fileInput.addEventListener('change', (e) => {
                if (fileInput.files.length) {
                    this.handleUpload(fileInput.files[0], previewImg, clearBtn, dropZone);
                }
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.uploadedFile = null;
                if (fileInput) fileInput.value = '';
                if (previewImg) {
                    previewImg.style.display = 'none';
                    previewImg.src = '';
                }
                clearBtn.style.display = 'none';
                dropZone.querySelector('div').style.display = 'block';
            });
        }
        
        // Trigger Image Generation
        const generateImgBtn = document.getElementById('generator-submit-btn');
        if (generateImgBtn) {
            generateImgBtn.addEventListener('click', () => this.generateImage());
        }
        
        // Trigger Post Generation
        const generatePostBtn = document.getElementById('post-submit-btn');
        if (generatePostBtn) {
            generatePostBtn.addEventListener('click', () => this.generatePost());
        }
        
        // Copy to clipboard Post Generator
        const copyPostBtn = document.getElementById('post-copy-btn');
        if (copyPostBtn) {
            copyPostBtn.addEventListener('click', () => this.copyPostToClipboard());
        }
    }
    
    static handleUpload(file, previewImg, clearBtn, dropZone) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            clearBtn.style.display = 'block';
            dropZone.querySelector('div').style.display = 'none';
            this.uploadedFile = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // Simulate premium AI Image Generation
    static generateImage() {
        const promptInput = document.getElementById('generator-prompt-input');
        const promptText = promptInput ? promptInput.value.trim() : '';
        
        // Verify user has credits
        if (this.app.credits <= 0) {
            alert('You do not have enough credits. Please upgrade to Pro.');
            return;
        }
        
        // UI Loader elements
        const placeholder = document.getElementById('generator-result-placeholder');
        const loader = document.getElementById('generator-result-loader');
        const resultImg = document.getElementById('generator-result-image');
        const progressBar = document.getElementById('generator-progress-bar');
        const progressContainer = document.getElementById('generator-progress-container');
        
        if (!loader || !resultImg) return;
        
        // Activate Loader
        if (placeholder) placeholder.style.display = 'none';
        resultImg.style.display = 'none';
        loader.style.display = 'flex';
        
        // Reset progress bar
        if (progressContainer) progressContainer.style.display = 'block';
        if (progressBar) progressBar.style.width = '0%';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            if (progressBar) progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                
                // Select output image based on selections to simulate smart matching
                let outImg = './assets/perfume_studio.png'; // Default luxury
                let title = 'Aura Eau de Parfum - Studio Render';
                
                if (this.selectedStyle === 'technology') {
                    outImg = './assets/headphones.png';
                    title = 'Apex Sound - Neon Concept';
                } else if (this.selectedStyle === 'cosmetics' && promptText.toLowerCase().includes('cream')) {
                    outImg = './assets/cream.png';
                    title = 'Hydra Glow Cream - Soft Shade';
                } else if (this.selectedStyle === 'luxury' && promptText.toLowerCase().includes('watch')) {
                    outImg = './assets/watch.png';
                    title = 'Vanguard Watch - Dark Chrono';
                } else if (this.uploadedFile) {
                    // If they uploaded a file, we "process" it and display a cool product render
                    outImg = this.uploadedFile;
                    title = 'Custom Product - AI Creative Studio';
                }
                
                // Set image src and reveal
                resultImg.src = outImg;
                loader.style.display = 'none';
                resultImg.style.display = 'block';
                if (progressContainer) progressContainer.style.display = 'none';
                
                // Deduct credits and log activity
                this.app.deductCredits(1);
                
                // Add to History state
                const newHistItem = {
                    id: `hist-${Date.now()}`,
                    type: 'image',
                    title: title,
                    preview: outImg,
                    prompt: promptText || `Generated image in ${this.selectedStyle} style, background: ${this.selectedBg}`,
                    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                    status: 'Completed'
                };
                MockData.history.unshift(newHistItem);
                this.app.renderHistory();
                
                // Add new activity log
                this.app.logActivity('Generated Ad Image', title, 'Just now', 'image');
            }
        }, 150);
    }
    
    // Simulate AI Post Generation
    static generatePost() {
        const prodSelect = document.getElementById('post-product-select');
        const platform = document.querySelector('#post-platform-tabs .badge-primary')?.textContent || 'Instagram';
        const language = document.getElementById('post-lang-select')?.value || 'English';
        const tone = document.getElementById('post-tone-select')?.value || 'Luxury';
        
        const outputCard = document.getElementById('post-output-card');
        const charCounter = document.getElementById('post-char-counter');
        const hashtagContainer = document.getElementById('post-tags-container');
        
        if (!outputCard) return;
        
        // Verify credits
        if (this.app.credits <= 0) {
            alert('You do not have enough credits. Please upgrade to Pro.');
            return;
        }
        
        outputCard.textContent = 'Analyzing product values...';
        outputCard.style.opacity = '0.5';
        
        setTimeout(() => {
            outputCard.textContent = 'Crafting marketing copy...';
        }, 1000);
        
        setTimeout(() => {
            const selectedProdId = prodSelect ? prodSelect.value : 'prod-1';
            let copyText = '';
            
            if (MarketingCopy[selectedProdId] && MarketingCopy[selectedProdId][language] && MarketingCopy[selectedProdId][language][tone]) {
                copyText = MarketingCopy[selectedProdId][language][tone];
            } else {
                copyText = DefaultCopy[language] || DefaultCopy['English'];
            }
            
            // Output text typewriter style
            outputCard.style.opacity = '1';
            outputCard.textContent = '';
            
            let i = 0;
            const typingInterval = setInterval(() => {
                outputCard.textContent += copyText.charAt(i);
                i++;
                if (charCounter) charCounter.textContent = `${outputCard.textContent.length} characters`;
                
                if (i >= copyText.length) {
                    clearInterval(typingInterval);
                    
                    // Deduct credit
                    this.app.deductCredits(1);
                    
                    // Generate dynamic hashtag chips
                    if (hashtagContainer) {
                        hashtagContainer.innerHTML = '';
                        const tags = copyText.match(/#[A-Za-z0-9]+/g) || ['#AIMarketing', '#SaaS', '#AIAdStudio'];
                        tags.forEach(tag => {
                            const chip = document.createElement('span');
                            chip.className = 'post-tag';
                            chip.textContent = tag;
                            hashtagContainer.appendChild(chip);
                        });
                    }
                    
                    // Add to history
                    const selectedProdName = prodSelect ? prodSelect.options[prodSelect.selectedIndex].text : 'Product';
                    const newHistItem = {
                        id: `hist-${Date.now()}`,
                        type: 'post',
                        title: `${selectedProdName} - ${tone} Post`,
                        preview: '',
                        prompt: `${platform} post, ${tone} tone, ${language}.`,
                        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                        status: 'Completed',
                        content: copyText
                    };
                    MockData.history.unshift(newHistItem);
                    this.app.renderHistory();
                    
                    this.app.logActivity('Generated Ad Post', `${selectedProdName} Copy`, 'Just now', 'post');
                }
            }, 5);
            
        }, 2000);
    }
    
    // Clipboard copy mechanism
    static copyPostToClipboard() {
        const outputCard = document.getElementById('post-output-card');
        const copyBtn = document.getElementById('post-copy-btn');
        if (!outputCard || !copyBtn) return;
        
        const textToCopy = outputCard.textContent;
        if (textToCopy === 'Press Generate to craft your marketing post.' || textToCopy.startsWith('Analyzing') || textToCopy.startsWith('Crafting')) {
            return;
        }
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Animate copy feedback
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width:16px;height:16px;stroke:var(--accent)">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Copied!</span>
            `;
            copyBtn.style.borderColor = 'var(--accent)';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.style.borderColor = '';
            }, 2000);
            
            this.app.logActivity('Copied Post Copy', 'Clipboard Sync', 'Just now', 'post');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }
}
