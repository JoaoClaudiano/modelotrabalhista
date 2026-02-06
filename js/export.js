// export.js - Sistema de exportação de documentos aprimorado
class DocumentExporter {
    constructor() {
        this.mutationObserver = null; // Armazenar referência para limpeza
        this.libsLoaded = {
            jspdf: false,
            docx: false,
            html2canvas: false
        };
        this.libsAttempted = {
            jspdf: false,
            docx: false,
            html2canvas: false
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
            HTML2CANVAS_LOAD_TIMEOUT: 10000, // 10 seconds
            // Delay to allow browser layout engine to complete recalculation after CSS transform changes
            DOM_UPDATE_DELAY_MS: 50
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
        return trimmedLine.length < 60 && 
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

    loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            // Verificar se já está carregado
            if (typeof html2canvas !== 'undefined') {
                resolve();
                return;
            }

            // Carregar html2canvas
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
            script.crossOrigin = 'anonymous';
            
            script.onload = () => {
                console.log('✅ html2canvas carregado com sucesso');
                resolve();
            };
            
            script.onerror = () => {
                console.error('❌ Falha ao carregar html2canvas');
                reject(new Error('Não foi possível carregar o conversor de HTML para PDF'));
            };
            
            document.head.appendChild(script);
        });
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
                    
                    // USAR O NOVO MÉTODO DE DOWNLOAD AUTOMÁTICO
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
    // MÉTODOS DE EXPORTAÇÃO PDF (2 métodos)
    // ==========================================
    // 1. PRIMEIRA TENTATIVA: Download automático (exportToPDFAuto)
    // 2. SE FALHAR: Impressão nativa (exportToPDFViaPrint)
    // ==========================================
    
    // 1. Exportar para PDF com download automático (método principal)
    // Usa html2canvas + jsPDF para gerar PDF e fazer download automático
    async exportToPDFAuto(filename = 'ModeloTrabalhista') {
        // A4 dimensions at 96 DPI: 210mm = 794px, 297mm = 1123px
        const A4_WIDTH_PX = 794;
        const A4_HEIGHT_PX = 1123;
        const PDF_MARGIN_MM = 15; // Margin in mm for PDF
        
        try {
            // 1. Obter o elemento HTML formatado
            const element = this.getDocumentElement();
            if (!element) {
                throw new Error('Não foi possível obter o conteúdo do documento para exportar');
            }

            // 2. Carregar bibliotecas necessárias
            // Carregar jsPDF se necessário
            if (typeof window.jspdf === 'undefined') {
                console.log('Carregando jsPDF...');
                this.loadLibraries();
                // Wait for jsPDF to load
                await new Promise((resolve, reject) => {
                    const checkInterval = setInterval(() => {
                        if (typeof window.jspdf !== 'undefined') {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                    // Timeout after configured time with error
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        reject(new Error('Timeout ao carregar jsPDF'));
                    }, this.VALIDATION.LIBRARY_LOAD_TIMEOUT);
                });
            }
            
            // Verificar se jsPDF foi carregado
            if (typeof window.jspdf === 'undefined') {
                throw new Error('jsPDF não pôde ser carregado');
            }

            // Carregar html2canvas com timeout
            await Promise.race([
                this.loadHtml2Canvas(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao carregar html2canvas')), this.VALIDATION.HTML2CANVAS_LOAD_TIMEOUT)
                )
            ]);
            
            // Verificar se html2canvas foi carregado
            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvas não pôde ser carregado');
            }

            // 3. Preparar elemento para captura com dimensões e estilos A4
            // Save original styles
            const originalStyles = {
                transform: element.style.transform,
                transformOrigin: element.style.transformOrigin,
                width: element.style.width,
                maxWidth: element.style.maxWidth,
                fontSize: element.style.fontSize,
                lineHeight: element.style.lineHeight,
                padding: element.style.padding,
                boxSizing: element.style.boxSizing
            };
            const container = element.parentElement;
            const originalContainerHeight = container ? container.style.height : null;
            
            let canvas;
            try {
                // Apply A4-friendly styles for reflow (not scale)
                element.style.transform = '';
                element.style.transformOrigin = '';
                element.style.width = `${A4_WIDTH_PX}px`;
                element.style.maxWidth = `${A4_WIDTH_PX}px`;
                element.style.fontSize = '11pt'; // Readable font size
                element.style.lineHeight = '1.4'; // Comfortable line spacing
                element.style.padding = '40px'; // Internal padding for margins
                element.style.boxSizing = 'border-box';
                
                if (container) {
                    container.style.height = '';
                }
                
                // Small delay to allow DOM reflow with new styles
                await new Promise(resolve => setTimeout(resolve, this.VALIDATION.DOM_UPDATE_DELAY_MS));
                
                // Capture with fixed A4 width, scale: 1 (no excessive scaling)
                canvas = await html2canvas(element, {
                    scale: 1, // No scaling - use natural size
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    width: A4_WIDTH_PX,
                    height: element.scrollHeight // Let height be natural
                });
                
                // Validate canvas was created successfully
                if (!canvas || canvas.width === 0 || canvas.height === 0) {
                    throw new Error('Canvas vazio - conteúdo não foi renderizado corretamente');
                }
            } catch (canvasError) {
                console.error('Erro ao capturar elemento com html2canvas:', canvasError);
                throw new Error(`Falha ao capturar conteúdo: ${canvasError.message}`);
            } finally {
                // Always restore original styles
                Object.keys(originalStyles).forEach(key => {
                    element.style[key] = originalStyles[key];
                });
                // Restore container height even if it was an empty string
                if (container) {
                    container.style.height = originalContainerHeight !== null ? originalContainerHeight : '';
                }
            }

            // 4. Configurar PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // 5. Calcular dimensões para página A4 (FIXAS - sem compressão)
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            
            // Área utilizável (descontando margens)
            const usableWidth = pageWidth - (2 * PDF_MARGIN_MM);
            const usableHeight = pageHeight - (2 * PDF_MARGIN_MM);
            
            // Convert canvas pixels to mm (assuming 96 DPI: 96 pixels = 1 inch = 25.4mm)
            const pxToMm = 25.4 / 96;
            const imgWidthMm = canvas.width * pxToMm;
            const imgHeightMm = canvas.height * pxToMm;
            
            // REGRAS OBRIGATÓRIAS:
            // 1. Dimensões FIXAS A4 - sem proporção dinâmica
            // 2. NUNCA reduzir para "fazer caber"
            // 3. Se exceder altura A4, FALHAR explicitamente
            
            // Usar dimensões fixas A4 (sem redução proporcional)
            const finalWidth = usableWidth;
            const finalHeight = usableHeight;
            
            // Validar se conteúdo excede altura permitida
            if (imgHeightMm > usableHeight) {
                const exceededByMm = (imgHeightMm - usableHeight).toFixed(1);
                const exceededByPercent = ((imgHeightMm / usableHeight - 1) * 100).toFixed(1);
                console.warn(`⚠️ AVISO: Conteúdo excede altura A4 em ${exceededByMm}mm (${exceededByPercent}%)`);
                console.warn(`   Altura do conteúdo: ${imgHeightMm.toFixed(1)}mm`);
                console.warn(`   Altura disponível: ${usableHeight.toFixed(1)}mm`);
                console.warn(`   Redução de conteúdo ou ajuste de layout necessário.`);
                
                // Erro controlado - informar usuário mas continuar
                this.showNotification(
                    `Atenção: Conteúdo ultrapassa ${exceededByPercent}% da altura A4. Parte do texto pode ser cortada.`,
                    'warning'
                );
            }
            
            // Posicionar no topo esquerdo com margens
            const x = PDF_MARGIN_MM;
            const y = PDF_MARGIN_MM;

            // 6. Adicionar imagem ao PDF com dimensões FIXAS
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

            // 7. Baixar automaticamente
            const safeFilename = filename.replace(/[^a-z0-9]/gi, '_');
            doc.save(`${safeFilename}.pdf`);

            // 8. Feedback ao usuário
            this.showNotification('PDF gerado e baixado automaticamente!', 'success');
            return { 
                success: true, 
                filename: `${safeFilename}.pdf`,
                message: 'PDF baixado automaticamente'
            };

        } catch (error) {
            console.error('Erro na geração automática de PDF:', error);
            
            // Fallback para método de impressão se a geração automática falhar
            this.showNotification('Tentando método alternativo...', 'info');
            return await this.exportToPDFViaPrint(filename);
        }
    }

    // 2. Fallback: exportar via impressão nativa do navegador
    // Abre janela de impressão para o usuário salvar como PDF manualmente
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
                            line-height: 1.3;
                            margin: 0;
                            padding: 15mm;
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
                            font-size: 14pt;
                            margin: 12px 0;
                        }
                        strong {
                            font-weight: bold;
                        }
                        ul {
                            margin: 4px 0 4px 18px;
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
                                margin: 15mm;
                            }
                            body {
                                padding: 0;
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

            // 4. Dar feedback ao usuário
            this.showNotification('Janela de impressão aberta. Escolha "Salvar como PDF" na caixa de diálogo.', 'success');
            return { success: true, message: 'Janela de impressão aberta.' };

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
