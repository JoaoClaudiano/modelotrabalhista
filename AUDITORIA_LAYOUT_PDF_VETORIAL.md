# Auditoria do Layout PDF Vetorial - `exportPDFVector()`

**Data da Auditoria:** 2026-02-06  
**Arquivo Analisado:** `/js/export.js`  
**Função:** `exportPDFVector(content, filename)`  
**Linhas:** 657-766

---

## 1. MARGENS

### Valores Atuais
- **Margem Esquerda:** 20 mm
- **Margem Direita:** 20 mm  
- **Margem Superior:** 20 mm
- **Margem Inferior:** 20 mm

### Análise

✅ **FIXAS:** Sim, valor definido em constante `PDF_CONFIG.MARGIN = 20`

✅ **CONSISTENTES:** Sim, todas as 4 margens usam o mesmo valor (`config.MARGIN`)

✅ **ADEQUADAS PARA A4 JURÍDICO/INSTITUCIONAL:** Sim
- 20 mm está dentro do padrão institucional brasileiro (15-25 mm)
- Margens simétricas facilitam leitura e impressão frente/verso
- Adequadas para documentos trabalhistas/jurídicos

### Implementação
```javascript
// Linha 54
MARGIN: 20,

// Usado em:
// - Linha 688: yPosition inicial = config.MARGIN
// - Linha 710: yPosition resetado ao criar nova página = config.MARGIN
// - Linha 716: Centralização de títulos considera PAGE_WIDTH (inclui margens)
// - Linha 727: Largura útil para quebra de texto = config.USABLE_WIDTH (PAGE_WIDTH - 2*MARGIN)
// - Linha 738: Posição X do texto normal = config.MARGIN
```

---

## 2. TIPOGRAFIA

### Tamanhos de Fonte

#### Corpo do Texto
- **Valor:** 11 pt
- **Constante:** `PDF_CONFIG.FONT_SIZE = 11`
- **Linha de uso:** 724, 728, 696

#### Títulos
- **Valor:** 12 pt
- **Constante:** `PDF_CONFIG.TITLE_FONT_SIZE = 12`
- **Linha de uso:** 702, 705

### Unidade Utilizada
- **Declarada:** pt (pontos)
- **Convertida para:** mm (através do fator `0.3527`)
- **Fator de conversão:** `1 pt = 0.3527 mm` (usado para cálculos de line-height)

### Fontes Utilizadas

#### Corpo do Texto
- **Família:** Helvetica
- **Peso:** Normal
- **Linha 725:** `pdf.setFont('helvetica', 'normal')`

#### Títulos
- **Família:** Helvetica
- **Peso:** Bold
- **Linha 703:** `pdf.setFont('helvetica', 'bold')`

### Variação de Tamanho

⚠️ **POTENCIAL INCONSISTÊNCIA:**

Existem valores duplicados e não sincronizados:

1. **`PDF_CONFIG` (usado por `exportPDFVector`):**
   - `FONT_SIZE = 11`
   - `TITLE_FONT_SIZE = 12`

2. **`FORMATTING` (não usado por `exportPDFVector`, mas presente no mesmo arquivo):**
   - `BODY_FONT_SIZE = 11`
   - `TITLE_FONT_SIZE = 12`

**Análise:** Embora os valores sejam atualmente iguais, a duplicação cria risco de divergência futura. Se alguém alterar apenas `FORMATTING.BODY_FONT_SIZE`, o `exportPDFVector()` não será afetado, criando inconsistência entre métodos de exportação.

---

## 3. ESPAÇAMENTO VERTICAL

### Line-Height Efetivo

#### Corpo do Texto
- **Fator:** 1.4 (`PDF_CONFIG.LINE_HEIGHT_FACTOR = 1.4`)
- **Cálculo:** `(FONT_SIZE * 0.3527) * LINE_HEIGHT_FACTOR`
- **Resultado:** `(11 * 0.3527) * 1.4 = 5.42 mm`
- **Implementação:** Linha 728

#### Títulos
- **Fator:** 1.4 (mesmo fator)
- **Cálculo:** `(TITLE_FONT_SIZE * 0.3527) * LINE_HEIGHT_FACTOR + 3`
- **Resultado:** `(12 * 0.3527) * 1.4 + 3 = 7.95 mm`
- **Espaçamento extra:** +3 mm fixo adicionado
- **Implementação:** Linha 705

### Espaço Entre Parágrafos

❌ **NÃO EXISTE ESPAÇAMENTO ESPECÍFICO**

- O código não distingue entre "fim de parágrafo" e "linha dentro de parágrafo"
- Todas as linhas de texto normal recebem o mesmo line-height (5.42 mm)
- Não há espaçamento adicional entre parágrafos

### Espaço Antes/Depois de Títulos

#### Antes de Títulos
- **Valor:** Nenhum espaçamento adicional
- O título usa o espaçamento padrão da linha anterior

#### Depois de Títulos
- **Valor:** +3 mm embutido no line-height total
- **Implementação:** Linha 705 - `+ 3` adicionado ao cálculo
- Este espaço funciona como "espaço depois" do título

### Linhas Vazias

- **Espaçamento:** `line-height * 0.5 = 5.42 * 0.5 = 2.71 mm`
- **Implementação:** Linha 696
- **Análise:** Linha vazia cria metade do espaçamento de uma linha normal

### Avaliação

⚠️ **ESPAÇAMENTO COMPRIMIDO EM ALGUNS CENÁRIOS:**

1. **Falta de espaço entre parágrafos:** Parágrafos consecutivos não têm separação visual, apenas line-height
2. **Títulos sem espaço antes:** Um título logo após texto normal não tem respiro visual adicional
3. **Linha vazia é muito pequena:** 2.71 mm pode ser insuficiente para separação clara

✅ **CONSISTENTE:**
- Line-height factor (1.4) é aplicado uniformemente
- Fórmula de cálculo é repetível

---

## 4. CENTRALIZAÇÃO E ALINHAMENTO

### Detecção de Títulos

**Função:** `isTitleLine(line)` (linhas 80-86)

**Critérios:**
1. Comprimento < 60 caracteres
2. Comprimento > 0
3. Todo o texto em UPPERCASE
4. Contém apenas letras maiúsculas, espaços e caracteres acentuados latinos

**Regex utilizado:**
```javascript
UPPERCASE_CHARS: /^[A-ZÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ\s]+$/
```

### Centralização de Títulos

**Método:** Matemático, baseado em largura do texto

**Implementação (linhas 714-718):**
```javascript
// 1. Mede a largura do texto renderizado
const textWidth = pdf.getTextWidth(trimmed);

// 2. Calcula posição X para centralizar na página inteira (não na largura útil)
const xPosition = (config.PAGE_WIDTH - textWidth) / 2;

// 3. Renderiza o texto
pdf.text(trimmed, xPosition, yPosition);
```

### Análise da Centralização

❌ **PROBLEMA: Centralização ignora margens**

- **Cálculo atual:** `(PAGE_WIDTH - textWidth) / 2`
- **Largura considerada:** 210 mm (página inteira)
- **Resultado:** Texto centralizado em relação à página física, incluindo áreas de margem

✅ **MATEMATICAMENTE CORRETO:** O cálculo está correto para centralizar na página inteira

⚠️ **VISUALMENTE INCORRETO PARA DOCUMENTO ESTRUTURADO:**

Para documentos com margens, o ideal seria:
```javascript
// Centralizar na LARGURA ÚTIL, não na página inteira
const usableWidth = config.PAGE_WIDTH - (2 * config.MARGIN);
const xPosition = config.MARGIN + (usableWidth - textWidth) / 2;
```

**Por quê?**
- Documentos institucionais devem respeitar margens de forma consistente
- Títulos centralizados na página inteira ficam deslocados em relação ao texto do corpo
- O corpo do texto começa em `MARGIN` (20mm), mas o título pode começar antes disso se for curto

### Alinhamento do Corpo do Texto

**Tipo:** Left-aligned (alinhado à esquerda)

**Implementação:** Linha 738
```javascript
pdf.text(textLine, config.MARGIN, yPosition);
```

✅ **CONSISTENTE:** Todo texto normal inicia na margem esquerda (20 mm)

❌ **NÃO É JUSTIFIED:** O texto não é justificado (alinhamento em ambas as margens)
- Para documentos jurídicos/institucionais, justificação completa é mais comum
- jsPDF não oferece justificação automática (requer implementação manual)

---

## 5. LARGURA ÚTIL

### Valor Utilizado

**Constante:** `USABLE_WIDTH` (calculada dinamicamente)

**Fórmula:** `PAGE_WIDTH - (2 * MARGIN)`

**Cálculo:** `210 - (2 * 20) = 170 mm`

**Implementação:** Linha 60
```javascript
get USABLE_WIDTH() { return this.PAGE_WIDTH - (2 * this.MARGIN); }
```

### Uso no Código

**Linha 727:** Quebra automática de texto
```javascript
const textLines = pdf.splitTextToSize(trimmed, config.USABLE_WIDTH);
```

✅ **RESPEITA AS MARGENS:** Sim, perfeitamente

- A largura útil é calculada subtraindo ambas as margens
- O texto quebra corretamente dentro da área disponível
- Não há overflow horizontal

### Consistência

✅ **GETTER DINÂMICO:**
- `USABLE_WIDTH` é um getter, não um valor hardcoded
- Se `MARGIN` mudar, `USABLE_WIDTH` atualiza automaticamente
- Elimina risco de dessincronização

---

## 6. CONSISTÊNCIA

### Valores Reutilizados vs Hardcoded

#### ✅ Valores Bem Centralizados

**`PDF_CONFIG` object (linhas 49-62):**
- `PAGE_WIDTH: 210` ✅
- `PAGE_HEIGHT: 297` ✅
- `MARGIN: 20` ✅
- `FONT_SIZE: 11` ✅
- `TITLE_FONT_SIZE: 12` ✅
- `LINE_HEIGHT_FACTOR: 1.4` ✅

Todos são constantes reutilizáveis e bem nomeadas.

#### ⚠️ Valores Hardcoded Localmente

1. **Fator de conversão pt→mm: `0.3527`**
   - Aparece em: Linhas 696, 705, 728
   - **Problema:** Não está em constante nomeada
   - **Risco:** Se precisar ajustar, deve-se alterar em 3 lugares

2. **Espaçamento extra de título: `+ 3`**
   - Aparece em: Linha 705
   - **Problema:** "Magic number" sem contexto
   - **Sugestão:** Criar constante `TITLE_EXTRA_SPACING_MM = 3`

3. **Fator de linha vazia: `* 0.5`**
   - Aparece em: Linha 696
   - **Problema:** Não está nomeado
   - **Sugestão:** Criar constante `EMPTY_LINE_FACTOR = 0.5`

### Risco de Divergência Visual

⚠️ **MÉDIO RISCO**

**Motivo 1: Duplicação de Constantes**

O arquivo `export.js` possui dois conjuntos de constantes:
- `FORMATTING` (linhas 14-36) - Usado por outros métodos?
- `PDF_CONFIG` (linhas 48-62) - Usado por `exportPDFVector()`

Embora atualmente tenham valores similares, não há garantia de sincronização.

**Motivo 2: Valores Hardcoded**

- Fator `0.3527`, `+ 3`, `* 0.5` são magic numbers que podem ser alterados inconsistentemente

**Motivo 3: Lógica de Detecção de Título**

- A função `isTitleLine()` tem critérios específicos que não são documentados no PDF_CONFIG
- Limite de 60 caracteres é hardcoded na função (linha 82)

---

## RESUMO TÉCNICO

### Valores Numéricos (mm)

| Parâmetro | Valor | Unidade |
|-----------|-------|---------|
| Margem esquerda | 20 | mm |
| Margem direita | 20 | mm |
| Margem superior | 20 | mm |
| Margem inferior | 20 | mm |
| Largura página A4 | 210 | mm |
| Altura página A4 | 297 | mm |
| Largura útil | 170 | mm |
| Altura útil | 257 | mm |
| Fonte corpo | 11 | pt |
| Fonte título | 12 | pt |
| Line-height corpo | 5.42 | mm |
| Line-height título | 7.95 | mm |
| Espaço linha vazia | 2.71 | mm |

### Valores Numéricos (pt / fatores)

| Parâmetro | Valor |
|-----------|-------|
| Line-height factor | 1.4 |
| Conversão pt→mm | 0.3527 |
| Empty line factor | 0.5 |
| Título extra spacing | 3 mm |

---

## LISTA DE PROBLEMAS E INCONSISTÊNCIAS

### 🔴 Críticos

1. **Centralização de títulos ignora margens**
   - Títulos centralizados na página inteira (210mm)
   - Deveriam centralizar na largura útil (170mm)
   - Causa desalinhamento visual em relação ao corpo do texto

### 🟡 Moderados

2. **Ausência de espaçamento entre parágrafos**
   - Parágrafos consecutivos sem separação visual
   - Dificulta leitura de textos longos

3. **Títulos sem espaço antes**
   - Não há respiro visual entre texto e título seguinte
   - Apenas o espaço extra "depois" do título existe (+3mm)

4. **Duplicação de constantes**
   - `FORMATTING` e `PDF_CONFIG` têm valores similares não sincronizados
   - Risco de divergência futura entre métodos de exportação

5. **Linha vazia muito pequena**
   - 2.71 mm pode ser insuficiente para separação clara de seções

### 🟢 Leves

6. **Magic numbers hardcoded**
   - `0.3527` (conversão pt→mm)
   - `+ 3` (espaçamento título)
   - `* 0.5` (fator linha vazia)
   - `< 60` (limite de caracteres para título)

7. **Texto não justificado**
   - Documentos jurídicos normalmente usam justificação completa
   - Atualmente apenas left-aligned

8. **Detecção de título baseada em uppercase**
   - Funciona, mas não é flexível
   - Não suporta títulos em sentence case ou outras convenções

---

## LISTA DO QUE ESTÁ BOM E DEVE SER MANTIDO

### ✅ Estrutura e Organização

1. **Constantes centralizadas em `PDF_CONFIG`**
   - Fácil de encontrar e modificar
   - Nomes descritivos e claros

2. **Uso de getters para valores calculados**
   - `USABLE_WIDTH` e `USABLE_HEIGHT` calculados dinamicamente
   - Previne dessincronização

3. **Margens adequadas e simétricas**
   - 20mm é padrão institucional sólido
   - Simétrico facilita impressão frente/verso

### ✅ Implementação Técnica

4. **Quebra automática de texto**
   - `pdf.splitTextToSize()` funciona perfeitamente
   - Respeita largura útil corretamente

5. **Paginação automática**
   - Detecta quando precisa criar nova página
   - Reinicia `yPosition` corretamente

6. **Detecção de título robusta**
   - Critérios claros e testáveis
   - Regex inclui caracteres acentuados (importante para português)

7. **Fonte Helvetica**
   - Universalmente disponível em PDFs
   - Boa legibilidade
   - Adequada para documentos institucionais

### ✅ Tipografia

8. **Tamanhos de fonte adequados**
   - 11pt para corpo: legível e padrão
   - 12pt para títulos: diferenciação sutil mas efetiva

9. **Line-height 1.4**
   - Valor equilibrado para legibilidade
   - Nem comprimido, nem espaçado demais

10. **Conversão pt→mm correta**
    - Fator 0.3527 é matematicamente correto (1pt = 1/72 inch = 0.3527mm)

---

## RECOMENDAÇÕES (SEM ALTERAÇÕES)

### Para Futura Refatoração (quando solicitado)

1. **Corrigir centralização de títulos** para respeitar largura útil
2. **Adicionar espaçamento entre parágrafos** (ex: +2mm)
3. **Adicionar espaço antes de títulos** (ex: +4mm)
4. **Consolidar constantes** (eliminar duplicação entre `FORMATTING` e `PDF_CONFIG`)
5. **Nomear magic numbers** (criar constantes para 0.3527, 3, 0.5, 60)
6. **Aumentar linha vazia** de 2.71mm para ~4-5mm
7. **Considerar justificação** de texto para documentos jurídicos
8. **Documentar critérios** de detecção de título no código

### Manutenção dos Pontos Fortes

- ✅ Manter margens de 20mm
- ✅ Manter estrutura de constantes centralizadas
- ✅ Manter uso de getters dinâmicos
- ✅ Manter fontes e tamanhos atuais (11pt/12pt)
- ✅ Manter line-height factor de 1.4
- ✅ Manter Helvetica como fonte
- ✅ Manter quebra automática e paginação

---

## CONCLUSÃO

O código de `exportPDFVector()` demonstra uma implementação **sólida e bem estruturada**, com constantes centralizadas e lógica clara. Os tamanhos de fonte, margens e line-height são **apropriados para documentos institucionais brasileiros**.

No entanto, existem **oportunidades de melhoria** principalmente em:
- ✏️ Centralização de títulos (atualmente desalinhada)
- 📏 Espaçamento vertical (falta de respiro entre elementos)
- 🔄 Consolidação de constantes (eliminar duplicação)

A boa notícia é que todas as melhorias são **incrementais e não requerem reescrita completa**. A estrutura base está bem fundamentada.

---

**Fim da Auditoria**
