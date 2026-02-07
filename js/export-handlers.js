/**
 * Export Handlers - Integração completa de lazy loading para exportação
 * 
 * Este módulo integra o lazy loading de bibliotecas PDF/DOCX com estados visuais
 * de loading nos botões de exportação.
 * 
 * @version 1.0.0
 * @requires DocumentExporter (js/export.js)
 * @requires ExportLibraryPreloader (js/utils/lazy-loading.js)
 */

(function() {
    'use strict';
    
    /**
     * Configuração de seletores e textos
     */
    const CONFIG = {
        selectors: {
            exportPDF: '[data-action="export-pdf"], .btn-export-pdf, #exportPDF',
            exportDOCX: '[data-action="export-docx"], .btn-export-docx, #exportDOCX'
        },
        messages: {
            loading: {
                library: '<i class="fas fa-spinner fa-spin"></i> Carregando biblioteca...',
                generating: '<i class="fas fa-spinner fa-spin"></i> Gerando {FORMAT}...'
            },
            success: '<i class="fas fa-check"></i> Exportado!',
            error: '<i class="fas fa-times"></i> Erro - Tente novamente',
            timeout: '<i class="fas fa-exclamation-triangle"></i> Timeout - Tente novamente'
        },
        timeouts: {
            success: 2000,  // Tempo para mostrar mensagem de sucesso
            error: 3000,    // Tempo para mostrar mensagem de erro
            library: 10000  // Timeout para carregamento de bibliotecas
        }
    };
    
    /**
     * Estado global para controle de exportações
     */
    const state = {
        isExporting: false,
        loadedLibraries: false
    };
    
    /**
     * Adiciona handler de exportação a um botão
     * @param {HTMLElement} button - Botão de exportação
     * @param {string} format - Formato de exportação ('PDF' ou 'DOCX')
     */
    function addExportHandler(button, format) {
        if (!button) return;
        
        const originalHTML = button.innerHTML;
        
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Prevenir múltiplas exportações simultâneas
            if (state.isExporting) {
                console.warn('[Export] Exportação já em andamento');
                return;
            }
            
            state.isExporting = true;
            
            try {
                // 1. Mostrar estado de carregamento da biblioteca
                button.disabled = true;
                button.innerHTML = CONFIG.messages.loading.library;
                
                // 2. Garantir que bibliotecas estão carregadas
                if (!state.loadedLibraries) {
                    await loadLibrariesWithTimeout();
                    state.loadedLibraries = true;
                }
                
                // 3. Atualizar para estado de geração
                button.innerHTML = CONFIG.messages.loading.generating.replace('{FORMAT}', format);
                
                // 4. Executar exportação
                await performExport(format);
                
                // 5. Mostrar sucesso
                button.innerHTML = CONFIG.messages.success;
                
                // 6. Restaurar botão após delay
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.disabled = false;
                    state.isExporting = false;
                }, CONFIG.timeouts.success);
                
            } catch (error) {
                console.error(`[Export] Erro ao exportar ${format}:`, error);
                
                // Mostrar erro
                button.innerHTML = error.name === 'TimeoutError' 
                    ? CONFIG.messages.timeout 
                    : CONFIG.messages.error;
                
                // Restaurar botão após delay
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.disabled = false;
                    state.isExporting = false;
                }, CONFIG.timeouts.error);
            }
        });
        
        console.log(`[Export] Handler adicionado para exportação ${format}`);
    }
    
    /**
     * Carrega bibliotecas com timeout
     * @returns {Promise<void>}
     * @throws {TimeoutError} Se exceder o timeout configurado
     */
    async function loadLibrariesWithTimeout() {
        if (!window.documentExporter) {
            throw new Error('DocumentExporter não está disponível');
        }
        
        return new Promise((resolve, reject) => {
            // Timeout
            const timeoutId = setTimeout(() => {
                const error = new Error('Timeout ao carregar bibliotecas');
                error.name = 'TimeoutError';
                reject(error);
            }, CONFIG.timeouts.library);
            
            // Carregar bibliotecas
            window.documentExporter.loadLibraries()
                .then(() => {
                    clearTimeout(timeoutId);
                    resolve();
                })
                .catch((error) => {
                    clearTimeout(timeoutId);
                    reject(error);
                });
        });
    }
    
    /**
     * Executa a exportação no formato especificado
     * @param {string} format - Formato de exportação ('PDF' ou 'DOCX')
     * @returns {Promise<void>}
     */
    async function performExport(format) {
        if (!window.documentExporter) {
            throw new Error('DocumentExporter não está disponível');
        }
        
        // Chamar método apropriado do DocumentExporter
        switch (format.toUpperCase()) {
            case 'PDF':
                await window.documentExporter.exportToPDF();
                break;
            case 'DOCX':
                await window.documentExporter.exportToDOCX();
                break;
            default:
                throw new Error(`Formato desconhecido: ${format}`);
        }
    }
    
    /**
     * Inicializa handlers para todos os botões de exportação
     */
    function initExportHandlers() {
        console.log('[Export] Inicializando handlers de exportação...');
        
        // Botões PDF
        const pdfButtons = document.querySelectorAll(CONFIG.selectors.exportPDF);
        pdfButtons.forEach(button => addExportHandler(button, 'PDF'));
        
        // Botões DOCX
        const docxButtons = document.querySelectorAll(CONFIG.selectors.exportDOCX);
        docxButtons.forEach(button => addExportHandler(button, 'DOCX'));
        
        console.log(`[Export] ${pdfButtons.length} botão(s) PDF e ${docxButtons.length} botão(s) DOCX configurados`);
    }
    
    /**
     * Verifica se dependências necessárias estão disponíveis
     * @returns {boolean}
     */
    function checkDependencies() {
        const checks = {
            documentExporter: typeof window.documentExporter !== 'undefined',
            lazyLoadingUtils: typeof window.lazyLoadingUtils !== 'undefined'
        };
        
        if (!checks.documentExporter) {
            console.warn('[Export] DocumentExporter não encontrado - handlers não serão inicializados');
        }
        
        if (!checks.lazyLoadingUtils) {
            console.info('[Export] LazyLoadingUtils não encontrado - pré-carregamento automático não está ativo');
        }
        
        return checks.documentExporter;
    }
    
    /**
     * Inicialização quando DOM estiver pronto
     */
    function init() {
        if (!checkDependencies()) {
            return;
        }
        
        initExportHandlers();
        
        console.log('[Export] ✅ Sistema de exportação com lazy loading inicializado');
    }
    
    // Auto-inicializar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expor API pública se necessário
    window.ExportHandlers = {
        init,
        addExportHandler,
        state
    };
    
})();
