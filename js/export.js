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
                
                // Mostrar loading
                const originalHTML = pdfBtn.innerHTML;
                const originalDisabled = pdfBtn.disabled;
                pdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando PDF...';
                pdfBtn.disabled = true;
                
                try {
                    console.log('Iniciando geração de PDF...');
                    
                    // Reset zoom before PDF export to ensure consistent formatting
                    const preview = document.getElementById('documentPreview');
                    let originalZoom = null;
                    if (preview && window.ui) {
                        originalZoom = window.ui.currentZoom;
                        window.ui.resetZoom('documentPreview');
                        // Small delay to allow DOM to update after zoom reset
                        const DOM_UPDATE_DELAY_MS = 50;
                        await new Promise(resolve => setTimeout(resolve, DOM_UPDATE_DELAY_MS));
                    }
                    
                    const content = this.getDocumentContent();
                    
                    if (!content || content.trim() === '') {
                        throw new Error('Nenhum conteúdo encontrado para exportar');
                    }
                    
                    await this.exportToPDF(content, 'ModeloTrabalhista');
                    
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
                if (html.trim().length > 0) {
                    console.log(`Conteúdo HTML encontrado no seletor: ${selector}`);
                    return html.trim();
                }
            }
        }
        
        return null;
    }

    // Obter conteúdo do documento
    getDocumentContent() {
        // Prioridade: elemento específico do modelo
        const contentSelectors = [
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
                if (text.trim().length > 0) {
                    console.log(`Conteúdo encontrado no seletor: ${selector}`);
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

    // Exportar para PDF
    async exportToPDF(content, filename = 'ModeloTrabalhista') {
        try {
            // Load jsPDF library on demand if not already loaded
            if (typeof window.jspdf === 'undefined' && !this.libsLoaded.jspdf) {
                console.log('Loading jsPDF on demand...');
                this.loadLibraries();
                // Wait for library to load
                await new Promise((resolve) => {
                    const checkInterval = setInterval(() => {
                        if (typeof window.jspdf !== 'undefined') {
                            this.libsLoaded.jspdf = true;
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
            
            // Se jsPDF não estiver carregado, usar fallback
            if (typeof window.jspdf === 'undefined') {
                console.log('Usando fallback para PDF');
                return this.exportToPDFFallback(content, filename);
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Configurações
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const maxWidth = pageWidth - (margin * 2);
            
            // Conteúdo
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            
            let y = margin;
            const lineHeight = this.FORMATTING.LINE_HEIGHT_MM;
            
            // Dividir conteúdo em linhas PRESERVANDO linhas vazias
            const rawLines = content.split('\n');
            
            for (let i = 0; i < rawLines.length; i++) {
                const line = rawLines[i];
                const trimmedLine = line.trim();
                
                // Se for linha vazia, adicionar espaço
                if (!trimmedLine) {
                    y += lineHeight * this.FORMATTING.EMPTY_LINE_SPACING_FACTOR;
                    continue;
                }
                
                // Detectar linhas de separação (========)
                if (this.PATTERNS.HEAVY_SEPARATOR.test(trimmedLine)) {
                    y += this.FORMATTING.SEPARATOR_PADDING_BEFORE;
                    doc.setLineWidth(this.FORMATTING.HEAVY_SEPARATOR_LINE_WIDTH);
                    doc.line(margin, y, pageWidth - margin, y);
                    y += this.FORMATTING.SEPARATOR_PADDING_AFTER_HEAVY;
                    continue;
                }
                
                // Detectar linhas de sublinhado (________)
                if (this.PATTERNS.LIGHT_SEPARATOR.test(trimmedLine)) {
                    y += this.FORMATTING.SEPARATOR_PADDING_BEFORE;
                    doc.setLineWidth(this.FORMATTING.LIGHT_SEPARATOR_LINE_WIDTH);
                    doc.line(margin, y, pageWidth - margin, y);
                    y += this.FORMATTING.SEPARATOR_PADDING_AFTER_LIGHT;
                    continue;
                }
                
                // Detectar possíveis títulos
                const isTitle = this.isTitleLine(line);
                
                if (isTitle) {
                    doc.setFontSize(this.FORMATTING.TITLE_FONT_SIZE);
                    doc.setFont('helvetica', 'bold');
                }
                
                // Quebrar linha longa em múltiplas linhas se necessário
                const wrappedLines = doc.splitTextToSize(line, maxWidth);
                
                for (let j = 0; j < wrappedLines.length; j++) {
                    // Verificar se precisa adicionar nova página
                    if (y + lineHeight > pageHeight - margin) {
                        doc.addPage();
                        y = margin;
                        // Adicionar indicador de continuação
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'italic');
                        doc.text('(continuação)', pageWidth / 2, y, { align: 'center' });
                        y += 10;
                        doc.setFontSize(11);
                        doc.setFont('helvetica', 'normal');
                    }
                    
                    doc.text(wrappedLines[j], margin, y);
                    y += lineHeight;
                }
                
                // Restaurar fonte normal
                if (isTitle) {
                    doc.setFontSize(this.FORMATTING.BODY_FONT_SIZE);
                    doc.setFont('helvetica', 'normal');
                }
            }
            
            // Rodapé em todas as páginas
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
            
            // Salvar
            const safeFilename = filename.replace(/[^a-z0-9]/gi, '_');
            doc.save(`${safeFilename}.pdf`);
            
            this.showNotification('PDF gerado com sucesso!', 'success');
            return { success: true, filename: `${safeFilename}.pdf` };
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            return this.exportToPDFFallback(content, filename);
        }
    }

    // Fallback para PDF
    exportToPDFFallback(content, filename) {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error('Popup bloqueado. Permita popups para esta página.');
            }
            
            // Get HTML content instead of plain text
            const htmlContent = this.getDocumentHTML() || content;
            
            const pageContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${filename}</title>
                    <meta charset="UTF-8">
                    <style>
                        /* CSS otimizado para PDF de 1 página A4 */
                        
                        /* Reset e box-sizing universal - garante dimensões previsíveis */
                        *, *::before, *::after {
                            box-sizing: border-box;
                            margin: 0;
                            padding: 0;
                        }
                        
                        body { 
                            font-family: Arial, sans-serif; 
                            /* line-height reduzido de 1.6 para 1.3 - economiza espaço vertical */
                            line-height: 1.3; 
                            /* margin reduzido de 1.5cm para 1.2cm - mais espaço utilizável */
                            margin: 1.2cm;
                            font-size: 10pt;
                            max-width: 21cm;
                        }
                        
                        @media print {
                            /* @page configurado com margin 2cm conforme requisito */
                            @page { 
                                margin: 2cm; 
                                size: A4;
                            }
                            body {
                                margin: 0;
                                /* padding 2cm alinhado com @page margin */
                                padding: 2cm;
                            }
                            .no-print { display: none; }
                            /* REMOVIDO: page-break regras que forçam quebra de página */
                        }
                        
                        .document { 
                            font-family: Arial, sans-serif;
                            font-size: 10pt;
                            /* line-height reduzido de 1.4 para 1.3 */
                            line-height: 1.3;
                            /* page-break-inside: avoid - evita quebra dentro do documento */
                            page-break-inside: avoid;
                        }
                        
                        .document h2 {
                            text-align: center;
                            font-weight: bold;
                            /* font-size reduzido de 14pt para 13pt */
                            font-size: 13pt;
                            /* margin reduzido de 15px para 8px */
                            margin: 8px 0;
                            line-height: 1.2;
                        }
                        
                        .document p {
                            text-align: justify;
                            /* margin reduzido de 10px para 6px */
                            margin: 6px 0;
                            /* line-height reduzido de 1.5 para 1.3 */
                            line-height: 1.3;
                        }
                        
                        .document strong {
                            font-weight: bold;
                        }
                        
                        .document ul {
                            /* margins reduzidos - economiza espaço */
                            margin: 4px 0 4px 18px;
                            line-height: 1.3;
                        }
                        
                        .document li {
                            /* margin reduzido de 5px para 2px */
                            margin: 2px 0;
                            line-height: 1.3;
                        }
                        
                        /* Company header styles */
                        .document > div:first-child {
                            text-align: center;
                            font-weight: bold;
                            /* margin-bottom reduzido de 20px para 8px */
                            margin-bottom: 8px;
                        }
                        
                        .document > div:first-child > div {
                            font-weight: bold;
                            line-height: 1.2;
                        }
                        
                        /* Signature and footer sections - page-break-inside: avoid */
                        .document > div:last-child {
                            /* margin-top reduzido de 20px para 8px */
                            margin-top: 8px;
                            page-break-inside: avoid;
                        }
                        
                        .document > div:last-child p {
                            text-align: left;
                            line-height: 1.3;
                        }
                        
                        /* Centered elements */
                        .document > p:nth-last-of-type(2),
                        .document > p:nth-last-of-type(1) {
                            text-align: center;
                        }
                        
                        .header {
                            text-align: center;
                            /* margin-bottom reduzido */
                            margin-bottom: 0.6cm;
                            border-bottom: 2px solid #ccc;
                            /* padding-bottom reduzido */
                            padding-bottom: 0.3cm;
                        }
                        
                        .footer {
                            /* margin-top reduzido */
                            margin-top: 0.6cm;
                            text-align: center;
                            font-size: 9pt;
                            color: #666;
                            border-top: 1px solid #ccc;
                            /* padding-top reduzido */
                            padding-top: 0.3cm;
                        }
                        
                        button {
                            padding: 10px 20px;
                            background: #007bff;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            margin: 10px;
                            font-size: 14px;
                        }
                        button:hover {
                            background: #0056b3;
                        }
                    </style>
                </head>
                <body>
                    <div class="document">${htmlContent}</div>
                    
                    <div class="no-print" style="text-align: center; margin-top: 2cm;">
                        <button onclick="window.print()">📄 Abrir Caixa de Impressão</button>
                        <button onclick="window.close()">❌ Fechar Janela</button>
                    </div>
                    
                    <script>
                        // Focar na janela
                        window.focus();
                    </script>
                </body>
                </html>
            `;
            
            printWindow.document.write(pageContent);
            printWindow.document.close();
            
            return { 
                success: true, 
                message: 'Janela aberta. Clique em "Abrir Caixa de Impressão" e selecione "Salvar como PDF".' 
            };
            
        } catch (error) {
            console.error('Erro no fallback do PDF:', error);
            this.showNotification('Erro ao gerar PDF. Tente usar Ctrl+P na página principal.', 'error');
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
            const safeFilename = filename.replace(/[^a-z0-9]/gi, '_');
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
            const safeFilename = filename.replace(/[^a-z0-9]/gi, '_');
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
