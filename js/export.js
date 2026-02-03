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
            document.head.appendChild(script);
        }

        // html2canvas para capturar elementos DOM
        if (typeof window.html2canvas === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = () => {
                console.log('html2canvas carregado');
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
            document.head.appendChild(script);
        }
    }

    setupEventListeners() {
        // Event listeners serão adicionados pelo main.js
        // Adicionando fallback para evitar erros
        setTimeout(() => {
            this.attachExportButtons();
        }, 1000);
    }

    // Método para anexar automaticamente os botões de exportação
    attachExportButtons() {
        // Botão de PDF
        const pdfBtn = document.getElementById('export-pdf') || 
                      document.querySelector('[data-export="pdf"]') ||
                      document.querySelector('button:contains("PDF")');
        
        if (pdfBtn && !pdfBtn.hasAttribute('data-listener-attached')) {
            pdfBtn.setAttribute('data-listener-attached', 'true');
            pdfBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const content = this.getDocumentContent();
                this.exportToPDF(content, 'ModeloTrabalhista');
            });
        }

        // Botão de DOCX (substitui o botão de imprimir)
        const docxBtn = document.getElementById('export-docx') ||
                       document.querySelector('[data-export="docx"]') ||
                       document.querySelector('button:contains("DOCX")') ||
                       document.querySelector('button:contains("Imprimir")');
        
        if (docxBtn && !docxBtn.hasAttribute('data-listener-attached')) {
            docxBtn.setAttribute('data-listener-attached', 'true');
            docxBtn.textContent = 'Gerar DOCX'; // Renomear o botão
            docxBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const content = this.getDocumentContent();
                this.exportToDOCX(content, 'ModeloTrabalhista');
            });
        }
    }

    // Obter conteúdo do documento
    getDocumentContent() {
        // Tenta encontrar o conteúdo do documento em diferentes locais
        const contentSelectors = [
            '#document-content',
            '.document-content',
            '#conteudo',
            '.conteudo',
            '#texto',
            '.texto',
            '#modelo-text',
            '#main-content',
            'article',
            'section'
        ];

        for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim().length > 0) {
                return element.textContent || element.innerText;
            }
        }

        // Fallback: pegar todo o conteúdo da página, exceto cabeçalho, rodapé e menus
        const mainContent = document.querySelector('main') || document.body;
        const excludedTags = ['header', 'nav', 'footer', 'aside', 'script', 'style'];
        let text = '';
        
        const walker = document.createTreeWalker(
            mainContent,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    const parentTag = node.parentElement.tagName.toLowerCase();
                    if (excludedTags.includes(parentTag)) {
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

        return text.trim() || 'Conteúdo não encontrado.';
    }

    // Exportar para PDF com jsPDF
    async exportToPDF(content, filename = 'documento') {
        try {
            // Verificar se jsPDF está carregado
            if (typeof window.jspdf === 'undefined') {
                await new Promise(resolve => {
                    const check = setInterval(() => {
                        if (typeof window.jspdf !== 'undefined') {
                            clearInterval(check);
                            resolve();
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
            doc.save(`${filename.replace(/[^a-z0-9]/gi, '_')}.pdf`);
            
            // Notificar sucesso
            this.showNotification('PDF gerado com sucesso!', 'success');
            
            return { success: true, filename: `${filename}.pdf` };
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            this.showNotification('Erro ao gerar PDF. Tente novamente.', 'error');
            
            // Fallback: método antigo
            return this.exportToPDFFallback(content, filename);
        }
    }

    // Fallback para PDF (abre janela de impressão)
    exportToPDFFallback(content, filename) {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error('Não foi possível abrir janela para impressão');
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
                        <p>Use Ctrl+P para imprimir ou salvar como PDF</p>
                        <button onclick="window.print()">Imprimir/Salvar como PDF</button>
                        <button onclick="window.close()">Fechar</button>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            
            // Focar na janela para impressão
            printWindow.focus();
            
            return { success: true, message: 'Janela de impressão aberta. Use Ctrl+P para salvar como PDF.' };
        } catch (error) {
            console.error('Erro no fallback do PDF:', error);
            return { success: false, error: error.message };
        }
    }

    // Exportar para DOCX real com docx.js
    async exportToDOCX(content, filename = 'documento') {
        try {
            // Verificar se docx está carregado
            if (typeof window.docx === 'undefined') {
                await new Promise(resolve => {
                    const check = setInterval(() => {
                        if (typeof window.docx !== 'undefined') {
                            clearInterval(check);
                            resolve();
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
            a.download = `${filename.replace(/[^a-z0-9]/gi, '_')}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Notificar sucesso
            this.showNotification('Documento DOCX gerado com sucesso!', 'success');
            
            return { success: true, filename: `${filename}.docx` };
            
        } catch (error) {
            console.error('Erro ao gerar DOCX:', error);
            this.showNotification('Erro ao gerar DOCX. Tente novamente.', 'error');
            
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
            a.download = `${filename.replace(/[^a-z0-9]/gi, '_')}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return { success: true, filename: `${filename}.docx` };
        } catch (error) {
            console.error('Erro no fallback do DOCX:', error);
            return { success: false, error: error.message };
        }
    }

    // Métodos existentes mantidos para compatibilidade
    exportToTXT(content, filename) {
        try {
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename.replace(/[^a-z0-9]/gi, '_')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Documento TXT gerado com sucesso!', 'success');
            return { success: true, filename: `${filename}.txt` };
        } catch (error) {
            console.error('Erro ao exportar TXT:', error);
            this.showNotification('Erro ao gerar TXT.', 'error');
            return { success: false, error: error.message };
        }
    }

    exportToHTML(content, filename) {
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
            a.download = `${filename.replace(/[^a-z0-9]/gi, '_')}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Documento HTML gerado com sucesso!', 'success');
            return { success: true, filename: `${filename}.html` };
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
            this.showNotification('Conteúdo copiado para área de transferência!', 'success');
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
                    this.showNotification('Conteúdo copiado para área de transferência!', 'success');
                    return { success: true, message: 'Conteúdo copiado para área de transferência!' };
                } else {
                    throw new Error('Falha no comando de cópia');
                }
            } catch (fallbackError) {
                this.showNotification('Não foi possível copiar. Tente selecionar manualmente (Ctrl+A, Ctrl+C).', 'error');
                return { 
                    success: false, 
                    error: 'Não foi possível copiar. Tente selecionar manualmente (Ctrl+A, Ctrl+C).' 
                };
            }
        }
    }

    // Método para compartilhar
    async shareDocument(content, filename) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: filename,
                    text: content.substring(0, 100) + '...',
                    url: window.location.href
                });
                this.showNotification('Documento compartilhado com sucesso!', 'success');
                return { success: true, message: 'Documento compartilhado com sucesso!' };
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Erro ao compartilhar:', error);
                    this.showNotification('Erro ao compartilhar documento', 'error');
                    return { success: false, error: 'Erro ao compartilhar documento' };
                }
            }
        }
        
        // Fallback: copiar link
        return await this.copyToClipboard(window.location.href);
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
            animation: fadeIn 0.3s ease-in;
            ${type === 'success' ? 'background: #10b981; color: white;' : 'background: #ef4444; color: white;'}
        `;

        document.body.appendChild(notification);

        // Remover após 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);

        // Adicionar animações CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    if (!window.documentExporter) {
        window.documentExporter = new DocumentExporter();
        console.log('DocumentExporter inicializado com sucesso!');
    }
});

// Exportar para uso global
window.DocumentExporter = DocumentExporter;
