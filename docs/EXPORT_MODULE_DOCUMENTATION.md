# Documentação Técnica: Módulo export.js

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Classe DocumentExporter](#classe-documentexporter)
4. [Configurações e Constantes](#configurações-e-constantes)
5. [Métodos Públicos](#métodos-públicos)
6. [Dependências Externas](#dependências-externas)
7. [Padrões de Projeto](#padrões-de-projeto)
8. [Exemplos de Uso](#exemplos-de-uso)
9. [Fluxos de Execução](#fluxos-de-execução)
10. [Tratamento de Erros](#tratamento-de-erros)

---

## Visão Geral

O módulo `export.js` é responsável pelo sistema de exportação de documentos trabalhistas da aplicação ModeloTrabalhista. Ele fornece funcionalidades para exportar documentos em múltiplos formatos (PDF, DOCX) e copiar conteúdo para a área de transferência.

### Características Principais
- **Formatos de Exportação**: PDF vetorial, DOCX e texto simples
- **Carregamento Sob Demanda**: Bibliotecas externas são carregadas apenas quando necessário
- **Múltiplos Fallbacks**: Sistema robusto com várias estratégias de recuperação
- **Exportação Vetorial**: PDFs são gerados com texto 100% selecionável e vetorial
- **Parsing Semântico**: Conversão de HTML em estrutura semântica para formatação consistente
- **Integração com DOM**: Observer pattern para detectar botões dinamicamente adicionados

### Informações do Arquivo
- **Localização**: `/js/export.js`
- **Linhas de Código**: 1799
- **Classe Principal**: `DocumentExporter`
- **Instância Global**: `window.documentExporter`

---

## Arquitetura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                   DocumentExporter                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────┐│
│  │ Library Loader │  │ Content Parser │  │ Formatters ││
│  │  - jsPDF       │  │  - HTML→Text   │  │  - PDF     ││
│  │  - docx.js     │  │  - Semantic    │  │  - DOCX    ││
│  │  - Fallbacks   │  │  - Extraction  │  │  - Text    ││
│  └────────────────┘  └────────────────┘  └────────────┘│
│                                                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────┐│
│  │  UI Manager    │  │ Config Manager │  │  Notifier  ││
│  │  - Buttons     │  │  - PDF_CONFIG  │  │  - Toast   ││
│  │  - Events      │  │  - FORMATTING  │  │  - Alerts  ││
│  │  - Observer    │  │  - VALIDATION  │  │            ││
│  └────────────────┘  └────────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐        ┌──────────┐        ┌──────────┐
   │  jsPDF   │        │ docx.js  │        │ Browser  │
   │ (CDN)    │        │ (CDN)    │        │   APIs   │
   └──────────┘        └──────────┘        └──────────┘
```

### Fluxo de Dados

```
Usuário Clica em Botão
       │
       ▼
attachExportButtons() detecta evento
       │
       ▼
┌──────┴───────┐
│              │
▼              ▼              ▼
exportPDF()   exportToDOCX()  copyToClipboard()
│              │              │
▼              ▼              ▼
Carrega       Carrega        Clipboard API
jsPDF         docx.js        (ou fallback)
│              │              │
▼              ▼              ▼
getDocumentTextForPDF()  getDocumentContent()
│              │
▼              ▼
parseDocumentToSemanticStructure()
│              │
▼              ▼
Renderização   Geração DOCX
PDF Vetorial
│              │
▼              ▼
Download       Download
PDF            DOCX
```

---

## Classe DocumentExporter

### Construtor

```javascript
constructor()
```

**Inicializa o exportador de documentos com:**
- Observer de mutação para detectar novos botões no DOM
- Estado de carregamento de bibliotecas externas
- Constantes de configuração para PDF, DOCX e validação
- Mapeamento de títulos de modelos de documentos

### Propriedades de Instância

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `mutationObserver` | `MutationObserver \| null` | Referência ao observer do DOM para limpeza |
| `libsLoaded` | `Object` | Estado de carregamento das bibliotecas (`jspdf`, `docx`) |
| `libsAttempted` | `Object` | Rastreamento de tentativas de carregamento |
| `FORMATTING` | `Object` | Constantes de formatação para DOCX |
| `VALIDATION` | `Object` | Constantes de validação |
| `PDF_CONFIG` | `Object` | Configurações consolidadas para PDF |
| `PATTERNS` | `Object` | Expressões regulares para detecção de padrões |
| `MODEL_TITLES` | `Object` | Mapeamento de IDs de modelos para títulos |

---

## Configurações e Constantes

### PDF_CONFIG

Configurações para geração de PDF em formato A4.

```javascript
PDF_CONFIG = {
    // Dimensões da página (mm)
    PAGE_WIDTH: 210,
    PAGE_HEIGHT: 297,
    MARGIN: 20,
    
    // Configurações de fonte (pt)
    FONT_SIZE: 11,              // Corpo do texto
    TITLE_FONT_SIZE: 12,        // Títulos
    LINE_HEIGHT_FACTOR: 1.5,    // Espaçamento entre linhas
    
    // Fator de conversão
    PT_TO_MM: 0.3527,           // 1pt = 1/72 inch = 0.3527mm
    
    // Espaçamento vertical (mm)
    PARAGRAPH_SPACING: 2.5,     // Entre parágrafos
    TITLE_SPACING_BEFORE: 4,    // Antes de títulos
    TITLE_SPACING_AFTER: 3,     // Depois de títulos
    EMPTY_LINE_FACTOR: 0.75,    // Para linhas vazias
    
    // Espaçamento do cabeçalho (mm)
    HEADER_NAME_TO_ADDRESS: 1.5,
    HEADER_AFTER: 6,
    
    // Linhas decorativas do título
    TITLE_LINE_WIDTH: 0.4,
    TITLE_LINE_SPACING_BEFORE: 3,
    TITLE_LINE_TO_TEXT: 3,
    TITLE_TEXT_TO_LINE: 3,
    TITLE_LINE_SPACING_AFTER: 6,
    
    // Detecção de título
    TITLE_CHAR_LIMIT: 60,       // Máximo de caracteres para título
    
    // Justificação de texto
    JUSTIFY_MIN_LENGTH: 60,     // Mínimo para justificar
    
    // Formatação de lista
    LIST_INDENT: 5,             // Indentação (mm)
    LIST_BULLET_CHAR: '•',
    
    // Área utilizável (getters dinâmicos)
    get USABLE_WIDTH() { return this.PAGE_WIDTH - (2 * this.MARGIN); },
    get USABLE_HEIGHT() { return this.PAGE_HEIGHT - (2 * this.MARGIN); }
}
```

### FORMATTING

Constantes específicas para exportação DOCX.

```javascript
FORMATTING = {
    DOCX_TITLE_SIZE: 28,        // 14pt (half-points)
    DOCX_BODY_SIZE: 22,         // 11pt
    DOCX_EMPTY_SIZE: 24,        // 12pt para linhas vazias
    DOCX_TITLE_SPACING_BEFORE: 200,
    DOCX_TITLE_SPACING_AFTER: 200,
    DOCX_BODY_SPACING_AFTER: 120,
    DOCX_EMPTY_SPACING_AFTER: 100,
    DOCX_SEPARATOR_SPACING: 100
}
```

### VALIDATION

Constantes para validação de conteúdo e timeouts.

```javascript
VALIDATION = {
    MIN_CONTENT_LENGTH: 50,         // Caracteres mínimos
    LIBRARY_LOAD_TIMEOUT: 10000,    // 10 segundos
    DOM_UPDATE_DELAY_MS: 50         // Delay para atualização do DOM
}
```

### PATTERNS

Expressões regulares para detecção de padrões no conteúdo.

```javascript
PATTERNS = {
    HEAVY_SEPARATOR: /^[=]{3,}$/,     // Separador pesado: ===
    LIGHT_SEPARATOR: /^[_]{3,}$/,     // Separador leve: ___
    UPPERCASE_CHARS: /^[A-ZÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ\s]+$/
}
```

### MODEL_TITLES

Mapeamento de identificadores de modelo para títulos de documentos.

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

## Métodos Públicos

### Inicialização e Configuração

#### `init()`
```javascript
init(): void
```
Inicializa o exportador, configurando listeners de eventos e observer de mutação.

**Comportamento:**
- Configura listeners de eventos do DOM
- Não carrega bibliotecas imediatamente (carregamento sob demanda)

---

#### `loadLibraries()`
```javascript
loadLibraries(): void
```
Carrega as bibliotecas jsPDF e docx.js sob demanda.

**Bibliotecas carregadas:**
- jsPDF 2.5.1
- docx.js 7.8.0

---

### Carregamento de Bibliotecas

#### `loadJSPDF()`
```javascript
loadJSPDF(): void
```
Carrega jsPDF do CDN principal (jsdelivr).

**CDN:** `https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js`

**Comportamento:**
- Verifica se já está sendo carregado
- Usa SRI (Subresource Integrity) para segurança
- Chama `loadJSPDFFallback()` em caso de falha

---

#### `loadJSPDFFallback()`
```javascript
loadJSPDFFallback(): void
```
Carrega jsPDF do CDN alternativo (unpkg).

**CDN Fallback:** `https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js`

---

#### `loadDocxJS()`
```javascript
loadDocxJS(): void
```
Carrega docx.js como módulo ES6.

**CDN:** `https://cdn.jsdelivr.net/npm/docx@7.8.0/+esm`

**Comportamento:**
- Tenta carregamento como ES Module
- Dispara evento customizado `docxLoaded` quando carregado
- Fallback para `loadDocxJSFallback()` em caso de erro

---

#### `loadDocxJSFallback()`
```javascript
loadDocxJSFallback(): void
```
Carrega docx.js no formato UMD do CDN alternativo.

**CDN Fallback:** `https://unpkg.com/docx@7.8.0/build/index.js`

---

### Gerenciamento de UI

#### `setupEventListeners()`
```javascript
setupEventListeners(): void
```
Configura listeners de eventos para o estado do DOM.

**Comportamento:**
- Aguarda `DOMContentLoaded` se documento ainda está carregando
- Chama `attachExportButtons()` quando DOM está pronto

---

#### `setupMutationObserver()`
```javascript
setupMutationObserver(): void
```
Configura observer para detectar adição dinâmica de botões de exportação.

**Observa:**
- Mudanças na árvore do DOM
- Adições de elementos filhos
- Subtree completa

**Uso:** Detecta quando botões de exportação são adicionados dinamicamente (ex: após geração de modelo).

---

#### `cleanup()`
```javascript
cleanup(): void
```
Desconecta o mutation observer para prevenir vazamentos de memória.

---

#### `attachExportButtons()`
```javascript
attachExportButtons(): void
```
Anexa event listeners aos botões de exportação.

**Botões Gerenciados:**
- `#pdfBtn` - Exportação PDF
- `#printBtn` - Exportação DOCX (reutilizado)
- `#copyBtn` - Copiar para área de transferência

**Comportamento:**
- Adiciona atributo `data-export-listener` para prevenir múltiplas associações
- Gerencia estado de loading dos botões
- Reset de zoom antes de exportar PDF
- Notificações de sucesso/erro

---

### Exportação de Documentos

#### `exportPDF(modelId)`
```javascript
exportPDF(modelId: string = 'documento'): Promise<Object>
```

Orquestrador principal para exportação PDF.

**Parâmetros:**
- `modelId` (string): Identificador do modelo de documento

**Retorna:**
```javascript
Promise<{
    success: boolean,
    filename: string,
    method: string,
    pages: number,
    message: string
}>
```

**Comportamento:**
1. Obtém conteúdo do modelo de dados
2. Determina título apropriado do documento
3. Delega para `exportPDFVector()`

---

#### `exportPDFVector(content, title, modelId)`
```javascript
exportPDFVector(
    content: string, 
    title: string = 'Documento Trabalhista',
    modelId: string = 'documento'
): Promise<Object>
```

Gera PDF com texto 100% vetorial usando jsPDF.

**Parâmetros:**
- `content` (string): Conteúdo do documento em texto puro
- `title` (string): Título do documento
- `modelId` (string): ID do modelo para nome do arquivo

**Retorna:**
```javascript
Promise<{
    success: boolean,
    filename: string,
    method: 'vector',
    pages: number,
    message: string
}>
```

**Características:**
- Parsing semântico do conteúdo
- Suporte para múltiplas páginas
- Texto vetorial totalmente selecionável
- Formatação rica (negrito, listas, campos)
- Linhas decorativas ao redor do título
- Download automático

**Algoritmo:**
1. Carrega jsPDF se necessário (com timeout de 10s)
2. Cria documento PDF A4
3. Faz parsing do conteúdo em estrutura semântica
4. Renderiza cada bloco com formatação apropriada
5. Gerencia quebras de página automáticas
6. Sanitiza nome do arquivo
7. Faz download do PDF

---

#### `exportToPDFViaPrint(filename)`
```javascript
exportToPDFViaPrint(filename: string = 'ModeloTrabalhista'): Promise<Object>
```

Método de fallback para exportação via diálogo de impressão nativo.

**Parâmetros:**
- `filename` (string): Nome do arquivo

**Retorna:**
```javascript
Promise<{
    success: boolean,
    filename: string,
    method: 'print',
    message: string
}>
```

**Comportamento:**
- Abre nova janela com conteúdo HTML
- Aplica estilos otimizados para impressão
- Abre diálogo de impressão automaticamente
- Usuário pode "Salvar como PDF"

**Nota:** Este método não é chamado atualmente pelo orquestrador principal, mantido como fallback para implementação futura.

---

#### `exportToDOCX(content, filename)`
```javascript
exportToDOCX(
    content: string, 
    filename: string = 'ModeloTrabalhista'
): Promise<void>
```

Exporta documento no formato Microsoft Word (.docx).

**Parâmetros:**
- `content` (string): Conteúdo do documento
- `filename` (string): Nome do arquivo

**Dependência:** Requer docx.js carregado

**Comportamento:**
1. Carrega docx.js sob demanda (timeout 15s)
2. Parsing de linhas do conteúdo
3. Identifica títulos (maiúsculas)
4. Identifica campos (formato "Label: Valor")
5. Cria documento DOCX com formatação
6. Download automático via Blob

**Formatação aplicada:**
- Títulos: 14pt, negrito, centralizado
- Corpo: 11pt
- Campos: Label negrito, valor normal
- Linhas vazias preservadas
- Separadores convertidos em linhas vazias

---

#### `exportToDOCXFallback(content, filename)`
```javascript
exportToDOCXFallback(
    content: string, 
    filename: string
): void
```

Fallback quando docx.js não está disponível - exibe erro ao usuário.

---

### Utilitários de Conteúdo

#### `getDocumentTextForPDF()`
```javascript
getDocumentTextForPDF(): string | null
```

Obtém conteúdo de texto puro do modelo de dados da aplicação.

**Retorna:** String com conteúdo ou `null` se não encontrado

**Fonte de Dados:**
- Primário: `window.app.getDocumentContentForPDF()`
- Este método garante que o PDF seja 100% vetorial e independente do preview DOM

**Validação:** Conteúdo deve ter pelo menos 50 caracteres (`MIN_CONTENT_LENGTH`)

---

#### `getDocumentHTML()`
```javascript
getDocumentHTML(): string | null
```

Extrai conteúdo HTML do documento usando hierarquia de seletores.

**Retorna:** HTML string ou `null` se não encontrado

**Seletores (em ordem de prioridade):**
1. `#documentPreview .document-content`
2. `#documentPreview`
3. `#modelo-text`
4. `#textoModelo`
5. `#documento-texto`
6. `#conteudoModelo`
7. `.modelo-texto`
8. `.documento-conteudo`
9. `#previewModelo`
10. `.preview-content`

**Uso:** Principalmente por `exportToPDFViaPrint()` para método de impressão.

---

#### `getDocumentContent()`
```javascript
getDocumentContent(): string
```

Extrai conteúdo de texto puro usando múltiplas estratégias de fallback.

**Retorna:** String com conteúdo (nunca null, retorna mensagem padrão em caso de falha)

**Estratégia de Extração:**
1. **Primário:** Seletores específicos do modelo (mesmo que `getDocumentHTML()`)
2. **Fallback 1:** Elementos de preview (`[id*="preview"]`, `[class*="preview"]`, etc.)
3. **Fallback 2:** Elemento com maior quantidade de texto na página
4. **Último Recurso:** Mensagem padrão

**Validação:** Conteúdo deve ter pelo menos 50 caracteres

---

#### `copyToClipboard(content)`
```javascript
copyToClipboard(content: string): Promise<Object>
```

Copia conteúdo para área de transferência.

**Parâmetros:**
- `content` (string): Texto a copiar

**Retorna:**
```javascript
Promise<{
    success: boolean,
    message: string
}>
```

**Métodos (em ordem de tentativa):**
1. **Clipboard API** (moderno): `navigator.clipboard.writeText()`
2. **Fallback:** `document.execCommand('copy')` com textarea temporária

---

### Utilitários de Formatação

#### `sanitizeFilename(filename)`
```javascript
sanitizeFilename(filename: string): string
```

Remove caracteres especiais de nomes de arquivo.

**Parâmetros:**
- `filename` (string): Nome original

**Retorna:** String sanitizada

**Comportamento:**
- Remove: `/ \ : * ? " < > |`
- Substitui espaços por underscores
- Limita a 255 caracteres

---

#### `isTitleLine(line)`
```javascript
isTitleLine(line: string): boolean
```

Determina se uma linha deve ser tratada como título.

**Parâmetros:**
- `line` (string): Linha de texto

**Critérios:**
1. Texto em maiúsculas (incluindo acentos)
2. Menos de 60 caracteres
3. Não vazia

**Retorna:** `true` se for título, `false` caso contrário

---

#### `parseDocumentToSemanticStructure(htmlContent)`
```javascript
parseDocumentToSemanticStructure(htmlContent: string): Array<Object>
```

Converte HTML em estrutura semântica de blocos.

**Parâmetros:**
- `htmlContent` (string): HTML do documento

**Retorna:** Array de objetos de bloco semântico

**Tipos de Bloco:**
1. `companyName` - Nome da empresa
2. `companyAddress` - Endereço da empresa
3. `documentTitle` - Título do documento
4. `recipient` - Destinatário
5. `opening` - Abertura (ex: "Prezado(a) Senhor(a)")
6. `paragraph` - Parágrafo normal
7. `field` - Campo (Label: Valor)
8. `listItem` - Item de lista
9. `signature` - Bloco de assinatura
10. `date` - Data
11. `location` - Local
12. `heavySeparator` - Separador pesado (===)
13. `lightSeparator` - Separador leve (___)
14. `emptyLine` - Linha vazia
15. `title` - Título intermediário

**Estrutura do Bloco:**
```javascript
{
    type: string,           // Tipo do bloco
    content: string,        // Conteúdo textual
    label?: string,         // Para tipo 'field'
    value?: string,         // Para tipo 'field'
    formatting?: Array      // Tags de formatação (strong, em)
}
```

---

### Renderização PDF

#### `renderParagraphWithFormatting(pdf, block, yPosition, currentPageCount, config)`
```javascript
renderParagraphWithFormatting(
    pdf: jsPDF,
    block: Object,
    yPosition: number,
    currentPageCount: number,
    config: Object
): number
```

Renderiza parágrafo com formatação mista (negrito/normal).

**Parâmetros:**
- `pdf` (jsPDF): Instância do jsPDF
- `block` (Object): Bloco de parágrafo
- `yPosition` (number): Posição Y atual (mm)
- `currentPageCount` (number): Contador de páginas
- `config` (Object): Configuração PDF

**Retorna:** Nova posição Y após renderização

**Características:**
- Suporta negrito inline
- Justificação de texto para parágrafos longos
- Quebra de linha automática
- Quebra de página quando necessário

---

#### `renderFieldWithFormatting(pdf, block, yPosition, currentPageCount, config)`
```javascript
renderFieldWithFormatting(
    pdf: jsPDF,
    block: Object,
    yPosition: number,
    currentPageCount: number,
    config: Object
): number
```

Renderiza campo (Label: Valor) com formatação.

**Parâmetros:** Mesmos que `renderParagraphWithFormatting`

**Retorna:** Nova posição Y após renderização

**Formatação:**
- Label em negrito
- Valor em texto normal
- Alinhamento à esquerda
- Quebra de página se necessário

---

#### `drawDecorativeLine(pdf, yPosition, config)`
```javascript
drawDecorativeLine(
    pdf: jsPDF,
    yPosition: number,
    config: Object
): void
```

Desenha linha horizontal decorativa.

**Parâmetros:**
- `pdf` (jsPDF): Instância do jsPDF
- `yPosition` (number): Posição Y da linha
- `config` (Object): Configuração PDF

**Uso:** Linhas decorativas ao redor do título do documento

---

### Notificações

#### `showNotification(message, type)`
```javascript
showNotification(
    message: string, 
    type: string = 'info'
): void
```

Exibe notificação toast ao usuário.

**Parâmetros:**
- `message` (string): Texto da notificação
- `type` (string): Tipo da notificação

**Tipos Suportados:**
- `'success'` - Verde (✅)
- `'error'` - Vermelho (❌)
- `'info'` - Azul (ℹ️)
- `'warning'` - Amarelo (⚠️)

**Comportamento:**
- Fade-in animation (0.3s)
- Auto-remove após 3 segundos
- Fade-out animation (0.3s)
- Posicionado no topo centralizado

**CSS Classes Aplicadas:**
- `export-notification`
- `export-notification-${type}`
- `show` (para animação)

---

## Dependências Externas

### jsPDF 2.5.1

**Propósito:** Geração de documentos PDF com texto vetorial

**Carregamento:**
- Primário: `https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js`
- Fallback: `https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js`

**Formato:** UMD (Universal Module Definition)

**Segurança:** SRI (Subresource Integrity) com hash SHA-384

**Uso:**
```javascript
const { jsPDF } = window.jspdf;
const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
});
```

**Recursos Utilizados:**
- Criação de documentos A4
- Texto com múltiplas fontes e tamanhos
- Negrito via setFont()
- Linhas (line drawing)
- Múltiplas páginas (addPage)
- Justificação de texto
- Download automático (save)

---

### docx.js 7.8.0

**Propósito:** Geração de documentos Microsoft Word (.docx)

**Carregamento:**
- Primário: `https://cdn.jsdelivr.net/npm/docx@7.8.0/+esm` (ES Module)
- Fallback: `https://unpkg.com/docx@7.8.0/build/index.js` (UMD)

**Formato:** ES6 Module (com fallback UMD)

**Segurança:** SRI com hash SHA-384

**Uso:**
```javascript
const { Document, Paragraph, TextRun, AlignmentType, Packer } = window.docx;
const doc = new Document({
    sections: [{
        children: [
            new Paragraph({
                text: "Conteúdo",
                alignment: AlignmentType.LEFT
            })
        ]
    }]
});
```

**Recursos Utilizados:**
- Document, Paragraph, TextRun
- AlignmentType (LEFT, CENTER, JUSTIFIED)
- Tamanhos de fonte (size em half-points)
- Negrito (bold: true)
- Espaçamento entre parágrafos
- Geração de Blob
- Download via saveAs (FileSaver.js)

---

### Clipboard API

**Propósito:** Copiar texto para área de transferência

**API Nativa do Browser:**
```javascript
navigator.clipboard.writeText(text)
```

**Fallback:** `document.execCommand('copy')` para navegadores antigos

**Compatibilidade:**
- Moderno: Chrome 63+, Firefox 53+, Safari 13.1+
- Fallback: Todos os navegadores modernos

---

## Padrões de Projeto

### 1. Singleton Pattern

**Implementação:**
```javascript
if (!window.documentExporter) {
    window.documentExporter = new DocumentExporter();
}
```

**Propósito:** Garantir uma única instância do exportador na aplicação

---

### 2. Lazy Loading Pattern

**Implementação:**
```javascript
// Bibliotecas não são carregadas no init()
init() {
    // Não carrega bibliotecas aqui
    this.setupEventListeners();
}

// Carregadas apenas quando necessário
async exportPDF() {
    if (typeof window.jspdf === 'undefined') {
        this.loadLibraries();
        await waitForLibrary();
    }
}
```

**Propósito:** Melhorar performance inicial, carregar recursos apenas quando necessário

---

### 3. Observer Pattern

**Implementação:**
```javascript
setupMutationObserver() {
    this.mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                this.attachExportButtons();
            }
        });
    });
    this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}
```

**Propósito:** Detectar adição dinâmica de botões no DOM

---

### 4. Strategy Pattern

**Implementação:**
```javascript
async copyToClipboard(content) {
    // Estratégia 1: Clipboard API moderna
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(content);
            return { success: true };
        } catch (err) {}
    }
    
    // Estratégia 2: execCommand fallback
    const textarea = document.createElement('textarea');
    // ... implementação fallback
}
```

**Propósito:** Múltiplas estratégias de execução com fallbacks

---

### 5. Chain of Responsibility

**Implementação:**
```javascript
getDocumentContent() {
    // Handler 1: Seletores específicos
    for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element && isValid(element)) {
            return element.textContent;
        }
    }
    
    // Handler 2: Elementos de preview
    for (const element of previewElements) {
        if (isValid(element)) {
            return element.textContent;
        }
    }
    
    // Handler 3: Maior elemento de texto
    // ...
    
    // Handler final: Mensagem padrão
    return 'Nenhum conteúdo disponível';
}
```

**Propósito:** Cascata de tentativas até encontrar conteúdo válido

---

### 6. Builder Pattern (Semantic Parsing)

**Implementação:**
```javascript
parseDocumentToSemanticStructure(htmlContent) {
    const blocks = [];
    // Constrói estrutura gradualmente
    blocks.push({ type: 'companyName', content: '...' });
    blocks.push({ type: 'paragraph', content: '...' });
    // ...
    return blocks;
}
```

**Propósito:** Construção gradual de estrutura complexa

---

### 7. Facade Pattern

**Implementação:**
```javascript
async exportPDF(modelId) {
    // Fachada que esconde complexidade
    const content = this.getDocumentTextForPDF();
    const title = this.MODEL_TITLES[modelId];
    return await this.exportPDFVector(content, title, modelId);
}
```

**Propósito:** Interface simples para operação complexa

---

### 8. Configuration Object Pattern

**Implementação:**
```javascript
this.PDF_CONFIG = {
    PAGE_WIDTH: 210,
    MARGIN: 20,
    // ... todas as configurações centralizadas
    get USABLE_WIDTH() { return this.PAGE_WIDTH - (2 * this.MARGIN); }
};
```

**Propósito:** Centralizar configurações, evitar magic numbers

---

## Exemplos de Uso

### Exemplo 1: Exportar PDF Programaticamente

```javascript
// Obter instância global
const exporter = window.documentExporter;

// Exportar PDF de um modelo específico
await exporter.exportPDF('demissao');
// Resultado: Download de "Pedido_de_Demissao.pdf"
```

---

### Exemplo 2: Exportar DOCX

```javascript
const exporter = window.documentExporter;

// Obter conteúdo do documento
const content = exporter.getDocumentContent();

// Exportar para DOCX
await exporter.exportToDOCX(content, 'MeuDocumento');
// Resultado: Download de "MeuDocumento.docx"
```

---

### Exemplo 3: Copiar para Área de Transferência

```javascript
const exporter = window.documentExporter;

// Obter conteúdo
const content = exporter.getDocumentContent();

// Copiar
const result = await exporter.copyToClipboard(content);

if (result.success) {
    console.log('✅ Copiado com sucesso!');
} else {
    console.error('❌ Erro ao copiar:', result.message);
}
```

---

### Exemplo 4: Uso via Botões HTML

```html
<!-- Botões que o exportador detecta automaticamente -->
<button id="pdfBtn">
    <i class="fas fa-file-pdf"></i> Gerar PDF
</button>

<button id="printBtn">
    <i class="fas fa-file-word"></i> Gerar DOCX
</button>

<button id="copyBtn">
    <i class="fas fa-copy"></i> Copiar Texto
</button>

<script>
    // Exportador anexa listeners automaticamente via attachExportButtons()
    // Nenhum código adicional necessário!
</script>
```

---

### Exemplo 5: Notificação Customizada

```javascript
const exporter = window.documentExporter;

// Notificação de sucesso
exporter.showNotification('Operação concluída com sucesso!', 'success');

// Notificação de erro
exporter.showNotification('Erro ao processar arquivo', 'error');

// Notificação informativa
exporter.showNotification('Processando...', 'info');

// Notificação de aviso
exporter.showNotification('Arquivo muito grande', 'warning');
```

---

### Exemplo 6: Criar PDF com Conteúdo Customizado

```javascript
const exporter = window.documentExporter;

// Conteúdo customizado
const content = `
MINHA EMPRESA LTDA
Rua Exemplo, 123 - São Paulo/SP

CARTA DE APRESENTAÇÃO

Prezados Senhores,

Apresentamos nossa proposta de serviços.

Atenciosamente,

_____________________________
João da Silva
Diretor
`;

// Gerar PDF
await exporter.exportPDFVector(
    content, 
    'Carta de Apresentação',
    'carta_apresentacao'
);
```

---

## Fluxos de Execução

### Fluxo 1: Exportação PDF Completa

```
Usuário clica em "Gerar PDF"
    │
    ▼
attachExportButtons() captura evento
    │
    ▼
Botão desabilitado + spinner exibido
    │
    ▼
Zoom resetado (ui.resetZoom)
    │
    ▼
exportPDF('modelo_id') chamado
    │
    ▼
getDocumentTextForPDF()
    ├─► window.app.getDocumentContentForPDF() [primário]
    └─► null [fallback]
    │
    ▼
Verifica MIN_CONTENT_LENGTH (50 chars)
    │
    ▼
Determina título: MODEL_TITLES[modelId]
    │
    ▼
exportPDFVector(content, title, modelId)
    │
    ▼
Verifica se jsPDF está carregado
    ├─► Não: loadLibraries() + aguarda 10s
    └─► Sim: continua
    │
    ▼
Cria instância jsPDF (A4, portrait)
    │
    ▼
parseDocumentToSemanticStructure(content)
    ├─► Identifica blocos semânticos
    ├─► Extrai formatação (bold, campos, listas)
    └─► Retorna array de blocos
    │
    ▼
Loop pelos blocos semânticos:
    ├─► companyName: renderiza centralizado, fonte 11pt
    ├─► companyAddress: renderiza centralizado
    ├─► documentTitle: linhas decorativas + centralizado + bold
    ├─► paragraph: renderParagraphWithFormatting()
    ├─► field: renderFieldWithFormatting() (label bold)
    ├─► listItem: indentado com bullet
    ├─► signature: linha + nome
    ├─► emptyLine: espaço vertical
    └─► ... outros tipos
    │
    ▼
Verifica necessidade de nova página
    ├─► yPosition > USABLE_HEIGHT - 30?
    └─► Sim: pdf.addPage()
    │
    ▼
Finaliza renderização
    │
    ▼
sanitizeFilename(title)
    │
    ▼
pdf.save(filename + '.pdf')
    │
    ▼
showNotification('✅ PDF gerado', 'success')
    │
    ▼
Restaura botão + zoom original
    │
    ▼
Retorna { success: true, filename, pages }
```

---

### Fluxo 2: Exportação DOCX

```
Usuário clica em "Gerar DOCX"
    │
    ▼
attachExportButtons() captura evento
    │
    ▼
Botão desabilitado + spinner
    │
    ▼
getDocumentContent() [cascata de seletores]
    │
    ▼
exportToDOCX(content, 'ModeloTrabalhista')
    │
    ▼
Verifica se docx.js está carregado
    ├─► Não: loadLibraries() + aguarda 15s
    └─► Sim: continua
    │
    ▼
Split conteúdo em linhas
    │
    ▼
Loop pelas linhas:
    ├─► Linha vazia: Paragraph com espaço
    ├─► Separador (===): Paragraph vazio
    ├─► Título (uppercase): Paragraph centralizado, bold, 14pt
    ├─► Campo (Label: Valor): Label bold + Valor normal
    └─► Texto normal: Paragraph 11pt, esquerda
    │
    ▼
Cria Document com sections
    │
    ▼
Packer.toBlob(doc)
    │
    ▼
saveAs(blob, filename + '.docx')
    │
    ▼
showNotification('✅ DOCX gerado', 'success')
    │
    ▼
Restaura botão
```

---

### Fluxo 3: Carregamento de Biblioteca com Fallback

```
exportPDF() necessita jsPDF
    │
    ▼
typeof window.jspdf === 'undefined'?
    │
    ▼ Sim
loadLibraries() chamado
    │
    ▼
loadJSPDF()
    │
    ▼
Verifica se script já existe no DOM
    ├─► Sim: retorna (previne duplicação)
    └─► Não: continua
    │
    ▼
Cria <script> tag
    ├─► src: jsdelivr CDN
    ├─► crossOrigin: 'anonymous'
    └─► integrity: SHA-384 hash
    │
    ▼
Anexa ao <head>
    │
    ▼
Aguarda evento onload
    │
    ├─► Sucesso?
    │   ├─► libsLoaded.jspdf = true
    │   └─► Retorna
    │
    └─► Erro (onerror)?
        │
        ▼
    loadJSPDFFallback()
        │
        ▼
    Tenta unpkg CDN
        │
        ├─► Sucesso: libsLoaded.jspdf = true
        └─► Erro: console.warn()
```

---

## Tratamento de Erros

### Estratégias de Tratamento

#### 1. Try-Catch em Métodos Assíncronos

```javascript
async exportPDF(modelId) {
    try {
        // Lógica de exportação
        return await this.exportPDFVector(content, title, modelId);
    } catch (error) {
        console.error('Erro no orquestrador de PDF:', error);
        this.showNotification(`Erro ao gerar PDF: ${error.message}`, 'error');
        throw error;
    }
}
```

---

#### 2. Validação de Conteúdo

```javascript
getDocumentTextForPDF() {
    const content = window.app.getDocumentContentForPDF();
    
    // Validação de comprimento mínimo
    if (content && content.length > this.VALIDATION.MIN_CONTENT_LENGTH) {
        return content;
    }
    
    console.warn('⚠️ No content available from data model');
    return null;
}
```

---

#### 3. Timeouts para Carregamento

```javascript
await new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
        if (typeof window.jspdf !== 'undefined') {
            clearInterval(checkInterval);
            resolve();
        }
    }, 100);
    
    // Timeout após 10 segundos
    setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Timeout ao carregar jsPDF'));
    }, this.VALIDATION.LIBRARY_LOAD_TIMEOUT);
});
```

---

#### 4. Fallbacks em Cascata

```javascript
// Fallback 1: Clipboard API
if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
        await navigator.clipboard.writeText(content);
        return { success: true };
    } catch (err) {
        console.warn('Clipboard API failed, trying fallback');
    }
}

// Fallback 2: execCommand
try {
    const textarea = document.createElement('textarea');
    // ... implementação fallback
    document.execCommand('copy');
    return { success: true };
} catch (err) {
    return { success: false, message: err.message };
}
```

---

#### 5. Mensagens de Erro Amigáveis

```javascript
catch (error) {
    const userMessage = error.message.includes('timeout') 
        ? 'Tempo esgotado ao carregar biblioteca. Verifique sua conexão.'
        : `Erro ao gerar documento: ${error.message}`;
    
    this.showNotification(userMessage, 'error');
}
```

---

### Tipos de Erro Tratados

| Tipo de Erro | Tratamento |
|--------------|------------|
| **Biblioteca não carregada** | Tentativa de carregamento + timeout + fallback CDN |
| **Conteúdo vazio** | Validação + mensagem + cascata de seletores |
| **Timeout de rede** | Mensagem de erro + sugestão de verificar conexão |
| **Popup bloqueado** | Mensagem informando para permitir popups |
| **Clipboard negado** | Fallback para execCommand |
| **DOM não encontrado** | Múltiplos seletores + fallback para maior elemento |
| **Erro de formatação** | Log de erro + continua renderização |

---

## Considerações de Performance

### Otimizações Implementadas

1. **Lazy Loading**: Bibliotecas carregadas apenas quando necessárias
2. **Singleton**: Uma única instância do exportador
3. **Mutation Observer Eficiente**: Desconexão após anexar botões
4. **Seletores Específicos**: Uso de IDs antes de classes
5. **Validação Early**: Verificação de conteúdo mínimo antes de processar
6. **Cache de Estado**: `libsLoaded` previne recarregamento

---

### Métricas Típicas

| Operação | Tempo Estimado |
|----------|----------------|
| Inicialização (init) | < 10ms |
| Carregamento jsPDF | 200-500ms |
| Carregamento docx.js | 300-700ms |
| Parsing semântico (200 linhas) | 10-20ms |
| Renderização PDF (1 página) | 50-100ms |
| Geração DOCX | 30-80ms |
| Cópia para clipboard | < 5ms |

---

## Limitações Conhecidas

1. **Formato PDF**:
   - Não suporta imagens embedded
   - Não suporta tabelas complexas
   - Fonte limitada (Helvetica/Times)

2. **Formato DOCX**:
   - Formatação básica apenas
   - Sem suporte a tabelas
   - Sem imagens

3. **Navegadores**:
   - IE11 não suportado (ES6+ usado)
   - Clipboard API não funciona em contextos inseguros (HTTP)

4. **Conteúdo**:
   - Parsing assume estrutura específica
   - HTML complexo pode não ser interpretado corretamente

---

## Manutenção e Extensão

### Como Adicionar Novo Formato de Exportação

```javascript
async exportToTXT(content, filename = 'documento') {
    try {
        // 1. Processar conteúdo
        const sanitized = content.trim();
        
        // 2. Criar blob
        const blob = new Blob([sanitized], { type: 'text/plain' });
        
        // 3. Download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.sanitizeFilename(filename)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        // 4. Notificar
        this.showNotification('✅ TXT gerado com sucesso!', 'success');
        
        return { success: true, filename: `${filename}.txt` };
    } catch (error) {
        console.error('Erro ao gerar TXT:', error);
        this.showNotification(`Erro ao gerar TXT: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
}
```

---

### Como Adicionar Novo Tipo de Bloco Semântico

```javascript
parseDocumentToSemanticStructure(htmlContent) {
    // ... código existente ...
    
    // Novo tipo: Citação (texto entre aspas)
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        blocks.push({
            type: 'quote',
            content: trimmed.slice(1, -1) // Remove aspas
        });
        continue;
    }
    
    // ... resto do código ...
}

// Na renderização PDF:
if (block.type === 'quote') {
    pdf.setFont('helvetica', 'italic');
    pdf.text(
        `"${block.content}"`,
        config.MARGIN + 10, // Indentado
        yPosition
    );
    pdf.setFont('helvetica', 'normal');
}
```

---

### Como Atualizar Versão de Biblioteca

```javascript
// 1. Atualizar URL do CDN
loadJSPDF() {
    script.src = 'https://cdn.jsdelivr.net/npm/jspdf@3.0.0/dist/jspdf.umd.min.js';
    
    // 2. Atualizar SRI hash (obter do CDN)
    script.integrity = 'sha384-NOVO_HASH_AQUI';
}

// 3. Testar todas as funcionalidades
// 4. Atualizar fallback também
```

---

## Glossário

| Termo | Definição |
|-------|-----------|
| **Vetorial** | Texto em PDF renderizado como vetores, permitindo seleção e cópia |
| **Semântico** | Estrutura que representa significado, não apenas aparência |
| **UMD** | Universal Module Definition - formato de módulo JavaScript |
| **ESM** | ES6 Module - formato moderno de módulo JavaScript |
| **SRI** | Subresource Integrity - verificação de integridade de recursos CDN |
| **CDN** | Content Delivery Network - rede de distribuição de conteúdo |
| **Fallback** | Método alternativo usado quando o principal falha |
| **Toast** | Notificação temporária que aparece e desaparece |
| **Mutation Observer** | API do navegador para detectar mudanças no DOM |
| **Half-point** | Unidade de tamanho de fonte (2 half-points = 1 point) |

---

## Changelog do Módulo

### Versão Atual (Estado do Código)
- ✅ 6 funções mortas removidas
- ✅ 28 console.log statements removidos
- ✅ 9 constantes não utilizadas removidas
- ✅ Implementação de exportação PDF vetorial
- ✅ Suporte a DOCX via docx.js 7.8.0
- ✅ Sistema de notificações toast
- ✅ Parsing semântico de conteúdo
- ✅ Múltiplos fallbacks para todas as operações
- ✅ Mutation observer para botões dinâmicos
- ✅ Carregamento lazy de bibliotecas

---

## Contato e Suporte

Para questões técnicas sobre este módulo:
1. Consulte esta documentação
2. Verifique os logs do console para diagnóstico
3. Revise o código-fonte em `/js/export.js`

---

**Documento gerado em:** 06/02/2026  
**Versão do Código:** Estado atual (1799 linhas)  
**Última Atualização:** Após remoção de código morto e otimizações
