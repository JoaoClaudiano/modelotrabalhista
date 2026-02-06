# Guia Rápido: Módulo export.js

## 📋 Resumo Executivo

Documentação completa disponível em: [`EXPORT_MODULE_DOCUMENTATION.md`](./EXPORT_MODULE_DOCUMENTATION.md)

---

## 🎯 O que é o export.js?

Sistema de exportação de documentos trabalhistas que suporta:
- ✅ PDF vetorial (texto selecionável)
- ✅ DOCX (Microsoft Word)
- ✅ Copiar para área de transferência

---

## 🚀 Início Rápido

### Uso via Botões HTML
```html
<button id="pdfBtn">Gerar PDF</button>
<button id="printBtn">Gerar DOCX</button>
<button id="copyBtn">Copiar Texto</button>
```
**Os botões são detectados e vinculados automaticamente!**

### Uso Programático
```javascript
// Obter instância
const exporter = window.documentExporter;

// Exportar PDF
await exporter.exportPDF('demissao');

// Exportar DOCX
await exporter.exportToDOCX(content, 'documento');

// Copiar texto
await exporter.copyToClipboard(content);
```

---

## 📦 Principais Métodos

| Método | Descrição | Uso |
|--------|-----------|-----|
| `exportPDF(modelId)` | Exporta PDF do modelo | `exportPDF('ferias')` |
| `exportPDFVector(content, title, id)` | PDF com conteúdo customizado | `exportPDFVector(text, 'Título', 'id')` |
| `exportToDOCX(content, filename)` | Exporta DOCX | `exportToDOCX(text, 'doc')` |
| `copyToClipboard(content)` | Copia texto | `copyToClipboard(text)` |
| `showNotification(msg, type)` | Mostra notificação | `showNotification('OK', 'success')` |
| `getDocumentContent()` | Obtém conteúdo | `getDocumentContent()` |

---

## ⚙️ Configurações Principais

### PDF_CONFIG
```javascript
PAGE_WIDTH: 210mm         // A4
PAGE_HEIGHT: 297mm        // A4
MARGIN: 20mm              // Margens
FONT_SIZE: 11pt           // Corpo
TITLE_FONT_SIZE: 12pt     // Títulos
```

### Tipos de Notificação
- `'success'` - Verde ✅
- `'error'` - Vermelho ❌
- `'info'` - Azul ℹ️
- `'warning'` - Amarelo ⚠️

---

## 🔧 Modelos de Documento

```javascript
MODEL_TITLES = {
    'demissao': 'Pedido de Demissão',
    'ferias': 'Solicitação de Férias',
    'advertencia': 'Advertência',
    'alteracao_jornada': 'Pedido de Alteração de Jornada ou Turno',
    'reembolso': 'Pedido de Reembolso de Despesas',
    'beneficios': 'Solicitação de Benefícios',
    'licenca_maternidade': 'Licença Maternidade',
    'licenca_paternidade': 'Licença Paternidade',
    'amamentacao': 'Horário de Amamentação'
}
```

---

## 📚 Dependências

| Biblioteca | Versão | Propósito |
|------------|--------|-----------|
| jsPDF | 2.5.1 | Geração de PDF |
| docx.js | 7.8.0 | Geração de DOCX |
| Clipboard API | Nativa | Copiar texto |

**Carregamento:** Sob demanda (lazy loading)

---

## 🎨 Tipos de Bloco Semântico

O parser identifica 15 tipos:
1. `companyName` - Nome da empresa
2. `companyAddress` - Endereço
3. `documentTitle` - Título do doc
4. `recipient` - Destinatário
5. `opening` - Abertura
6. `paragraph` - Parágrafo
7. `field` - Campo (Label: Valor)
8. `listItem` - Item de lista
9. `signature` - Assinatura
10. `date` - Data
11. `location` - Local
12. `heavySeparator` - ===
13. `lightSeparator` - ___
14. `emptyLine` - Linha vazia
15. `title` - Título interno

---

## 🔄 Padrões de Projeto Usados

1. **Singleton** - Uma instância global
2. **Lazy Loading** - Bibliotecas sob demanda
3. **Observer** - Detecta botões no DOM
4. **Strategy** - Múltiplos fallbacks
5. **Chain of Responsibility** - Cascata de seletores
6. **Builder** - Parsing semântico
7. **Facade** - Interface simples
8. **Configuration Object** - Constantes centralizadas

---

## ⚡ Métricas de Performance

| Operação | Tempo |
|----------|-------|
| Inicialização | < 10ms |
| Carregar jsPDF | 200-500ms |
| Carregar docx.js | 300-700ms |
| Parsing (200 linhas) | 10-20ms |
| Render PDF (1 pág) | 50-100ms |
| Gerar DOCX | 30-80ms |
| Copiar clipboard | < 5ms |

---

## 🛡️ Tratamento de Erros

### Estratégias
- ✅ Try-catch em métodos assíncronos
- ✅ Validação de conteúdo mínimo (50 chars)
- ✅ Timeouts (10s para jsPDF, 15s para docx)
- ✅ Fallbacks em cascata
- ✅ Mensagens amigáveis ao usuário

### Erros Tratados
- Biblioteca não carregada
- Conteúdo vazio
- Timeout de rede
- Popup bloqueado
- Clipboard negado
- DOM não encontrado

---

## 📖 Links Úteis

- 📄 [Documentação Completa](./EXPORT_MODULE_DOCUMENTATION.md) - Guia técnico detalhado
- 📁 Código fonte: `/js/export.js` (1799 linhas)
- 🔧 Exemplos de uso na documentação completa

---

## 💡 Exemplos Rápidos

### Exportar PDF de Modelo
```javascript
await window.documentExporter.exportPDF('demissao');
```

### Notificação
```javascript
window.documentExporter.showNotification('Sucesso!', 'success');
```

### PDF Customizado
```javascript
const content = `
MINHA EMPRESA
Rua Exemplo, 123

DOCUMENTO

Conteúdo aqui...
`;

await window.documentExporter.exportPDFVector(
    content, 
    'Meu Documento',
    'custom_id'
);
```

---

**Gerado em:** 06/02/2026  
**Versão:** Estado atual (após otimizações)
