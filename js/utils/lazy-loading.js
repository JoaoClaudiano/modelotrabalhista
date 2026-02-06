/**
 * Lazy Loading Utilities
 * 
 * Utilidades para otimizar o carregamento de recursos pesados
 * usando Intersection Observer API.
 * 
 * @version 1.0.0
 * @author ModeloTrabalhista Performance Team
 */

/**
 * Pré-carrega bibliotecas de exportação quando botões aparecem na viewport
 * Implementa estratégia de carregamento just-in-time para melhorar TTI
 */
class ExportLibraryPreloader {
    constructor() {
        this.preloaded = false;
        this.loading = false;
        this.observer = null;
        
        // Seletores dos botões de exportação
        this.selectors = [
            '[data-action="export-pdf"]',
            '[data-action="export-docx"]',
            '.btn-export-pdf',
            '.btn-export-docx',
            '#exportPDF',
            '#exportDOCX'
        ];
    }
    
    /**
     * Inicializa o preloader
     * Deve ser chamado após o DOM estar pronto
     */
    init() {
        // Verificar suporte a Intersection Observer
        if (!('IntersectionObserver' in window)) {
            console.warn('[Lazy Loading] IntersectionObserver não suportado, usando fallback');
            this.fallbackInit();
            return;
        }
        
        // Encontrar botões de exportação
        const exportButtons = this.findExportButtons();
        
        if (exportButtons.length === 0) {
            console.log('[Lazy Loading] Nenhum botão de exportação encontrado');
            return;
        }
        
        console.log(`[Lazy Loading] Observando ${exportButtons.length} botão(s) de exportação`);
        
        // Criar observer
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                // Carregar 200px antes do botão entrar na viewport
                rootMargin: '200px',
                threshold: 0
            }
        );
        
        // Observar todos os botões
        exportButtons.forEach(button => {
            this.observer.observe(button);
        });
    }
    
    /**
     * Encontra todos os botões de exportação na página
     * @returns {HTMLElement[]} Array de elementos
     */
    findExportButtons() {
        const buttons = [];
        
        this.selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (!buttons.includes(el)) {
                    buttons.push(el);
                }
            });
        });
        
        return buttons;
    }
    
    /**
     * Callback do Intersection Observer
     * @param {IntersectionObserverEntry[]} entries
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.preloaded && !this.loading) {
                this.preloadLibraries();
            }
        });
    }
    
    /**
     * Pré-carrega as bibliotecas de exportação
     * @returns {Promise<void>}
     */
    async preloadLibraries() {
        if (this.preloaded || this.loading) {
            return;
        }
        
        this.loading = true;
        console.log('[Lazy Loading] Iniciando pré-carregamento de bibliotecas de exportação...');
        
        try {
            // Verificar se DocumentExporter está disponível
            if (typeof DocumentExporter !== 'undefined' && window.documentExporter) {
                await window.documentExporter.loadLibraries();
                console.log('[Lazy Loading] ✅ Bibliotecas pré-carregadas com sucesso');
                this.preloaded = true;
            } else {
                console.warn('[Lazy Loading] DocumentExporter não disponível ainda');
            }
        } catch (error) {
            console.warn('[Lazy Loading] ⚠️ Erro ao pré-carregar bibliotecas:', error);
        } finally {
            this.loading = false;
            
            // Desconectar observer após pré-carregar
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
        }
    }
    
    /**
     * Fallback para navegadores sem IntersectionObserver
     * Carrega bibliotecas após um delay
     */
    fallbackInit() {
        // Aguardar 3 segundos e então pré-carregar
        setTimeout(() => {
            this.preloadLibraries();
        }, 3000);
    }
    
    /**
     * Desconecta o observer manualmente
     */
    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
}

/**
 * Lazy loading de imagens usando Intersection Observer
 * Para navegadores que não suportam loading="lazy" nativamente
 */
class ImageLazyLoader {
    constructor() {
        this.observer = null;
        this.images = [];
    }
    
    /**
     * Inicializa o lazy loading de imagens
     */
    init() {
        // Verificar suporte nativo
        if ('loading' in HTMLImageElement.prototype) {
            console.log('[Lazy Loading] Usando loading="lazy" nativo do navegador');
            return; // Navegador suporta nativamente
        }
        
        console.log('[Lazy Loading] Implementando polyfill para lazy loading de imagens');
        
        // Encontrar imagens com data-src
        this.images = Array.from(document.querySelectorAll('img[data-src]'));
        
        if (this.images.length === 0) {
            return;
        }
        
        // Criar observer
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                rootMargin: '50px',
                threshold: 0.01
            }
        );
        
        // Observar todas as imagens
        this.images.forEach(img => {
            this.observer.observe(img);
        });
    }
    
    /**
     * Callback do Intersection Observer
     * @param {IntersectionObserverEntry[]} entries
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
            }
        });
    }
    
    /**
     * Carrega uma imagem
     * @param {HTMLImageElement} img
     */
    loadImage(img) {
        const src = img.getAttribute('data-src');
        
        if (!src) {
            return;
        }
        
        // Carregar imagem
        img.src = src;
        img.removeAttribute('data-src');
        
        // Adicionar classe de loaded
        img.classList.add('lazy-loaded');
        
        // Parar de observar
        if (this.observer) {
            this.observer.unobserve(img);
        }
    }
}

/**
 * Dynamic import helper para carregar módulos sob demanda
 */
class DynamicModuleLoader {
    constructor() {
        this.loadedModules = new Map();
    }
    
    /**
     * Carrega um módulo dinamicamente
     * @param {string} moduleName - Nome do módulo
     * @param {string} modulePath - Caminho do módulo
     * @returns {Promise<any>}
     */
    async loadModule(moduleName, modulePath) {
        // Verificar se já foi carregado
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }
        
        console.log(`[Dynamic Import] Carregando módulo: ${moduleName}`);
        
        try {
            const module = await import(modulePath);
            this.loadedModules.set(moduleName, module);
            console.log(`[Dynamic Import] ✅ Módulo ${moduleName} carregado`);
            return module;
        } catch (error) {
            console.error(`[Dynamic Import] ❌ Erro ao carregar ${moduleName}:`, error);
            throw error;
        }
    }
    
    /**
     * Verifica se um módulo está carregado
     * @param {string} moduleName
     * @returns {boolean}
     */
    isLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }
    
    /**
     * Obtém um módulo carregado
     * @param {string} moduleName
     * @returns {any}
     */
    getModule(moduleName) {
        return this.loadedModules.get(moduleName);
    }
}

/**
 * Inicialização global
 */
function initLazyLoading() {
    // Inicializar preloader de bibliotecas de exportação
    const exportPreloader = new ExportLibraryPreloader();
    exportPreloader.init();
    
    // Inicializar lazy loading de imagens (polyfill)
    const imageLoader = new ImageLazyLoader();
    imageLoader.init();
    
    // Expor globalmente para debug
    window.lazyLoadingUtils = {
        exportPreloader,
        imageLoader,
        dynamicLoader: new DynamicModuleLoader()
    };
    
    console.log('[Lazy Loading] ✅ Utilitários inicializados');
}

// Auto-inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoading);
} else {
    initLazyLoading();
}

// Exportar classes para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ExportLibraryPreloader,
        ImageLazyLoader,
        DynamicModuleLoader
    };
}
