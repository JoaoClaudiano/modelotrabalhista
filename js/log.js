// log.js - Sistema de monitoramento e logging para ModeloTrabalhista

// ========== CONFIGURAÇÃO DE LOGS ==========
// Flag para DESABILITAR completamente o sistema de logs
// Para desabilitar, defina localStorage.setItem('DISABLE_APP_LOGGER', 'true')
const DISABLE_APP_LOGGER = (() => {
    // Verificar se há override para desabilitar via localStorage
    const disableOverride = localStorage.getItem('DISABLE_APP_LOGGER');
    if (disableOverride === 'true') {
        return true; // Desabilitar se explicitamente desabilitado
    }
    
    // Por padrão, habilitar o logger para que possa silenciar logs em produção
    return false;
})();

// Flag para silenciar logs em produção
// Detecta automaticamente se está em produção ou permite configuração manual
const SILENCIAR_LOGS = (() => {
    // Detectar ambiente de produção automaticamente
    const isProduction = 
        window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1' &&
        !window.location.hostname.includes('.local') &&
        window.location.protocol === 'https:';
    
    // Permitir override manual via localStorage (útil para debug)
    const manualOverride = localStorage.getItem('SILENCIAR_LOGS');
    if (manualOverride !== null) {
        return manualOverride === 'true';
    }
    
    return isProduction;
})();

class AppLogger {
    constructor() {
        this.version = '1.0';
        this.logs = [];
        this.errors = [];
        this.warnings = [];
        this.silenciarLogs = SILENCIAR_LOGS;
        this.performance = {
            startTime: performance.now(),
            scripts: {},
            resources: {}
        };
        // Lista de scripts será preenchida automaticamente
        this.expectedScripts = [];
        
        this.init();
    }
    
    init() {
        this.setupErrorHandling();
        this.setupPerformanceMonitoring();
        this.setupResourceTracking();
        this.detectScripts(); // Detectar scripts automaticamente primeiro
        this.checkScripts();
        this.setupConsoleOverride();
        this.setupHeartbeat();
        
        // Log inicial
        this.info('AppLogger inicializado', {
            url: window.location.href,
            userAgent: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            silenciarLogs: this.silenciarLogs
        });
    }
    
    // ========== DETECÇÃO AUTOMÁTICA DE SCRIPTS ==========
    detectScripts() {
        try {
            const scripts = document.querySelectorAll('script[src]');
            const detected = [];
            
            // Verificar se encontrou scripts
            if (!scripts || scripts.length === 0) {
                this.warning('Nenhum script com src encontrado na página');
                this.expectedScripts = [];
                return detected;
            }
            
            // Converter NodeList para Array para compatibilidade
            const scriptArray = Array.from(scripts);
            
            scriptArray.forEach(script => {
                if (script.src) {
                    const filename = script.src.split('/').pop();
                    if (filename) {
                        detected.push(filename);
                    }
                }
            });
            
            this.expectedScripts = detected;
            this.info('Scripts detectados automaticamente', { 
                scripts: detected,
                count: detected.length 
            });
            
            return detected;
        } catch (error) {
            this.error('Erro ao detectar scripts', { error: error.message });
            this.expectedScripts = [];
            return [];
        }
    }
    
    // ========== MONITORAMENTO DE SCRIPTS ==========
    checkScripts() {
        try {
            // Verificar scripts já carregados
            const scripts = document.querySelectorAll('script[src]');
            const loadedScripts = new Set();
            
            // Verificação de segurança
            if (!scripts || scripts.length === 0) {
                this.warning('Nenhum script com src encontrado durante o check');
                return Array.from(loadedScripts);
            }
            
            // Converter NodeList para Array
            const scriptArray = Array.from(scripts);
            
            scriptArray.forEach(script => {
                const src = script.src;
                const filename = src.split('/').pop();
                loadedScripts.add(filename);
                
                // Verificar se o script já foi carregado (pode ter carregado antes do listener)
                if (script.readyState === 'complete' || script.readyState === 'loaded' || !script.readyState) {
                    // Script já carregado
                    this.performance.scripts[filename] = {
                        loaded: true,
                        loadTime: performance.now() - this.performance.startTime,
                        size: this.getResourceSize(src)
                    };
                    this.info(`Script já carregado: ${filename}`);
                } else {
                    // Adicionar listeners para scripts ainda carregando
                    script.addEventListener('load', () => {
                        this.performance.scripts[filename] = {
                            loaded: true,
                            loadTime: performance.now() - this.performance.startTime,
                            size: this.getResourceSize(src)
                        };
                        this.info(`Script carregado: ${filename}`);
                    });
                    
                    script.addEventListener('error', (e) => {
                        this.error(`Falha ao carregar script: ${filename}`, {
                            src,
                            error: e.error
                        });
                    });
                }
            });
            
            // Verificar scripts esperados mas não carregados - COM VERIFICAÇÃO DE SEGURANÇA
            if (this.expectedScripts && Array.isArray(this.expectedScripts)) {
                this.expectedScripts.forEach(script => {
                    if (!loadedScripts.has(script)) {
                        this.warning(`Script esperado não encontrado: ${script}`);
                    }
                });
            } else {
                this.warning('Lista de scripts esperados não está definida ou não é um array');
            }
            
            return Array.from(loadedScripts);
        } catch (error) {
            this.error('Erro ao verificar scripts', { error: error.message });
            return [];
        }
    }
    
    // ========== MONITORAMENTO DE RECURSOS ==========
    setupResourceTracking() {
        // Monitorar imagens
        document.addEventListener('DOMContentLoaded', () => {
            const images = document.querySelectorAll('img');
            if (images && images.length > 0) {
                Array.from(images).forEach(img => {
                    img.addEventListener('load', () => {
                        this.performance.resources[img.src] = {
                            type: 'image',
                            loaded: true,
                            dimensions: `${img.naturalWidth}x${img.naturalHeight}`
                        };
                    });
                    
                    img.addEventListener('error', () => {
                        this.error(`Falha ao carregar imagem: ${img.src || img.alt || 'Sem src'}`);
                    });
                });
            }
        });
        
        // Monitorar CSS
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        if (links && links.length > 0) {
            Array.from(links).forEach(link => {
                link.addEventListener('load', () => {
                    this.info(`CSS carregado: ${link.href.split('/').pop()}`);
                });
                
                link.addEventListener('error', () => {
                    this.error(`Falha ao carregar CSS: ${link.href}`);
                });
            });
        }
        
        // Monitorar fontes
        const fonts = document.querySelectorAll('link[rel*="font"], link[href*="font"], link[href*="fonts.googleapis.com"]');
        if (fonts && fonts.length > 0) {
            Array.from(fonts).forEach(font => {
                font.addEventListener('load', () => {
                    this.info(`Fonte carregada: ${font.href.split('/').pop()}`);
                });
                
                font.addEventListener('error', () => {
                    this.error(`Falha ao carregar fonte: ${font.href}`);
                });
            });
        }
    }
    
    // ========== MONITORAMENTO DE PERFORMANCE ==========
    setupPerformanceMonitoring() {
        // Medir tempo de carregamento da página
        window.addEventListener('load', () => {
            const loadTime = performance.now() - this.performance.startTime;
            this.performance.pageLoadTime = loadTime;
            
            // Coletar métricas de performance da API Navigation Timing
            if (performance.getEntriesByType) {
                const navTiming = performance.getEntriesByType('navigation')[0];
                if (navTiming) {
                    this.performance.timing = {
                        dns: navTiming.domainLookupEnd - navTiming.domainLookupStart,
                        tcp: navTiming.connectEnd - navTiming.connectStart,
                        request: navTiming.responseStart - navTiming.requestStart,
                        response: navTiming.responseEnd - navTiming.responseStart,
                        domInteractive: navTiming.domInteractive,
                        domComplete: navTiming.domComplete,
                        loadEvent: navTiming.loadEventEnd - navTiming.loadEventStart
                    };
                }
            }
            
            this.info('Página completamente carregada', {
                loadTime: `${loadTime.toFixed(2)}ms`,
                performance: this.performance.timing
            });
            
            // Agendar health check único após o carregamento completo
            this.scheduleHealthCheck();
        });
    }
    
    // ========== TRATAMENTO DE ERROS ==========
    setupErrorHandling() {
        // Erros JavaScript globais
        window.addEventListener('error', (e) => {
            const error = {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                stack: e.error ? e.error.stack : null,
                timestamp: new Date().toISOString()
            };
            
            this.errors.push(error);
            this.error('Erro JavaScript', error);
            
            // Não interferir com o comportamento padrão
            return false;
        });
        
        // Promise rejeitadas não tratadas
        window.addEventListener('unhandledrejection', (e) => {
            const error = {
                message: e.reason?.message || 'Promise rejeitada',
                reason: e.reason,
                timestamp: new Date().toISOString()
            };
            
            this.errors.push(error);
            this.error('Promise não tratada', error);
        });
        
        // Erros de fetch/XHR
        const originalFetch = window.fetch;
        if (originalFetch) {
            window.fetch = (...args) => {
                const startTime = performance.now();
                return originalFetch(...args)
                    .then(response => {
                        const duration = performance.now() - startTime;
                        if (!response.ok) {
                            this.warning(`Fetch falhou: ${args[0]}`, {
                                status: response.status,
                                statusText: response.statusText,
                                duration: `${duration.toFixed(2)}ms`
                            });
                        }
                        return response;
                    })
                    .catch(error => {
                        this.error('Erro no fetch', {
                            url: args[0],
                            error: error.message,
                            timestamp: new Date().toISOString()
                        });
                        throw error;
                    });
            };
        }
    }
    
    // ========== LOGGING MELHORADO ==========
    setupConsoleOverride() {
        // Salvar logs originais
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };
        
        // Sobrescrever console.log
        console.log = (...args) => {
            this.logs.push({
                type: 'log',
                message: args.join(' '),
                timestamp: new Date().toISOString()
            });
            if (!this.silenciarLogs) {
                originalConsole.log(...args);
            }
        };
        
        // Sobrescrever console.error - NUNCA SILENCIAR
        console.error = (...args) => {
            this.errors.push({
                type: 'error',
                message: args.join(' '),
                timestamp: new Date().toISOString()
            });
            // console.error SEMPRE é exibido, independente do flag
            originalConsole.error(...args);
        };
        
        // Sobrescrever console.warn
        console.warn = (...args) => {
            this.warnings.push({
                type: 'warn',
                message: args.join(' '),
                timestamp: new Date().toISOString()
            });
            if (!this.silenciarLogs) {
                originalConsole.warn(...args);
            }
        };
        
        // Sobrescrever console.info
        console.info = (...args) => {
            this.logs.push({
                type: 'info',
                message: args.join(' '),
                timestamp: new Date().toISOString()
            });
            if (!this.silenciarLogs) {
                originalConsole.info(...args);
            }
        };
    }
    
    // ========== MÉTODOS DE LOGGING ==========
    log(message, data = {}) {
        const entry = {
            type: 'log',
            message,
            data,
            timestamp: new Date().toISOString()
        };
        this.logs.push(entry);
        if (!this.silenciarLogs) {
            console.log(`[LOG] ${message}`, data);
        }
        return entry;
    }
    
    info(message, data = {}) {
        const entry = {
            type: 'info',
            message,
            data,
            timestamp: new Date().toISOString()
        };
        this.logs.push(entry);
        
        if (!this.silenciarLogs) {
            // Melhorar formatação do console
            console.groupCollapsed(`%c[INFO] ${message}`, 'color: #2196F3; font-weight: bold;');
            if (Object.keys(data).length > 0) {
                console.log('Detalhes:', data);
            }
            console.groupEnd();
        }
        
        return entry;
    }
    
    warning(message, data = {}) {
        const entry = {
            type: 'warning',
            message,
            data,
            timestamp: new Date().toISOString()
        };
        this.warnings.push(entry);
        
        if (!this.silenciarLogs) {
            console.groupCollapsed(`%c[WARNING] ${message}`, 'color: #FF9800; font-weight: bold;');
            if (Object.keys(data).length > 0) {
                console.warn('Detalhes:', data);
            }
            console.groupEnd();
        }
        
        return entry;
    }
    
    error(message, data = {}) {
        const entry = {
            type: 'error',
            message,
            data,
            timestamp: new Date().toISOString()
        };
        this.errors.push(entry);
        
        // console.error SEMPRE é exibido, independente do flag
        console.groupCollapsed(`%c[ERROR] ${message}`, 'color: #F44336; font-weight: bold;');
        if (Object.keys(data).length > 0) {
            console.error('Detalhes:', data);
        }
        console.groupEnd();
        
        // Enviar para analytics se disponível
        if (window.analytics && typeof window.analytics.trackError === 'function') {
            try {
                window.analytics.trackError(new Error(message), data);
            } catch (e) {
                // Silencioso
            }
        }
        
        return entry;
    }
    
    // ========== RELATÓRIOS E STATUS ==========
    getReport() {
        const scripts = Object.keys(this.performance.scripts);
        const resources = Object.keys(this.performance.resources);
        
        return {
            summary: {
                totalLogs: this.logs.length,
                totalErrors: this.errors.length,
                totalWarnings: this.warnings.length,
                scriptsLoaded: scripts.length,
                resourcesLoaded: resources.length
            },
            status: this.getStatus(),
            scripts: this.performance.scripts,
            performance: {
                pageLoadTime: this.performance.pageLoadTime,
                timing: this.performance.timing
            },
            recentErrors: this.errors.slice(-5),
            recentWarnings: this.warnings.slice(-5)
        };
    }
    
    getStatus() {
        const criticalErrors = this.errors.filter(e => 
            e.message && (e.message.includes('Uncaught') || 
            e.message.includes('Cannot read') ||
            e.message.includes('is not defined'))
        );
        
        if (criticalErrors.length > 0) {
            return 'CRITICAL';
        } else if (this.errors.length > 0) {
            return 'WITH_ERRORS';
        } else if (this.warnings.length > 0) {
            return 'WITH_WARNINGS';
        } else {
            return 'HEALTHY';
        }
    }
    
    checkHealth() {
        const report = this.getReport();
        const status = this.getStatus();
        const scripts = Object.keys(this.performance.scripts);
        
        if (!this.silenciarLogs) {
            console.groupCollapsed(`%c🩺 Health Check do Aplicativo - ${status}`, 
                status === 'HEALTHY' ? 'color: #4CAF50; font-weight: bold;' :
                status === 'WITH_WARNINGS' ? 'color: #FF9800; font-weight: bold;' :
                status === 'WITH_ERRORS' ? 'color: #F44336; font-weight: bold;' :
                'color: #9C27B0; font-weight: bold;');
            
            console.log(`📊 Status: ${status}`);
            console.log(`📦 Scripts carregados: ${scripts.length}`);
            console.log(`❌ Erros: ${this.errors.length}`);
            console.log(`⚠️  Warnings: ${this.warnings.length}`);
            
            if (this.performance.pageLoadTime) {
                console.log(`⏱️  Tempo de carregamento: ${this.performance.pageLoadTime.toFixed(2)}ms`);
            }
            
            // Mostrar scripts carregados
            if (scripts.length > 0) {
                console.groupCollapsed('📁 Scripts carregados:');
                scripts.forEach((script, index) => {
                    const data = this.performance.scripts[script];
                    console.log(`${index + 1}. ${script}: ${data.loaded ? '✅' : '❌'} ${data.loadTime ? `(${data.loadTime.toFixed(2)}ms)` : ''}`);
                });
                console.groupEnd();
            }
            
            // Listar scripts esperados mas não carregados
            const missingScripts = this.expectedScripts.filter(script => 
                !this.performance.scripts[script]
            );
            
            if (missingScripts.length > 0) {
                console.warn('🔍 Scripts esperados mas não encontrados:', missingScripts);
            }
            
            // Mostrar erros recentes se houver
            if (this.errors.length > 0) {
                console.groupCollapsed(`❌ Últimos ${Math.min(3, this.errors.length)} erros:`);
                this.errors.slice(-3).forEach((error, index) => {
                    console.log(`${index + 1}. ${error.message || 'Erro sem mensagem'}`);
                });
                console.groupEnd();
            }
            
            // Mostrar warnings recentes se houver
            if (this.warnings.length > 0) {
                console.groupCollapsed(`⚠️  Últimos ${Math.min(3, this.warnings.length)} warnings:`);
                this.warnings.slice(-3).forEach((warning, index) => {
                    console.log(`${index + 1}. ${warning.message || 'Warning sem mensagem'}`);
                });
                console.groupEnd();
            }
            
            console.groupEnd();
        }
        
        return {
            status,
            report,
            healthy: status === 'HEALTHY' || status === 'WITH_WARNINGS',
            timestamp: new Date().toISOString()
        };
    }
    
    // ========== AGENDAR HEALTH CHECK ==========
    scheduleHealthCheck() {
        // Verificar se já há um health check agendado
        if (this.healthCheckScheduled) {
            return;
        }
        
        this.healthCheckScheduled = true;
        
        // Agendar health check único após 2 segundos
        setTimeout(() => {
            this.checkHealth();
            this.healthCheckScheduled = false;
        }, 2000);
    }
    
    // ========== UTILITÁRIOS ==========
    getResourceSize(url) {
        // Tentar obter tamanho via Performance API
        if (performance.getEntriesByName) {
            const entries = performance.getEntriesByName(url);
            if (entries.length > 0) {
                return entries[0].transferSize || entries[0].encodedBodySize || 'unknown';
            }
        }
        return 'unknown';
    }
    
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0 || bytes === 'unknown') return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // ========== HEARTBEAT ==========
    setupHeartbeat() {
        // Verificar periodicamente o status da aplicação (a cada 5 minutos)
        this.heartbeatInterval = setInterval(() => {
            const health = this.checkHealth();
            
            // Se status for crítico, tentar recuperação
            if (health.status === 'CRITICAL' && this.errors.length > 10) {
                this.warning('Muitos erros críticos detectados. Considerando recarregamento...');
                
                // Oferecer opção de recarregar para usuário (em produção, seria um modal)
                if (confirm('O aplicativo está com problemas. Deseja recarregar a página?')) {
                    location.reload();
                }
            }
        }, 300000); // A cada 5 minutos
    }
    
    // ========== DEBUG ==========
    debug(scriptName) {
        if (this.silenciarLogs) {
            // Em modo silencioso, retornar dados sem console output
            if (scriptName) {
                return this.performance.scripts[scriptName] || null;
            } else {
                return this.performance.scripts;
            }
        }
        
        if (scriptName) {
            const script = this.performance.scripts[scriptName];
            if (script) {
                console.group(`🔍 Debug: ${scriptName}`);
                console.log('Status:', script.loaded ? '✅ Carregado' : '❌ Falhou');
                console.log('Tempo de carregamento:', script.loadTime ? `${script.loadTime.toFixed(2)}ms` : 'N/A');
                console.log('Tamanho:', script.size);
                console.groupEnd();
                return script;
            } else {
                console.warn(`Script ${scriptName} não encontrado no monitoramento`);
                return null;
            }
        } else {
            // Debug de todos os scripts
            console.group('📊 Debug de todos os scripts');
            Object.entries(this.performance.scripts).forEach(([name, data]) => {
                console.log(`${name}:`, data.loaded ? '✅' : '❌', 
                          data.loadTime ? `${data.loadTime.toFixed(2)}ms` : '');
            });
            console.groupEnd();
        }
    }
    
    // ========== EXPORTAÇÃO DE LOGS ==========
    exportLogs(format = 'json') {
        const data = {
            logs: this.logs,
            errors: this.errors,
            warnings: this.warnings,
            performance: this.performance,
            metadata: {
                exportedAt: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            }
        };
        
        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(data);
        }
        
        return data;
    }
    
    convertToCSV(data) {
        let csv = 'Tipo,Mensagem,Timestamp\n';
        
        [...data.logs, ...data.errors, ...data.warnings].forEach(entry => {
            const message = entry.message ? entry.message.replace(/"/g, '""') : '';
            csv += `"${entry.type}","${message}","${entry.timestamp}"\n`;
        });
        
        return csv;
    }
    
    // ========== MÉTODO PARA ATUALIZAR SCRIPTS ESPERADOS ==========
    updateExpectedScripts(scripts) {
        if (Array.isArray(scripts)) {
            this.expectedScripts = scripts;
            this.info('Lista de scripts esperados atualizada manualmente', { 
                scripts: scripts,
                count: scripts.length 
            });
        } else {
            this.error('Tentativa de atualizar scripts esperados com valor não-array', { 
                received: typeof scripts,
                value: scripts 
            });
        }
    }
    
    // ========== MÉTODOS PARA CONTROLAR SILENCIAMENTO ==========
    setSilenciarLogs(value) {
        this.silenciarLogs = !!value;
        localStorage.setItem('SILENCIAR_LOGS', String(this.silenciarLogs));
        
        // Sempre mostrar no console quando alternar o modo
        // Usando console.error para garantir visibilidade (nunca é silenciado)
        console.error(`🔧 Logs ${this.silenciarLogs ? 'SILENCIADOS' : 'ATIVADOS'}`);
        
        return this.silenciarLogs;
    }
    
    getSilenciarLogs() {
        return this.silenciarLogs;
    }
    
    toggleLogs() {
        return this.setSilenciarLogs(!this.silenciarLogs);
    }
    
    // ========== DESTRUIÇÃO ==========
    destroy() {
        // Restaurar console original
        if (console.__original__) {
            console.log = console.__original__.log;
            console.error = console.__original__.error;
            console.warn = console.__original__.warn;
            console.info = console.__original__.info;
            delete console.__original__;
        }
        
        // Limpar intervalos
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        this.info('AppLogger destruído');
    }
}

// Inicialização automática
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o AppLogger está desabilitado
    if (DISABLE_APP_LOGGER) {
        // AppLogger desabilitado manualmente
        // Para desabilitar: localStorage.setItem('DISABLE_APP_LOGGER', 'true')
        return; // Não inicializar
    }
    
    // Aguardar um pouco mais para garantir que todos os scripts começaram a carregar
    setTimeout(() => {
        try {
            // Verificar se já existe um logger (evitar duplicação)
            if (!window.appLogger) {
                window.appLogger = new AppLogger();
                
                // DEBUG: expor métodos em desenvolvimento
                if (window.location.hostname.includes('localhost') || 
                    window.location.hostname.includes('127.0.0.1') ||
                    window.location.hostname === 'joaoclaudiano.github.io' ||
                    window.location.hostname.includes('pages.dev')) {
                    
                    window.debugApp = {
                        health: () => window.appLogger.checkHealth(),
                        report: () => window.appLogger.getReport(),
                        errors: () => window.appLogger.errors,
                        warnings: () => window.appLogger.warnings,
                        scripts: () => window.appLogger.performance.scripts,
                        debug: (script) => window.appLogger.debug(script),
                        export: (format) => window.appLogger.exportLogs(format),
                        updateScripts: (scripts) => window.appLogger.updateExpectedScripts(scripts),
                        detectScripts: () => window.appLogger.detectScripts(),
                        silenciarLogs: (value) => window.appLogger.setSilenciarLogs(value),
                        toggleLogs: () => window.appLogger.toggleLogs(),
                        getLogStatus: () => window.appLogger.getSilenciarLogs()
                    };
                    
                    if (!window.appLogger.silenciarLogs) {
                        console.log('%c🔧 Debug tools disponíveis em window.debugApp', 'color: #4CAF50; font-weight: bold;');
                        console.log('%c📝 Para verificar a saúde do app: debugApp.health()', 'color: #2196F3;');
                        console.log('%c📊 Para ver relatório completo: debugApp.report()', 'color: #2196F3;');
                        console.log('%c🔇 Para silenciar/ativar logs: debugApp.toggleLogs()', 'color: #FF9800;');
                        console.log(`%c📋 Logs atualmente: ${window.appLogger.silenciarLogs ? 'SILENCIADOS' : 'ATIVOS'}`, 
                            `color: ${window.appLogger.silenciarLogs ? '#F44336' : '#4CAF50'}; font-weight: bold;`);
                    }
                }
            }
            
        } catch (error) {
            console.error('Falha crítica ao inicializar AppLogger:', error);
            
            // Fallback mínimo para logging básico
            window.appLogger = {
                logs: [],
                errors: [],
                warnings: [],
                performance: {},
                silenciarLogs: false,
                log: (msg, data) => console.log('[FALLBACK LOG]', msg, data),
                error: (msg, data) => console.error('[FALLBACK ERROR]', msg, data),
                warning: (msg, data) => console.warn('[FALLBACK WARNING]', msg, data),
                info: (msg, data) => console.info('[FALLBACK INFO]', msg, data),
                checkHealth: () => ({ status: 'FALLBACK_MODE', healthy: false })
            };
        }
    }, 500); // Aumente o delay para 500ms
});

// Exportar para uso global
window.AppLogger = AppLogger;
