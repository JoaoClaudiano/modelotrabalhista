// acessibilidade.js - Sistema de acessibilidade com botão único e card flutuante

class AcessibilidadeManager {
    constructor() {
        this.prefix = 'modelotrabalhista_accessibility_';
        
        // Configurações padrão (sem Vlibras)
        this.defaultSettings = {
            theme: 'light',
            fontSize: 16,
            highContrast: false,
            readableFonts: false,
            linkUnderline: false
        };
        
        this.currentSettings = {};
        this.cardVisible = false;
        
        // Inicialização segura
        setTimeout(() => this.safeInit(), 100);
    }

    safeInit() {
        try {
            this.init();
        } catch (error) {
            console.error('Erro na inicialização do sistema de acessibilidade:', error);
        }
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.createAccessibilityButton();
        this.applyAllSettings();
        
        // Log de sucesso
        if (window.appLogger) {
            window.appLogger.info('Sistema de acessibilidade carregado com sucesso');
        }
    }

    // ========== CONFIGURAÇÕES ==========
    loadSettings() {
        try {
            const saved = localStorage.getItem(`${this.prefix}settings`);
            this.currentSettings = saved ? 
                { ...this.defaultSettings, ...JSON.parse(saved) } : 
                { ...this.defaultSettings };
        } catch (e) {
            this.currentSettings = { ...this.defaultSettings };
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(`${this.prefix}settings`, JSON.stringify(this.currentSettings));
        } catch (e) {
            console.error('Erro ao salvar configurações:', e);
        }
    }

    updateSetting(key, value) {
        this.currentSettings[key] = value;
        this.saveSettings();
        this.applySetting(key, value);
        return true;
    }

    // ========== BOTÃO ÚNICO ==========
    createAccessibilityButton() {
        // Remover botões antigos se existirem
        const oldButton = document.getElementById('accessibility-toggle');
        const oldPanel = document.getElementById('accessibility-panel');
        const oldMinimal = document.getElementById('minimal-accessibility-toggle');
        
        if (oldButton) oldButton.remove();
        if (oldPanel) oldPanel.remove();
        if (oldMinimal) oldMinimal.remove();
        
        // Criar botão único
        const button = document.createElement('button');
        button.id = 'accessibility-toggle';
        button.className = 'accessibility-toggle';
        button.innerHTML = '<i class="fas fa-universal-access"></i>';
        button.title = 'Acessibilidade';
        button.setAttribute('aria-label', 'Abrir menu de acessibilidade');
        
        button.onclick = () => this.toggleCard();
        document.body.appendChild(button);
        
        // Criar card flutuante
        this.createFloatingCard();
        this.addStyles();
    }

    // ========== CARD FLUTUANTE ==========
    createFloatingCard() {
        const card = document.createElement('div');
        card.id = 'accessibility-card';
        card.className = 'accessibility-card';
        card.setAttribute('aria-hidden', 'true');
        card.setAttribute('role', 'dialog');
        card.setAttribute('aria-label', 'Opções de acessibilidade');
        
        card.innerHTML = `
            <div class="accessibility-card-header">
                <h3><i class="fas fa-universal-access"></i> Acessibilidade</h3>
                <button class="accessibility-card-close" aria-label="Fechar">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="accessibility-card-content">
                <div class="accessibility-card-section">
                    <h4><i class="fas fa-text-height"></i> Tamanho do Texto</h4>
                    <div class="accessibility-card-controls">
                        <button class="accessibility-card-btn" data-action="decrease-font" title="Diminuir texto">
                            <i class="fas fa-minus"></i> A-
                        </button>
                        <span class="accessibility-card-value" id="font-size-value">${this.currentSettings.fontSize}px</span>
                        <button class="accessibility-card-btn" data-action="increase-font" title="Aumentar texto">
                            A+ <i class="fas fa-plus"></i>
                        </button>
                        <button class="accessibility-card-btn small" data-action="reset-font" title="Tamanho padrão">
                            <i class="fas fa-redo"></i>
                        </button>
                    </div>
                </div>
                
                <div class="accessibility-card-section">
                    <h4><i class="fas fa-palette"></i> Tema</h4>
                    <div class="accessibility-card-buttons">
                        <button class="accessibility-card-btn theme-btn ${this.currentSettings.theme === 'light' ? 'active' : ''}" 
                                data-action="set-theme" data-value="light" title="Tema claro">
                            <i class="fas fa-sun"></i> Claro
                        </button>
                        <button class="accessibility-card-btn theme-btn ${this.currentSettings.theme === 'dark' ? 'active' : ''}" 
                                data-action="set-theme" data-value="dark" title="Tema escuro">
                            <i class="fas fa-moon"></i> Escuro
                        </button>
                        <button class="accessibility-card-btn theme-btn ${this.currentSettings.theme === 'high-contrast' ? 'active' : ''}" 
                                data-action="set-theme" data-value="high-contrast" title="Alto contraste">
                            <i class="fas fa-adjust"></i> Contraste
                        </button>
                    </div>
                </div>
                
                <div class="accessibility-card-section">
                    <h4><i class="fas fa-cog"></i> Outras Opções</h4>
                    <div class="accessibility-card-switches">
                        <label class="accessibility-card-switch">
                            <input type="checkbox" id="link-underline-switch" ${this.currentSettings.linkUnderline ? 'checked' : ''}>
                            <span class="slider"></span>
                            <span class="switch-label">
                                <i class="fas fa-underline"></i> Sublinhar links
                            </span>
                        </label>
                        
                        <label class="accessibility-card-switch">
                            <input type="checkbox" id="readable-fonts-switch" ${this.currentSettings.readableFonts ? 'checked' : ''}>
                            <span class="slider"></span>
                            <span class="switch-label">
                                <i class="fas fa-font"></i> Fontes legíveis
                            </span>
                        </label>
                    </div>
                </div>
                
                <div class="accessibility-card-footer">
                    <button class="accessibility-card-reset" data-action="reset-all">
                        <i class="fas fa-redo"></i> Restaurar Padrões
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(card);
        this.setupCardEvents();
    }

    toggleCard() {
        const card = document.getElementById('accessibility-card');
        const button = document.getElementById('accessibility-toggle');
        
        if (this.cardVisible) {
            card.classList.remove('visible');
            button.classList.remove('active');
            card.setAttribute('aria-hidden', 'true');
            this.cardVisible = false;
        } else {
            card.classList.add('visible');
            button.classList.add('active');
            card.setAttribute('aria-hidden', 'false');
            this.cardVisible = true;
        }
    }

    setupCardEvents() {
        // Botão de fechar
        document.querySelector('.accessibility-card-close').onclick = () => this.toggleCard();
        
        // Botões de ação
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.onclick = (e) => {
                const action = e.target.closest('[data-action]').dataset.action;
                const value = e.target.closest('[data-value]')?.dataset.value;
                this.handleCardAction(action, value, e.target);
            };
        });
        
        // Switches
        document.getElementById('link-underline-switch').onchange = (e) => {
            this.updateSetting('linkUnderline', e.target.checked);
        };
        
        document.getElementById('readable-fonts-switch').onchange = (e) => {
            this.updateSetting('readableFonts', e.target.checked);
        };
        
        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            const card = document.getElementById('accessibility-card');
            const button = document.getElementById('accessibility-toggle');
            
            if (this.cardVisible && 
                !card.contains(e.target) && 
                !button.contains(e.target)) {
                this.toggleCard();
            }
        });
        
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.cardVisible) {
                this.toggleCard();
            }
        });
    }

    handleCardAction(action, value, button) {
        switch(action) {
            case 'increase-font':
                this.adjustFontSize('increase');
                break;
            case 'decrease-font':
                this.adjustFontSize('decrease');
                break;
            case 'reset-font':
                this.adjustFontSize('reset');
                break;
            case 'set-theme':
                this.setTheme(value);
                // Atualizar botões ativos
                document.querySelectorAll('.theme-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                break;
            case 'reset-all':
                if (confirm('Restaurar todas as configurações para os valores padrão?')) {
                    this.resetSettings();
                }
                break;
        }
    }

    // ========== FUNÇÕES DE ACESSIBILIDADE ==========
    setTheme(theme) {
        this.updateSetting('theme', theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        const styleId = 'theme-style';
        let style = document.getElementById(styleId);
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        
        if (theme === 'dark') {
            style.textContent = `
                body {
                    background-color: #1a1a1a !important;
                    color: #f0f0f0 !important;
                }
                
                /* Seções e contêineres */
                section, .section, div[class*="section"],
                .container, .content, .wrapper,
                .hero, .features, .about, .faq,
                #hero, #modelos, #gerador, #sobre, #faq, #beneficios {
                    background-color: #1a1a1a !important;
                    color: #f0f0f0 !important;
                }
                
                /* Cards e painéis */
                .card, .panel, .box, .item,
                .model-card, .feature-card, .faq-item,
                .form-container, .preview-container, .form-card {
                    background-color: #2d2d2d !important;
                    color: #f0f0f0 !important;
                    border-color: #404040 !important;
                }
                
                /* Inputs e formulários */
                input, textarea, select {
                    background-color: #2d2d2d !important;
                    color: #f0f0f0 !important;
                    border-color: #404040 !important;
                }
                
                input::placeholder, textarea::placeholder {
                    color: #a0a0a0 !important;
                }
                
                /* Botões */
                button:not(.accessibility-card-btn):not(.accessibility-toggle):not([class*="tour"]) {
                    background-color: #3d3d3d !important;
                    color: #f0f0f0 !important;
                    border-color: #505050 !important;
                }
                
                button.btn-primary, button[class*="primary"] {
                    background-color: #2563eb !important;
                    color: white !important;
                }
                
                /* Links */
                a {
                    color: #60a5fa !important;
                }
                
                /* Cabeçalhos */
                h1, h2, h3, h4, h5, h6 {
                    color: #f0f0f0 !important;
                }
                
                /* Rodapé */
                footer {
                    background-color: #0d0d0d !important;
                    color: #f0f0f0 !important;
                }
                
                /* Navegação */
                nav, .navbar, header {
                    background-color: #0d0d0d !important;
                    color: #f0f0f0 !important;
                }
            `;
        } else if (theme === 'high-contrast') {
            style.textContent = `
                body {
                    background: black !important;
                    color: white !important;
                }
                
                /* Seções e contêineres */
                section, .section, div[class*="section"],
                .container, .content, .wrapper,
                .hero, .features, .about, .faq,
                #hero, #modelos, #gerador, #sobre, #faq, #beneficios {
                    background-color: black !important;
                    color: white !important;
                }
                
                /* Cards e painéis */
                .card, .panel, .box, .item,
                .model-card, .feature-card, .faq-item,
                .form-container, .preview-container, .form-card {
                    background-color: black !important;
                    color: white !important;
                    border: 3px solid yellow !important;
                }
                
                /* Inputs e formulários */
                input, textarea, select {
                    background-color: black !important;
                    color: white !important;
                    border: 2px solid yellow !important;
                }
                
                input::placeholder, textarea::placeholder {
                    color: yellow !important;
                    opacity: 0.7 !important;
                }
                
                /* Botões */
                button:not(.accessibility-card-btn):not(.accessibility-toggle):not([class*="tour"]) {
                    background-color: black !important;
                    color: yellow !important;
                    border: 2px solid yellow !important;
                }
                
                /* Links */
                a {
                    color: yellow !important;
                    text-decoration: underline !important;
                }
                
                /* Cabeçalhos */
                h1, h2, h3, h4, h5, h6 {
                    color: white !important;
                }
                
                /* Rodapé */
                footer {
                    background-color: black !important;
                    color: white !important;
                    border-top: 3px solid yellow !important;
                }
                
                /* Navegação */
                nav, .navbar, header {
                    background-color: black !important;
                    color: white !important;
                    border-bottom: 3px solid yellow !important;
                }
            `;
        } else {
            // Clear all theme styles to allow the page to revert to its default CSS
            style.textContent = '';
        }
    }

    adjustFontSize(direction) {
        let newSize = this.currentSettings.fontSize;
        
        if (direction === 'increase' && newSize < 24) {
            newSize += 2;
        } else if (direction === 'decrease' && newSize > 12) {
            newSize -= 2;
        } else if (direction === 'reset') {
            newSize = this.defaultSettings.fontSize;
        }
        
        this.updateSetting('fontSize', newSize);
        
        // Atualizar display
        const display = document.getElementById('font-size-value');
        if (display) {
            display.textContent = `${newSize}px`;
        }
        
        return newSize;
    }

    applyFontSize(size) {
        document.documentElement.style.fontSize = `${size}px`;
    }

    applyLinkUnderline(enabled) {
        const styleId = 'link-underline-style';
        let style = document.getElementById(styleId);
        
        if (enabled) {
            if (!style) {
                style = document.createElement('style');
                style.id = styleId;
                document.head.appendChild(style);
            }
            style.textContent = `
                a:not(.btn):not(.button):not(.navbar-brand) {
                    text-decoration: underline !important;
                    text-decoration-thickness: 1px !important;
                }
                
                /* Exceções para elementos que não devem ser sublinhados */
                h1 a, h2 a, h3 a, h4 a, h5 a, h6 a,
                .navbar a, .nav a,
                .btn a, .button a,
                .card-title a, .title a {
                    text-decoration: none !important;
                }
            `;
        } else if (style) {
            style.remove();
        }
    }

    applyReadableFonts(enabled) {
        const styleId = 'readable-fonts-style';
        let style = document.getElementById(styleId);
        
        if (enabled) {
            if (!style) {
                style = document.createElement('style');
                style.id = styleId;
                document.head.appendChild(style);
            }
            style.textContent = `
                body, p, li, span, a, input, textarea, select, button {
                    font-family: Arial, Helvetica, sans-serif !important;
                    letter-spacing: 0.5px !important;
                    line-height: 1.6 !important;
                }
            `;
        } else if (style) {
            style.remove();
        }
    }

    // ========== APLICAÇÃO ==========
    applySetting(key, value) {
        switch(key) {
            case 'theme':
                this.applyTheme(value);
                break;
            case 'fontSize':
                this.applyFontSize(value);
                break;
            case 'linkUnderline':
                this.applyLinkUnderline(value);
                break;
            case 'readableFonts':
                this.applyReadableFonts(value);
                break;
        }
    }

    applyAllSettings() {
        Object.entries(this.currentSettings).forEach(([key, value]) => {
            this.applySetting(key, value);
        });
    }

    resetSettings() {
        this.currentSettings = { ...this.defaultSettings };
        this.saveSettings();
        this.applyAllSettings();
        
        // Atualizar UI
        setTimeout(() => {
            const underlineSwitch = document.getElementById('link-underline-switch');
            const fontsSwitch = document.getElementById('readable-fonts-switch');
            const fontSizeDisplay = document.getElementById('font-size-value');
            
            if (underlineSwitch) underlineSwitch.checked = false;
            if (fontsSwitch) fontsSwitch.checked = false;
            if (fontSizeDisplay) fontSizeDisplay.textContent = `${this.defaultSettings.fontSize}px`;
            
            // Atualizar botões de tema
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.value === 'light') {
                    btn.classList.add('active');
                }
            });
        }, 100);
    }

    // ========== ESTILOS ==========
    addStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            /* Botão flutuante */
            .accessibility-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 56px;
                height: 56px;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                z-index: 9995;
                box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .accessibility-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            }
            
            .accessibility-toggle.active {
                background: linear-gradient(135deg, #ef4444, #f97316);
                transform: scale(1.1);
            }
            
            /* Card flutuante */
            .accessibility-card {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 320px;
                max-width: calc(100vw - 40px);
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                z-index: 9994;
                opacity: 0;
                transform: translateY(20px) scale(0.95);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: none;
                overflow: hidden;
            }
            
            .accessibility-card.visible {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: all;
            }
            
            .accessibility-card-header {
                padding: 20px;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .accessibility-card-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .accessibility-card-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                transition: background 0.2s;
            }
            
            .accessibility-card-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .accessibility-card-content {
                padding: 20px;
                max-height: 400px;
                overflow-y: auto;
            }
            
            .accessibility-card-section {
                margin-bottom: 24px;
            }
            
            .accessibility-card-section h4 {
                margin: 0 0 12px 0;
                color: #374151;
                font-size: 14px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .accessibility-card-controls {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 8px;
            }
            
            .accessibility-card-btn {
                flex: 1;
                padding: 10px 12px;
                background: #f3f4f6;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                color: #374151;
                cursor: pointer;
                font-weight: 500;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: all 0.2s;
            }
            
            .accessibility-card-btn:hover {
                background: #e5e7eb;
                border-color: #d1d5db;
            }
            
            .accessibility-card-btn.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .accessibility-card-btn.small {
                flex: 0 0 auto;
                width: 40px;
            }
            
            .accessibility-card-value {
                flex: 0 0 60px;
                text-align: center;
                font-weight: 600;
                color: #3b82f6;
                font-size: 14px;
            }
            
            .accessibility-card-buttons {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                margin-top: 8px;
            }
            
            .accessibility-card-switches {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-top: 8px;
            }
            
            .accessibility-card-switch {
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
            }
            
            .accessibility-card-switch input {
                display: none;
            }
            
            .accessibility-card-switch .slider {
                position: relative;
                width: 44px;
                height: 24px;
                background: #e5e7eb;
                border-radius: 12px;
                transition: background 0.2s;
            }
            
            .accessibility-card-switch .slider::before {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: transform 0.2s;
            }
            
            .accessibility-card-switch input:checked + .slider {
                background: #3b82f6;
            }
            
            .accessibility-card-switch input:checked + .slider::before {
                transform: translateX(20px);
            }
            
            .switch-label {
                flex: 1;
                color: #374151;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .accessibility-card-footer {
                margin-top: 24px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
            }
            
            .accessibility-card-reset {
                padding: 10px 20px;
                background: #fef2f2;
                color: #dc2626;
                border: 2px solid #fca5a5;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                font-size: 14px;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }
            
            .accessibility-card-reset:hover {
                background: #fee2e2;
            }
            
            /* Responsivo */
            @media (max-width: 768px) {
                .accessibility-toggle {
                    bottom: 20px;
                    right: 80px;
                    width: 52px;
                    height: 52px;
                    font-size: 22px;
                }
                
                .accessibility-card {
                    bottom: 85px;
                    right: 16px;
                    left: 16px;
                    width: auto;
                }
                
                .accessibility-card-buttons {
                    grid-template-columns: 1fr;
                }
            }
            
            @media (max-width: 480px) {
                .accessibility-toggle {
                    bottom: 15px;
                    right: 65px;
                    width: 48px;
                    height: 48px;
                    font-size: 20px;
                }
                
                .accessibility-card {
                    bottom: 75px;
                }
                
                .accessibility-card-section h4 {
                    font-size: 13px;
                }
                
                .accessibility-card-btn {
                    font-size: 13px;
                    padding: 8px 10px;
                }
                
                .accessibility-card-value {
                    font-size: 13px;
                }
            }
            
            /* Animações reduzidas */
            @media (prefers-reduced-motion: reduce) {
                .accessibility-toggle,
                .accessibility-card {
                    transition: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // ========== EVENT LISTENERS ==========
    setupEventListeners() {
        // Atalho de teclado: Alt + A
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.toggleCard();
            }
        });
    }
}

// Inicialização - suporta carregamento antes e depois de DOMContentLoaded
function initializeAccessibility() {
    if (!window.accessibility) {
        try {
            setTimeout(() => {
                window.accessibility = new AcessibilidadeManager();
                console.log('Acessibilidade inicializada');
            }, 500);
        } catch (error) {
            console.error('Erro na acessibilidade:', error);
        }
    }
}

// Se o DOM já está pronto, inicializa imediatamente
if (document.readyState === 'loading') {
    // DOM ainda carregando, aguarda DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initializeAccessibility);
} else {
    // DOM já está pronto, inicializa agora
    initializeAccessibility();
}

window.AcessibilidadeManager = AcessibilidadeManager;
