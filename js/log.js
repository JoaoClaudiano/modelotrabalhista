// log.js - Sistema de monitoramento e logging para ModeloTrabalhista

class AppLogger {
    constructor() {
        this.version = '1.0';
        this.logs = [];
        this.errors = [];
        this.warnings = [];
        this.performance = {
            startTime: performance.now(),
            scripts: {},
            resources: {}
        };
        
        this.expectedScripts = [
            'main.js',
            'analytics.js', 
            'acessibilidade.js',

        ];
        
        this.init();
    }
    
    init() {
        this.setupErrorHandling();
        this.setupPerformanceMonitoring();
        this.setupResourceTracking();
        this.checkScripts();
        this.setupConsoleOverride();
        this.setupHeartbeat();
        
        // Log inicial
        this.info('AppLogger inicializado', {
            url: window.location.href,
            userAgent: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language
        });
    }
    
    // ========== MONITORAMENTO DE SCRIPTS ==========
    checkScripts() {
        // Verificar scripts já carregados
        const scripts = document.querySelectorAll('script[src]');
        const loadedScripts = new Set();
        
        scripts.forEach(script => {
            const src = script.src;
            const filename = src.split('/').pop();
            loadedScripts.add(filename);
            
            // Medir tempo de carregamento
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
        });
        
        // Verificar scripts esperados mas não carregados
        this.expectedScripts.forEach(script => {
            if (!loadedScripts.has(script)) {
                this.warning(`Script esperado não encontrado: ${script}`);
            }
        });
        
        return Array.from(loadedScripts);
    }
    
    // ========== MONITORAMENTO DE RECURSOS ==========
    setupResourceTracking() {
        // Monitorar imagens
        document.addEventListener('DOMContentLoaded', () => {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
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
        });
        
        // Monitorar CSS
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => {
            link.addEventListener('load', () => {
                this.info(`CSS carregado: ${link.href.split('/').pop()}`);
            });
            
            link.addEventListener('error', () => {
                this.error(`Falha ao carregar CSS: ${link.href}`);
            });
        });
        
        // Monitorar fontes
        const fonts = document.querySelectorAll('link[rel*="font"], link[href*="font"], link[href*="fonts.googleapis.com"]');
        fonts.forEach(font => {
            font.addEventListener('load', () => {
                this.info(`Fonte carregada: ${font.href.split('/').pop()}`);
            });
            
            font.addEventListener('error', () => {
                this.error(`Falha ao carregar fonte: ${font.href}`);
            });
        });
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
        });
        
        // Monitorar memória (se suportado)
        if (performance.memory) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > 100 * 1024 * 1024) { // > 100MB
                    this.warning('Uso alto de memória JavaScript', {
                        used: this.formatBytes(memory.usedJSHeapSize),
                        total: this.formatBytes(memory.totalJSHeapSize),
                        limit: this.formatBytes(memory.jsHeapSizeLimit)
                    });
                }
            }, 30000);
        }
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
            originalConsole.log(...args);
        };
        
        // Sobrescrever console.error
        console.error = (...args) => {
            this.errors.push({
                type: 'error',
                message: args.join(' '),
                timestamp: new Date().toISOString()
            });
            originalConsole.error(...args);
        };
        
        // Sobrescrever console.warn
        console.warn = (...args) => {
            this.warnings.push({
                type: 'warn',
                message: args.join(' '),
                timestamp: new Date().toISOString()
            });
            originalConsole.warn(...args);
        };
        
        // Sobrescrever console.info
        console.info = (...args) => {
            this.logs.push({
                type: 'info',
                message: args.join(' '),
                timestamp: new Date().toISOString()
            });
            originalConsole.info(...args);
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
        console.log(`[LOG] ${message}`, data);
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
        console.info(`[INFO] ${message}`, data);
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
        console.warn(`[WARNING] ${message}`, data);
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
        console.error(`[ERROR] ${message}`, data);
        
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
            e.message.includes('Uncaught') || 
            e.message.includes('Cannot read') ||
            e.message.includes('is not defined')
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
        
        console.group('🩺 Health Check do Aplicativo');
        console.log(`Status: ${status}`);
        console.log(`Scripts carregados: ${Object.keys(this.performance.scripts).length}`);
        console.log(`Erros: ${this.errors.length}`);
        console.log(`Warnings: ${this.warnings.length}`);
        
        if (this.performance.pageLoadTime) {
            console.log(`Tempo de carregamento: ${this.performance.pageLoadTime.toFixed(2)}ms`);
        }
        
        // Listar scripts não carregados
        const missingScripts = this.expectedScripts.filter(script => 
            !this.performance.scripts[script]
        );
        
        if (missingScripts.length > 0) {
            console.warn('Scripts ausentes:', missingScripts);
        }
        
        console.groupEnd();
        
        return {
            status,
            report,
            healthy: status === 'HEALTHY' || status === 'WITH_WARNINGS'
        };
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
        // Verificar periodicamente o status da aplicação
        setInterval(() => {
            const health = this.checkHealth();
            
            // Se status for crítico, tentar recuperação
            if (health.status === 'CRITICAL' && this.errors.length > 10) {
                this.warning('Muitos erros críticos detectados. Considerando recarregamento...');
                
                // Oferecer opção de recarregar para usuário (em produção, seria um modal)
                if (confirm('O aplicativo está com problemas. Deseja recarregar a página?')) {
                    location.reload();
                }
            }
        }, 60000); // A cada minuto
    }
    
    // ========== DEBUG ==========
    debug(scriptName) {
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
            const message = entry.message.replace(/"/g, '""');
            csv += `"${entry.type}","${message}","${entry.timestamp}"\n`;
        });
        
        return csv;
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
    // Aguardar um pouco para capturar erros iniciais
    setTimeout(() => {
        try {
            window.appLogger = new AppLogger();
            
            // Expor métodos de debug globalmente (apenas em desenvolvimento)
            if (window.location.hostname.includes('localhost') || 
                window.location.hostname.includes('127.0.0.1')) {
                window.debugApp = {
                    health: () => window.appLogger.checkHealth(),
                    report: () => window.appLogger.getReport(),
                    errors: () => window.appLogger.errors,
                    warnings: () => window.appLogger.warnings,
                    scripts: () => window.appLogger.performance.scripts,
                    debug: (script) => window.appLogger.debug(script),
                    export: (format) => window.appLogger.exportLogs(format)
                };
                
                console.log('🔧 Debug tools disponíveis em window.debugApp');
            }
            
            // Verificar saúde inicial
            setTimeout(() => window.appLogger.checkHealth(), 2000);
            
        } catch (error) {
            console.error('Falha ao inicializar AppLogger:', error);
        }
    }, 100);
});

// Exportar para uso global
window.AppLogger = AppLogger;
