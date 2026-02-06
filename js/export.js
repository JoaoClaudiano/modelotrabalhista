// export.js - Sistema de exportação de documentos aprimorado
class DocumentExporter {
    constructor() {
        this.mutationObserver = null; // Armazenar referência para limpeza
        this.libsLoaded = {
            jspdf: false,
            docx: false
        };
        this.libsAttempted = {
            jspdf: false,
            docx: false
        };
        
        // Constantes de formatação
        this.FORMATTING = {
            // PDF
            EMPTY_LINE_SPACING_FACTOR: 0.5,
            LINE_HEIGHT_MM: 7,
            TITLE_FONT_SIZE: 12,
            BODY_FONT_SIZE: 11,
            SEPARATOR_PADDING_BEFORE: 2,
            SEPARATOR_PADDING_AFTER_HEAVY: 5,
            SEPARATOR_PADDING_AFTER_LIGHT: 4,
            HEAVY_SEPARATOR_LINE_WIDTH: 0.5,
            LIGHT_SEPARATOR_LINE_WIDTH: 0.3,
            
            // DOCX (sizes in half-points: 22 = 11pt, 24 = 12pt, 28 = 14pt)
            DOCX_TITLE_SIZE: 28, // 14pt
            DOCX_BODY_SIZE: 22,  // 11pt
            DOCX_EMPTY_SIZE: 24, // 12pt for empty line placeholders
            DOCX_TITLE_SPACING_BEFORE: 200,
            DOCX_TITLE_SPACING_AFTER: 200,
            DOCX_BODY_SPACING_AFTER: 120,
            DOCX_EMPTY_SPACING_AFTER: 100,
            DOCX_SEPARATOR_SPACING: 100
        };
        
        // Constantes de validação
        this.VALIDATION = {
            // Minimum content length to prevent empty exports (approximately 1-2 short sentences)
            MIN_CONTENT_LENGTH: 50,
            // Timeout for library loading (in milliseconds)
            LIBRARY_LOAD_TIMEOUT: 10000, // 10 seconds
            // Delay to allow browser layout engine to complete recalculation after CSS transform changes
            DOM_UPDATE_DELAY_MS: 50
        };
        
        // Constantes para PDF - Consolidadas e documentadas
        this.PDF_CONFIG = {
            // A4 dimensions in mm
            PAGE_WIDTH: 210,
            PAGE_HEIGHT: 297,
            
            // Margins in mm
            MARGIN: 20,
            
            // Font settings (pt)
            FONT_SIZE: 11,              // Corpo do texto
            TITLE_FONT_SIZE: 12,        // Títulos
            LINE_HEIGHT_FACTOR: 1.4,    // Fator de espaçamento entre linhas
            
            // Conversion factor: points to millimeters
            PT_TO_MM: 0.3527,           // 1pt = 1/72 inch = 0.3527mm
            
            // Vertical spacing (mm)
            PARAGRAPH_SPACING: 2.5,     // Espaço adicional entre parágrafos
            TITLE_SPACING_BEFORE: 4,    // Espaço antes de títulos
            TITLE_SPACING_AFTER: 3,     // Espaço depois de títulos
            EMPTY_LINE_FACTOR: 0.75,    // Fator para linhas vazias (relativo ao line-height)
            
            // Title detection
            TITLE_CHAR_LIMIT: 60,       // Máximo de caracteres para considerar como título
            
            // Calculated usable area (getters dinâmicos)
            get USABLE_WIDTH() { return this.PAGE_WIDTH - (2 * this.MARGIN); },
            get USABLE_HEIGHT() { return this.PAGE_HEIGHT - (2 * this.MARGIN); }
        };
        
        // Padrões regex para detecção
        this.PATTERNS = {
            HEAVY_SEPARATOR: /^[=]{3,}$/,
            LIGHT_SEPARATOR: /^[_]{3,}$/,
            UPPERCASE_CHARS: /^[A-ZÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ\s]+$/
        };
        
        this.init();
    }
    
    // Converter pontos para half-points (usado pela biblioteca docx)
    pointsToHalfPoints(points) {
        return points * 2;
    }
    
    // Detectar se uma linha é um título
    isTitleLine(line) {
        const trimmedLine = line.trim();
        return trimmedLine.length < this.PDF_CONFIG.TITLE_CHAR_LIMIT && 
               trimmedLine.length > 0 &&
               trimmedLine === trimmedLine.toUpperCase() && 
               this.PATTERNS.UPPERCASE_CHARS.test(trimmedLine);
    }

    // Sanitizar nome de arquivo
    sanitizeFilename(filename) {
        return filename.replace(/[^a-z0-9]/gi, '_');
    }

    init() {
        console.log('DocumentExporter inicializando...');
        // Don't load libraries immediately - load on demand
        // this.loadLibraries(); // REMOVED - libraries will be loaded when export is triggered
        this.setupEventListeners();
        this.setupMutationObserver();
    }

    // Carregar bibliotecas necessárias de forma mais robusta
    loadLibraries() {
        // Carregar jsPDF apenas se não estiver já carregado
        if (typeof window.jspdf === 'undefined' && !this.libsAttempted.jspdf) {
            this.libsAttempted.jspdf = true;
            this.loadJSPDF();
        } else if (typeof window.jspdf !== 'undefined') {
            this.libsLoaded.jspdf = true;
        }

        // Carregar docx.js apenas se não estiver já carregado
        if (typeof window.docx === 'undefined' && !this.libsAttempted.docx) {
            this.libsAttempted.docx = true;
            this.loadDocxJS();
        } else if (typeof window.docx !== 'undefined') {
            this.libsLoaded.docx = true;
        }
    }

    loadJSPDF() {
        // Verificar se já existe um script carregando
        if (document.querySelector('script[src*="jspdf"]')) {
            console.log('jsPDF já está sendo carregado');
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
        script.crossOrigin = 'anonymous';
        script.integrity = 'sha384-JcnsjUPPylna1s1fvi1u12X5qjY5OL56iySh75FdtrwhO/SWXgMjoVqcKyIIWOLk';
        
        script.onload = () => {
            console.log('✅ jsPDF carregado com sucesso');
            this.libsLoaded.jspdf = true;
            this.checkAllLibsLoaded();
        };
        
        script.onerror = () => {
            console.warn('⚠️  Falha ao carregar jsPDF, tentando CDN alternativo...');
            this.loadJSPDFFallback();
        };
        
        document.head.appendChild(script);
    }

    loadJSPDFFallback() {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js';
        script.crossOrigin = 'anonymous';
        script.integrity = 'sha384-JcnsjUPPylna1s1fvi1u12X5qjY5OL56iySh75FdtrwhO/SWXgMjoVqcKyIIWOLk';
        
        script.onload = () => {
            console.log('✅ jsPDF carregado via fallback');
            this.libsLoaded.jspdf = true;
            this.checkAllLibsLoaded();
        };
        
        script.onerror = () => {
            console.warn('⚠️  Falha ao carregar jsPDF de todos os CDNs, usando fallback nativo');
            this.libsLoaded.jspdf = true; // Marcar como carregado para usar fallback
            this.checkAllLibsLoaded();
        };
        
        document.head.appendChild(script);
    }

    loadDocxJS() {
        // Verificar se já existe um script carregando
        if (document.querySelector('script[src*="docx"]')) {
            console.log('docx já está sendo carregado');
            return;
        }

        const script = document.createElement('script');
        script.type = 'module';
        script.innerHTML = `
            import * as docx from 'https://cdn.jsdelivr.net/npm/docx@7.8.0/+esm';
            window.docx = docx;
            console.log('✅ docx.js carregado com sucesso (ESM)');
            
            // Disparar evento personalizado
            window.dispatchEvent(new CustomEvent('docxLoaded', { detail: docx }));
        `;
        
        script.onerror = () => {
            console.warn('⚠️  Falha ao carregar docx.js como módulo, tentando fallback...');
            this.loadDocxJSFallback();
        };
        
        document.head.appendChild(script);
        
        // Também adicionar listener para o evento personalizado
        window.addEventListener('docxLoaded', (e) => {
            this.libsLoaded.docx = true;
            this.checkAllLibsLoaded();
        });
    }

    loadDocxJSFallback() {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/docx@7.8.0/build/index.js';
        script.crossOrigin = 'anonymous';
        script.integrity = 'sha384-+Q9XUOzYmnebUFYhYAgja0XBVfXUm8gKA6IyQqNzzgwauWOwIR5hBtCyJvMA2Q0x';
        
        script.onload = () => {
            console.log('✅ docx.js carregado via fallback');
            this.libsLoaded.docx = true;
            this.checkAllLibsLoaded();
        };
        
        script.onerror = () => {
            console.warn('⚠️  Falha ao carregar docx.js de todos os CDNs, usando fallback nativo');
            this.libsLoaded.docx = true; // Marcar como carregado para usar fallback
            this.checkAllLibsLoaded();
        };
        
        document.head.appendChild(script);
    }

    checkAllLibsLoaded() {
        console.log('Status das bibliotecas:', {
            jspdf: this.libsLoaded.jspdf,
            docx: this.libsLoaded.docx
        });
    }

    setupEventListeners() {
        // Adicionar listeners quando o DOM estiver pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachExportButtons());
        } else {
            this.attachExportButtons();
        }
        
        // Também tentar anexar após um pequeno delay
        setTimeout(() => this.attachExportButtons(), 1000);
    }

    setupMutationObserver() {
        // Observar mudanças no DOM para quando botões forem adicionados dinamicamente
        // Desconectar observer anterior se existir
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        
        this.mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    this.attachExportButtons();
                }
            });
        });

        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['id', 'class', 'disabled']
        });
    }
    
    // Método para desconectar o observer e evitar memory leak
    cleanup() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
    }

    // Método para anexar automaticamente os botões de exportação
    attachExportButtons() {
        // Botão de PDF (id: pdfBtn)
        const pdfBtn = document.getElementById('pdfBtn');
        
        if (pdfBtn && !pdfBtn.hasAttribute('data-export-listener')) {
            console.log('Anexando listener ao botão PDF');
            pdfBtn.setAttribute('data-export-listener', 'true');
            
            pdfBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (pdfBtn.disabled) {
                    console.log('Botão PDF desabilitado, ignorando clique');
                    return;
                }
                
                const originalHTML = pdfBtn.innerHTML;
                const originalDisabled = pdfBtn.disabled;
                pdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando PDF...';
                pdfBtn.disabled = true;
                
                try {
                    console.log('Iniciando geração automática de PDF...');
                    
                    // Reset zoom before PDF export to ensure consistent formatting
                    const preview = document.getElementById('documentPreview');
                    let originalZoom = null;
                    if (preview && window.ui) {
                        originalZoom = window.ui.currentZoom;
                        window.ui.resetZoom('documentPreview');
                        // Small delay to allow DOM to update after zoom reset
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    
                    // Usar o novo orquestrador de PDF (via exportToPDFAuto para compatibilidade)
                    await this.exportToPDFAuto('ModeloTrabalhista');
                    
                    // Restore original zoom if it was changed
                    if (preview && window.ui && originalZoom !== null && originalZoom !== 100) {
                        window.ui.currentZoom = originalZoom;
                        window.ui.applyZoom(preview);
                    }
                } catch (error) {
                    console.error('Erro ao exportar PDF:', error);
                    this.showNotification(`Erro ao gerar PDF: ${error.message}`, 'error');
                } finally {
                    // Restaurar botão
                    pdfBtn.innerHTML = originalHTML;
                    pdfBtn.disabled = originalDisabled;
                }
            });
            
            // Adicionar tooltip
            pdfBtn.title = 'Salvar documento como PDF';
        }

        // Botão de DOCX (id: printBtn - renomeado para Gerar DOCX)
        const printBtn = document.getElementById('printBtn');
        
        if (printBtn && !printBtn.hasAttribute('data-export-listener')) {
            console.log('Anexando listener ao botão DOCX');
            printBtn.setAttribute('data-export-listener', 'true');
            
            // Atualizar texto e ícone do botão
            if (!printBtn.innerHTML.includes('fa-file-word')) {
                printBtn.innerHTML = '<i class="fas fa-file-word"></i> Gerar DOCX';
            }
            
            printBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (printBtn.disabled) {
                    console.log('Botão DOCX desabilitado, ignorando clique');
                    return;
                }
                
                // Mostrar loading
                const originalHTML = printBtn.innerHTML;
                const originalDisabled = printBtn.disabled;
                printBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando DOCX...';
                printBtn.disabled = true;
                
                try {
                    console.log('Iniciando geração de DOCX...');
                    const content = this.getDocumentContent();
                    
                    if (!content || content.trim() === '') {
                        throw new Error('Nenhum conteúdo encontrado para exportar');
                    }
                    
                    await this.exportToDOCX(content, 'ModeloTrabalhista');
                } catch (error) {
                    console.error('Erro ao exportar DOCX:', error);
                    this.showNotification(`Erro ao gerar DOCX: ${error.message}`, 'error');
                } finally {
                    // Restaurar botão
                    printBtn.innerHTML = originalHTML;
                    printBtn.disabled = originalDisabled;
                }
            });
            
            // Atualizar tooltip
            printBtn.title = 'Gerar documento Word (DOCX)';
        }

        // Botão de copiar (id: copyBtn)
        const copyBtn = document.getElementById('copyBtn');
        
        if (copyBtn && !copyBtn.hasAttribute('data-export-listener')) {
            console.log('Anexando listener ao botão Copiar');
            copyBtn.setAttribute('data-export-listener', 'true');
            
            copyBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (copyBtn.disabled) {
                    console.log('Botão Copiar desabilitado, ignorando clique');
                    return;
                }
                
                try {
                    const content = this.getDocumentContent();
                    
                    if (!content || content.trim() === '') {
                        throw new Error('Nenhum conteúdo encontrado para copiar');
                    }
                    
                    const result = await this.copyToClipboard(content);
                    
                    // Feedback visual
                    if (result.success) {
                        const originalHTML = copyBtn.innerHTML;
                        const originalDisabled = copyBtn.disabled;
                        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                        copyBtn.disabled = true;
                        
                        setTimeout(() => {
                            copyBtn.innerHTML = originalHTML;
                            copyBtn.disabled = originalDisabled;
                        }, 2000);
                    }
                } catch (error) {
                    console.error('Erro ao copiar:', error);
                    this.showNotification(`Erro ao copiar: ${error.message}`, 'error');
                }
            });
            
            // Adicionar tooltip
            copyBtn.title = 'Copiar texto para área de transferência';
        }
    }

    // Obter conteúdo HTML do documento
    getDocumentHTML() {
        // Prioridade: elemento específico do modelo
        const contentSelectors = [
            // Priority: actual selectors used in the app
            '#documentPreview .document-content',
            '#documentPreview',
            // Legacy selectors for backward compatibility
            '#modelo-text',
            '#textoModelo',
            '#documento-texto',
            '#conteudoModelo',
            '.modelo-texto',
            '.documento-conteudo',
            '#previewModelo',
            '.preview-content'
        ];
        
        for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                const html = element.innerHTML || '';
                if (html.trim().length > this.VALIDATION.MIN_CONTENT_LENGTH) { // Validate minimum content
                    console.log(`getDocumentHTML: Conteúdo HTML encontrado no seletor: ${selector}`);
                    return html.trim();
                }
            }
        }
        
        console.warn('getDocumentHTML: Nenhum conteúdo HTML encontrado');
        return null;
    }
    
    /**
     * Get document text content for PDF generation
     * This method NEVER uses the preview DOM to ensure PDF is 100% vectorial
     * and completely independent from the preview layout
     * @returns {string|null} Pure text content from the data model
     */
    getDocumentTextForPDF() {
        // Try to get content from the app's stored data model first
        if (window.app && typeof window.app.getDocumentContentForPDF === 'function') {
            const content = window.app.getDocumentContentForPDF();
            if (content && content.length > this.VALIDATION.MIN_CONTENT_LENGTH) {
                console.log('✅ getDocumentTextForPDF: Using content from data model (NOT from preview DOM)');
                return content;
            }
        }
        
        console.warn('⚠️ getDocumentTextForPDF: No content available from data model. Generate a document first.');
        return null;
    }

    // Obter conteúdo do documento
    getDocumentContent() {
        // Prioridade: elemento específico do modelo
        const contentSelectors = [
            // Priority: actual selectors used in the app
            '#documentPreview .document-content',
            '#documentPreview',
            // Legacy selectors for backward compatibility
            '#modelo-text',
            '#textoModelo',
            '#documento-texto',
            '#conteudoModelo',
            '.modelo-texto',
            '.documento-conteudo',
            '#previewModelo',
            '.preview-content'
        ];
        
        for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                const text = element.textContent || element.innerText || '';
                if (text.trim().length > this.VALIDATION.MIN_CONTENT_LENGTH) { // Validate minimum content
                    console.log(`getDocumentContent: Conteúdo encontrado no seletor: ${selector}`);
                    return text.trim();
                }
            }
        }
        
        // Fallback: procurar em elementos de preview
        const previewElements = document.querySelectorAll('[id*="preview"], [class*="preview"], [id*="modelo"], [class*="modelo"]');
        for (const element of previewElements) {
            const text = element.textContent || element.innerText || '';
            if (text.trim().length > 100) { // Conteúdo significativo
                console.log('Conteúdo encontrado em elemento de preview');
                return text.trim();
            }
        }
        
        // Último recurso: procurar por elementos com muito texto
        const allElements = document.querySelectorAll('div, p, span, section, article');
        let maxLength = 0;
        let bestContent = '';
        
        for (const element of allElements) {
            // Pular elementos de interface
            if (element.closest('header, nav, footer, aside, .btn, button, .actions, .controls')) {
                continue;
            }
            
            const text = element.textContent || element.innerText || '';
            const trimmed = text.trim();
            
            if (trimmed.length > maxLength && trimmed.length > 100) {
                maxLength = trimmed.length;
                bestContent = trimmed;
            }
        }
        
        if (bestContent) {
            console.log('Conteúdo encontrado em elemento com mais texto');
            return bestContent;
        }
        
        console.warn('Nenhum conteúdo significativo encontrado para exportação');
        return 'Nenhum conteúdo disponível para exportação. Gere um modelo primeiro.';
    }

    // Obter elemento do documento (retorna HTMLElement, não string)
    getDocumentElement() {
        const selectors = [
            // Priority: actual selectors used in the app
            '#documentPreview .document-content',
            '#documentPreview',
            // Legacy selectors for backward compatibility
            '#modelo-text',
            '#textoModelo',
            '#documento-texto',
            '#conteudoModelo',
            '.modelo-texto',
            '.documento-conteudo',
            '#previewModelo',
            '.preview-content'
        ];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.innerHTML.trim().length > this.VALIDATION.MIN_CONTENT_LENGTH) { // Validate minimum content
                console.log(`getDocumentElement: Found element with selector: ${selector}`);
                return element;
            }
        }
        
        console.warn('getDocumentElement: No suitable element found');
        return null;
    }

    // ==========================================
    // MÉTODOS DE EXPORTAÇÃO PDF (Novo Sistema)
    // ==========================================
    // Orquestrador único que decide automaticamente entre:
    // - exportPDFVector: jsPDF puro com texto vetorial
    // - exportPDFViaPrint: impressão nativa como fallback
    // ==========================================
    
    /**
     * Orquestrador principal de exportação PDF
     * Sempre usa jsPDF com texto vetorial para garantir texto selecionável
     */
    async exportPDF(filename = 'ModeloTrabalhista') {
        try {
            // 1. Obter conteúdo do documento a partir do modelo de dados (NÃO do DOM de preview)
            const content = this.getDocumentTextForPDF();
            if (!content || content.length < this.VALIDATION.MIN_CONTENT_LENGTH) {
                throw new Error('Conteúdo insuficiente para gerar PDF. Gere um documento primeiro.');
            }
            
            // 2. Sempre usar exportPDFVector para garantir texto 100% vetorial e selecionável
            console.log('✅ Gerando PDF vetorial com texto do modelo de dados');
            return await this.exportPDFVector(content, filename);
            
        } catch (error) {
            console.error('Erro no orquestrador de PDF:', error);
            this.showNotification(`Erro ao gerar PDF: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Estimar altura do conteúdo em milímetros
     * Baseado em contagem de linhas e espaçamento de texto
     * Atualizado para usar constantes consolidadas
     */
    estimateContentHeight(content) {
        const lines = content.split('\n');
        const config = this.PDF_CONFIG;
        
        // Altura por linha de texto usando constantes
        const lineHeightMm = (config.FONT_SIZE * config.PT_TO_MM) * config.LINE_HEIGHT_FACTOR;
        
        let totalHeight = 0;
        let previousWasEmpty = false;
        let previousWasTitle = false;
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Linha vazia
            if (!trimmed) {
                totalHeight += lineHeightMm * config.EMPTY_LINE_FACTOR;
                previousWasEmpty = true;
                previousWasTitle = false;
                continue;
            }
            
            // Título (uppercase)
            if (this.isTitleLine(line)) {
                const titleLineHeight = (config.TITLE_FONT_SIZE * config.PT_TO_MM) * config.LINE_HEIGHT_FACTOR;
                // Adicionar espaçamento antes (se não for início ou após linha vazia)
                if (totalHeight > 0 && !previousWasEmpty) {
                    totalHeight += config.TITLE_SPACING_BEFORE;
                }
                totalHeight += titleLineHeight + config.TITLE_SPACING_AFTER;
                previousWasEmpty = false;
                previousWasTitle = true;
                continue;
            }
            
            // Texto normal - calcular quebras de linha baseado na largura útil
            // Adicionar espaçamento entre parágrafos
            if (!previousWasTitle && !previousWasEmpty && totalHeight > 0) {
                totalHeight += config.PARAGRAPH_SPACING;
            }
            
            // Aproximação: ~2.5 caracteres por mm em fonte 11pt
            const charsPerLine = Math.floor(config.USABLE_WIDTH * 2.5);
            const wrappedLines = Math.ceil(trimmed.length / charsPerLine);
            totalHeight += lineHeightMm * wrappedLines;
            
            previousWasEmpty = false;
            previousWasTitle = false;
        }
        
        return totalHeight;
    }
    
    /**
     * Exportar PDF com texto vetorial usando jsPDF puro
     * Suporta múltiplas páginas automaticamente
     * 
     * IMPORTANTE: Este método usa APENAS texto puro do modelo de dados.
     * NÃO extrai conteúdo do DOM de preview, garantindo PDF 100% vetorial.
     * 
     * @param {string} content - Texto puro do documento (do modelo de dados, não do DOM)
     * @param {string} filename - Nome do arquivo PDF
     */
    async exportPDFVector(content, filename = 'ModeloTrabalhista') {
        try {
            // 1. Carregar jsPDF se necessário
            if (typeof window.jspdf === 'undefined') {
                console.log('Carregando jsPDF...');
                this.loadLibraries();
                await new Promise((resolve, reject) => {
                    const checkInterval = setInterval(() => {
                        if (typeof window.jspdf !== 'undefined') {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        reject(new Error('Timeout ao carregar jsPDF'));
                    }, this.VALIDATION.LIBRARY_LOAD_TIMEOUT);
                });
            }
            
            if (typeof window.jspdf === 'undefined') {
                throw new Error('jsPDF não pôde ser carregado');
            }
            
            // 2. Criar documento PDF A4
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const config = this.PDF_CONFIG;
            
            // 3. Processar conteúdo linha por linha com suporte a múltiplas páginas
            const lines = content.split('\n');
            let yPosition = config.MARGIN;
            let pageCount = 1;
            let previousLineWasEmpty = false;
            let previousLineWasTitle = false;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                
                // Linha vazia - usar fator de espaçamento configurável
                if (!trimmed) {
                    const emptyLineSpacing = (config.FONT_SIZE * config.PT_TO_MM) * config.LINE_HEIGHT_FACTOR * config.EMPTY_LINE_FACTOR;
                    yPosition += emptyLineSpacing;
                    previousLineWasEmpty = true;
                    previousLineWasTitle = false;
                    continue;
                }
                
                // Título (uppercase)
                if (this.isTitleLine(line)) {
                    pdf.setFontSize(config.TITLE_FONT_SIZE);
                    pdf.setFont('helvetica', 'bold');
                    
                    // Calcular line-height do título usando constantes
                    const titleLineHeight = (config.TITLE_FONT_SIZE * config.PT_TO_MM) * config.LINE_HEIGHT_FACTOR;
                    const totalTitleHeight = titleLineHeight + config.TITLE_SPACING_AFTER;
                    
                    // Adicionar espaço antes do título (exceto no início da página ou após linha vazia)
                    if (yPosition > config.MARGIN && !previousLineWasEmpty) {
                        yPosition += config.TITLE_SPACING_BEFORE;
                    }
                    
                    // Verificar se precisa de nova página
                    if (yPosition + totalTitleHeight > config.PAGE_HEIGHT - config.MARGIN) {
                        pdf.addPage();
                        yPosition = config.MARGIN;
                        pageCount++;
                    }
                    
                    // Centralizar título DENTRO DA LARGURA ÚTIL (correção crítica)
                    const textWidth = pdf.getTextWidth(trimmed);
                    const xPosition = config.MARGIN + (config.USABLE_WIDTH - textWidth) / 2;
                    
                    pdf.text(trimmed, xPosition, yPosition);
                    yPosition += totalTitleHeight;
                    previousLineWasEmpty = false;
                    previousLineWasTitle = true;
                    continue;
                }
                
                // Texto normal com quebra automática
                pdf.setFontSize(config.FONT_SIZE);
                pdf.setFont('helvetica', 'normal');
                
                // Adicionar espaço entre parágrafos (texto após texto, não após título ou linha vazia)
                if (!previousLineWasTitle && !previousLineWasEmpty && yPosition > config.MARGIN) {
                    yPosition += config.PARAGRAPH_SPACING;
                }
                
                const textLines = pdf.splitTextToSize(trimmed, config.USABLE_WIDTH);
                const lineHeight = (config.FONT_SIZE * config.PT_TO_MM) * config.LINE_HEIGHT_FACTOR;
                
                for (const textLine of textLines) {
                    // Verificar se precisa de nova página
                    if (yPosition + lineHeight > config.PAGE_HEIGHT - config.MARGIN) {
                        pdf.addPage();
                        yPosition = config.MARGIN;
                        pageCount++;
                    }
                    
                    pdf.text(textLine, config.MARGIN, yPosition);
                    yPosition += lineHeight;
                }
                
                previousLineWasEmpty = false;
                previousLineWasTitle = false;
            }
            
            // 4. Salvar PDF
            const safeFilename = filename.replace(/[^a-z0-9]/gi, '_');
            pdf.save(`${safeFilename}.pdf`);
            
            const message = pageCount > 1 
                ? `PDF vetorial gerado com ${pageCount} páginas!` 
                : 'PDF vetorial gerado com sucesso!';
            
            this.showNotification(message, 'success');
            console.log(`✅ PDF gerado com ${pageCount} página(s) usando texto do modelo de dados`);
            
            return { 
                success: true, 
                filename: `${safeFilename}.pdf`,
                method: 'vector',
                pages: pageCount,
                message: `PDF com texto vetorial (${pageCount} páginas) baixado automaticamente`
            };
            
        } catch (error) {
            console.error('Erro ao gerar PDF vetorial:', error);
            throw error;
        }
    }
    
    /**
     * MANTENDO exportToPDFAuto por compatibilidade - redireciona para exportPDF
     * @deprecated Use exportPDF() instead
     */
    async exportToPDFAuto(filename = 'ModeloTrabalhista') {
        console.warn('exportToPDFAuto está obsoleto. Use exportPDF() diretamente.');
        return await this.exportPDF(filename);
    }

    /**
     * Exportar via impressão nativa (fallback para conteúdo longo)
     * Usa window.print() com estilos @media print
     */
    async exportToPDFViaPrint(filename = 'ModeloTrabalhista') {
        try {
            // 1. Obter o HTML formatado do documento
            const htmlContent = this.getDocumentHTML();
            if (!htmlContent) {
                throw new Error('Não foi possível obter o conteúdo HTML do documento.');
            }

            // 2. Criar uma janela de impressão dedicada
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error('Popup bloqueado. Permita popups para esta página.');
            }

            // 3. Escrever o HTML na nova janela, com estilos otimizados para impressão
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${filename}</title>
                    <style>
                        /* Estilos base para impressão (PDF) */
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.4;
                            margin: 0;
                            padding: 20mm;
                            font-size: 11pt;
                            color: #000;
                        }
                        .document {
                            width: 100%;
                            box-sizing: border-box;
                        }
                        h2 {
                            text-align: center;
                            font-weight: bold;
                            font-size: 12pt;
                            margin: 12px 0;
                        }
                        strong {
                            font-weight: bold;
                        }
                        ul {
                            margin: 4px 0 4px 18mm;
                        }
                        li {
                            margin: 2px 0;
                        }
                        /* Ocultar elementos de interface na impressão */
                        .no-print {
                            display: none;
                        }
                        /* Quebras de página evitadas dentro do conteúdo principal */
                        .document > * {
                            page-break-inside: avoid;
                        }
                        @media print {
                            @page {
                                margin: 20mm;
                                size: A4 portrait;
                            }
                            body {
                                padding: 0;
                                font-size: 11pt;
                                line-height: 1.4;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="document">${htmlContent}</div>
                    <div class="no-print" style="text-align: center; margin-top: 20px;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            📄 Abrir Caixa de Impressão
                        </button>
                        <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                            ❌ Fechar Janela
                        </button>
                        <p style="font-size: 12px; color: #666; margin-top: 10px;">
                            Na caixa de impressão, escolha "Salvar como PDF" como destino.
                        </p>
                    </div>
                    <script>
                        window.focus();
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
            
            // 4. Aguardar carregamento e abrir janela de impressão automaticamente
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                }, 250);
            };

            this.showNotification('Janela de impressão aberta. Escolha "Salvar como PDF".', 'info');
            return { 
                success: true, 
                filename: `${filename}.pdf`,
                method: 'print',
                message: 'Usando impressão nativa (conteúdo longo)'
            };

        } catch (error) {
            console.error('Erro ao abrir janela de impressão:', error);
            this.showNotification(`Erro ao gerar PDF: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    // Exportar para DOCX
    async exportToDOCX(content, filename = 'ModeloTrabalhista') {
        try {
            // Load docx library on demand if not already loaded
            if (typeof window.docx === 'undefined' && !this.libsLoaded.docx) {
                console.log('Loading docx.js on demand...');
                this.loadLibraries();
                // Wait for library to load
                await new Promise((resolve) => {
                    const checkInterval = setInterval(() => {
                        if (typeof window.docx !== 'undefined') {
                            this.libsLoaded.docx = true;
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                    // Timeout after 10 seconds
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        resolve();
                    }, 10000);
                });
            }
            
            // Se docx não estiver carregado, usar fallback
            if (typeof window.docx === 'undefined') {
                console.log('Usando fallback para DOCX');
                return this.exportToDOCXFallback(content, filename);
            }

            const docxLib = window.docx;
            const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } = docxLib;
            
            // Criar parágrafos PRESERVANDO linhas vazias e estrutura
            const lines = content.split('\n');
            const paragraphs = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmedLine = line.trim();
                
                // Linha vazia - adicionar parágrafo vazio para preservar espaçamento
                if (!trimmedLine) {
                    paragraphs.push(new Paragraph({
                        children: [new TextRun({ text: '', size: this.FORMATTING.DOCX_EMPTY_SIZE })],
                        spacing: { after: this.FORMATTING.DOCX_EMPTY_SPACING_AFTER }
                    }));
                    continue;
                }
                
                // Detectar linhas de separação (========)
                if (this.PATTERNS.HEAVY_SEPARATOR.test(trimmedLine)) {
                    paragraphs.push(new Paragraph({
                        children: [new TextRun({ text: '', size: this.FORMATTING.DOCX_EMPTY_SIZE })],
                        border: {
                            bottom: {
                                color: '000000',
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 20
                            }
                        },
                        spacing: { 
                            before: this.FORMATTING.DOCX_SEPARATOR_SPACING, 
                            after: this.FORMATTING.DOCX_SEPARATOR_SPACING 
                        }
                    }));
                    continue;
                }
                
                // Detectar linhas de sublinhado (________)
                if (this.PATTERNS.LIGHT_SEPARATOR.test(trimmedLine)) {
                    paragraphs.push(new Paragraph({
                        children: [new TextRun({ text: '', size: this.FORMATTING.DOCX_EMPTY_SIZE })],
                        border: {
                            bottom: {
                                color: '000000',
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 10
                            }
                        },
                        spacing: { 
                            before: this.FORMATTING.DOCX_SEPARATOR_SPACING - 20, 
                            after: this.FORMATTING.DOCX_SEPARATOR_SPACING - 20 
                        }
                    }));
                    continue;
                }
                
                // Detectar possíveis títulos
                const isTitle = this.isTitleLine(line);
                
                if (isTitle) {
                    paragraphs.push(new Paragraph({
                        children: [new TextRun({ 
                            text: trimmedLine, 
                            font: 'Arial', 
                            size: this.FORMATTING.DOCX_TITLE_SIZE,
                            bold: true 
                        })],
                        alignment: AlignmentType.CENTER,
                        spacing: { 
                            before: this.FORMATTING.DOCX_TITLE_SPACING_BEFORE, 
                            after: this.FORMATTING.DOCX_TITLE_SPACING_AFTER 
                        }
                    }));
                } else {
                    // Linha normal
                    paragraphs.push(new Paragraph({
                        children: [new TextRun({ 
                            text: line, 
                            font: 'Courier New', 
                            size: this.FORMATTING.DOCX_BODY_SIZE
                        })],
                        spacing: { after: this.FORMATTING.DOCX_BODY_SPACING_AFTER }
                    }));
                }
            }

            // Criar documento
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        // Conteúdo
                        ...paragraphs
                    ]
                }]
            });

            // Gerar e salvar
            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeFilename = this.sanitizeFilename(filename);
            a.download = `${safeFilename}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Documento DOCX gerado com sucesso!', 'success');
            return { success: true, filename: `${safeFilename}.docx` };
            
        } catch (error) {
            console.error('Erro ao gerar DOCX:', error);
            return this.exportToDOCXFallback(content, filename);
        }
    }

    // Fallback para DOCX
    exportToDOCXFallback(content, filename) {
        try {
            const htmlContent = `
                <!DOCTYPE html>
                <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                      xmlns:w='urn:schemas-microsoft-com:office:word' 
                      xmlns='http://www.w3.org/TR/REC-html40'>
                <head>
                    <meta charset="UTF-8">
                    <title>${filename}</title>
                    <!--[if gte mso 9]>
                    <xml>
                        <w:WordDocument>
                            <w:View>Print</w:View>
                            <w:Zoom>100</w:Zoom>
                            <w:DoNotOptimizeForBrowser/>
                        </w:WordDocument>
                    </xml>
                    <![endif]-->
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            line-height: 1.8;
                            margin: 2cm;
                            font-size: 11pt;
                        }
                        .document {
                            white-space: pre-wrap;
                            word-wrap: break-word;
                            font-family: 'Courier New', monospace;
                            font-size: 11pt;
                            line-height: 1.8;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 2cm;
                            border-bottom: 2px solid #007bff;
                            padding-bottom: 1cm;
                        }
                        .footer {
                            margin-top: 2cm;
                            text-align: center;
                            font-size: 10pt;
                            color: #666;
                            border-top: 1px solid #ddd;
                            padding-top: 1cm;
                        }
                    </style>
                </head>
                <body>
                    <div class="document">${content}</div>
                </body>
                </html>
            `;
            
            const blob = new Blob([htmlContent], { 
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
            });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            const safeFilename = this.sanitizeFilename(filename);
            a.download = `${safeFilename}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Documento DOCX (fallback) gerado! Salve com extensão .docx', 'success');
            return { success: true, filename: `${safeFilename}.docx` };
            
        } catch (error) {
            console.error('Erro no fallback do DOCX:', error);
            this.showNotification('Erro ao gerar DOCX. Use a opção de PDF.', 'error');
            return { success: false, error: error.message };
        }
    }

    // Método para copiar para área de transferência
    async copyToClipboard(content) {
        try {
            if (!content || content.trim() === '') {
                throw new Error('Nenhum conteúdo para copiar');
            }
            
            await navigator.clipboard.writeText(content);
            this.showNotification('Texto copiado para área de transferência!', 'success');
            return { success: true, message: 'Conteúdo copiado para área de transferência!' };
        } catch (error) {
            console.error('Erro ao copiar:', error);
            
            // Fallback
            try {
                const textArea = document.createElement('textarea');
                textArea.value = content;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (success) {
                    this.showNotification('Texto copiado para área de transferência!', 'success');
                    return { success: true, message: 'Conteúdo copiado para área de transferência!' };
                }
                throw new Error('Falha no fallback de cópia');
            } catch (fallbackError) {
                this.showNotification('Não foi possível copiar. Selecione o texto manualmente (Ctrl+A, Ctrl+C).', 'error');
                return { 
                    success: false, 
                    error: 'Não foi possível copiar. Tente selecionar manualmente (Ctrl+A, Ctrl+C).' 
                };
            }
        }
    }

    // Mostrar notificação
    showNotification(message, type = 'info') {
        // Remover notificações anteriores
        document.querySelectorAll('.export-notification').forEach(el => el.remove());
        
        const icon = type === 'success' ? '✅' : '❌';
        const color = type === 'success' ? '#10b981' : '#ef4444';
        
        const notification = document.createElement('div');
        notification.className = 'export-notification';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 16px;">${icon}</span>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${color};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            animation: exportNotificationFadeIn 0.3s ease-in;
        `;
        
        document.body.appendChild(notification);
        
        // Adicionar animação CSS
        if (!document.querySelector('#export-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'export-notification-styles';
            style.textContent = `
                @keyframes exportNotificationFadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes exportNotificationFadeOut {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remover após 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'exportNotificationFadeOut 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }

    // Habilitar/desabilitar botões
    enableExportButtons(enable = true) {
        ['pdfBtn', 'printBtn', 'copyBtn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = !enable;
            }
        });
    }
}

// Inicialização
if (!window.documentExporter) {
    window.documentExporter = new DocumentExporter();
    console.log('✅ DocumentExporter inicializado com sucesso!');
}

// Exportar para uso global
window.DocumentExporter = DocumentExporter;
