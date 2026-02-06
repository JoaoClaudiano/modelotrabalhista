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
            
            // Header spacing (mm)
            HEADER_NAME_TO_ADDRESS: 1.5,  // Espaço reduzido entre nome e endereço da empresa
            HEADER_AFTER: 6,              // Espaço após cabeçalho completo
            
            // Decorative lines for document title
            TITLE_LINE_WIDTH: 0.4,        // Espessura das linhas (pt) - discreta
            TITLE_LINE_SPACING_BEFORE: 3, // Espaço antes da linha superior
            TITLE_LINE_TO_TEXT: 4,        // Espaço entre linha e texto do título (increased from 2 to 4 to prevent overlap)
            TITLE_TEXT_TO_LINE: 2,        // Espaço entre texto do título e linha inferior
            TITLE_LINE_SPACING_AFTER: 5,  // Espaço após linha inferior (increased from 3 to 5 for better spacing before first paragraph)
            
            // Title detection
            TITLE_CHAR_LIMIT: 60,       // Máximo de caracteres para considerar como título
            
            // Text justification
            JUSTIFY_MIN_LENGTH: 60,     // Mínimo de caracteres para justificar parágrafo
            
            // List formatting
            LIST_INDENT: 5,              // Indentação para itens de lista (mm)
            LIST_BULLET_CHAR: '•',       // Caractere de bullet point
            
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
    
    /**
     * Parse HTML document content into semantic structure
     * @param {string} htmlContent - HTML string from document generator
     * @returns {Array} Array of semantic content blocks
     */
    parseDocumentToSemanticStructure(htmlContent) {
        const structure = [];
        
        // Create a temporary DOM element to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Helper function to extract text from element, preserving <strong> tags
        const extractTextWithFormatting = (element) => {
            const parts = [];
            const processNode = (node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    // Don't trim - preserve spaces for accurate position mapping
                    const text = node.textContent;
                    if (text) {
                        // Normalize whitespace: collapse multiple spaces/newlines into single space
                        const normalizedText = text.replace(/\s+/g, ' ');
                        // Add non-empty text or single space if there are already parts (to preserve spacing)
                        const isNonEmpty = normalizedText.length > 0 && normalizedText !== ' ';
                        const isSeparatingSpace = normalizedText === ' ' && parts.length > 0;
                        if (isNonEmpty || isSeparatingSpace) {
                            parts.push({ text: normalizedText, bold: false });
                        }
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'STRONG' || node.tagName === 'B') {
                        // For bold elements, get the text content and normalize whitespace
                        const text = node.textContent;
                        if (text) {
                            const normalizedText = text.replace(/\s+/g, ' ').trim();
                            if (normalizedText) {
                                parts.push({ text: normalizedText, bold: true });
                            }
                        }
                    } else {
                        // Recursively process child nodes
                        node.childNodes.forEach(processNode);
                    }
                }
            };
            
            element.childNodes.forEach(processNode);
            return parts;
        };
        
        // Process the main container and its children
        const mainContainer = tempDiv.querySelector('div') || tempDiv;
        const children = Array.from(mainContainer.children);
        
        for (let i = 0; i < children.length; i++) {
            const element = children[i];
            
            // Check for HTML comment before element to identify type
            let commentText = '';
            let prevSibling = element.previousSibling;
            while (prevSibling) {
                if (prevSibling.nodeType === Node.COMMENT_NODE) {
                    commentText = prevSibling.textContent.trim().toLowerCase();
                    break;
                }
                prevSibling = prevSibling.previousSibling;
            }
            
            // Company header (look for centered div with two child divs)
            if (commentText.includes('cabeçalho') || (i === 0 && element.style.textAlign === 'center')) {
                const divs = element.querySelectorAll('div');
                if (divs.length >= 2) {
                    structure.push({
                        type: 'companyName',
                        text: divs[0].textContent.trim()
                    });
                    structure.push({
                        type: 'companyAddress',
                        text: divs[1].textContent.trim()
                    });
                    continue;
                }
            }
            
            // Document title (centered div with h2 and border divs)
            if (commentText.includes('título')) {
                const h2 = element.querySelector('h2');
                if (h2) {
                    structure.push({
                        type: 'documentTitle',
                        text: h2.textContent.trim()
                    });
                    continue;
                }
            }
            
            // H2 tag directly
            if (element.tagName === 'H2') {
                structure.push({
                    type: 'documentTitle',
                    text: element.textContent.trim()
                });
                continue;
            }
            
            // Check for separator (div with border-top)
            if (element.style.borderTop && element.style.borderTop !== 'none' && element.style.borderTop !== '') {
                structure.push({
                    type: 'separator'
                });
                continue;
            }
            
            // Lists (ul elements)
            const ul = element.querySelector('ul');
            if (ul) {
                // Check if there's a preceding paragraph (label for the list)
                const allPs = element.querySelectorAll('p');
                for (const p of allPs) {
                    // Only add paragraph if it comes before the list
                    if (p.parentNode === element && ul.parentNode === element) {
                        const pPos = Array.from(element.children).indexOf(p);
                        const ulPos = Array.from(element.children).indexOf(ul);
                        if (pPos < ulPos) {
                            const parts = extractTextWithFormatting(p);
                            if (parts.length > 0) {
                                // Build fullText from parts to ensure consistency
                                const fullText = parts.map(part => part.text).join('').trim();
                                structure.push({
                                    type: 'paragraph',
                                    parts: parts,
                                    text: fullText
                                });
                            }
                        }
                    }
                }
                
                // Add the list items
                const items = Array.from(ul.querySelectorAll('li')).map(li => li.textContent.trim());
                if (items.length > 0) {
                    structure.push({
                        type: 'list',
                        items: items
                    });
                }
                continue;
            }
            
            // Paragraphs with potential field values
            const paragraphs = element.querySelectorAll('p');
            if (paragraphs.length > 0) {
                paragraphs.forEach(p => {
                    const parts = extractTextWithFormatting(p);
                    if (parts.length > 0) {
                        // Build fullText from parts to ensure consistency
                        const fullText = parts.map(part => part.text).join('').trim();
                        
                        // Check if this is a field (has label: value pattern)
                        const colonMatch = fullText.match(/^([^:]+):\s*(.+)$/);
                        
                        if (colonMatch) {
                            // Check if bold formatting appears in the value part (after the colon)
                            const colonIndex = fullText.indexOf(':');
                            let hasBoldAfterColon = false;
                            
                            // Build position map
                            let textPosition = 0;
                            for (const part of parts) {
                                const partStart = textPosition;
                                const partEnd = partStart + part.text.length;
                                
                                // Check if this bold part overlaps with text after colon
                                if (part.bold && partEnd > colonIndex + 1) {
                                    hasBoldAfterColon = true;
                                    break;
                                }
                                textPosition = partEnd;
                            }
                            
                            if (hasBoldAfterColon) {
                                // This is a field with label and value
                                structure.push({
                                    type: 'field',
                                    label: colonMatch[1].trim(),
                                    value: colonMatch[2].trim(),
                                    parts: parts
                                });
                            } else {
                                // Regular paragraph
                                structure.push({
                                    type: 'paragraph',
                                    parts: parts,
                                    text: fullText
                                });
                            }
                        } else {
                            // Regular paragraph
                            structure.push({
                                type: 'paragraph',
                                parts: parts,
                                text: fullText
                            });
                        }
                    }
                });
            }
        }
        
        return structure;
    }
    
    /**
     * Render a paragraph with mixed formatting (normal and bold)
     * @param {object} pdf - jsPDF instance
     * @param {object} block - Paragraph block with parts array
     * @param {number} yPosition - Current Y position
     * @param {number} currentPageCount - Current page count
     * @param {object} config - PDF configuration
     * @returns {object} Updated yPosition and pageCount
     */
    renderParagraphWithFormatting(pdf, block, yPosition, currentPageCount, config) {
        const lineHeight = (config.FONT_SIZE * config.PT_TO_MM) * config.LINE_HEIGHT_FACTOR;
        let pageCount = currentPageCount;
        
        // Helper function to skip whitespace
        const skipWhitespace = (text, pos) => {
            while (pos < text.length && /\s/.test(text[pos])) {
                pos++;
            }
            return pos;
        };
        
        // Build the full text for line breaking
        const fullText = block.text;
        
        // Check if paragraph should be justified (long paragraphs only)
        const shouldJustify = fullText.length >= config.JUSTIFY_MIN_LENGTH &&
                            !fullText.match(/^[-•*]/) && // Not a list item
                            !fullText.match(/^[0-9]+[.)]/); // Not a numbered list
        
        // Split text into lines that fit the usable width
        pdf.setFont('helvetica', 'normal'); // Set base font for measurement
        const lines = pdf.splitTextToSize(fullText, config.USABLE_WIDTH);
        
        // Build position map for bold text
        let textPosition = 0;
        const boldRanges = [];
        for (const part of block.parts) {
            const start = textPosition;
            const end = start + part.text.length;
            if (part.bold) {
                boldRanges.push({ start, end });
            }
            textPosition = end;
        }
        
        // Helper to check if a character position is in a bold range
        const isBold = (pos) => {
            for (const range of boldRanges) {
                if (pos >= range.start && pos < range.end) {
                    return true;
                }
            }
            return false;
        };
        
        // Track position in full text
        let fullTextPos = 0;
        
        // Render each line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isLastLine = i === lines.length - 1;
            
            // Check for page break
            if (yPosition + lineHeight > config.PAGE_HEIGHT - config.MARGIN) {
                pdf.addPage();
                yPosition = config.MARGIN;
                pageCount++;
            }
            
            // Render line with proper formatting
            let xPos = config.MARGIN;
            
            // Skip whitespace at start of line
            fullTextPos = skipWhitespace(fullText, fullTextPos);
            
            // For justified text (not last line)
            if (shouldJustify && !isLastLine && line.trim().length > 0) {
                const words = line.trim().split(/\s+/);
                if (words.length > 1) {
                    // Calculate space width for justification
                    const wordWidths = [];
                    let lineStart = fullTextPos;
                    
                    for (const word of words) {
                        const wordBold = isBold(fullTextPos);
                        pdf.setFont('helvetica', wordBold ? 'bold' : 'normal');
                        wordWidths.push(pdf.getTextWidth(word));
                        fullTextPos += word.length;
                        fullTextPos = skipWhitespace(fullText, fullTextPos);
                    }
                    
                    const totalWordsWidth = wordWidths.reduce((sum, w) => sum + w, 0);
                    const availableSpace = config.USABLE_WIDTH - totalWordsWidth;
                    const spaceWidth = availableSpace / (words.length - 1);
                    
                    // Reset position for rendering
                    fullTextPos = lineStart;
                    
                    for (let j = 0; j < words.length; j++) {
                        const word = words[j];
                        const wordBold = isBold(fullTextPos);
                        pdf.setFont('helvetica', wordBold ? 'bold' : 'normal');
                        pdf.text(word, xPos, yPosition);
                        xPos += wordWidths[j] + spaceWidth;
                        fullTextPos += word.length;
                        fullTextPos = skipWhitespace(fullText, fullTextPos);
                    }
                } else {
                    // Single word
                    const wordBold = isBold(fullTextPos);
                    pdf.setFont('helvetica', wordBold ? 'bold' : 'normal');
                    pdf.text(line, config.MARGIN, yPosition);
                    fullTextPos += line.length;
                }
            } else {
                // Left-aligned rendering (last line or short paragraph)
                const words = line.trim().split(/\s+/);
                for (const word of words) {
                    const wordBold = isBold(fullTextPos);
                    pdf.setFont('helvetica', wordBold ? 'bold' : 'normal');
                    pdf.text(word, xPos, yPosition);
                    xPos += pdf.getTextWidth(word) + pdf.getTextWidth(' ');
                    fullTextPos += word.length;
                    fullTextPos = skipWhitespace(fullText, fullTextPos);
                }
            }
            
            yPosition += lineHeight;
            fullTextPos = skipWhitespace(fullText, fullTextPos);
        }
        
        return { yPosition, pageCount };
    }
    
    /**
     * Render a field with label (normal) and value (bold)
     * @param {object} pdf - jsPDF instance
     * @param {object} block - Field block with label and value
     * @param {number} yPosition - Current Y position
     * @param {number} currentPageCount - Current page count
     * @param {object} config - PDF configuration
     * @returns {object} Updated yPosition and pageCount
     */
    renderFieldWithFormatting(pdf, block, yPosition, currentPageCount, config) {
        const lineHeight = (config.FONT_SIZE * config.PT_TO_MM) * config.LINE_HEIGHT_FACTOR;
        let pageCount = currentPageCount;
        
        // Build the full text for line breaking
        const fullText = `${block.label}: ${block.value}`;
        
        // Split text into lines
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(fullText, config.USABLE_WIDTH);
        
        // Render each line
        for (const line of lines) {
            // Check for page break
            if (yPosition + lineHeight > config.PAGE_HEIGHT - config.MARGIN) {
                pdf.addPage();
                yPosition = config.MARGIN;
                pageCount++;
            }
            
            // Render line with label in normal and value in bold
            let xPos = config.MARGIN;
            
            // Check if this line contains the colon (label part)
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                const label = line.substring(0, colonIndex + 1);
                const value = line.substring(colonIndex + 1).trim();
                
                // Render label (normal)
                pdf.setFont('helvetica', 'normal');
                pdf.text(label, xPos, yPosition);
                xPos += pdf.getTextWidth(label + ' ');
                
                // Render value (bold)
                pdf.setFont('helvetica', 'bold');
                pdf.text(value, xPos, yPosition);
            } else {
                // Continuation line - render as bold (part of value)
                pdf.setFont('helvetica', 'bold');
                pdf.text(line, xPos, yPosition);
            }
            
            yPosition += lineHeight;
        }
        
        return { yPosition, pageCount };
    }
    
    // Desenhar linha horizontal decorativa
    drawDecorativeLine(pdf, yPosition, config) {
        pdf.setLineWidth(config.TITLE_LINE_WIDTH);
        pdf.line(
            config.MARGIN, 
            yPosition, 
            config.MARGIN + config.USABLE_WIDTH, 
            yPosition
        );
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
                    
                    // Usar o novo orquestrador de PDF diretamente
                    await this.exportPDF('ModeloTrabalhista');
                    
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
            
            // 3. Parse content into semantic structure
            const structure = this.parseDocumentToSemanticStructure(content);
            
            // 4. Render content based on semantic structure
            let yPosition = config.MARGIN;
            let pageCount = 1;
            let previousBlockType = null;
            
            for (let i = 0; i < structure.length; i++) {
                const block = structure[i];
                const lineHeight = (config.FONT_SIZE * config.PT_TO_MM) * config.LINE_HEIGHT_FACTOR;
                
                // Handle different block types
                switch (block.type) {
                    case 'companyName':
                        pdf.setFontSize(config.FONT_SIZE);
                        pdf.setFont('helvetica', 'bold');
                        
                        // Check for page break
                        if (yPosition + lineHeight > config.PAGE_HEIGHT - config.MARGIN) {
                            pdf.addPage();
                            yPosition = config.MARGIN;
                            pageCount++;
                        }
                        
                        // Center on usable width
                        const nameWidth = pdf.getTextWidth(block.text);
                        const nameX = config.MARGIN + (config.USABLE_WIDTH - nameWidth) / 2;
                        pdf.text(block.text, nameX, yPosition);
                        yPosition += lineHeight;
                        break;
                        
                    case 'companyAddress':
                        pdf.setFontSize(config.FONT_SIZE);
                        pdf.setFont('helvetica', 'normal');
                        
                        // Reduced spacing between name and address
                        yPosition += config.HEADER_NAME_TO_ADDRESS;
                        
                        // Check for page break
                        if (yPosition + lineHeight > config.PAGE_HEIGHT - config.MARGIN) {
                            pdf.addPage();
                            yPosition = config.MARGIN;
                            pageCount++;
                        }
                        
                        // Center on usable width
                        const addressWidth = pdf.getTextWidth(block.text);
                        const addressX = config.MARGIN + (config.USABLE_WIDTH - addressWidth) / 2;
                        pdf.text(block.text, addressX, yPosition);
                        yPosition += lineHeight + config.HEADER_AFTER;
                        break;
                        
                    case 'documentTitle':
                        pdf.setFontSize(config.TITLE_FONT_SIZE);
                        pdf.setFont('helvetica', 'bold');
                        
                        // Calculate total height needed
                        const titleLineHeight = (config.TITLE_FONT_SIZE * config.PT_TO_MM) * config.LINE_HEIGHT_FACTOR;
                        const totalHeight = config.TITLE_LINE_SPACING_BEFORE +
                                          config.TITLE_LINE_TO_TEXT +
                                          titleLineHeight +
                                          config.TITLE_TEXT_TO_LINE +
                                          config.TITLE_LINE_SPACING_AFTER;
                        
                        // Check for page break
                        if (yPosition + totalHeight > config.PAGE_HEIGHT - config.MARGIN) {
                            pdf.addPage();
                            yPosition = config.MARGIN;
                            pageCount++;
                        }
                        
                        // Space before top line
                        yPosition += config.TITLE_LINE_SPACING_BEFORE;
                        
                        // Draw top decorative line
                        this.drawDecorativeLine(pdf, yPosition, config);
                        
                        // Space between line and title
                        yPosition += config.TITLE_LINE_TO_TEXT;
                        
                        // Center title on usable width
                        const titleWidth = pdf.getTextWidth(block.text);
                        const titleX = config.MARGIN + (config.USABLE_WIDTH - titleWidth) / 2;
                        pdf.text(block.text, titleX, yPosition);
                        yPosition += titleLineHeight;
                        
                        // Space between title and bottom line
                        yPosition += config.TITLE_TEXT_TO_LINE;
                        
                        // Draw bottom decorative line
                        this.drawDecorativeLine(pdf, yPosition, config);
                        
                        // Space after bottom line
                        yPosition += config.TITLE_LINE_SPACING_AFTER;
                        break;
                        
                    case 'paragraph':
                        // Add spacing between paragraphs (but not after title or at start)
                        if (previousBlockType === 'paragraph' && yPosition > config.MARGIN) {
                            yPosition += config.PARAGRAPH_SPACING;
                        }
                        
                        pdf.setFontSize(config.FONT_SIZE);
                        
                        // Render paragraph with mixed formatting (bold and normal)
                        const paragraphResult = this.renderParagraphWithFormatting(pdf, block, yPosition, pageCount, config);
                        yPosition = paragraphResult.yPosition;
                        pageCount = paragraphResult.pageCount;
                        break;
                        
                    case 'field':
                        // Add spacing if after paragraph
                        if (previousBlockType === 'paragraph' && yPosition > config.MARGIN) {
                            yPosition += config.PARAGRAPH_SPACING;
                        }
                        
                        pdf.setFontSize(config.FONT_SIZE);
                        
                        // Render field with label (normal) and value (bold)
                        const fieldResult = this.renderFieldWithFormatting(pdf, block, yPosition, pageCount, config);
                        yPosition = fieldResult.yPosition;
                        pageCount = fieldResult.pageCount;
                        break;
                        
                    case 'list':
                        // Add spacing before list
                        if (previousBlockType && previousBlockType !== 'list' && yPosition > config.MARGIN) {
                            yPosition += config.PARAGRAPH_SPACING;
                        }
                        
                        pdf.setFontSize(config.FONT_SIZE);
                        pdf.setFont('helvetica', 'normal');
                        
                        // Calculate positions for list items
                        const bulletX = config.MARGIN + config.LIST_INDENT;
                        const textX = bulletX + pdf.getTextWidth(config.LIST_BULLET_CHAR + ' ');
                        const listTextWidth = config.USABLE_WIDTH - config.LIST_INDENT - pdf.getTextWidth(config.LIST_BULLET_CHAR + ' ');
                        
                        // Render list items with bullet points and indentation
                        for (const item of block.items) {
                            // Check for page break before item
                            if (yPosition + lineHeight > config.PAGE_HEIGHT - config.MARGIN) {
                                pdf.addPage();
                                yPosition = config.MARGIN;
                                pageCount++;
                            }
                            
                            // Draw bullet point
                            pdf.text(config.LIST_BULLET_CHAR, bulletX, yPosition);
                            
                            // Split item text to fit available width (accounting for indentation and bullet)
                            const itemLines = pdf.splitTextToSize(item, listTextWidth);
                            
                            // Render first line at current position
                            if (itemLines.length > 0) {
                                pdf.text(itemLines[0], textX, yPosition);
                                yPosition += lineHeight;
                            }
                            
                            // Render continuation lines (indented, no bullet)
                            for (let i = 1; i < itemLines.length; i++) {
                                // Check for page break
                                if (yPosition + lineHeight > config.PAGE_HEIGHT - config.MARGIN) {
                                    pdf.addPage();
                                    yPosition = config.MARGIN;
                                    pageCount++;
                                }
                                
                                pdf.text(itemLines[i], textX, yPosition);
                                yPosition += lineHeight;
                            }
                        }
                        break;
                        
                    case 'separator':
                        // Add spacing before separator
                        yPosition += config.PARAGRAPH_SPACING;
                        
                        // Draw separator line
                        pdf.setLineWidth(config.TITLE_LINE_WIDTH);
                        pdf.line(config.MARGIN, yPosition, config.MARGIN + config.USABLE_WIDTH, yPosition);
                        
                        // Add spacing after separator
                        yPosition += config.PARAGRAPH_SPACING;
                        break;
                }
                
                previousBlockType = block.type;
            }
            
            // 5. Salvar PDF
            const safeFilename = filename.replace(/[^a-z0-9]/gi, '_');
            pdf.save(`${safeFilename}.pdf`);
            
            const message = pageCount > 1 
                ? `PDF vetorial gerado com ${pageCount} páginas!` 
                : 'PDF vetorial gerado com sucesso!';
            
            this.showNotification(message, 'success');
            console.log(`✅ PDF gerado com ${pageCount} página(s) usando estrutura semântica`);
            
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
