# 🚀 Guia Rápido - Métodos de Exportação

**Documento de Referência Rápida para Desenvolvedores**

---

## 📋 Métodos Principais (Quick Reference)

### ✅ Métodos que VOCÊ DEVE USAR

| Método | Botão | Uso | Arquivo |
|--------|-------|-----|---------|
| `exportToPDFAuto()` | #pdfBtn | Exportar para PDF | export.js:652 |
| `exportToDOCX()` | #printBtn | Exportar para DOCX | export.js:1036 |
| `copyToClipboard()` | #copyBtn | Copiar texto | export.js:1324 |

### 🛠️ Métodos Helper que VOCÊ DEVE USAR

| Método | Função | Retorno |
|--------|--------|---------|
| `getDocumentElement()` | Busca elemento DOM | HTMLElement |
| `getDocumentHTML()` | Extrai HTML | String (HTML) |
| `getDocumentContent()` | Extrai texto | String (texto) |
| `showNotification(msg, type)` | Mostra notificação | void |

### ❌ Métodos que NÃO DEVEM SER USADOS

| Método | Motivo |
|--------|--------|
| `exportToPDF()` | Wrapper desnecessário, use exportToPDFAuto |
| `exportToPDFWithHTML()` | Não integrado, não use |
| `exportTextToPDF()` | Não integrado, não use |

---

## 🎯 Como Exportar um Documento

### Exportar para PDF

```javascript
// Opção 1: Via botão (automático)
document.getElementById('pdfBtn').click();

// Opção 2: Direto (programático)
await window.exporter.exportToPDFAuto('MeuDocumento');
```

### Exportar para DOCX

```javascript
// Opção 1: Via botão (automático)
document.getElementById('printBtn').click();

// Opção 2: Direto (programático)
const content = window.exporter.getDocumentContent();
await window.exporter.exportToDOCX(content, 'MeuDocumento');
```

### Copiar Texto

```javascript
// Opção 1: Via botão (automático)
document.getElementById('copyBtn').click();

// Opção 2: Direto (programático)
const content = window.exporter.getDocumentContent();
await window.exporter.copyToClipboard(content);
```

---

## 🔧 Funções Auxiliares Úteis

### Obter Conteúdo do Documento

```javascript
// HTML completo
const html = window.exporter.getDocumentHTML();

// Apenas texto
const texto = window.exporter.getDocumentContent();

// Elemento DOM
const elemento = window.exporter.getDocumentElement();
```

### Mostrar Notificações

```javascript
// Sucesso
window.exporter.showNotification('Operação bem-sucedida!', 'success');

// Erro
window.exporter.showNotification('Algo deu errado!', 'error');

// Info
window.exporter.showNotification('Informação importante', 'info');
```

### Validar se É Título

```javascript
const isTitle = window.exporter.isTitleLine('MEU TÍTULO');
// Retorna: true (porque está em maiúsculas e < 60 chars)
```

### Sanitizar Nome de Arquivo

```javascript
const safeName = window.exporter.sanitizeFilename('Meu Arquivo.pdf');
// Retorna: "Meu_Arquivo_pdf"
```

---

## 🎨 Estados dos Botões

```javascript
// Habilitar todos os botões
const buttons = ['pdfBtn', 'printBtn', 'copyBtn'];
buttons.forEach(id => {
    document.getElementById(id).disabled = false;
});

// Desabilitar todos os botões
buttons.forEach(id => {
    document.getElementById(id).disabled = true;
});
```

---

## 🔄 Fluxo Típico de Exportação

```javascript
// 1. Usuário gera documento
gerarDocumento();

// 2. Sistema habilita botões
enableExportButtons(true);

// 3. Usuário clica em exportar
// (Evento já está anexado automaticamente)

// 4. Sistema exporta e notifica
// (Automático via attachExportButtons)
```

---

## ⚙️ Configurações e Constantes

### Constantes de Validação

```javascript
// Disponíveis em: exporter.VALIDATION

VALIDATION.MIN_CONTENT_LENGTH = 50  // Mínimo de caracteres
VALIDATION.LIBRARY_LOAD_TIMEOUT = 10000  // 10 segundos
VALIDATION.HTML2CANVAS_LOAD_TIMEOUT = 10000  // 10 segundos
```

### Constantes de Formatação

```javascript
// Disponíveis em: exporter.FORMATTING

// PDF
FORMATTING.LINE_HEIGHT_MM = 7
FORMATTING.TITLE_FONT_SIZE = 12
FORMATTING.BODY_FONT_SIZE = 11

// DOCX
FORMATTING.DOCX_TITLE_SIZE = 28  // 14pt
FORMATTING.DOCX_BODY_SIZE = 22   // 11pt
```

---

## 🐛 Debugging

### Verificar se Exportador Está Carregado

```javascript
if (window.exporter) {
    console.log('✅ Exportador disponível');
} else {
    console.error('❌ Exportador não inicializado');
}
```

### Verificar Bibliotecas Carregadas

```javascript
console.log('jsPDF:', window.exporter.libsLoaded.jspdf);
console.log('docx:', window.exporter.libsLoaded.docx);
console.log('html2canvas:', typeof html2canvas !== 'undefined');
```

### Logs de Exportação

```javascript
// Os métodos já incluem console.log automaticamente
// Busque no console do navegador por:
// - "getDocumentElement: Found element..."
// - "Carregando jsPDF..."
// - "✅ jsPDF carregado com sucesso"
// - "Iniciando geração automática de PDF..."
```

---

## ⚠️ Erros Comuns e Soluções

### Erro: "Elemento do documento não encontrado"

**Causa:** Documento não foi gerado ou seletor incorreto

**Solução:**
```javascript
// Verificar se documento existe
const element = document.querySelector('#documentPreview .document-content');
if (!element) {
    console.error('Documento não encontrado!');
}
```

### Erro: "Timeout ao carregar jsPDF"

**Causa:** CDN bloqueado ou lento

**Solução:** O sistema já tem fallback automático, mas você pode forçar:
```javascript
// Carrega manualmente
await window.exporter.loadJSPDF();
```

### Erro: "Nenhum conteúdo encontrado para exportar"

**Causa:** Documento vazio ou muito curto (< 50 caracteres)

**Solução:**
```javascript
const content = window.exporter.getDocumentContent();
if (content.length < window.exporter.VALIDATION.MIN_CONTENT_LENGTH) {
    console.warn('Conteúdo muito curto:', content.length, 'caracteres');
}
```

---

## 📞 API Pública do DocumentExporter

```javascript
class DocumentExporter {
    // Métodos de Exportação
    async exportToPDFAuto(filename)
    async exportToDOCX(content, filename)
    async copyToClipboard(content)
    
    // Métodos Helper
    getDocumentElement()
    getDocumentHTML()
    getDocumentContent()
    
    // Utilitários
    showNotification(message, type)
    sanitizeFilename(filename)
    isTitleLine(line)
    
    // Carregamento
    loadLibraries()
    async loadHtml2Canvas()
    
    // Propriedades
    VALIDATION = { MIN_CONTENT_LENGTH, ... }
    FORMATTING = { TITLE_FONT_SIZE, ... }
    libsLoaded = { jspdf, docx, html2canvas }
}
```

---

## 📚 Recursos Adicionais

### Documentação Completa
- **METODOS_UTILIZADOS.md** - Lista completa de métodos
- **DIAGRAMA_METODOS.md** - Diagramas visuais e fluxos

### Arquivos Relevantes
- **js/export.js** - Implementação principal (1532 linhas)
- **js/main.js** - Integração com UI
- **index.html** - Botões e interface

### Bibliotecas Externas
- **jsPDF 2.5.1** - Geração de PDF
- **docx.js 7.8.0** - Geração de DOCX
- **html2canvas 1.4.1** - Captura de HTML

---

## 🎓 Exemplos Práticos

### Exemplo 1: Exportar Programaticamente

```javascript
// Gera documento primeiro
gerarDocumento();

// Aguarda um momento para renderização
await new Promise(resolve => setTimeout(resolve, 100));

// Exporta automaticamente
await window.exporter.exportToPDFAuto('RelatorioMensal');
```

### Exemplo 2: Exportar com Feedback

```javascript
async function exportarComFeedback() {
    try {
        window.exporter.showNotification('Gerando PDF...', 'info');
        await window.exporter.exportToPDFAuto('MeuDocumento');
        window.exporter.showNotification('PDF gerado com sucesso!', 'success');
    } catch (error) {
        window.exporter.showNotification('Erro ao gerar PDF: ' + error.message, 'error');
    }
}
```

### Exemplo 3: Validar Antes de Exportar

```javascript
async function exportarComValidacao() {
    const content = window.exporter.getDocumentContent();
    
    if (!content || content.length < 50) {
        window.exporter.showNotification('Documento muito curto para exportar', 'error');
        return;
    }
    
    if (content.length > 100000) {
        window.exporter.showNotification('Documento muito grande, pode demorar...', 'info');
    }
    
    await window.exporter.exportToPDFAuto('Documento_Validado');
}
```

---

## 🚨 Importante

1. **Sempre use `window.exporter`** - Instância global criada automaticamente
2. **Não chame métodos não documentados** - Use apenas os listados aqui
3. **Aguarde promises** - Todos os métodos de exportação são assíncronos
4. **Verifique conteúdo** - Sempre valide se há conteúdo antes de exportar
5. **Use try-catch** - Métodos podem lançar exceções

---

## 📝 Checklist de Desenvolvimento

Antes de usar exportação:
- [ ] Documento foi gerado
- [ ] Botões estão habilitados
- [ ] Conteúdo tem > 50 caracteres
- [ ] window.exporter está definido

Ao implementar nova funcionalidade:
- [ ] Use métodos documentados aqui
- [ ] Adicione try-catch
- [ ] Mostre feedback ao usuário
- [ ] Valide conteúdo antes de exportar
- [ ] Teste em diferentes navegadores

---

**Versão:** 1.0  
**Última Atualização:** 2026-02-05  
**Autor:** Análise Automatizada
