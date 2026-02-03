// acessibilidade.js - Sistema completo e robusto de acessibilidade para ModeloTrabalhista

class AcessibilidadeManager {
    constructor() {
        this.prefix = 'modelotrabalhista_accessibility_';
        
        // Configurações padrão otimizadas
        this.defaultSettings = {
            theme: 'light',
            fontSize: 16,
            highContrast: false,
            reducedMotion: false,
            dyslexiaFriendly: false,
            cursorSize: 'normal',
            voiceReader: false,
            voiceReaderRate: 1.0,
            vlibrasEnabled: true, // Vlibras ativo por padrão
            focusHighlight: true,
            readableFonts: false,
            linkUnderline: false // Sublinhado desativado por padrão
        };
        
        this.currentSettings = {};
        this.speechSynthesis = window.speechSynthesis;
        this.speechVoices = [];
        this.vlibrasInitialized = false;
        this.vlibrasScriptLoaded = false;
        this.initialized = false;
        
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
        this.loadSpeechVoices();
        this.setupEventListeners();
        this.createAccessibilityPanel();
        this.applyAllSettings();
        
        // Inicializar Vlibras com fallback
        this.initVlibrasWithFallback();
        
        this.initialized = true;
    }

    // ========== VLIBRAS ROBUSTO ==========
    initVlibrasWithFallback() {
        // Verificar se já existe o script
        if (document.querySelector('#vlibras-script')) {
            this.checkAndInitVlibras();
            return;
        }
        
        // Carregar script com timeout
        const loadPromise = new Promise((resolve) => {
            const script = document.createElement('script');
            script.id = 'vlibras-script';
            script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                this.vlibrasScriptLoaded = true;
                setTimeout(() => this.checkAndInitVlibras(), 500);
                resolve(true);
            };
            
            script.onerror = () => {
                console.warn('Não foi possível carregar o Vlibras. Tentando alternativa...');
                this.loadVlibrasAlternative();
                resolve(false);
            };
            
            document.head.appendChild(script);
        });
        
        // Timeout de 10 segundos
        setTimeout(() => {
            if (!this.vlibrasInitialized && !document.querySelector('.vlibras-widget')) {
                console.warn('Timeout no carregamento do Vlibras. Carregando alternativa.');
                this.loadVlibrasAlternative();
            }
        }, 10000);
    }

    checkAndInitVlibras() {
        if (this.vlibrasInitialized) return;
        
        // Verificar várias vezes se o VLibras está disponível
        let attempts = 0;
        const maxAttempts = 5;
        
        const tryInit = () => {
            attempts++;
            
            if (window.VLibras && typeof window.VLibras.Widget === 'function') {
                try {
                    new window.VLibras.Widget('https://vlibras.gov.br/app');
                    this.vlibrasInitialized = true;
                    
                    // Estilo para posicionamento
                    this.addVlibrasStyles();
                    
                    console.log('VLibras inicializado com sucesso');
                } catch (error) {
                    console.error('Erro ao criar widget do Vlibras:', error);
                    this.loadVlibrasAlternative();
                }
            } else if (attempts < maxAttempts) {
                setTimeout(tryInit, 500);
            } else {
                console.warn('VLibras não disponível após tentativas. Usando alternativa.');
                this.loadVlibrasAlternative();
            }
        };
        
        setTimeout(tryInit, 1000);
    }

    loadVlibrasAlternative() {
        // Widget alternativo se o Vlibras oficial falhar
        const widgetHtml = `
            <div id="vlibras-alternative" class="vlibras-alternative" style="
                position: fixed;
                bottom: 100px;
                right: 20px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 9990;
                padding: 10px;
                display: ${this.currentSettings.vlibrasEnabled ? 'block' : 'none'};
                border: 2px solid #3b82f6;
            ">
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 24px; margin-bottom: 5px;">👐</div>
                    <div style="font-weight: bold; color: #3b82f6;">Acessibilidade em Libras</div>
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">
                        Para tradução completa, acesse: 
                        <a href="https://www.vlibras.gov.br" target="_blank" style="color: #3b82f6;">
                            vlibras.gov.br
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        const container = document.createElement('div');
        container.innerHTML = widgetHtml;
        document.body.appendChild(container);
        
        console.log('Widget alternativo de Libras carregado');
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
                    transform: scale(0.85);
                }
                
                .accessibility-toggle {
                    bottom: 20px !important;
                    right: 15px !important;
                    width: 55px !important;
                    height: 55px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    toggleVlibras() {
        const enabled = !this.currentSettings.vlibrasEnabled;
        this.updateSetting('vlibrasEnabled', enabled);
        
        // Mostrar/ocultar widget
        const widget = document.querySelector('.vlibras-widget');
        const altWidget = document.getElementById('vlibras-alternative');
        
        if (widget) {
            widget.style.display = enabled ? 'block' : 'none';
        }
        
        if (altWidget) {
            altWidget.style.display = enabled ? 'block' : 'none';
        }
        
        return enabled;
    }

    // ========== INICIALIZAÇÃO MÍNIMA ==========
    initializeMinimalFeatures() {
        try {
            this.loadSettings();
            this.createAccessibilityButton();
            this.applyTheme(this.currentSettings.theme);
            console.log('Funcionalidades mínimas de acessibilidade carregadas');
        } catch (error) {
            console.error('Falha crítica na inicialização mínima:', error);
        }
    }

    createAccessibilityButton() {
        // Botão mínimo de acessibilidade
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
        
        button.onclick = () => {
            alert('Recursos de acessibilidade:\n\n1. Vlibras (Libras)\n2. Ajuste de texto\n3. Alto contraste\n\nPara mais opções, recarregue a página.');
        };
        
        document.body.appendChild(button);
    }

    // ========== CONFIGURAÇÕES BÁSICAS ==========
    loadSettings() {
        try {
            const saved = localStorage.getItem(`${this.prefix}settings`);
            if (saved) {
                this.currentSettings = { ...this.defaultSettings, ...JSON.parse(saved) };
            } else {
                this.currentSettings = { ...this.defaultSettings };
            }
        } catch (e) {
            console.error('Erro ao carregar configurações:', e);
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

    // ========== TEMAS SIMPLIFICADOS ==========
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        const styleId = 'current-theme-style';
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
                
                a {
                    color: #60a5fa !important;
                }
            `;
        } else if (theme === 'high-contrast') {
            style.textContent = `
                body {
                    background: black !important;
                    color: white !important;
                }
                
                a, button, input {
                    border: 2px solid yellow !important;
                }
                
                a {
                    color: yellow !important;
                    text-decoration: underline !important;
                }
            `;
        } else {
            style.textContent = `
                body {
                    background-color: white !important;
                    color: #333 !important;
                }
            `;
        }
    }

    toggleTheme() {
        const themes = ['light', 'dark', 'high-contrast'];
        const currentIndex = themes.indexOf(this.currentSettings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        this.updateSetting('theme', nextTheme);
        return nextTheme;
    }

    // ========== CONTROLE DE FONTE ==========
    adjustFontSize(direction) {
        let newSize = this.currentSettings.fontSize;
        
        if (direction === 'increase' && newSize < 24) newSize += 2;
        else if (direction === 'decrease' && newSize > 12) newSize -= 2;
        else if (direction === 'reset') newSize = this.defaultSettings.fontSize;
        
        this.updateSetting('fontSize', newSize);
        
        // Aplicar diretamente
        document.documentElement.style.fontSize = `${newSize}px`;
        
        return newSize;
    }

    // ========== SUBLINHADO CONTROLADO ==========
    toggleLinkUnderline() {
        const enabled = !this.currentSettings.linkUnderline;
        this.updateSetting('linkUnderline', enabled);
        
        if (enabled) {
            const style = document.createElement('style');
            style.id = 'link-underline-style';
            style.textContent = `
                a:not(.btn):not(.button):not(.nav-link) {
                    text-decoration: underline !important;
                }
                
                h1 a, h2 a, h3 a, h4 a, h5 a, h6 a,
                .navbar a, .nav a {
                    text-decoration: none !important;
                }
            `;
            document.head.appendChild(style);
        } else {
            const style = document.getElementById('link-underline-style');
            if (style) style.remove();
        }
        
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
                    <h4>📱 Controles Rápidos</h4>
                    
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
                        <button class="accessibility-btn" data-action="toggle-contrast">
                            <span>⚫</span> Alto Contraste
                        </button>
                    </div>
                    
                    <div class="accessibility-control">
                        <button class="accessibility-btn ${this.currentSettings.vlibrasEnabled ? 'active' : ''}" 
                                data-action="toggle-vlibras">
                            <span>👐</span> Libras ${this.currentSettings.vlibrasEnabled ? '(ON)' : '(OFF)'}
                        </button>
                        <button class="accessibility-btn ${this.currentSettings.linkUnderline ? 'active' : ''}" 
                                data-action="toggle-underline">
                            <span>🔗</span> Sublinhar Links
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
        // Botão de fechar
        document.getElementById('accessibility-close').onclick = () => this.togglePanel();
        
        // Botões de ação
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.onclick = (e) => {
                const action = e.target.closest('[data-action]').dataset.action;
                this.handlePanelAction(action, e.target);
            };
        });
        
        // Reset
        document.getElementById('reset-settings').onclick = () => {
            if (confirm('Restaurar todas as configurações?')) {
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
            case 'toggle-contrast':
                this.toggleHighContrast();
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
        }
    }

    toggleHighContrast() {
        const current = this.currentSettings.theme;
        const newTheme = current === 'high-contrast' ? 'light' : 'high-contrast';
        this.updateSetting('theme', newTheme);
        this.applyTheme(newTheme);
    }

    // ========== ESTILOS DO PAINEL ==========
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
                box-shadow: 0 6px 25px rgba(0,0,0,0.2);
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
                font-family: Arial, sans-serif;
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
                border-color: #cbd5e1;
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

    // ========== APLICAÇÃO DE CONFIGURAÇÕES ==========
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

    // ========== EVENT LISTENERS SEGUROS ==========
    setupEventListeners() {
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.togglePanel();
            }
        });
        
        // Tratamento de erros
        window.addEventListener('error', (e) => {
            console.warn('Erro capturado pelo sistema de acessibilidade:', e.error);
        });
    }

    // ========== MÉTODOS PÚBLICOS ==========
    show() {
        this.togglePanel();
    }
    
    hide() {
        const panel = document.getElementById('accessibility-panel');
        if (panel) panel.classList.remove('open');
    }
}

// Inicialização segura e não-bloqueante
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Aguardar um pouco para não bloquear a renderização
        setTimeout(() => {
            window.accessibility = new AcessibilidadeManager();
            console.log('Sistema de acessibilidade carregado com sucesso');
        }, 500);
    } catch (error) {
        console.error('Falha crítica no carregamento da acessibilidade:', error);
        // Criar botão mínimo mesmo em caso de erro
        const button = document.createElement('button');
        button.innerHTML = '♿';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            border: none;
            font-size: 24px;
            cursor: pointer;
            z-index: 9999;
        `;
        button.onclick = () => alert('Acessibilidade: Recursos disponíveis após recarregar a página.');
        document.body.appendChild(button);
    }
});

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.AcessibilidadeManager = AcessibilidadeManager;
}
