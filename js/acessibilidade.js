// acessibilidade.js - Sistema completo de acessibilidade para ModeloTrabalhista

class AcessibilidadeManager {
    constructor() {
        this.prefix = 'modelotrabalhista_accessibility_';
        
        // Configurações padrão
        this.defaultSettings = {
            theme: 'light',
            fontSize: 16, // tamanho base em px
            highContrast: false,
            reducedMotion: false,
            dyslexiaFriendly: false,
            cursorSize: 'normal',
            voiceReader: false,
            voiceReaderRate: 1.0,
            voiceReaderVoice: null,
            vlibrasEnabled: false,
            focusHighlight: true,
            readableFonts: false,
            linkUnderline: false
        };
        
        this.currentSettings = {};
        this.speechSynthesis = window.speechSynthesis;
        this.speechVoices = [];
        this.vlibrasInitialized = false;
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.initVlibras();
        this.loadSpeechVoices();
        this.setupEventListeners();
        this.createAccessibilityPanel();
        this.applyAllSettings();
    }

    // ========== GERENCIAMENTO DE CONFIGURAÇÕES ==========
    loadSettings() {
        try {
            const saved = localStorage.getItem(`${this.prefix}settings`);
            if (saved) {
                this.currentSettings = { ...this.defaultSettings, ...JSON.parse(saved) };
            } else {
                this.currentSettings = { ...this.defaultSettings };
            }
        } catch (e) {
            console.error('Erro ao carregar configurações de acessibilidade:', e);
            this.currentSettings = { ...this.defaultSettings };
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(`${this.prefix}settings`, JSON.stringify(this.currentSettings));
        } catch (e) {
            console.error('Erro ao salvar configurações de acessibilidade:', e);
        }
    }

    updateSetting(key, value) {
        this.currentSettings[key] = value;
        this.saveSettings();
        this.applySetting(key, value);
        return true;
    }

    resetSettings() {
        this.currentSettings = { ...this.defaultSettings };
        this.saveSettings();
        this.applyAllSettings();
        return true;
    }

    // ========== TEMAS E CORES ==========
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        if (theme === 'dark') {
            this.applyDarkTheme();
        } else if (theme === 'high-contrast') {
            this.applyHighContrastTheme();
        } else {
            this.applyLightTheme();
        }
    }

    applyLightTheme() {
        const styleId = 'accessibility-theme-light';
        let style = document.getElementById(styleId);
        
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        
        style.textContent = `
            :root {
                --primary-color: #2563eb;
                --secondary-color: #64748b;
                --background-color: #ffffff;
                --text-color: #1e293b;
                --card-background: #f8fafc;
                --border-color: #e2e8f0;
                --hover-color: #f1f5f9;
                --focus-color: #3b82f6;
                --error-color: #dc2626;
                --success-color: #059669;
            }
            
            [data-theme="light"] {
                color-scheme: light;
            }
        `;
    }

    applyDarkTheme() {
        const styleId = 'accessibility-theme-dark';
        let style = document.getElementById(styleId);
        
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        
        style.textContent = `
            :root {
                --primary-color: #60a5fa;
                --secondary-color: #94a3b8;
                --background-color: #0f172a;
                --text-color: #f1f5f9;
                --card-background: #1e293b;
                --border-color: #334155;
                --hover-color: #2d3748;
                --focus-color: #60a5fa;
                --error-color: #f87171;
                --success-color: #34d399;
            }
            
            [data-theme="dark"] {
                color-scheme: dark;
            }
            
            [data-theme="dark"] body {
                background-color: var(--background-color);
                color: var(--text-color);
            }
            
            [data-theme="dark"] .card,
            [data-theme="dark"] .modal-content {
                background-color: var(--card-background);
                border-color: var(--border-color);
            }
        `;
    }

    applyHighContrastTheme() {
        const styleId = 'accessibility-theme-high-contrast';
        let style = document.getElementById(styleId);
        
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        
        style.textContent = `
            :root {
                --primary-color: #ffff00;
                --secondary-color: #00ffff;
                --background-color: #000000;
                --text-color: #ffffff;
                --card-background: #000000;
                --border-color: #ffff00;
                --hover-color: #333333;
                --focus-color: #ffff00;
                --error-color: #ff0000;
                --success-color: #00ff00;
            }
            
            [data-theme="high-contrast"] {
                color-scheme: dark;
            }
            
            [data-theme="high-contrast"] body {
                background: black !important;
                color: white !important;
            }
            
            [data-theme="high-contrast"] a {
                color: yellow !important;
                text-decoration: underline !important;
            }
            
            [data-theme="high-contrast"] button,
            [data-theme="high-contrast"] input,
            [data-theme="high-contrast"] select,
            [data-theme="high-contrast"] textarea {
                border: 2px solid yellow !important;
            }
            
            [data-theme="high-contrast"] .focus-highlight {
                outline: 3px solid yellow !important;
                outline-offset: 2px !important;
            }
        `;
    }

    toggleTheme() {
        const themes = ['light', 'dark', 'high-contrast'];
        const currentIndex = themes.indexOf(this.currentSettings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        this.updateSetting('theme', nextTheme);
        this.updatePanelThemeButton(nextTheme);
        
        return nextTheme;
    }

    // ========== CONTROLE DE TAMANHO DA FONTE ==========
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
        this.applyFontSize(newSize);
        this.updateFontSizeButtons(newSize);
        
        return newSize;
    }

    applyFontSize(size) {
        const styleId = 'accessibility-font-size';
        let style = document.getElementById(styleId);
        
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        
        style.textContent = `
            html {
                font-size: ${size}px !important;
            }
            
            body {
                font-size: 1rem !important;
                line-height: 1.6 !important;
            }
            
            h1 { font-size: 2rem !important; }
            h2 { font-size: 1.75rem !important; }
            h3 { font-size: 1.5rem !important; }
            h4 { font-size: 1.25rem !important; }
            h5 { font-size: 1.125rem !important; }
            h6 { font-size: 1rem !important; }
            
            p, li, span, a {
                font-size: 1rem !important;
                line-height: 1.6 !important;
            }
            
            input, textarea, select, button {
                font-size: 1rem !important;
            }
        `;
    }

    // ========== FONTES LEGÍVEIS ==========
    toggleReadableFonts() {
        const enabled = !this.currentSettings.readableFonts;
        this.updateSetting('readableFonts', enabled);
        
        if (enabled) {
            this.applyReadableFonts();
        } else {
            this.removeReadableFonts();
        }
        
        return enabled;
    }

    applyReadableFonts() {
        const styleId = 'accessibility-readable-fonts';
        let style = document.getElementById(styleId);
        
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Open+Dyslexic:wght@400;700&family=Comic+Neue:wght@400;700&display=swap');
            
            body, p, li, span, a, input, textarea, select, button {
                font-family: 'Comic Neue', 'Open Dyslexic', Arial, sans-serif !important;
                letter-spacing: 0.5px !important;
                word-spacing: 1px !important;
            }
            
            code, pre {
                font-family: 'Comic Neue', 'Open Dyslexic', monospace !important;
            }
        `;
    }

    removeReadableFonts() {
        const style = document.getElementById('accessibility-readable-fonts');
        if (style) {
            style.remove();
        }
    }

    // ========== DESTAQUE DE FOCO ==========
    toggleFocusHighlight() {
        const enabled = !this.currentSettings.focusHighlight;
        this.updateSetting('focusHighlight', enabled);
        
        if (enabled) {
            this.applyFocusHighlight();
        } else {
            this.removeFocusHighlight();
        }
        
        return enabled;
    }

    applyFocusHighlight() {
        const styleId = 'accessibility-focus-highlight';
        let style = document.getElementById(styleId);
        
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        
        style.textContent = `
            *:focus {
                outline: 3px solid var(--focus-color, #3b82f6) !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5) !important;
            }
            
            button:focus, a:focus, input:focus, textarea:focus, select:focus {
                transform: scale(1.02) !important;
                transition: transform 0.2s ease !important;
            }
            
            .focus-highlight {
                position: relative !important;
            }
            
            .focus-highlight::after {
                content: '' !important;
                position: absolute !important;
                top: -2px !important;
                left: -2px !important;
                right: -2px !important;
                bottom: -2px !important;
                border: 2px solid var(--focus-color, #3b82f6) !important;
                border-radius: inherit !important;
                pointer-events: none !important;
                z-index: 1000 !important;
            }
        `;
        
        // Adicionar event listeners para elementos focáveis
        document.querySelectorAll('button, a, input, textarea, select, [tabindex]').forEach(el => {
            el.addEventListener('focus', () => {
                el.classList.add('focus-highlight');
            });
            
            el.addEventListener('blur', () => {
                el.classList.remove('focus-highlight');
            });
        });
    }

    removeFocusHighlight() {
        const style = document.getElementById('accessibility-focus-highlight');
        if (style) {
            style.remove();
        }
        
        document.querySelectorAll('.focus-highlight').forEach(el => {
            el.classList.remove('focus-highlight');
        });
    }

    // ========== SUBLINHADO EM LINKS ==========
    toggleLinkUnderline() {
        const enabled = !this.currentSettings.linkUnderline;
        this.updateSetting('linkUnderline', enabled);
        
        if (enabled) {
            this.applyLinkUnderline();
        } else {
            this.removeLinkUnderline();
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
        
        style.textContent = `
            a {
                text-decoration: underline !important;
                text-decoration-thickness: 2px !important;
                text-underline-offset: 3px !important;
            }
            
            a:hover, a:focus {
                text-decoration-thickness: 3px !important;
            }
        `;
    }

    removeLinkUnderline() {
        const style = document.getElementById('accessibility-link-underline');
        if (style) {
            style.remove();
        }
    }

    // ========== TAMANHO DO CURSOR ==========
    adjustCursorSize(size) {
        this.updateSetting('cursorSize', size);
        this.applyCursorSize(size);
        return size;
    }

    applyCursorSize(size) {
        const styleId = 'accessibility-cursor-size';
        let style = document.getElementById(styleId);
        
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        
        const sizes = {
            'small': 'default',
            'normal': 'default',
            'large': 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Ccircle cx=\'16\' cy=\'16\' r=\'14\' fill=\'%23000\' stroke=\'%23fff\' stroke-width=\'2\'/%3E%3C/svg%3E") 16 16, pointer',
            'x-large': 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'48\' viewBox=\'0 0 48 48\'%3E%3Ccircle cx=\'24\' cy=\'24\' r=\'22\' fill=\'%23000\' stroke=\'%23fff\' stroke-width=\'3\'/%3E%3C/svg%3E") 24 24, pointer'
        };
        
        style.textContent = `
            * {
                cursor: ${sizes[size] || 'default'} !important;
            }
            
            a, button, input, textarea, select, [role="button"] {
                cursor: ${sizes[size] || 'pointer'} !important;
            }
        `;
    }

    // ========== REDUÇÃO DE MOVIMENTO ==========
    toggleReducedMotion() {
        const enabled = !this.currentSettings.reducedMotion;
        this.updateSetting('reducedMotion', enabled);
        
        if (enabled) {
            this.applyReducedMotion();
        } else {
            this.removeReducedMotion();
        }
        
        return enabled;
    }

    applyReducedMotion() {
        const styleId = 'accessibility-reduced-motion';
        let style = document.getElementById(styleId);
        
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
            
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            }
        `;
    }

    removeReducedMotion() {
        const style = document.getElementById('accessibility-reduced-motion');
        if (style) {
            style.remove();
        }
    }

    // ========== LEITOR DE VOZ ==========
    loadSpeechVoices() {
        // Carregar vozes disponíveis
        setTimeout(() => {
            this.speechVoices = this.speechSynthesis.getVoices();
            
            // Filtrar vozes em português
            this.portugueseVoices = this.speechVoices.filter(voice => 
                voice.lang.includes('pt') || voice.lang.includes('PT')
            );
            
            // Definir voz padrão se disponível
            if (this.portugueseVoices.length > 0 && !this.currentSettings.voiceReaderVoice) {
                this.currentSettings.voiceReaderVoice = this.portugueseVoices[0].name;
                this.saveSettings();
            }
        }, 1000);
    }

    toggleVoiceReader() {
        const enabled = !this.currentSettings.voiceReader;
        this.updateSetting('voiceReader', enabled);
        
        if (enabled) {
            this.startVoiceReader();
        } else {
            this.stopVoiceReader();
        }
        
        return enabled;
    }

    startVoiceReader() {
        if (!this.speechSynthesis) {
            console.error('Web Speech API não suportada');
            return false;
        }
        
        // Parar qualquer fala em andamento
        this.stopVoiceReader();
        
        // Ler conteúdo principal da página
        const mainContent = document.querySelector('main') || document.body;
        const text = this.extractReadableText(mainContent);
        
        this.speakText(text);
        return true;
    }

    stopVoiceReader() {
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
    }

    pauseVoiceReader() {
        if (this.speechSynthesis) {
            this.speechSynthesis.pause();
        }
    }

    resumeVoiceReader() {
        if (this.speechSynthesis) {
            this.speechSynthesis.resume();
        }
    }

    adjustVoiceRate(direction) {
        let newRate = this.currentSettings.voiceReaderRate || 1.0;
        
        if (direction === 'increase' && newRate < 2.0) {
            newRate += 0.1;
        } else if (direction === 'decrease' && newRate > 0.5) {
            newRate -= 0.1;
        } else if (direction === 'reset') {
            newRate = 1.0;
        }
        
        newRate = parseFloat(newRate.toFixed(1));
        this.updateSetting('voiceReaderRate', newRate);
        return newRate;
    }

    changeVoice(voiceName) {
        this.updateSetting('voiceReaderVoice', voiceName);
        return voiceName;
    }

    speakText(text) {
        if (!this.speechSynthesis || !text) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configurar voz
        if (this.currentSettings.voiceReaderVoice) {
            const voice = this.speechVoices.find(v => v.name === this.currentSettings.voiceReaderVoice);
            if (voice) utterance.voice = voice;
        }
        
        // Configurar taxa e outros parâmetros
        utterance.rate = this.currentSettings.voiceReaderRate || 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'pt-BR';
        
        utterance.onend = () => {
            console.log('Leitura concluída');
        };
        
        utterance.onerror = (event) => {
            console.error('Erro na leitura:', event);
        };
        
        this.speechSynthesis.speak(utterance);
    }

    extractReadableText(element) {
        // Clonar elemento para não modificar o DOM original
        const clone = element.cloneNode(true);
        
        // Remover elementos que não devem ser lidos
        clone.querySelectorAll('.no-read, script, style, nav, footer, .accessibility-panel').forEach(el => {
            el.remove();
        });
        
        // Extrair texto de forma significativa
        const textContent = clone.textContent
            .replace(/\s+/g, ' ') // Remover múltiplos espaços
            .replace(/[\r\n]+/g, ' ') // Remover quebras de linha
            .trim();
        
        return textContent;
    }

    readElement(element) {
        const text = element.textContent || element.getAttribute('aria-label') || element.getAttribute('alt');
        if (text) {
            this.speakText(text);
        }
    }

    // ========== VLIBRAS (Libras) ==========
    initVlibras() {
        if (this.currentSettings.vlibrasEnabled) {
            this.loadVlibras();
        }
    }

    loadVlibras() {
        // Verificar se o Vlibras já foi carregado
        if (window.VLibras) {
            this.initializeVlibrasWidget();
            return;
        }
        
        // Carregar script do Vlibras
        const script = document.createElement('script');
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
        script.async = true;
        script.onload = () => {
            this.initializeVlibrasWidget();
        };
        
        document.head.appendChild(script);
    }

    initializeVlibrasWidget() {
        if (this.vlibrasInitialized) return;
        
        try {
            new window.VLibras.Widget('https://vlibras.gov.br/app');
            this.vlibrasInitialized = true;
            
            // Adicionar estilo para o widget
            const style = document.createElement('style');
            style.textContent = `
                .vlibras-widget {
                    z-index: 9998 !important;
                }
            `;
            document.head.appendChild(style);
        } catch (error) {
            console.error('Erro ao inicializar Vlibras:', error);
        }
    }

    toggleVlibras() {
        const enabled = !this.currentSettings.vlibrasEnabled;
        this.updateSetting('vlibrasEnabled', enabled);
        
        if (enabled) {
            this.loadVlibras();
        } else {
            this.removeVlibras();
        }
        
        return enabled;
    }

    removeVlibras() {
        const widget = document.querySelector('.vlibras-widget');
        if (widget) {
            widget.remove();
        }
        
        const script = document.querySelector('script[src*="vlibras-plugin"]');
        if (script) {
            script.remove();
        }
        
        this.vlibrasInitialized = false;
    }

    // ========== PAINEL DE CONTROLE ==========
    createAccessibilityPanel() {
        // Verificar se o painel já existe
        if (document.getElementById('accessibility-panel')) {
            return;
        }
        
        // Criar container do painel
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.className = 'accessibility-panel';
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-label', 'Painel de acessibilidade');
        
        // Conteúdo do painel
        panel.innerHTML = `
            <div class="accessibility-header">
                <button id="accessibility-close" class="accessibility-close" aria-label="Fechar painel de acessibilidade">
                    <i class="fas fa-times"></i>
                </button>
                <h3><i class="fas fa-universal-access"></i> Acessibilidade</h3>
            </div>
            
            <div class="accessibility-content">
                <div class="accessibility-section">
                    <h4><i class="fas fa-palette"></i> Visual</h4>
                    
                    <div class="accessibility-control">
                        <label for="theme-toggle">
                            <i class="fas fa-moon"></i> Tema
                        </label>
                        <button id="theme-toggle" class="accessibility-btn" aria-pressed="false">
                            Claro
                        </button>
                    </div>
                    
                    <div class="accessibility-control">
                        <label>
                            <i class="fas fa-text-height"></i> Tamanho da Fonte
                        </label>
                        <div class="accessibility-btn-group">
                            <button id="font-decrease" class="accessibility-btn" aria-label="Diminuir fonte">A-</button>
                            <span id="font-size-display" class="font-size-display">${this.currentSettings.fontSize}px</span>
                            <button id="font-increase" class="accessibility-btn" aria-label="Aumentar fonte">A+</button>
                        </div>
                    </div>
                    
                    <div class="accessibility-control">
                        <label for="focus-toggle">
                            <i class="fas fa-bullseye"></i> Destaque de Foco
                        </label>
                        <button id="focus-toggle" class="accessibility-btn toggle-btn ${this.currentSettings.focusHighlight ? 'active' : ''}" 
                                aria-pressed="${this.currentSettings.focusHighlight}">
                            ${this.currentSettings.focusHighlight ? 'Ativo' : 'Inativo'}
                        </button>
                    </div>
                    
                    <div class="accessibility-control">
                        <label for="links-toggle">
                            <i class="fas fa-underline"></i> Sublinhar Links
                        </label>
                        <button id="links-toggle" class="accessibility-btn toggle-btn ${this.currentSettings.linkUnderline ? 'active' : ''}"
                                aria-pressed="${this.currentSettings.linkUnderline}">
                            ${this.currentSettings.linkUnderline ? 'Ativo' : 'Inativo'}
                        </button>
                    </div>
                </div>
                
                <div class="accessibility-section">
                    <h4><i class="fas fa-volume-up"></i> Áudio</h4>
                    
                    <div class="accessibility-control">
                        <label for="voice-toggle">
                            <i class="fas fa-assistive-listening-systems"></i> Leitor de Voz
                        </label>
                        <button id="voice-toggle" class="accessibility-btn toggle-btn ${this.currentSettings.voiceReader ? 'active' : ''}"
                                aria-pressed="${this.currentSettings.voiceReader}">
                            ${this.currentSettings.voiceReader ? 'Ativo' : 'Inativo'}
                        </button>
                    </div>
                    
                    <div class="accessibility-control" id="voice-controls" style="${this.currentSettings.voiceReader ? '' : 'display: none;'}">
                        <label>
                            <i class="fas fa-tachometer-alt"></i> Velocidade
                        </label>
                        <div class="accessibility-btn-group">
                            <button id="voice-slower" class="accessibility-btn" aria-label="Mais devagar">-</button>
                            <span id="voice-rate-display" class="rate-display">${this.currentSettings.voiceReaderRate}x</span>
                            <button id="voice-faster" class="accessibility-btn" aria-label="Mais rápido">+</button>
                        </div>
                    </div>
                    
                    <div class="accessibility-control">
                        <label for="vlibras-toggle">
                            <i class="fas fa-sign-language"></i> VLibras (Libras)
                        </label>
                        <button id="vlibras-toggle" class="accessibility-btn toggle-btn ${this.currentSettings.vlibrasEnabled ? 'active' : ''}"
                                aria-pressed="${this.currentSettings.vlibrasEnabled}">
                            ${this.currentSettings.vlibrasEnabled ? 'Ativo' : 'Inativo'}
                        </button>
                    </div>
                </div>
                
                <div class="accessibility-section">
                    <h4><i class="fas fa-cog"></i> Outros</h4>
                    
                    <div class="accessibility-control">
                        <label for="motion-toggle">
                            <i class="fas fa-running"></i> Reduzir Movimento
                        </label>
                        <button id="motion-toggle" class="accessibility-btn toggle-btn ${this.currentSettings.reducedMotion ? 'active' : ''}"
                                aria-pressed="${this.currentSettings.reducedMotion}">
                            ${this.currentSettings.reducedMotion ? 'Ativo' : 'Inativo'}
                        </button>
                    </div>
                    
                    <div class="accessibility-control">
                        <label for="fonts-toggle">
                            <i class="fas fa-font"></i> Fontes Legíveis
                        </label>
                        <button id="fonts-toggle" class="accessibility-btn toggle-btn ${this.currentSettings.readableFonts ? 'active' : ''}"
                                aria-pressed="${this.currentSettings.readableFonts}">
                            ${this.currentSettings.readableFonts ? 'Ativo' : 'Inativo'}
                        </button>
                    </div>
                    
                    <div class="accessibility-control">
                        <label for="cursor-size">
                            <i class="fas fa-mouse-pointer"></i> Tamanho do Cursor
                        </label>
                        <select id="cursor-size" class="accessibility-select">
                            <option value="small" ${this.currentSettings.cursorSize === 'small' ? 'selected' : ''}>Pequeno</option>
                            <option value="normal" ${this.currentSettings.cursorSize === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="large" ${this.currentSettings.cursorSize === 'large' ? 'selected' : ''}>Grande</option>
                            <option value="x-large" ${this.currentSettings.cursorSize === 'x-large' ? 'selected' : ''}>Extra Grande</option>
                        </select>
                    </div>
                </div>
                
                <div class="accessibility-actions">
                    <button id="reset-all" class="accessibility-btn reset-btn">
                        <i class="fas fa-redo"></i> Redefinir Tudo
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Adicionar botão de ativação do painel (flutuante)
        this.createActivationButton();
        
        // Configurar eventos do painel
        this.setupPanelEvents();
    }

    createActivationButton() {
        const button = document.createElement('button');
        button.id = 'accessibility-toggle';
        button.className = 'accessibility-toggle';
        button.setAttribute('aria-label', 'Abrir painel de acessibilidade');
        button.innerHTML = '<i class="fas fa-universal-access"></i>';
        
        button.addEventListener('click', () => {
            this.togglePanel();
        });
        
        document.body.appendChild(button);
    }

    setupPanelEvents() {
        // Botão de fechar
        document.getElementById('accessibility-close').addEventListener('click', () => {
            this.togglePanel();
        });
        
        // Controles de tema
        document.getElementById('theme-toggle').addEventListener('click', () => {
            const newTheme = this.toggleTheme();
            this.updatePanelThemeButton(newTheme);
        });
        
        // Controles de fonte
        document.getElementById('font-decrease').addEventListener('click', () => {
            const newSize = this.adjustFontSize('decrease');
            document.getElementById('font-size-display').textContent = `${newSize}px`;
        });
        
        document.getElementById('font-increase').addEventListener('click', () => {
            const newSize = this.adjustFontSize('increase');
            document.getElementById('font-size-display').textContent = `${newSize}px`;
        });
        
        // Controles de foco
        document.getElementById('focus-toggle').addEventListener('click', (e) => {
            const enabled = this.toggleFocusHighlight();
            e.target.classList.toggle('active', enabled);
            e.target.textContent = enabled ? 'Ativo' : 'Inativo';
            e.target.setAttribute('aria-pressed', enabled);
        });
        
        // Controles de links
        document.getElementById('links-toggle').addEventListener('click', (e) => {
            const enabled = this.toggleLinkUnderline();
            e.target.classList.toggle('active', enabled);
            e.target.textContent = enabled ? 'Ativo' : 'Inativo';
            e.target.setAttribute('aria-pressed', enabled);
        });
        
        // Controles de voz
        document.getElementById('voice-toggle').addEventListener('click', (e) => {
            const enabled = this.toggleVoiceReader();
            e.target.classList.toggle('active', enabled);
            e.target.textContent = enabled ? 'Ativo' : 'Inativo';
            e.target.setAttribute('aria-pressed', enabled);
            
            // Mostrar/ocultar controles de velocidade
            document.getElementById('voice-controls').style.display = enabled ? '' : 'none';
        });
        
        document.getElementById('voice-slower').addEventListener('click', () => {
            const newRate = this.adjustVoiceRate('decrease');
            document.getElementById('voice-rate-display').textContent = `${newRate}x`;
        });
        
        document.getElementById('voice-faster').addEventListener('click', () => {
            const newRate = this.adjustVoiceRate('increase');
            document.getElementById('voice-rate-display').textContent = `${newRate}x`;
        });
        
        // Controles do Vlibras
        document.getElementById('vlibras-toggle').addEventListener('click', (e) => {
            const enabled = this.toggleVlibras();
            e.target.classList.toggle('active', enabled);
            e.target.textContent = enabled ? 'Ativo' : 'Inativo';
            e.target.setAttribute('aria-pressed', enabled);
        });
        
        // Controles de movimento
        document.getElementById('motion-toggle').addEventListener('click', (e) => {
            const enabled = this.toggleReducedMotion();
            e.target.classList.toggle('active', enabled);
            e.target.textContent = enabled ? 'Ativo' : 'Inativo';
            e.target.setAttribute('aria-pressed', enabled);
        });
        
        // Controles de fontes
        document.getElementById('fonts-toggle').addEventListener('click', (e) => {
            const enabled = this.toggleReadableFonts();
            e.target.classList.toggle('active', enabled);
            e.target.textContent = enabled ? 'Ativo' : 'Inativo';
            e.target.setAttribute('aria-pressed', enabled);
        });
        
        // Controles de cursor
        document.getElementById('cursor-size').addEventListener('change', (e) => {
            this.adjustCursorSize(e.target.value);
        });
        
        // Botão de reset
        document.getElementById('reset-all').addEventListener('click', () => {
            if (confirm('Tem certeza que deseja redefinir todas as configurações de acessibilidade?')) {
                this.resetSettings();
                this.updatePanel();
            }
        });
        
        // Fechar painel ao pressionar ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPanelOpen()) {
                this.togglePanel();
            }
        });
    }

    togglePanel() {
        const panel = document.getElementById('accessibility-panel');
        const isOpen = panel.classList.contains('open');
        
        if (isOpen) {
            panel.classList.remove('open');
            document.getElementById('accessibility-toggle').classList.remove('active');
        } else {
            panel.classList.add('open');
            document.getElementById('accessibility-toggle').classList.add('active');
            panel.focus();
        }
    }

    isPanelOpen() {
        const panel = document.getElementById('accessibility-panel');
        return panel && panel.classList.contains('open');
    }

    updatePanel() {
        // Atualizar todos os controles do painel
        this.updatePanelThemeButton(this.currentSettings.theme);
        document.getElementById('font-size-display').textContent = `${this.currentSettings.fontSize}px`;
        document.getElementById('voice-rate-display').textContent = `${this.currentSettings.voiceReaderRate}x`;
        
        // Atualizar estados dos toggles
        const toggles = {
            'focus-toggle': this.currentSettings.focusHighlight,
            'links-toggle': this.currentSettings.linkUnderline,
            'voice-toggle': this.currentSettings.voiceReader,
            'vlibras-toggle': this.currentSettings.vlibrasEnabled,
            'motion-toggle': this.currentSettings.reducedMotion,
            'fonts-toggle': this.currentSettings.readableFonts
        };
        
        Object.entries(toggles).forEach(([id, enabled]) => {
            const button = document.getElementById(id);
            if (button) {
                button.classList.toggle('active', enabled);
                button.textContent = enabled ? 'Ativo' : 'Inativo';
                button.setAttribute('aria-pressed', enabled);
            }
        });
        
        // Atualizar seleção do cursor
        const cursorSelect = document.getElementById('cursor-size');
        if (cursorSelect) {
            cursorSelect.value = this.currentSettings.cursorSize;
        }
        
        // Mostrar/ocultar controles de voz
        document.getElementById('voice-controls').style.display = 
            this.currentSettings.voiceReader ? '' : 'none';
    }

    updatePanelThemeButton(theme) {
        const button = document.getElementById('theme-toggle');
        if (!button) return;
        
        const themes = {
            'light': { text: 'Claro', icon: 'fa-sun' },
            'dark': { text: 'Escuro', icon: 'fa-moon' },
            'high-contrast': { text: 'Alto Contraste', icon: 'fa-adjust' }
        };
        
        const themeInfo = themes[theme] || themes.light;
        button.innerHTML = `<i class="fas ${themeInfo.icon}"></i> ${themeInfo.text}`;
    }

    updateFontSizeButtons(currentSize) {
        const decreaseBtn = document.getElementById('font-decrease');
        const increaseBtn = document.getElementById('font-increase');
        
        if (decreaseBtn) {
            decreaseBtn.disabled = currentSize <= 12;
        }
        
        if (increaseBtn) {
            increaseBtn.disabled = currentSize >= 24;
        }
    }

    // ========== APLICAÇÃO DE CONFIGURAÇÕES ==========
    applySetting(key, value) {
        switch(key) {
            case 'theme':
                this.applyTheme(value);
                break;
            case 'fontSize':
                this.applyFontSize(value);
                break;
            case 'focusHighlight':
                if (value) this.applyFocusHighlight();
                else this.removeFocusHighlight();
                break;
            case 'linkUnderline':
                if (value) this.applyLinkUnderline();
                else this.removeLinkUnderline();
                break;
            case 'voiceReader':
                // Ação é tratada no botão
                break;
            case 'voiceReaderRate':
                // Atualizado em tempo real
                break;
            case 'vlibrasEnabled':
                if (value) this.loadVlibras();
                else this.removeVlibras();
                break;
            case 'reducedMotion':
                if (value) this.applyReducedMotion();
                else this.removeReducedMotion();
                break;
            case 'readableFonts':
                if (value) this.applyReadableFonts();
                else this.removeReadableFonts();
                break;
            case 'cursorSize':
                this.applyCursorSize(value);
                break;
        }
    }

    applyAllSettings() {
        Object.entries(this.currentSettings).forEach(([key, value]) => {
            this.applySetting(key, value);
        });
    }

    // ========== DETECÇÃO DE PREFERÊNCIAS DO SISTEMA ==========
    setupEventListeners() {
        // Detectar preferências do sistema
        if (window.matchMedia) {
            // Preferência de tema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
            prefersDark.addEventListener('change', (e) => {
                if (!localStorage.getItem(`${this.prefix}theme_set`)) {
                    this.updateSetting('theme', e.matches ? 'dark' : 'light');
                }
            });
            
            // Preferência de redução de movimento
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
            prefersReducedMotion.addEventListener('change', (e) => {
                if (!localStorage.getItem(`${this.prefix}motion_set`)) {
                    this.updateSetting('reducedMotion', e.matches);
                }
            });
        }
        
        // Salvar quando o usuário define manualmente
        document.addEventListener('themeChanged', () => {
            localStorage.setItem(`${this.prefix}theme_set`, 'true');
        });
        
        document.addEventListener('motionChanged', () => {
            localStorage.setItem(`${this.prefix}motion_set`, 'true');
        });
        
        // Atalhos de teclado para acessibilidade
        document.addEventListener('keydown', (e) => {
            // Alt + A = Abrir/fechar painel de acessibilidade
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.togglePanel();
            }
            
            // Alt + 1 = Alternar tema
            if (e.altKey && e.key === '1') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // Alt + 2 = Aumentar fonte
            if (e.altKey && e.key === '2') {
                e.preventDefault();
                this.adjustFontSize('increase');
            }
            
            // Alt + 3 = Diminuir fonte
            if (e.altKey && e.key === '3') {
                e.preventDefault();
                this.adjustFontSize('decrease');
            }
            
            // Alt + 4 = Alternar leitor de voz
            if (e.altKey && e.key === '4') {
                e.preventDefault();
                this.toggleVoiceReader();
            }
        });
        
        // Fechar leitor de voz ao sair da página
        window.addEventListener('beforeunload', () => {
            this.stopVoiceReader();
        });
    }

    // ========== ATALHOS DE TECLADO GLOBAIS ==========
    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Alt + A', action: 'Abrir/fechar painel de acessibilidade' },
            { key: 'Alt + 1', action: 'Alternar tema' },
            { key: 'Alt + 2', action: 'Aumentar tamanho da fonte' },
            { key: 'Alt + 3', action: 'Diminuir tamanho da fonte' },
            { key: 'Alt + 4', action: 'Alternar leitor de voz' },
            { key: 'Tab', action: 'Navegar entre elementos' },
            { key: 'Shift + Tab', action: 'Navegar para trás' },
            { key: 'Enter/Space', action: 'Ativar elemento selecionado' },
            { key: 'Esc', action: 'Fechar painel/modal' }
        ];
        
        let html = '<h3>Atalhos de Teclado</h3><ul>';
        shortcuts.forEach(shortcut => {
            html += `<li><kbd>${shortcut.key}</kbd> - ${shortcut.action}</li>`;
        });
        html += '</ul>';
        
        alert(html); // Em produção, use um modal personalizado
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar estilos CSS para o sistema de acessibilidade
    const styles = document.createElement('style');
    styles.textContent = `
        /* Painel de Acessibilidade */
        .accessibility-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            z-index: 9997;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            transition: all 0.3s ease;
        }
        
        .accessibility-toggle:hover,
        .accessibility-toggle:focus {
            transform: scale(1.1);
            box-shadow: 0 6px 25px rgba(0,0,0,0.2);
        }
        
        .accessibility-toggle.active {
            background: linear-gradient(135deg, #ef4444, #f97316);
        }
        
        .accessibility-panel {
            position: fixed;
            top: 0;
            right: -400px;
            width: 380px;
            height: 100vh;
            background: white;
            box-shadow: -5px 0 25px rgba(0,0,0,0.1);
            z-index: 9999;
            transition: right 0.3s ease;
            overflow-y: auto;
            font-family: Arial, sans-serif;
        }
        
        .accessibility-panel.open {
            right: 0;
        }
        
        [data-theme="dark"] .accessibility-panel {
            background: #1e293b;
            color: #f1f5f9;
        }
        
        [data-theme="high-contrast"] .accessibility-panel {
            background: black;
            color: white;
            border-left: 3px solid yellow;
        }
        
        .accessibility-header {
            padding: 20px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        [data-theme="dark"] .accessibility-header {
            background: linear-gradient(135deg, #1e40af, #5b21b6);
        }
        
        [data-theme="high-contrast"] .accessibility-header {
            background: black;
            border-bottom: 3px solid yellow;
        }
        
        .accessibility-header h3 {
            margin: 0;
            font-size: 1.25rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .accessibility-close {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            transition: background 0.2s;
        }
        
        .accessibility-close:hover {
            background: rgba(255,255,255,0.3);
        }
        
        .accessibility-content {
            padding: 20px;
        }
        
        .accessibility-section {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        [data-theme="dark"] .accessibility-section {
            border-bottom-color: #334155;
        }
        
        [data-theme="high-contrast"] .accessibility-section {
            border-bottom: 2px solid yellow;
        }
        
        .accessibility-section h4 {
            margin: 0 0 15px 0;
            color: #3b82f6;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.1rem;
        }
        
        [data-theme="dark"] .accessibility-section h4 {
            color: #60a5fa;
        }
        
        [data-theme="high-contrast"] .accessibility-section h4 {
            color: yellow;
        }
        
        .accessibility-control {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .accessibility-control label {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            flex: 1;
        }
        
        .accessibility-btn {
            padding: 8px 16px;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .accessibility-btn:hover,
        .accessibility-btn:focus {
            background: #e2e8f0;
            outline: none;
        }
        
        .accessibility-btn.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }
        
        [data-theme="dark"] .accessibility-btn {
            background: #334155;
            border-color: #475569;
            color: #f1f5f9;
        }
        
        [data-theme="dark"] .accessibility-btn:hover {
            background: #475569;
        }
        
        [data-theme="dark"] .accessibility-btn.active {
            background: #60a5fa;
            border-color: #60a5fa;
        }
        
        .accessibility-btn-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .font-size-display,
        .rate-display {
            min-width: 50px;
            text-align: center;
            font-weight: bold;
        }
        
        .accessibility-select {
            padding: 8px 12px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            background: white;
            font-size: 1rem;
            min-width: 150px;
        }
        
        [data-theme="dark"] .accessibility-select {
            background: #1e293b;
            border-color: #475569;
            color: #f1f5f9;
        }
        
        [data-theme="high-contrast"] .accessibility-select {
            background: black;
            border: 2px solid yellow;
            color: white;
        }
        
        .accessibility-actions {
            margin-top: 25px;
            text-align: center;
        }
        
        .reset-btn {
            background: #fef2f2;
            color: #dc2626;
            border-color: #fca5a5;
        }
        
        .reset-btn:hover {
            background: #fee2e2;
        }
        
        /* Overlay para quando o painel está aberto */
        .accessibility-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9998;
            display: none;
        }
        
        .accessibility-panel.open + .accessibility-overlay {
            display: block;
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
            .accessibility-panel {
                width: 100%;
                right: -100%;
            }
            
            .accessibility-panel.open {
                right: 0;
            }
        }
        
        /* Animações reduzidas */
        @media (prefers-reduced-motion: reduce) {
            .accessibility-panel,
            .accessibility-toggle {
                transition: none;
            }
        }
    `;
    document.head.appendChild(styles);
    
    // Inicializar o gerenciador de acessibilidade
    window.accessibilityManager = new AcessibilidadeManager();
});

// Exportar para uso global
window.AcessibilidadeManager = AcessibilidadeManager;
