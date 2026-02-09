/**
 * Skeleton Screen Manager
 * Sistema global de Skeleton Screen com Shimmer Effect
 * Usando apenas CSS Puro e JavaScript Vanilla
 */

class SkeletonManager {
    constructor() {
        this.loadingElements = new Set();
        this.transitionDuration = 400; // Duração da transição em ms
    }

    /**
     * Adiciona a classe skeleton a um ou mais elementos
     * @param {string|Element|NodeList} selector - Seletor CSS, elemento DOM, ou NodeList
     */
    showSkeleton(selector) {
        const elements = this._getElements(selector);
        elements.forEach(element => {
            element.classList.add('skeleton');
            this.loadingElements.add(element);
        });
    }

    /**
     * Remove a classe skeleton de um ou mais elementos com animação de fade-in
     * @param {string|Element|NodeList} selector - Seletor CSS, elemento DOM, ou NodeList
     * @param {number} delay - Delay opcional antes de remover (em ms)
     */
    hideSkeleton(selector, delay = 0) {
        const elements = this._getElements(selector);
        
        setTimeout(() => {
            elements.forEach(element => {
                // Adiciona a classe de fade-in
                element.classList.add('skeleton-loaded');
                
                // Remove a classe skeleton
                element.classList.remove('skeleton');
                
                // Remove o elemento do conjunto de elementos em loading
                this.loadingElements.delete(element);
                
                // Remove a classe de transição após a animação completar
                setTimeout(() => {
                    element.classList.remove('skeleton-loaded');
                }, this.transitionDuration);
            });
        }, delay);
    }

    /**
     * Remove skeleton de todos os elementos que estão atualmente com skeleton
     */
    hideAllSkeletons() {
        this.loadingElements.forEach(element => {
            element.classList.add('skeleton-loaded');
            element.classList.remove('skeleton');
            
            setTimeout(() => {
                element.classList.remove('skeleton-loaded');
            }, this.transitionDuration);
        });
        
        this.loadingElements.clear();
    }

    /**
     * Simula carregamento de conteúdo/API e remove skeleton quando completo
     * @param {string|Element|NodeList} selector - Seletor CSS, elemento DOM, ou NodeList
     * @param {Function} loadFunction - Função assíncrona que carrega o conteúdo
     */
    async loadWithSkeleton(selector, loadFunction) {
        this.showSkeleton(selector);
        
        try {
            // Aguarda o carregamento do conteúdo
            await loadFunction();
        } finally {
            // Remove skeleton independentemente de sucesso ou erro
            this.hideSkeleton(selector);
        }
    }

    /**
     * Verifica se um elemento está com skeleton ativo
     * @param {Element} element - Elemento DOM
     * @returns {boolean}
     */
    isLoading(element) {
        return element.classList.contains('skeleton');
    }

    /**
     * Obtém elementos do DOM baseado no seletor
     * @private
     */
    _getElements(selector) {
        if (typeof selector === 'string') {
            return Array.from(document.querySelectorAll(selector));
        } else if (selector instanceof NodeList) {
            return Array.from(selector);
        } else if (selector instanceof Element) {
            return [selector];
        } else if (Array.isArray(selector)) {
            return selector;
        }
        return [];
    }
}

// Cria instância global
window.SkeletonManager = SkeletonManager;
window.skeletonManager = new SkeletonManager();

// Funções utilitárias globais para facilitar o uso
window.showSkeleton = (selector) => window.skeletonManager.showSkeleton(selector);
window.hideSkeleton = (selector, delay) => window.skeletonManager.hideSkeleton(selector, delay);
window.hideAllSkeletons = () => window.skeletonManager.hideAllSkeletons();
window.loadWithSkeleton = (selector, loadFn) => window.skeletonManager.loadWithSkeleton(selector, loadFn);
