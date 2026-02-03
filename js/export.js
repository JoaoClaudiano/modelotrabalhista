// export.js - Sistema de exportação de documentos aprimorado
class DocumentExporter {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadLibraries();
    }

    // Carregar bibliotecas necessárias
    loadLibraries() {
        // jsPDF para PDF
        if (typeof window.jspdf === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                console.log('jsPDF carregado');
            };
            script.onerror = () => {
                console.warn('Falha ao carregar jsPDF, usando fallback');
            };
            document.head.appendChild(script);
        }

        // docx.js para documentos Word
        if (typeof window.docx === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/docx/7.8.0/docx.min.js';
            script.onload = () => {
                console.log('docx carregado');
            };
            script.onerror = () => {
                console.warn('Falha ao carregar docx.js, usando fallback');
            };
            document.head.appendChild(script);
        }
    }

    setupEventListeners() {
        // Adicionar listeners com delay para garantir que os botões existam
        setTimeout(() => {
            this.attachExportButtons();
        }, 1000);
    }

    // Método para anexar automaticamente os botões de exportação usando IDs corretos
    attachExportButtons() {
        // Botão de PDF (id: pdfBtn)
        const pdfBtn = document.getElementById('pdfBtn');
        
        if (pdfBtn && !pdfBtn.hasAttribute('data-export-listener')) {
            pdfBtn.setAttribute('data-export-listener', 'true');
            
            // Remover event listeners antigos para evitar duplicação
            const newPdfBtn = pdfBtn.cloneNode(true);
            pdfBtn.parentNode.replaceChild(newPdfBtn, pdfBtn);
            
            newPdfBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (newPdfBtn.disabled) return;
                
                // Mostrar loading
                const originalText = newPdfBtn.innerHTML;
                newPdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando PDF...';
                newPdfBtn.disabled = true;
                
                try {
                    const content = this.getDocumentContent();
                    await this.exportToPDF(content, 'ModeloTrabalhista');
                } catch (error) {
                    console.error('Erro ao exportar PDF:', error);
                    this.showNotification('Erro ao gerar PDF. Tente novamente.', 'error');
                } finally {
                    // Restaurar botão
                    newPdfBtn.innerHTML = originalText;
                    newPdfBtn.disabled = false;
                }
            });
            
            // Adicionar tooltip
            newPdfBtn.title = 'Salvar documento como PDF';
        }

        // Botão de DOCX (id: printBtn - renomeado para Gerar DOCX)
        const docxBtn = document.getElementById('printBtn');
        
        if (docxBtn && !docxBtn.hasAttribute('data-export-listener')) {
            docxBtn.setAttribute('data-export-listener', 'true');
            
            // Remover event listeners antigos para evitar duplicação
            const newDocxBtn = docxBtn.cloneNode(true);
            docxBtn.parentNode.replaceChild(newDocxBtn, docxBtn);
            
            // Atualizar texto e ícone do botão
            newDocxBtn.innerHTML = '<i class="fas fa-file-word"></i> Gerar DOCX';
            
            newDocxBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (newDocxBtn.disabled) return;
                
                // Mostrar loading
                const originalText = newDocxBtn.innerHTML;
                newDocxBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando DOCX...';
                newDocxBtn.disabled = true;
                
                try {
                    const content = this.getDocumentContent();
                    await this.exportToDOCX(content, 'ModeloTrabalhista');
                } catch (error) {
                    console.error('Erro ao exportar DOCX:', error);
                    this.showNotification('Erro ao gerar DOCX. Tente novamente.', 'error');
                } finally {
                    // Restaurar botão
                    newDocxBtn.innerHTML = originalText;
                    newDocxBtn.disabled = false;
                }
            });
            
            // Atualizar tooltip
            newDocxBtn.title = 'Gerar documento Word (DOCX)';
        }

        // Botão de copiar (id: copyBtn)
        const copyBtn = document.getElementById('copyBtn');
        
        if (copyBtn && !copyBtn.hasAttribute('data-export-listener')) {
            copyBtn.setAttribute('data-export-listener', 'true');
            
            // Remover event listeners antigos para evitar duplicação
            const newCopyBtn = copyBtn.cloneNode(true);
            copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
            
            newCopyBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (newCopyBtn.disabled) return;
                
                try {
                    const content = this.getDocumentContent();
                    const result = await this.copyToClipboard(content);
                    
                    // Feedback visual
                    if (result.success) {
                        const originalText = newCopyBtn.innerHTML;
                        newCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                        newCopyBtn.disabled = true;
                        
                        setTimeout(() => {
                            newCopyBtn.innerHTML = originalText;
                            newCopyBtn.disabled = false;
                        }, 2000);
                    }
                } catch (error) {
                    console.error('Erro ao copiar:', error);
                    this.showNotification('Erro ao copiar texto.', 'error');
                }
            });
            
            // Adicionar tooltip
            newCopyBtn.title = 'Copiar texto para área de transferência';
        }
    }

    // Obter conteúdo do documento
    getDocumentContent() {
        // Prioridade: elemento específico do modelo
        const modelSelectors = [
            '#modelo-text',
            '#document-content',
            '#modeloContent',
            '.modelo-content',
            '#texto-gerado',
            '.texto-gerado',
            '#conteudo-modelo',
            '#preview-content'
        ];
        
        for (const selector of modelSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                const text = element.textContent || element.innerText;
                if (text && text.trim().length > 0) {
                    return text.trim();
                }
            }
        }
        
        // Fallback: pegar conteúdo da área principal
        const mainContent = document.querySelector('main') || 
                           document.querySelector('#main') || 
                           document.querySelector('.main-content') ||
                           document.querySelector('#content') ||
                           document.body;
        
        // Tentar pegar apenas o texto relevante (excluir cabeçalhos, menus, etc.)
        const excludedClasses = [
            'header', 'nav', 'navbar', 'footer', 'sidebar',
            'menu', 'actions', 'buttons', 'controls',
            'preview-actions', 'export-buttons', 'toolbar'
        ];
        
        const excludedTags = ['HEADER', 'NAV', 'FOOTER', 'ASIDE', 'SCRIPT', 'STYLE', 'BUTTON'];
        
        let text = '';
        const walker = document.createTreeWalker(
            mainContent,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    
                    // Rejeitar se parent está em tags excluídas
                    if (excludedTags.includes(parent.tagName)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    // Rejeitar se parent tem classes excluídas
                    const parentClasses = parent.className || '';
                    const hasExcludedClass = excludedClasses.some(cls => 
                        parentClasses.includes(cls) || 
                        parent.classList.contains(cls)
                    );
                    
                    if (hasExcludedClass) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    // Rejeitar texto vazio ou muito curto
                    const nodeText = node.textContent.trim();
                    if (nodeText.length < 2) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let node;
        while (node = walker.nextNode()) {
            text += node.textContent + '\n';
        }
        
        return text.trim() || 'Conteúdo do documento não encontrado.';
    }

    // Exportar para PDF com jsPDF
    async exportToPDF(content, filename = 'ModeloTrabalhista') {
        try {
            // Verificar se jsPDF está carregado
            if (typeof window.jspdf === 'undefined') {
                await new Promise((resolve, reject) => {
                    let attempts = 0;
                    const checkInterval = setInterval(() => {
                        attempts++;
                        if (typeof window.jspdf !== 'undefined') {
                            clearInterval(checkInterval);
                            resolve();
                        } else if (attempts > 50) { // 5 segundos
                            clearInterval(checkInterval);
                            reject(new Error('jsPDF não carregado'));
                        }
                    }, 100);
                });
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Configurações da página
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const maxWidth = pageWidth - (margin * 2);
            
            // Cabeçalho
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('MODELO TRABALHISTA', pageWidth / 2, margin, { align: 'center' });
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, margin + 10, { align: 'center' });
            
            // Linha divisória
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, margin + 15, pageWidth - margin, margin + 15);
            
            // Conteúdo
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            
            let y = margin + 25;
            const lineHeight = 6;
            
            // Dividir o conteúdo em linhas
            const lines = doc.splitTextToSize(content, maxWidth);
            
            for (let i = 0; i < lines.length; i++) {
                // Verificar se precisa de nova página
                if (y + lineHeight > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                    
                    // Adicionar cabeçalho de continuação
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'italic');
                    doc.text(`Continuação...`, pageWidth / 2, y, { align: 'center' });
                    y += 10;
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'normal');
                }
                
                doc.text(lines[i], margin, y);
                y += lineHeight;
            }
            
            // Rodapé
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                doc.text('joaoclaudiano.github.io/modelotrabalhista', pageWidth / 2, pageHeight - 5, { align: 'center' });
            }
            
            // Salvar o PDF
            const safeFilename = filename.replace(/[^a-z0-9]/gi, '_');
            doc.save(`${safeFilename}.pdf`);
            
            // Notificar sucesso
            this.showNotification('PDF gerado com sucesso!', 'success');
            
            return { success: true, filename: `${safeFilename}.pdf` };
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            
            // Fallback: método antigo
            return this.exportToPDFFallback(content, filename);
        }
    }

    // Fallback para PDF (abre janela de impressão)
    exportToPDFFallback(content, filename) {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error('Não foi possível abrir janela para impressão. Verifique se há bloqueadores de popup.');
            }
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${filename}</title>
                    <meta charset="UTF-8">
                    <style>
                        body { 
                            font-family: 'Arial', sans-serif; 
                            line-height: 1.6; 
                            margin: 2cm; 
                            font-size: 12pt;
                        }
                        @media print {
                            @page { margin: 2cm; }
                            .no-print { display: none; }
                        }
                        .document { 
                            white-space: pre-wrap;
                            font-family: 'Courier New', monospace;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 2cm;
                        }
                        .footer {
                            margin-top: 2cm;
                            text-align: center;
                            font-size: 10pt;
                            color: #666;
                        }
                        button {
                            padding: 10px 20px;
                            background: #3b82f6;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            margin: 20px;
                        }
                        .instructions {
                            background: #f8f9fa;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                            border-left: 4px solid #3b82f6;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${filename}</h1>
                        <p>Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div class="document">${content}</div>
                    <div class="footer">
                        <p>Gerado por ModeloTrabalhista - ${window.location.origin}</p>
                    </div>
                    <div class="no-print" style="text-align: center; margin-top: 2cm;">
                        <div class="instructions">
                            <p><strong>Instruções:</strong> Use Ctrl+P para abrir a caixa de impressão, depois selecione "Salvar como PDF" como destino da impressão.</p>
                        </div>
                        <button onclick="window.print()">Abrir Caixa de Impressão</button>
                        <button onclick="window.close()">Fechar Janela</button>
                    </div>
                    <script>
                        // Auto-focar na janela
                        window.focus();
                        
                        // Auto-print após 1 segundo (opcional)
                        setTimeout(() => {
                            window.print();
                        }, 1000);
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
            
            return { 
                success: true, 
                message: 'Janela de impressão aberta. Use Ctrl+P para salvar como PDF.' 
            };
        } catch (error) {
            console.error('Erro no fallback do PDF:', error);
            this.showNotification('Erro ao gerar PDF. Tente usar o modo de impressão do navegador.', 'error');
            return { success: false, error: error.message };
        }
    }

    // Exportar para DOCX real com docx.js
    async exportToDOCX(content, filename = 'ModeloTrabalhista') {
        try {
            // Verificar se docx está carregado
            if (typeof window.docx === 'undefined') {
                await new Promise((resolve, reject) => {
                    let attempts = 0;
                    const checkInterval = setInterval(() => {
                        attempts++;
                        if (typeof window.docx !== 'undefined') {
                            clearInterval(checkInterval);
                            resolve();
                        } else if (attempts > 50) { // 5 segundos
                            clearInterval(checkInterval);
                            reject(new Error('docx.js não carregado'));
                        }
                    }, 100);
                });
            }

            const docx = window.docx;
            
            // Criar parágrafos a partir do conteúdo
            const paragraphs = content.split('\n').filter(line => line.trim()).map(line => {
                return new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: line,
                            font: 'Courier New',
                            size: 24, // 12pt
                        })
                    ],
                    spacing: {
                        after: 200, // 1 linha
                    },
                });
            });

            // Se não houver parágrafos, adicionar um com mensagem
            if (paragraphs.length === 0) {
                paragraphs.push(new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: 'Conteúdo vazio',
                            font: 'Arial',
                            size: 24,
                        })
                    ]
                }));
            }

            // Criar documento
            const doc = new docx.Document({
                sections: [{
                    properties: {},
                    children: [
                        // Cabeçalho
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: 'MODELO TRABALHISTA',
                                    bold: true,
                                    size: 32, // 16pt
                                }),
                            ],
                            alignment: docx.AlignmentType.CENTER,
                            spacing: {
                                after: 400,
                            },
                        }),
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
                                    size: 20, // 10pt
                                }),
                            ],
                            alignment: docx.AlignmentType.CENTER,
                            spacing: {
                                after: 800,
                            },
                        }),
                        // Conteúdo
                        ...paragraphs,
                        // Rodapé
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: ' ',
                                }),
                            ],
                        }),
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: `Gerado por ModeloTrabalhista - ${window.location.origin}`,
                                    size: 16, // 8pt
                                    color: '666666',
                                }),
                            ],
                            alignment: docx.AlignmentType.CENTER,
                        }),
                    ],
                }],
            });

            // Gerar blob
            const blob = await docx.Packer.toBlob(doc);
            
            // Salvar arquivo
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeFilename = filename.replace(/[^a-z0-9]/gi, '_');
            a.download = `${safeFilename}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Notificar sucesso
            this.showNotification('Documento DOCX gerado com sucesso!', 'success');
            
            return { success: true, filename: `${safeFilename}.docx` };
            
        } catch (error) {
            console.error('Erro ao gerar DOCX:', error);
            
            // Fallback: método antigo (HTML como DOCX)
            return this.exportToDOCXFallback(content, filename);
        }
    }

    // Fallback para DOCX
    exportToDOCXFallback(content, filename) {
        try {
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${filename}</title>
                    <meta name="generator" content="ModeloTrabalhista">
                    <style>
                        body { 
                            font-family: 'Arial', sans-serif; 
                            line-height: 1.6; 
                            margin: 2cm; 
                            font-size: 12pt;
                        }
                        .document { 
                            white-space: pre-wrap;
                            font-family: 'Courier New', monospace;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 2cm;
                        }
                        .footer {
                            margin-top: 2cm;
                            text-align: center;
                            font-size: 10pt;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${filename}</h1>
                        <p>Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div class="document">${content}</div>
                    <div class="footer">
                        <p>Gerado por ModeloTrabalhista - ${window.location.origin}</p>
                    </div>
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
            
            this.showNotification('Documento DOCX (fallback) gerado com sucesso!', 'success');
            return { success: true, filename: `${safeFilename}.docx` };
        } catch (error) {
            console.error('Erro no fallback do DOCX:', error);
            this.showNotification('Erro ao gerar DOCX.', 'error');
            return { success: false, error: error.message };
        }
    }

    // Métodos de exportação adicionais (mantidos para compatibilidade)
    exportToTXT(content, filename = 'ModeloTrabalhista') {
        try {
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            const safeFilename = filename.replace(/[^a-z0-9]/gi, '_');
            a.download = `${safeFilename}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Documento TXT gerado com sucesso!', 'success');
            return { success: true, filename: `${safeFilename}.txt` };
        } catch (error) {
            console.error('Erro ao exportar TXT:', error);
            this.showNotification('Erro ao gerar TXT.', 'error');
            return { success: false, error: error.message };
        }
    }

    exportToHTML(content, filename = 'ModeloTrabalhista') {
        try {
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${filename}</title>
                    <style>
                        body { 
                            font-family: 'Arial', sans-serif; 
                            line-height: 1.6; 
                            margin: 2cm; 
                            background: #f8fafc;
                        }
                        .document-container {
                            background: white;
                            padding: 2cm;
                            border-radius: 8px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .document { 
                            white-space: pre-wrap;
                            font-family: 'Courier New', monospace;
                            line-height: 1.8;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 2cm;
                            border-bottom: 2px solid #3b82f6;
                            padding-bottom: 1cm;
                        }
                        .footer {
                            margin-top: 2cm;
                            text-align: center;
                            font-size: 10pt;
                            color: #666;
                            border-top: 1px solid #e2e8f0;
                            padding-top: 1cm;
                        }
                    </style>
                </head>
                <body>
                    <div class="document-container">
                        <div class="header">
                            <h1 style="color: #3b82f6; margin: 0">${filename}</h1>
                            <p style="color: #64748b">Gerado em ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</p>
                        </div>
                        <div class="document">${content}</div>
                        <div class="footer">
                            <p>Gerado por <strong>ModeloTrabalhista</strong> - ${window.location.origin}</p>
                            <p style="font-size: 9pt; color: #94a3b8">Documento gerado automaticamente. Verifique as informações antes de usar.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            const safeFilename = filename.replace(/[^a-z0-9]/gi, '_');
            a.download = `${safeFilename}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Documento HTML gerado com sucesso!', 'success');
            return { success: true, filename: `${safeFilename}.html` };
        } catch (error) {
            console.error('Erro ao exportar HTML:', error);
            this.showNotification('Erro ao gerar HTML.', 'error');
            return { success: false, error: error.message };
        }
    }

    // Método para copiar para área de transferência
    async copyToClipboard(content) {
        try {
            await navigator.clipboard.writeText(content);
            return { success: true, message: 'Conteúdo copiado para área de transferência!' };
        } catch (error) {
            console.error('Erro ao copiar para clipboard:', error);
            
            // Fallback para navegadores mais antigos
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
                    return { success: true, message: 'Conteúdo copiado para área de transferência!' };
                } else {
                    throw new Error('Falha no comando de cópia');
                }
            } catch (fallbackError) {
                return { 
                    success: false, 
                    error: 'Não foi possível copiar. Tente selecionar manualmente (Ctrl+A, Ctrl+C).' 
                };
            }
        }
    }

    // Mostrar notificação
    showNotification(message, type = 'info') {
        // Remover notificação anterior
        const existing = document.querySelector('.export-notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `export-notification export-${type}`;
        notification.innerHTML = `
            <div class="export-notification-content">
                <span class="export-notification-icon">${type === 'success' ? '✅' : '❌'}</span>
                <span class="export-notification-text">${message}</span>
            </div>
        `;

        // Estilos
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            animation: exportFadeIn 0.3s ease-in;
            ${type === 'success' ? 
                'background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white;' : 
                'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white;'}
        `;

        document.body.appendChild(notification);

        // Adicionar animações CSS se não existirem
        if (!document.querySelector('#export-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'export-notification-styles';
            style.textContent = `
                @keyframes exportFadeIn {
                    from { opacity: 0; transform: translateY(-20px) translateX(20px); }
                    to { opacity: 1; transform: translateY(0) translateX(0); }
                }
                @keyframes exportFadeOut {
                    from { opacity: 1; transform: translateY(0) translateX(0); }
                    to { opacity: 0; transform: translateY(-20px) translateX(20px); }
                }
            `;
            document.head.appendChild(style);
        }

        // Remover após 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'exportFadeOut 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }

    // Método auxiliar para verificar se os botões estão habilitados
    enableExportButtons(enable = true) {
        const buttons = ['pdfBtn', 'printBtn', 'copyBtn'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = !enable;
            }
        });
    }

    // Método para forçar a atualização dos listeners (útil quando conteúdo é dinâmico)
    refreshExportButtons() {
        this.attachExportButtons();
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    if (!window.documentExporter) {
        window.documentExporter = new DocumentExporter();
        console.log('DocumentExporter inicializado com sucesso!');
        
        // Expor métodos para debug em desenvolvimento
        if (window.location.hostname.includes('localhost') || 
            window.location.hostname.includes('127.0.0.1') ||
            window.location.hostname.includes('github.io')) {
            window.debugExport = {
                exporter: window.documentExporter,
                getContent: () => window.documentExporter.getDocumentContent(),
                testPDF: () => window.documentExporter.exportToPDF('Teste de conteúdo', 'Teste'),
                testDOCX: () => window.documentExporter.exportToDOCX('Teste de conteúdo', 'Teste'),
                enableButtons: (enable) => window.documentExporter.enableExportButtons(enable),
                refresh: () => window.documentExporter.refreshExportButtons()
            };
            console.log('🔧 Debug export disponível em window.debugExport');
        }
    }
});

// Exportar para uso global
window.DocumentExporter = DocumentExporter;
