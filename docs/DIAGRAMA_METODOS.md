# Diagrama de Métodos - ModeloTrabalhista Export System

## 🎯 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    DocumentExporter Class                        │
│                     (js/export.js)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ init()
                              ▼
        ┌─────────────────────────────────────────┐
        │   setupEventListeners()                  │
        │   setupMutationObserver()                │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │   attachExportButtons()                  │
        │   (Anexa eventos aos 3 botões)           │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────┬──────────┴──────────┬──────────┐
        │          │                     │          │
        ▼          ▼                     ▼          ▼
   ┌────────┐  ┌─────────┐       ┌──────────┐  ┌────────┐
   │ pdfBtn │  │printBtn │       │ copyBtn  │  │  ...   │
   └────────┘  └─────────┘       └──────────┘  └────────┘
```

---

## 📱 Fluxo de Interação do Usuário

```
                    ┌─────────────────┐
                    │   index.html    │
                    │   (Interface)   │
                    └────────┬────────┘
                             │
                    Usuário clica botão
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   pdfBtn     │    │  printBtn    │    │   copyBtn    │
│ #pdfBtn      │    │ #printBtn    │    │  #copyBtn    │
│ (btn-accent) │    │(btn-success) │    │(btn-outline) │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                    │
       ▼                   ▼                    ▼
┌─────────────────────────────────────────────────────┐
│              DocumentExporter Methods                │
├─────────────────┬───────────────┬───────────────────┤
│exportToPDFAuto()│exportToDOCX() │copyToClipboard()  │
└─────────────────┴───────────────┴───────────────────┘
```

---

## 🔄 Métodos de Exportação PDF (Hierarquia)

```
exportToPDFAuto() ✅ MÉTODO PRINCIPAL USADO
    │
    ├──> getDocumentElement()
    │        └──> querySelector('#documentPreview .document-content')
    │
    ├──> loadJSPDF()
    │        ├──> Tenta: cdn.jsdelivr.net
    │        └──> Fallback: unpkg.com
    │
    ├──> loadHtml2Canvas()
    │        └──> Tenta: cdn.jsdelivr.net
    │
    ├──> html2canvas(element)
    │        └──> Captura elemento como imagem
    │
    ├──> new jsPDF()
    │        └──> Cria documento PDF
    │
    ├──> doc.addImage()
    │        └──> Adiciona imagem ao PDF
    │
    └──> doc.save() → Download automático
         │
         └─[SE FALHAR]──> exportToPDFViaPrint() ⚠️ FALLBACK
                              │
                              └──> window.open() + window.print()


exportToPDF() ❌ NÃO USADO
    └──> Apenas wrapper, chama exportToPDFAuto()


exportToPDFWithHTML() ❌ NÃO USADO
    └──> Método alternativo nunca invocado


exportTextToPDF() ❌ NÃO USADO
    └──> Para exportar texto puro, não está integrado


exportToPDFFallback() ⚠️ NÃO INTEGRADO
    └──> Cria Blob + URL, mas não é chamado
```

---

## 📄 Métodos de Exportação DOCX (Hierarquia)

```
exportToDOCX() ✅ MÉTODO PRINCIPAL USADO
    │
    ├──> getDocumentContent()
    │        └──> querySelector('#documentPreview .document-content')
    │                └──> Extrai textContent
    │
    ├──> loadDocxJS()
    │        ├──> Tenta: cdn.jsdelivr.net (ESM)
    │        └──> Fallback: unpkg.com
    │
    ├──> Parse do conteúdo
    │        ├──> Identifica títulos (isTitleLine)
    │        ├──> Identifica separadores (regex)
    │        └──> Formata linhas vazias
    │
    ├──> Cria Document (docx.Document)
    │        └──> Adiciona parágrafos formatados
    │
    ├──> Packer.toBlob()
    │        └──> Converte para arquivo .docx
    │
    └──> saveAs(blob, filename)
         │
         └─[SE FALHAR]──> exportToDOCXFallback() ⚠️ FALLBACK
                              │
                              └──> Salva como texto simples


exportToDOCXFallback() ⚠️ NÃO INTEGRADO
    └──> Cria Blob de texto, mas raramente chamado
```

---

## 📋 Método de Cópia (Hierarquia)

```
copyToClipboard() ✅ MÉTODO ÚNICO USADO
    │
    ├──> getDocumentContent()
    │        └──> Extrai texto do documento
    │
    ├──> navigator.clipboard.writeText() [MODERNO]
    │        └──> API Clipboard moderna (Chrome 63+)
    │
    └─[SE FALHAR]──> document.execCommand('copy') [LEGACY]
                         └──> Fallback para navegadores antigos
```

---

## 🛠️ Métodos Auxiliares (Helper Methods)

```
Métodos de Busca de Conteúdo:
┌──────────────────────────────────────────────┐
│ getDocumentElement() ✅                       │
│   └──> Retorna elemento DOM                  │
│        Prioridade:                            │
│        1. #documentPreview .document-content  │
│        2. #documentPreview                    │
│        3. Seletores legados                   │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ getDocumentHTML() ✅                          │
│   └──> Retorna innerHTML do elemento         │
│        Validação: min 50 caracteres           │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ getDocumentContent() ✅                       │
│   └──> Retorna textContent do elemento       │
│        Validação: min 50 caracteres           │
│        Fallback: busca em múltiplos elementos │
└──────────────────────────────────────────────┘


Métodos de Formatação:
┌──────────────────────────────────────────────┐
│ isTitleLine(line) ✅                          │
│   └──> Detecta se linha é título             │
│        Regra: < 60 chars + UPPERCASE          │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ sanitizeFilename(filename) ✅                 │
│   └──> Remove caracteres inválidos           │
│        Regex: /[^a-z0-9]/gi → '_'             │
└──────────────────────────────────────────────┘


Métodos de UI:
┌──────────────────────────────────────────────┐
│ showNotification(message, type) ✅            │
│   └──> Exibe notificação toast               │
│        Tipos: success, error, info            │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ enableExportButtons(enable) ✅                │
│   └──> Habilita/desabilita botões            │
│        Altera: disabled attribute             │
└──────────────────────────────────────────────┘
```

---

## 📚 Métodos de Carregamento de Bibliotecas

```
loadLibraries() ✅
    ├──> loadJSPDF()
    │        ├──> Script: https://cdn.jsdelivr.net/npm/jspdf@2.5.1
    │        │    Fallback: https://unpkg.com/jspdf@2.5.1
    │        └──> Timeout: 10 segundos
    │
    └──> loadDocxJS()
             ├──> Script ESM: https://cdn.jsdelivr.net/npm/docx@7.8.0/+esm
             │    Fallback: https://unpkg.com/docx@7.8.0
             └──> Evento: 'docxLoaded'


loadHtml2Canvas() ✅
    └──> Script: https://cdn.jsdelivr.net/npm/html2canvas@1.4.1
         └──> Timeout: 10 segundos
         └──> Usado apenas para PDF
```

---

## ⚡ Event Flow (Sequence Diagram)

```
Inicialização:
──────────────
DOMContentLoaded
    │
    ├──> new DocumentExporter()
    │        │
    │        └──> init()
    │                 │
    │                 ├──> setupEventListeners()
    │                 │        └──> attachExportButtons()
    │                 │
    │                 └──> setupMutationObserver()
    │                          └──> Observa mudanças no DOM
    │                               └──> Re-anexa botões se necessário
    │
    └──> window.exporter = documentExporter


Exportação PDF:
───────────────
Usuário: Clica "Salvar como PDF"
    │
    └──> pdfBtn.click
              │
              └──> exportToPDFAuto('ModeloTrabalhista')
                        │
                        ├──> Desabilita botão
                        ├──> Reseta zoom (se necessário)
                        ├──> getDocumentElement()
                        ├──> Carrega bibliotecas
                        ├──> Captura com html2canvas
                        ├──> Gera PDF com jsPDF
                        ├──> Download automático
                        ├──> Restaura zoom
                        └──> Habilita botão


Exportação DOCX:
────────────────
Usuário: Clica "Gerar DOCX"
    │
    └──> printBtn.click
              │
              └──> exportToDOCX('ModeloTrabalhista')
                        │
                        ├──> Desabilita botão
                        ├──> getDocumentContent()
                        ├──> Carrega docx.js
                        ├──> Parse e formatação
                        ├──> Gera documento DOCX
                        ├──> Download automático
                        └──> Habilita botão


Cópia:
──────
Usuário: Clica "Copiar Texto"
    │
    └──> copyBtn.click
              │
              └──> copyToClipboard()
                        │
                        ├──> getDocumentContent()
                        ├──> navigator.clipboard.writeText()
                        ├──> Feedback visual (✓ Copiado!)
                        └──> Restaura botão após 2s
```

---

## 🎨 Estado dos Botões

```
Estado Inicial (documento não gerado):
┌──────────┬──────────┬──────────┐
│  pdfBtn  │ printBtn │ copyBtn  │
│ DISABLED │ DISABLED │ DISABLED │
│  (gray)  │  (gray)  │  (gray)  │
└──────────┴──────────┴──────────┘


Após gerar documento:
┌──────────┬──────────┬──────────┐
│  pdfBtn  │ printBtn │ copyBtn  │
│ ENABLED  │ ENABLED  │ ENABLED  │
│  (blue)  │ (green)  │ (white)  │
└──────────┴──────────┴──────────┘


Durante exportação (exemplo PDF):
┌──────────┬──────────┬──────────┐
│  pdfBtn  │ printBtn │ copyBtn  │
│ DISABLED │ ENABLED  │ ENABLED  │
│(spinner) │ (green)  │ (white)  │
└──────────┴──────────┴──────────┘
```

---

## 📊 Estatísticas de Uso

```
Total de Métodos Definidos: ~50
Métodos Ativamente Usados: 15 (30%)
Métodos Fallback: 5 (10%)
Métodos Não Usados: 4 (8%)
Métodos Helper: 10 (20%)
Métodos de Inicialização: 4 (8%)
Métodos de Carregamento: 6 (12%)
```

---

## 🎯 Resumo de Uso por Categoria

```
┌──────────────────────┬────────┬──────────┐
│ Categoria            │ Total  │ Usados   │
├──────────────────────┼────────┼──────────┤
│ Exportação Principal │   7    │   3 ✅   │
│ Exportação Fallback  │   3    │   2 ⚠️   │
│ Helper Methods       │  10    │  10 ✅   │
│ Carregamento         │   6    │   6 ✅   │
│ Inicialização        │   4    │   4 ✅   │
│ Event Handling       │   3    │   3 ✅   │
│ Não Utilizados       │   4    │   0 ❌   │
└──────────────────────┴────────┴──────────┘

Legenda:
✅ = Ativamente usado
⚠️ = Usado apenas como fallback
❌ = Não usado
```

---

**Legenda de Símbolos:**
- ✅ = Método ativamente usado
- ❌ = Método não usado
- ⚠️ = Método usado apenas como fallback
- 🔄 = Fluxo de dados
- → = Sequência de chamadas
- └──> = Chamada de método
- ├──> = Múltiplas opções/caminhos

**Última atualização:** 2026-02-05
