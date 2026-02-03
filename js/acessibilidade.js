// acessibilidade.js - Sistema simplificado e robusto de acessibilidade

class AcessibilidadeManager {
    constructor() {
        this.prefix = 'modelotrabalhista_accessibility_';
        
        // Configurações padrão
        this.defaultSettings = {
            theme: 'light',
            fontSize: 16,
            highContrast: false,
            reducedMotion: false,
            vlibrasEnabled: true,
            focusHighlight: true,
            readableFonts: false,
            linkUnderline: false
        };
        
        this.currentSettings = {};
        this.vlibrasInitialized = false;
        this.vlibrasScriptLoaded = false;
        
        // Inicialização segura
        setTimeout(() => this.safeInit(), 100);
    }

    safeInit() {
        try {
            this.init();
        } catch (error) {
            console.error('Erro na inicialização do sistema de acessibilidade:', error);
            this.initializeMinimalFeatures();
        }
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.createAccessibilityPanel();
        this.applyAllSettings();
        
        // Inicializar Vlibras com fallback
        this.initVlibrasWithFallback();
        
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

    // ========== VLIBRAS ==========
    initVlibrasWithFallback() {
        if (document.querySelector('#vlibras-script')) {
            this.checkAndInitVlibras();
            return;
        }
        
        const script = document.createElement('script');
        script.id = 'vlibras-script';
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            this.vlibrasScriptLoaded = true;
            setTimeout(() => this.checkAndInitVlibras(), 500);
        };
        
        script.onerror = () => {
            console.warn('Vlibras não carregado. Carregando alternativa...');
            this.loadVlibrasAlternative();
        };
        
        document.head.appendChild(script);
    }

    checkAndInitVlibras() {
        if (this.vlibrasInitialized) return;
        
        if (window.VLibras && typeof window.VLibras.Widget === 'function') {
            try {
                new window.VLibras.Widget('https://vlibras.gov.br/app');
                this.vlibrasInitialized = true;
                this.addVlibrasStyles();
            } catch (error) {
                this.loadVlibrasAlternative();
            }
        } else {
            setTimeout(() => this.checkAndInitVlibras(), 500);
        }
    }

    loadVlibrasAlternative() {
        const widget = document.createElement('div');
        widget.id = 'vlibras-alternative';
        widget.innerHTML = `
            <div style="
                position: fixed;
                bottom: 100px;
                right: 20px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 9990;
                padding: 10px;
                border: 2px solid #3b82f6;
                display: ${this.currentSettings.vlibrasEnabled ? 'block' : 'none'};
            ">
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 24px; margin-bottom: 5px;">👐</div>
                    <div style="font-weight: bold; color: #3b82f6;">Acessibilidade</div>
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">
                        Para recursos de acessibilidade, use o menu ♿
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(widget);
    }

    addVlibrasStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .vlibras-widget {
                z-index: 9990 !important;
                bottom: 100px !important;
                right: 20px !important;
            }
            
            .accessibility-toggle {
                bottom: 30px !important;
                z-index: 9999 !important;
            }
            
            @media (max-width: 768px) {
                .vlibras-widget {
                    bottom: 90px !important;
                    right: 10px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    toggleVlibras() {
        const enabled = !this.currentSettings.vlibrasEnabled;
        this.updateSetting('vlibrasEnabled', enabled);
        
        const widget = document.querySelector('.vlibras-widget');
        const altWidget = document.getElementById('vlibras-alternative');
        
        if (widget) widget.style.display = enabled ? 'block' : 'none';
        if (altWidget) altWidget.style.display = enabled ? 'block' : 'none';
        
        return enabled;
    }

    // ========== PAINEL SIMPLIFICADO ==========
    createAccessibilityPanel() {
        if (document.getElementById('accessibility-panel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.className = 'accessibility-panel';
        panel.innerHTML = `
            <div class="accessibility-header">
                <button id="accessibility-close" class="accessibility-close">×</button>
                <h3>♿ Acessibilidade</h3>
            </div>
            <div class="accessibility-content">
                <div class="accessibility-section">
                    <h4>📱 Controles</h4>
                    
                    <div class="accessibility-control">
                        <button class="accessibility-btn" data-action="increase-font">
                            <span>A+</span> Aumentar Texto
                        </button>
                        <button class="accessibility-btn" data-action="decrease-font">
                            <span>A-</span> Diminuir Texto
                        </button>
                    </div>
                    
                    <div class="accessibility-control">
                        <button class="accessibility-btn" data-action="toggle-theme">
                            <span>🌙</span> Alternar Tema
                        </button>
                        <button class="accessibility-btn ${this.currentSettings.vlibrasEnabled ? 'active' : ''}" 
                                data-action="toggle-vlibras">
                            <span>👐</span> Libras ${this.currentSettings.vlibrasEnabled ? '(ON)' : '(OFF)'}
                        </button>
                    </div>
                    
                    <div class="accessibility-control">
                        <button class="accessibility-btn ${this.currentSettings.linkUnderline ? 'active' : ''}" 
                                data-action="toggle-underline">
                            <span>🔗</span> Sublinhar Links
                        </button>
                        <button class="accessibility-btn ${this.currentSettings.readableFonts ? 'active' : ''}" 
                                data-action="toggle-fonts">
                            <span>🔤</span> Fontes Especiais
                        </button>
                    </div>
                </div>
                
                <div class="accessibility-actions">
                    <button id="reset-settings" class="reset-btn">
                        🔄 Restaurar Padrões
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.createAccessibilityToggle();
        this.setupPanelEvents();
        this.addPanelStyles();
    }

    createAccessibilityToggle() {
        const button = document.createElement('button');
        button.id = 'accessibility-toggle';
        button.className = 'accessibility-toggle';
        button.innerHTML = '♿';
        button.title = 'Abrir configurações de acessibilidade';
        button.onclick = () => this.togglePanel();
        document.body.appendChild(button);
    }

    togglePanel() {
        const panel = document.getElementById('accessibility-panel');
        const toggle = document.getElementById('accessibility-toggle');
        
        if (panel.classList.contains('open')) {
            panel.classList.remove('open');
            toggle.classList.remove('active');
        } else {
            panel.classList.add('open');
            toggle.classList.add('active');
        }
    }

    setupPanelEvents() {
        document.getElementById('accessibility-close').onclick = () => this.togglePanel();
        
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.onclick = (e) => {
                const action = e.target.closest('[data-action]').dataset.action;
                this.handlePanelAction(action, e.target);
            };
        });
        
        document.getElementById('reset-settings').onclick = () => {
            if (confirm('Restaurar configurações padrão?')) {
                this.currentSettings = { ...this.defaultSettings };
                this.saveSettings();
                this.applyAllSettings();
                location.reload();
            }
        };
    }

    handlePanelAction(action, button) {
        switch(action) {
            case 'increase-font':
                this.adjustFontSize('increase');
                break;
            case 'decrease-font':
                this.adjustFontSize('decrease');
                break;
            case 'toggle-theme':
                this.toggleTheme();
                break;
            case 'toggle-vlibras':
                const vlibrasEnabled = this.toggleVlibras();
                button.innerHTML = `<span>👐</span> Libras ${vlibrasEnabled ? '(ON)' : '(OFF)'}`;
                button.classList.toggle('active', vlibrasEnabled);
                break;
            case 'toggle-underline':
                const underlineEnabled = this.toggleLinkUnderline();
                button.innerHTML = `<span>🔗</span> Sublinhar Links`;
                button.classList.toggle('active', underlineEnabled);
                break;
            case 'toggle-fonts':
                const fontsEnabled = this.toggleReadableFonts();
                button.innerHTML = `<span>🔤</span> Fontes Especiais`;
                button.classList.toggle('active', fontsEnabled);
                break;
        }
    }

    // ========== CONTROLES ==========
    toggleTheme() {
        const themes = ['light', 'dark', 'high-contrast'];
        const currentIndex = themes.indexOf(this.currentSettings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        this.updateSetting('theme', nextTheme);
        this.applyTheme(nextTheme);
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
            style.textContent = `body { background: #1a1a1a !important; color: #f0f0f0 !important; }`;
        } else if (theme === 'high-contrast') {
            style.textContent = `
                body { background: black !important; color: white !important; }
                a { color: yellow !important; text-decoration: underline !important; }
            `;
        } else {
            style.textContent = `body { background: white !important; color: #333 !important; }`;
        }
    }

    adjustFontSize(direction) {
        let newSize = this.currentSettings.fontSize;
        if (direction === 'increase' && newSize < 24) newSize += 2;
        else if (direction === 'decrease' && newSize > 12) newSize -= 2;
        else if (direction === 'reset') newSize = this.defaultSettings.fontSize;
        
        this.updateSetting('fontSize', newSize);
        document.documentElement.style.fontSize = `${newSize}px`;
        return newSize;
    }

    toggleLinkUnderline() {
        const enabled = !this.currentSettings.linkUnderline;
        this.updateSetting('linkUnderline', enabled);
        
        const styleId = 'link-underline-style';
        let style = document.getElementById(styleId);
        
        if (enabled) {
            if (!style) {
                style = document.createElement('style');
                style.id = styleId;
                document.head.appendChild(style);
            }
            style.textContent = `a:not(.btn):not(.button) { text-decoration: underline !important; }`;
        } else if (style) {
            style.remove();
        }
        
        return enabled;
    }

    toggleReadableFonts() {
        const enabled = !this.currentSettings.readableFonts;
        this.updateSetting('readableFonts', enabled);
        
        const styleId = 'readable-fonts-style';
        let style = document.getElementById(styleId);
        
        if (enabled) {
            if (!style) {
                style = document.createElement('style');
                style.id = styleId;
                document.head.appendChild(style);
            }
            style.textContent = `
                body, p, li, span, a {
                    font-family: Arial, sans-serif !important;
                    letter-spacing: 0.5px !important;
                }
            `;
        } else if (style) {
            style.remove();
        }
        
        return enabled;
    }

    // ========== ESTILOS ==========
    addPanelStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .accessibility-toggle {
                position: fixed;
                bottom: 30px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                z-index: 9998;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                font-size: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }
            
            .accessibility-toggle:hover {
                transform: scale(1.1);
            }
            
            .accessibility-toggle.active {
                background: linear-gradient(135deg, #ef4444, #f97316);
            }
            
            .accessibility-panel {
                position: fixed;
                top: 0;
                right: -320px;
                width: 300px;
                height: 100vh;
                background: white;
                box-shadow: -5px 0 25px rgba(0,0,0,0.1);
                z-index: 9999;
                transition: right 0.3s;
                overflow-y: auto;
            }
            
            .accessibility-panel.open {
                right: 0;
            }
            
            .accessibility-header {
                padding: 20px;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .accessibility-header h3 {
                margin: 0;
                font-size: 1.3rem;
            }
            
            .accessibility-close {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                font-size: 24px;
                cursor: pointer;
                line-height: 1;
            }
            
            .accessibility-content {
                padding: 20px;
            }
            
            .accessibility-section {
                margin-bottom: 25px;
            }
            
            .accessibility-section h4 {
                margin: 0 0 15px 0;
                color: #3b82f6;
            }
            
            .accessibility-control {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .accessibility-btn {
                padding: 12px;
                background: #f1f5f9;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                text-align: center;
                transition: all 0.2s;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }
            
            .accessibility-btn:hover {
                background: #e2e8f0;
            }
            
            .accessibility-btn.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .accessibility-btn span {
                font-size: 20px;
            }
            
            .accessibility-actions {
                margin-top: 25px;
                text-align: center;
            }
            
            .reset-btn {
                padding: 12px 24px;
                background: #fef2f2;
                color: #dc2626;
                border: 2px solid #fca5a5;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                width: 100%;
            }
            
            @media (max-width: 768px) {
                .accessibility-panel {
                    width: 100%;
                    right: -100%;
                }
                
                .accessibility-toggle {
                    bottom: 20px;
                    right: 15px;
                    width: 55px;
                    height: 55px;
                    font-size: 24px;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // ========== APLICAÇÃO ==========
    applySetting(key, value) {
        switch(key) {
            case 'theme':
                this.applyTheme(value);
                break;
            case 'fontSize':
                document.documentElement.style.fontSize = `${value}px`;
                break;
            case 'linkUnderline':
                this.toggleLinkUnderline();
                break;
            case 'readableFonts':
                this.toggleReadableFonts();
                break;
            case 'vlibrasEnabled':
                this.toggleVlibras();
                break;
        }
    }

    applyAllSettings() {
        Object.entries(this.currentSettings).forEach(([key, value]) => {
            this.applySetting(key, value);
        });
    }

    // ========== INICIALIZAÇÃO MÍNIMA ==========
    initializeMinimalFeatures() {
        try {
            this.loadSettings();
            this.createAccessibilityButton();
            this.applyTheme(this.currentSettings.theme);
        } catch (error) {
            console.error('Falha crítica:', error);
        }
    }

    createAccessibilityButton() {
        const button = document.createElement('button');
        button.id = 'minimal-accessibility-toggle';
        button.innerHTML = '♿';
        button.title = 'Acessibilidade';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        button.onclick = () => alert('Recursos de acessibilidade disponíveis');
        document.body.appendChild(button);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.togglePanel();
            }
        });
    }
}

// Inicialização segura
document.addEventListener('DOMContentLoaded', () => {
    try {
        setTimeout(() => {
            window.accessibility = new AcessibilidadeManager();
            console.log('Acessibilidade inicializada');
        }, 500);
    } catch (error) {
        console.error('Erro na acessibilidade:', error);
    }
});

window.AcessibilidadeManager = AcessibilidadeManager;
