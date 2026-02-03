// acessibilidade.js - Sistema otimizado de acessibilidade para ModeloTrabalhista

class AcessibilidadeManager {
    constructor() {
        this.prefix = 'modelotrabalhista_accessibility_';
        
        // Configurações padrão MODIFICADAS
        this.defaultSettings = {
            theme: 'light',
            fontSize: 16,
            highContrast: false,
            reducedMotion: false,
            dyslexiaFriendly: false,
            cursorSize: 'normal',
            voiceReader: false,
            voiceReaderRate: 1.0,
            voiceReaderVoice: null,
            vlibrasEnabled: true, // AGORA É TRUE POR PADRÃO
            focusHighlight: true,
            readableFonts: false,
            linkUnderline: false, // AGORA É FALSE POR PADRÃO
            showFloatingButtons: true
        };
        
        this.currentSettings = {};
        this.speechSynthesis = window.speechSynthesis;
        this.speechVoices = [];
        this.vlibrasInitialized = false;
        this.isPanelOpen = false;
        
        // CARREGAR IMEDIATAMENTE - não esperar DOMContentLoaded
        this.init();
    }

    init() {
        this.loadSettings();
        this.initVlibras(); // Vlibras independente do painel
        this.loadSpeechVoices();
        this.setupEventListeners();
        this.createAccessibilityButtons(); // Mini botões flutuantes
        this.applyAllSettings();
    }

    // ========== NOVO: CRIAR BOTÕES FLUTUANTES INDIVIDUAIS ==========
    createAccessibilityButtons() {
        // Botão principal (ícone de acessibilidade)
        this.createFloatingButton('main', 'fa-universal-access', 'Menu de acessibilidade', () => {
            this.togglePanel();
        });
        
        // Botões individuais (visíveis quando menu aberto)
        this.createFloatingButton('font-increase', 'fa-text-height', 'Aumentar texto', () => {
            this.adjustFontSize('increase');
        }, true);
        
        this.createFloatingButton('font-decrease', 'fa-text-height', 'Diminuir texto', () => {
            this.adjustFontSize('decrease');
        }, true);
        
        this.createFloatingButton('theme', 'fa-moon', 'Alternar tema', () => {
            this.toggleTheme();
        }, true);
        
        this.createFloatingButton('voice', 'fa-volume-up', 'Ler texto em voz alta', () => {
            this.toggleVoiceReader();
        }, true);
        
        this.createFloatingButton('contrast', 'fa-adjust', 'Alto contraste', () => {
            this.toggleHighContrast();
        }, true);
        
        this.createFloatingButton('readable', 'fa-font', 'Fontes legíveis', () => {
            this.toggleReadableFonts();
        }, true);
        
        this.createFloatingButton('underline', 'fa-underline', 'Sublinhar links', () => {
            this.toggleLinkUnderline();
        }, true);
    }

    createFloatingButton(id, icon, label, onClick, hiddenByDefault = false) {
        const button = document.createElement('button');
        button.id = `accessibility-${id}`;
        button.className = `accessibility-floating-btn ${hiddenByDefault ? 'hidden' : ''}`;
        button.setAttribute('aria-label', label);
        button.setAttribute('title', label);
        button.innerHTML = `<i class="fas ${icon}"></i>`;
        
        button.addEventListener('click', onClick);
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
            }
        });
        
        document.body.appendChild(button);
        return button;
    }

    toggleMiniButtons(show) {
        document.querySelectorAll('.accessibility-floating-btn:not(#accessibility-main)').forEach(btn => {
            if (show) {
                btn.classList.remove('hidden');
                setTimeout(() => btn.classList.add('visible'), 10);
            } else {
                btn.classList.remove('visible');
                setTimeout(() => btn.classList.add('hidden'), 300);
            }
        });
    }

    // ========== MODIFICADO: VLIBRAS INDEPENDENTE ==========
    initVlibras() {
        // Vlibras agora é independente - sempre carrega
        if (!document.querySelector('#vlibras-script')) {
            const script = document.createElement('script');
            script.id = 'vlibras-script';
            script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
            script.async = true;
            script.onload = () => {
                this.initializeVlibrasWidget();
            };
            document.head.appendChild(script);
        }
    }

    initializeVlibrasWidget() {
        if (this.vlibrasInitialized || !window.VLibras) return;
        
        try {
            new window.VLibras.Widget('https://vlibras.gov.br/app');
            this.vlibrasInitialized = true;
            
            // Estilo para o widget do Vlibras
            const style = document.createElement('style');
            style.textContent = `
                .vlibras-widget {
                    z-index: 9990 !important;
                    bottom: 100px !important;
                    right: 20px !important;
                }
                
                @media (max-width: 768px) {
                    .vlibras-widget {
                        bottom: 80px !important;
                        right: 10px !important;
                    }
                }
            `;
            document.head.appendChild(style);
        } catch (error) {
            console.error('Erro ao inicializar Vlibras:', error);
        }
    }

    // ========== MODIFICADO: SUBLINHADO DE LINKS ==========
    toggleLinkUnderline() {
        const enabled = !this.currentSettings.linkUnderline;
        this.updateSetting('linkUnderline', enabled);
        
        if (enabled) {
            this.applyLinkUnderline();
        } else {
            this.removeLinkUnderline();
        }
        
        // Atualizar ícone do botão flutuante
        const underlineBtn = document.getElementById('accessibility-underline');
        if (underlineBtn) {
            underlineBtn.classList.toggle('active', enabled);
            underlineBtn.innerHTML = `<i class="fas ${enabled ? 'fa-underline active' : 'fa-underline'}"></i>`;
        }
        
        return enabled;
    }

    applyLinkUnderline() {
        const styleId = 'accessibility-link-underline';
        let style = document.getElementById(styleId);
        
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        
        // SUBLINHADO APENAS EM LINKS COMUNS, NÃO EM TÍTULOS
        style.textContent = `
            a:not(.btn):not(.button):not(.nav-link):not(.navbar-brand):not(.logo-link) {
                text-decoration: underline !important;
                text-decoration-thickness: 1px !important;
                text-underline-offset: 2px !important;
            }
            
            /* Evitar sublinhado em elementos que não são links reais */
            h1 a, h2 a, h3 a, h4 a, h5 a, h6 a,
            .navbar a, .nav a, .btn, .button {
                text-decoration: none !important;
            }
        `;
    }

    removeLinkUnderline() {
        const style = document.getElementById('accessibility-link-underline');
        if (style) {
            style.remove();
        }
    }

    // ========== NOVO: ALTO CONTRASTE SIMPLIFICADO ==========
    toggleHighContrast() {
        const currentTheme = this.currentSettings.theme;
        const newTheme = currentTheme === 'high-contrast' ? 'light' : 'high-contrast';
        this.updateSetting('theme', newTheme);
        this.applyTheme(newTheme);
        
        // Atualizar botão
        const contrastBtn = document.getElementById('accessibility-contrast');
        if (contrastBtn) {
            contrastBtn.classList.toggle('active', newTheme === 'high-contrast');
        }
        
        return newTheme === 'high-contrast';
    }

    // ========== MODIFICADO: TEMA ==========
    toggleTheme() {
        const themes = ['light', 'dark'];
        const currentIndex = themes.indexOf(this.currentSettings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        this.updateSetting('theme', nextTheme);
        this.applyTheme(nextTheme);
        
        // Atualizar botão
        const themeBtn = document.getElementById('accessibility-theme');
        if (themeBtn) {
            themeBtn.innerHTML = `<i class="fas ${nextTheme === 'dark' ? 'fa-moon active' : 'fa-sun'}"></i>`;
        }
        
        return nextTheme;
    }

    // ========== MODIFICADO: PAINEL LATERAL ==========
    createAccessibilityPanel() {
        if (document.getElementById('accessibility-panel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.className = 'accessibility-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Configurações de acessibilidade');
        panel.setAttribute('aria-hidden', 'true');
        
        panel.innerHTML = `
            <div class="accessibility-header">
                <button id="accessibility-close" class="accessibility-close" aria-label="Fechar configurações">
                    <i class="fas fa-times"></i>
                </button>
                <h3><i class="fas fa-universal-access"></i> Acessibilidade</h3>
                <p>Ajuste as configurações conforme sua necessidade</p>
            </div>
            
            <div class="accessibility-content">
                <div class="accessibility-section">
                    <h4><i class="fas fa-text-height"></i> Texto</h4>
                    
                    <div class="accessibility-control">
                        <label>Tamanho da fonte</label>
                        <div class="accessibility-slider">
                            <button id="font-decrease-panel" class="slider-btn" aria-label="Diminuir">A-</button>
                            <input type="range" id="font-size-slider" min="12" max="24" value="${this.currentSettings.fontSize}" step="2">
                            <button id="font-increase-panel" class="slider-btn" aria-label="Aumentar">A+</button>
                            <span id="font-size-value" class="slider-value">${this.currentSettings.fontSize}px</span>
                        </div>
                    </div>
                    
                    <div class="accessibility-control">
                        <label>
                            <input type="checkbox" id="readable-fonts-checkbox" ${this.currentSettings.readableFonts ? 'checked' : ''}>
                            Fontes legíveis (para dislexia)
                        </label>
                    </div>
                </div>
                
                <div class="accessibility-section">
                    <h4><i class="fas fa-palette"></i> Cores</h4>
                    
                    <div class="accessibility-control">
                        <label>Tema</label>
                        <div class="theme-buttons">
                            <button class="theme-btn ${this.currentSettings.theme === 'light' ? 'active' : ''}" data-theme="light">
                                <i class="fas fa-sun"></i> Claro
                            </button>
                            <button class="theme-btn ${this.currentSettings.theme === 'dark' ? 'active' : ''}" data-theme="dark">
                                <i class="fas fa-moon"></i> Escuro
                            </button>
                            <button class="theme-btn ${this.currentSettings.theme === 'high-contrast' ? 'active' : ''}" data-theme="high-contrast">
                                <i class="fas fa-adjust"></i> Alto Contraste
                            </button>
                        </div>
                    </div>
                    
                    <div class="accessibility-control">
                        <label>
                            <input type="checkbox" id="link-underline-checkbox" ${this.currentSettings.linkUnderline ? 'checked' : ''}>
                            Sublinhar links
                        </label>
                    </div>
                </div>
                
                <div class="accessibility-section">
                    <h4><i class="fas fa-volume-up"></i> Áudio</h4>
                    
                    <div class="accessibility-control">
                        <label>
                            <input type="checkbox" id="voice-reader-checkbox" ${this.currentSettings.voiceReader ? 'checked' : ''}>
                            Leitor de voz
                        </label>
                    </div>
                    
                    <div class="accessibility-control ${this.currentSettings.voiceReader ? '' : 'disabled'}" id="voice-speed-control">
                        <label>Velocidade da voz</label>
                        <div class="accessibility-slider">
                            <input type="range" id="voice-rate-slider" min="0.5" max="2" value="${this.currentSettings.voiceReaderRate}" step="0.1">
                            <span id="voice-rate-value" class="slider-value">${this.currentSettings.voiceReaderRate}x</span>
                        </div>
                    </div>
                </div>
                
                <div class="accessibility-section">
                    <h4><i class="fas fa-cog"></i> Outros</h4>
                    
                    <div class="accessibility-control">
                        <label>
                            <input type="checkbox" id="focus-highlight-checkbox" ${this.currentSettings.focusHighlight ? 'checked' : ''}>
                            Destaque de foco
                        </label>
                    </div>
                    
                    <div class="accessibility-control">
                        <label>
                            <input type="checkbox" id="reduced-motion-checkbox" ${this.currentSettings.reducedMotion ? 'checked' : ''}>
                            Reduzir animações
                        </label>
                    </div>
                    
                    <div class="accessibility-control">
                        <label>Tamanho do cursor</label>
                        <select id="cursor-size-select" class="accessibility-select">
                            <option value="normal" ${this.currentSettings.cursorSize === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="large" ${this.currentSettings.cursorSize === 'large' ? 'selected' : ''}>Grande</option>
                            <option value="x-large" ${this.currentSettings.cursorSize === 'x-large' ? 'selected' : ''}>Extra Grande</option>
                        </select>
                    </div>
                </div>
                
                <div class="accessibility-actions">
                    <button id="reset-settings" class="reset-btn">
                        <i class="fas fa-redo"></i> Restaurar padrões
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.setupPanelEvents();
    }

    // ========== MODIFICADO: ABRIR/FECHAR PAINEL ==========
    togglePanel() {
        const panel = document.getElementById('accessibility-panel');
        
        if (!panel) {
            this.createAccessibilityPanel();
            return this.togglePanel();
        }
        
        this.isPanelOpen = !this.isPanelOpen;
        
        if (this.isPanelOpen) {
            panel.classList.add('open');
            panel.setAttribute('aria-hidden', 'false');
            document.getElementById('accessibility-main').classList.add('active');
            
            // Fechar mini botões quando painel aberto
            this.toggleMiniButtons(false);
            
            // Focar no botão de fechar
            setTimeout(() => document.getElementById('accessibility-close').focus(), 100);
        } else {
            panel.classList.remove('open');
            panel.setAttribute('aria-hidden', 'true');
            document.getElementById('accessibility-main').classList.remove('active');
            
            // Reabrir mini botões se configurado
            if (this.currentSettings.showFloatingButtons) {
                this.toggleMiniButtons(true);
            }
        }
    }

    // ========== ESTILOS OTIMIZADOS ==========
    addStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            /* Botões flutuantes */
            .accessibility-floating-btn {
                position: fixed;
                right: 20px;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
                border: none;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                cursor: pointer;
                z-index: 9995;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                opacity: 0.9;
            }
            
            .accessibility-floating-btn:hover,
            .accessibility-floating-btn:focus {
                opacity: 1;
                transform: scale(1.1);
                box-shadow: 0 6px 16px rgba(0,0,0,0.2);
            }
            
            .accessibility-floating-btn.active {
                background: linear-gradient(135deg, #10b981, #059669);
            }
            
            #accessibility-main {
                bottom: 30px;
                z-index: 9997;
            }
            
            #accessibility-font-increase {
                bottom: 90px;
                background: #3b82f6;
            }
            
            #accessibility-font-decrease {
                bottom: 150px;
                background: #3b82f6;
            }
            
            #accessibility-theme {
                bottom: 210px;
                background: #f59e0b;
            }
            
            #accessibility-voice {
                bottom: 270px;
                background: #ef4444;
            }
            
            #accessibility-contrast {
                bottom: 330px;
                background: #8b5cf6;
            }
            
            #accessibility-readable {
                bottom: 390px;
                background: #10b981;
            }
            
            #accessibility-underline {
                bottom: 450px;
                background: #6366f1;
            }
            
            /* Estados dos mini botões */
            .accessibility-floating-btn.hidden {
                opacity: 0;
                transform: translateX(100px);
                pointer-events: none;
            }
            
            .accessibility-floating-btn.visible {
                opacity: 0.9;
                transform: translateX(0);
                pointer-events: all;
            }
            
            /* Painel lateral otimizado */
            .accessibility-panel {
                position: fixed;
                top: 0;
                right: -400px;
                width: 380px;
                height: 100vh;
                background: white;
                box-shadow: -5px 0 25px rgba(0,0,0,0.1);
                z-index: 9998;
                transition: right 0.3s ease;
                overflow-y: auto;
                font-family: Arial, sans-serif;
            }
            
            .accessibility-panel.open {
                right: 0;
            }
            
            .accessibility-header {
                padding: 20px;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
            }
            
            .accessibility-header h3 {
                margin: 0 0 5px 0;
                font-size: 1.3rem;
            }
            
            .accessibility-header p {
                margin: 0;
                opacity: 0.9;
                font-size: 0.9rem;
            }
            
            .accessibility-content {
                padding: 20px;
            }
            
            .accessibility-section {
                margin-bottom: 25px;
            }
            
            .accessibility-control {
                margin-bottom: 15px;
            }
            
            .accessibility-control label {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                font-weight: 500;
            }
            
            .accessibility-slider {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 8px;
            }
            
            .theme-buttons {
                display: flex;
                gap: 10px;
                margin-top: 8px;
            }
            
            .theme-btn {
                flex: 1;
                padding: 8px 12px;
                border: 2px solid #e2e8f0;
                border-radius: 6px;
                background: white;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .theme-btn.active {
                border-color: #3b82f6;
                background: #eff6ff;
            }
            
            .slider-value {
                min-width: 50px;
                text-align: center;
                font-weight: bold;
                color: #3b82f6;
            }
            
            /* Tema escuro */
            [data-theme="dark"] .accessibility-panel {
                background: #1e293b;
                color: #f1f5f9;
            }
            
            [data-theme="dark"] .accessibility-control label {
                color: #f1f5f9;
            }
            
            [data-theme="dark"] .theme-btn {
                background: #334155;
                border-color: #475569;
                color: #f1f5f9;
            }
            
            [data-theme="dark"] .theme-btn.active {
                border-color: #60a5fa;
                background: #1e3a8a;
            }
            
            /* Alto contraste */
            [data-theme="high-contrast"] .accessibility-panel {
                background: black;
                color: white;
                border-left: 3px solid yellow;
            }
            
            [data-theme="high-contrast"] .accessibility-header {
                background: black;
                border-bottom: 3px solid yellow;
            }
            
            /* Responsividade */
            @media (max-width: 768px) {
                .accessibility-panel {
                    width: 100%;
                    right: -100%;
                }
                
                .accessibility-floating-btn {
                    width: 45px;
                    height: 45px;
                    font-size: 18px;
                    right: 15px;
                }
                
                #accessibility-main {
                    bottom: 20px;
                }
                
                /* Ajustar posições dos mini botões para mobile */
                #accessibility-font-increase { bottom: 75px; }
                #accessibility-font-decrease { bottom: 130px; }
                #accessibility-theme { bottom: 185px; }
                #accessibility-voice { bottom: 240px; }
                #accessibility-contrast { bottom: 295px; }
                #accessibility-readable { bottom: 350px; }
                #accessibility-underline { bottom: 405px; }
            }
            
            /* Animações reduzidas */
            @media (prefers-reduced-motion: reduce) {
                .accessibility-floating-btn,
                .accessibility-panel {
                    transition: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // ========== CARREGAR MAIS RÁPIDO ==========
    // Removemos o DOMContentLoaded e carregamos imediatamente
}

// Inicializar imediatamente (não esperar DOMContentLoaded)
window.addEventListener('load', () => {
    // Adicionar estilos primeiro
    const manager = new AcessibilidadeManager();
    manager.addStyles();
    
    // Expor globalmente para debugging
    window.accessibilityManager = manager;
});

// Manter métodos públicos globais
window.AcessibilidadeManager = AcessibilidadeManager;
