// export.js - Sistema de exportação de documentos
class DocumentExporter {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Event listeners serão adicionados pelo main.js
    }

    async exportToDOCX(content, filename) {
        try {
            // Para DOCX, precisaríamos de uma biblioteca como mammoth.js
            // Esta é uma implementação simplificada que cria um arquivo HTML com extensão .docx
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
            console.error('Erro ao exportar DOCX:', error);
            return { success: false, error: error.message };
        }
    }
    
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
            
            return { success: true, filename: `${filename}.txt` };
        } catch (error) {
            console.error('Erro ao exportar TXT:', error);
            return { success: false, error: error.message };
        }
    }

    exportToPDF(content, filename) {
        try {
            // Para PDF, usamos a funcionalidade de impressão do navegador
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
            console.error('Erro ao exportar PDF:', error);
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
            
            return { success: true, filename: `${filename}.html` };
        } catch (error) {
            console.error('Erro ao exportar HTML:', error);
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

    // Método para compartilhar
    async shareDocument(content, filename) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: filename,
                    text: content.substring(0, 100) + '...',
                    url: window.location.href
                });
                return { success: true, message: 'Documento compartilhado com sucesso!' };
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Erro ao compartilhar:', error);
                    return { success: false, error: 'Erro ao compartilhar documento' };
                }
            }
        }
        
        // Fallback: copiar link
        return await this.copyToClipboard(window.location.href);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    if (!window.documentExporter) {
        window.documentExporter = new DocumentExporter();
    }
});

// Exportar para uso global
window.DocumentExporter = DocumentExporter;
