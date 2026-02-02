// export.js - Novo arquivo
class DocumentExporter {
    async exportToDOCX(content, filename) {
        try {
            // Para DOCX, precisaríamos de uma biblioteca como mammoth.js
            // Esta é uma implementação simplificada
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${filename}</title>
                    <style>
                        body { font-family: 'Arial', sans-serif; line-height: 1.6; margin: 2cm; }
                        .document { white-space: pre-wrap; }
                    </style>
                </head>
                <body>
                    <div class="document">${content}</div>
                </body>
                </html>
            `;
            
            const blob = new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Erro ao exportar DOCX:', error);
            return false;
        }
    }
    
    exportToTXT(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}