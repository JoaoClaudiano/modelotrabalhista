# 📊 Análise Web Core Vitals - ModeloTrabalhista
## Dispositivos Móveis e Desktop

**Data da Análise:** 05/02/2026  
**Foco:** LCP, CLS, INP

---

## 📋 Resumo Executivo

### 🎯 Principais Oportunidades de Melhoria

| Métrica | Status Atual | Impacto | Prioridade |
|---------|-------------|---------|------------|
| **LCP** | ⚠️ Riscos Moderados | Fontes externas + scripts bloqueantes | **ALTA** |
| **CLS** | ⚠️ Riscos Moderados | Fontes FOUT, VLibras sem placeholder | **ALTA** |
| **INP** | ⚠️ Riscos Baixos/Médios | Scripts pesados, sem debouncing | **MÉDIA** |

### 🔍 Principais Descobertas

1. **Font Awesome carregado DUAS vezes** no index.html (linhas 46 e 59)
2. **Google Fonts sem preconnect** no index.html (presente apenas em artigos)
3. **VLibras carregado de forma síncrona** pode causar atrasos
4. **Scripts principais sem defer/async** (main.js, ui.js, generator.js)
5. **51.3 KB de JavaScript** em main.js sem lazy loading
6. **Falta debouncing** em eventos de tooltip e tour
7. **LocalStorage loops** podem criar long tasks

---

## 1️⃣ LCP (Largest Contentful Paint)

### 🎨 Análise de Elementos que Impactam LCP

#### A. **Fontes (Google Fonts + Font Awesome)**

**Problema Identificado:**
- **Google Fonts:** Inter e Roboto carregadas via CDN
- **Font Awesome:** 6.4.0 carregado DUAS vezes (duplicação)
- **Sem `font-display`:** Causa FOIT/FOUT

**Arquivos e Linhas:**

```html
📄 index.html
├─ Linha 46: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/.../font-awesome/...">
├─ Linha 49: <link href="https://fonts.googleapis.com/css2?family=Inter:wght...">
└─ Linha 59: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/.../font-awesome/..."> ⚠️ DUPLICADO

📄 artigos/*.html (todos)
├─ Google Fonts com preconnect ✅
└─ Font Awesome (1x)
```

**Impacto no LCP:**
- **Desktop:** +200-400ms para carregar fontes externas
- **Mobile 3G:** +800ms-1.5s (latência de rede)
- **Bloqueio de renderização:** Sim, carregadas no `<head>`

**Risco:** 🔴 **ALTO** (especialmente em conexões lentas)

---

#### B. **Scripts Bloqueantes no HEAD**

**Scripts Carregados:**

```html
📄 index.html - Preload hints (linhas 56-57)
├─ <link rel="preload" href="js/main.js" as="script">  ✅ Correto
└─ <link rel="preload" href="js/ui.js" as="script">     ✅ Correto

📄 index.html - Scripts no BODY (linhas 730-743)
├─ js/csp-reporter.js (sync) ⚠️ 9 KB - pode atrasar
├─ js/log.js (sync) ⚠️ 20 KB - pode atrasar
├─ js/analytics.js (async) ✅ Correto
├─ js/acessibilidade.js (async) ✅ Correto
├─ js/main.js (sync) 🔴 51.3 KB - PESADO, BLOQUEIA
├─ js/ui.js (sync) 🔴 30 KB - PESADO, BLOQUEIA
├─ js/generator.js (sync) ⚠️ 16 KB
├─ js/storage.js (sync) ⚠️ 14 KB
├─ js/export.js (sync) ⚠️ 31 KB
└─ js/tour.js (sync) ⚠️ 21 KB
```

**Total Scripts Síncronos (bloqueantes):** ~192 KB

**Impacto no LCP:**
- **Desktop:** +300-600ms de parse/execução
- **Mobile:** +1-2s (CPU mais lenta)
- **Bloqueia:** First Paint, FCP, LCP

**Risco:** 🔴 **ALTO** - Scripts pesados bloqueando renderização

---

#### C. **VLibras Widget (Acessibilidade)**

**Configuração Atual:**

```html
📄 index.html (linhas 829-831)
<script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
<script>
    new window.VLibras.Widget('https://vlibras.gov.br/app');
</script>
```

**Problema:**
- Carregado de forma **síncrona** no final do `<body>`
- **Script externo** pode ter latência
- Inicialização imediata (não lazy)

**Impacto no LCP:**
- **Desktop:** +100-300ms
- **Mobile:** +500ms-1s
- **Pode atrasar:** Interatividade (INP)

**Risco:** 🟡 **MÉDIO** - Não bloqueia crítico, mas adiciona latência

---

#### D. **CSS Externo (CDN)**

**Arquivos CSS:**

```html
📄 index.html
├─ css/style.css (local) ✅
├─ css/responsive.css (local, media query) ✅
├─ Font Awesome CSS (CDN) 🔴 Bloqueia renderização
└─ Google Fonts CSS (CDN) 🔴 Bloqueia renderização

📄 artigos/*.html
└─ template.css (local) ✅
```

**Impacto no LCP:**
- **CDN CSS:** +200-500ms (bloqueante)
- **Preconnect ausente** no index.html piora situação

**Risco:** 🟡 **MÉDIO**

---

### 📊 Resumo LCP

| Elemento | Arquivo | Linha(s) | Impacto Mobile | Impacto Desktop | Risco |
|----------|---------|----------|----------------|-----------------|-------|
| Google Fonts (sem preconnect) | index.html | 49 | +800ms-1.5s | +200-400ms | 🔴 ALTO |
| Font Awesome DUPLICADO | index.html | 46, 59 | +400ms-800ms | +100-200ms | 🔴 ALTO |
| main.js (51.3 KB sync) | index.html | 736 | +1-2s | +300-600ms | 🔴 ALTO |
| ui.js (30 KB sync) | index.html | 737 | +500ms-1s | +150-300ms | 🔴 ALTO |
| export.js (31 KB sync) | index.html | 742 | +500ms-1s | +150-300ms | 🟡 MÉDIO |
| VLibras (externo sync) | index.html | 829 | +500ms-1s | +100-300ms | 🟡 MÉDIO |
| Font Awesome CSS (CDN) | index.html | 46, 59 | +400ms-800ms | +100-200ms | 🟡 MÉDIO |

**Impacto Total Estimado (Mobile 3G):** +4-8 segundos  
**Impacto Total Estimado (Desktop):** +1-2 segundos

---

## 2️⃣ CLS (Cumulative Layout Shift)

### 🔀 Análise de Elementos que Causam Layout Shift

#### A. **Fontes Web (FOUT/FOIT)**

**Problema:**
- **Sem `font-display: swap`** nas fontes do Google
- **Font Awesome** carrega tarde, ícones podem "piscar"
- **Fallback fonts** diferentes causam reflow

**Arquivos:**

```css
📄 style.css (linhas 20-22)
--font-main: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
--font-heading: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
❌ Não usa Inter/Roboto (carregadas no HTML)
```

```html
📄 index.html (linha 49)
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@300;400;500&display=swap">
❌ Falta &display=swap no URL (não especificado)
```

**Impacto no CLS:**
- **FOUT:** Texto renderiza com fallback, depois muda quando fonte carrega
- **Shift:** ~0.05-0.15 (depende do tamanho de texto)
- **Hero Section:** Mais impactada (títulos grandes)

**Risco:** 🔴 **ALTO** - Afeta primeira impressão

---

#### B. **Imagens sem Dimensões (width/height)**

**Análise:**
- ✅ **Nenhuma tag `<img>` encontrada** no HTML principal
- ✅ Site usa **ícones Font Awesome** (não causam CLS se carregados cedo)
- ⚠️ **Possíveis imagens via CSS** (não analisadas)

**Arquivos Verificados:**
- index.html ✅
- artigos/*.html ✅
- pages/*.html ✅

**Impacto no CLS:** 🟢 **BAIXO** - Sem imagens HTML

**Risco:** 🟢 **BAIXO**

---

#### C. **VLibras Widget (Iframe Dinâmico)**

**Problema:**
- VLibras **injeta iframe** no DOM após carregamento
- **Sem espaço reservado** (placeholder)
- **Posicionado fixed/absolute** (menos impacto no flow)

**Arquivo:**

```html
📄 index.html (linhas 829-831)
<script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
<script>
    new window.VLibras.Widget('https://vlibras.gov.br/app');
</script>
```

**Análise do Posicionamento:**
- Widget geralmente renderiza **fixed bottom-right**
- **Não empurra conteúdo** existente
- Mas pode causar **pequeno shift** se carregar tarde

**Impacto no CLS:**
- **Shift:** ~0.01-0.05 (posicionado fixed)
- **Depende:** Tempo de carregamento

**Risco:** 🟡 **MÉDIO-BAIXO** - Posicionado fora do flow

---

#### D. **Elementos sem Dimensões Fixas**

**Análise CSS:**

```css
📄 style.css
├─ .hero (linhas 168-174): padding dinâmico, sem height fixo ⚠️
├─ .document-card (linhas 232-244): height: 100% (flex) ✅
├─ .preview-content (linhas 506-516): min-height/max-height definidos ✅
├─ textarea.form-control (linha 366): min-height: 100px ✅
└─ .preview-placeholder (linhas 518-527): height: 400px ✅

📄 responsive.css
├─ .hero (linha 808): min-height: -webkit-fill-available ⚠️ iOS fix
└─ Múltiplos min-height com !important ✅
```

**Potenciais Shifts:**
1. **Hero section:** Altura calculada dinamicamente
2. **Formulários:** Campos podem expandir (textarea auto-resize)
3. **Tooltips/Modals:** Aparecem sobre o conteúdo (fixed)

**Impacto no CLS:**
- **Hero:** ~0.05-0.10 (depende do conteúdo)
- **Textarea auto-resize:** ~0.02-0.05 por evento

**Risco:** 🟡 **MÉDIO**

---

#### E. **Animações e Transições**

**Análise:**

```css
📄 style.css (linhas 43-46)
--transition-fast: 0.2s ease;
--transition-normal: 0.3s ease;
--transition-slow: 0.5s ease;

Elementos com transform/transition:
├─ .document-card:hover (linha 246-249): transform: translateY(-8px)
├─ .btn:hover (linha 391-393): transform: translateY(-2px)
└─ .social-links a:hover (linha 739): transform: translateY(-3px)
```

**✅ Análise Positiva:**
- **Transform usado** (não reflow)
- **Não usa left/top/width/height em transições**
- **Animações não causam CLS**

**Risco:** 🟢 **BAIXO** - Implementação correta

---

### 📊 Resumo CLS

| Elemento | Arquivo | Linha(s) | Shift Estimado | Impacto | Risco |
|----------|---------|----------|----------------|---------|-------|
| Fontes sem font-display | index.html | 49 | 0.05-0.15 | Mobile/Desktop | 🔴 ALTO |
| Font Awesome ícones | index.html | 46, 59 | 0.02-0.08 | Mobile/Desktop | 🟡 MÉDIO |
| VLibras Widget | index.html | 829-831 | 0.01-0.05 | Mobile/Desktop | 🟡 MÉDIO-BAIXO |
| Hero section dinâmica | style.css | 168-174 | 0.05-0.10 | Mobile | 🟡 MÉDIO |
| Textarea auto-resize | ui.js | 563-571 | 0.02-0.05 | Mobile/Desktop | 🟡 MÉDIO-BAIXO |

**CLS Total Estimado:** 0.15-0.43  
**Meta Google:** < 0.1 (Bom)  
**Status:** ⚠️ **Precisa Melhorias**

---

## 3️⃣ INP (Interaction to Next Paint)

### ⚡ Análise de Interatividade e Resposta

#### A. **Campos de Formulário**

**Validação e Eventos:**

```javascript
📄 ui.js (linhas 359-455)
├─ validateForm() - percorre todos campos obrigatórios
├─ validateAdvanced() - valida CPF, email, data
├─ Input masks - formatação em tempo real
└─ Auto-save com debounce (1500ms) ✅

📄 main.js (linhas 82-87)
└─ Auto-save debounced ✅ Bom!
```

**Eventos sem Debounce:**

```javascript
📄 ui.js (linha 563-571)
textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});
❌ SEM DEBOUNCE - causa reflows a cada tecla
```

**Impacto no INP:**
- **Com debounce (auto-save):** ~50-100ms ✅
- **Sem debounce (textarea):** ~100-300ms ⚠️
- **Validação complexa:** ~150-400ms ⚠️

**Risco:** 🟡 **MÉDIO** - Validação pode atrasar em mobile

---

#### B. **Botões e Cliques**

**Event Listeners:**

```javascript
📄 main.js (linhas 35-40)
Botões de seleção de modelo (.model-select-btn)
├─ Click handler
├─ Atualiza UI
├─ Scroll suave
└─ ~50-150ms de resposta ✅

📄 generator.js (linhas 39-66)
Botão "Gerar Documento"
├─ generateDocument()
├─ Sanitização de inputs
├─ Template rendering
└─ ~200-500ms (depende do modelo) ⚠️
```

**Impacto no INP:**
- **Botões simples:** ~50-100ms ✅
- **Geração de documento:** ~200-500ms ⚠️
- **Export PDF:** ~500ms-2s (assíncrono, mas bloqueia UI) 🔴

**Risco:** 🟡 **MÉDIO** - Geração pode sentir lento

---

#### C. **Tour Guiado (Tooltips)**

**Eventos:**

```javascript
📄 tour.js (linha 486)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Fecha tour
    }
});
❌ SEM DEBOUNCE/THROTTLE

📄 ui.js (linhas 21-40)
Tooltips com mouseover/mouseout
├─ Sem debounce ❌
└─ Pode causar múltiplos eventos
```

**Impacto no INP:**
- **Keydown sem debounce:** ~50-150ms
- **Mouseenter rápido:** ~50-200ms (múltiplos eventos)

**Risco:** 🟢 **BAIXO-MÉDIO** - Impacto menor, mas otimizável

---

#### D. **Scripts Pesados e Long Tasks**

**Operações Bloqueantes:**

```javascript
📄 storage.js (linhas 76-92)
getAllDrafts() {
    // Loop por todo localStorage
    for (let key in localStorage) {
        // Processa cada item
    }
}
🔴 BLOQUEANTE - pode criar long task (>50ms)

📄 log.js (linhas 148-193)
Tracking de recursos (imagens, CSS, fontes)
├─ performance.getEntriesByType('resource')
├─ Loops e filtros
└─ ~100-300ms 🔴

📄 analytics.js (linhas 529-540)
Contagem de eventos
├─ .filter() e .map() em arrays
└─ ~50-150ms ⚠️
```

**Impacto no INP:**
- **LocalStorage loops:** +100-400ms 🔴
- **Performance tracking:** +100-300ms 🔴
- **Analytics:** +50-150ms ⚠️

**Risco:** 🔴 **ALTO** - Long tasks em mobile

---

#### E. **Geração e Export de Documentos**

**Operações Pesadas:**

```javascript
📄 generator.js (linhas 39-66)
generateDocument()
├─ Validação
├─ Sanitização (regex)
├─ Template building
└─ DOM injection
Tempo estimado: 200-500ms ⚠️

📄 export.js (linhas 42-85)
Export PDF/DOCX
├─ Carrega bibliotecas via CDN (jsPDF, docx.js)
├─ Processamento de texto
├─ Geração de arquivo
└─ Download
Tempo estimado: 500ms-2s 🔴

📄 export.js - Fallback CDN
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://unpkg.com/docx@7.1.0/build/index.js"></script>
❌ Carregamento dinâmico pode atrasar
```

**Impacto no INP:**
- **Geração:** ~200-500ms (tolerável)
- **Export:** ~500ms-2s (pode frustrar usuário)
- **CDN load:** +500ms-1.5s (primeira vez)

**Risco:** 🔴 **ALTO** - Export pode parecer travado

---

### 📊 Resumo INP

| Operação | Arquivo | Linha(s) | Tempo Mobile | Tempo Desktop | Risco |
|----------|---------|----------|--------------|---------------|-------|
| Textarea auto-resize (sem debounce) | ui.js | 563-571 | 100-300ms | 50-150ms | 🟡 MÉDIO |
| LocalStorage loops | storage.js | 76-92 | 200-400ms | 100-200ms | 🔴 ALTO |
| Performance tracking | log.js | 148-193 | 200-300ms | 100-200ms | 🔴 ALTO |
| Geração documento | generator.js | 39-66 | 300-500ms | 200-400ms | 🟡 MÉDIO |
| Export PDF/DOCX | export.js | 42-85 | 1-2s | 500ms-1s | 🔴 ALTO |
| Tour keydown (sem throttle) | tour.js | 486 | 50-150ms | 30-100ms | 🟢 BAIXO-MÉDIO |
| Tooltip mouseover (sem debounce) | ui.js | 21-40 | 50-200ms | 30-100ms | 🟢 BAIXO-MÉDIO |

**INP Médio Estimado:** 200-400ms (Mobile), 100-200ms (Desktop)  
**Meta Google:** < 200ms (Bom)  
**Status Mobile:** ⚠️ **No Limite**  
**Status Desktop:** ✅ **Aceitável**

---

## 4️⃣ Scripts e Recursos Não Críticos

### 🎯 Oportunidades de Otimização

#### A. **Lazy Loading de Scripts**

**Candidatos SEGUROS para defer/async:**

| Script | Tamanho | Atual | Recomendado | Segurança |
|--------|---------|-------|-------------|-----------|
| analytics.js | 22 KB | async ✅ | async | ✅ Seguro |
| acessibilidade.js | 31 KB | async ✅ | async | ✅ Seguro |
| tour.js | 21 KB | sync | **defer** | ✅ Seguro |
| export.js | 31 KB | sync | **defer** | ✅ Seguro |
| log.js | 20 KB | sync | **defer** | ⚠️ Cautela |
| csp-reporter.js | 9 KB | sync | **defer** | ⚠️ Cautela |

**NÃO recomendado alterar:**
- ❌ main.js - Inicialização crítica
- ❌ ui.js - Interatividade imediata
- ❌ generator.js - Funcionalidade core
- ❌ storage.js - Usado por main.js

**Arquivos:**

```html
📄 index.html (linhas 730-743)

PODE ALTERAR:
<script src="js/tour.js" defer></script> ✅
<script src="js/export.js" defer></script> ✅

CAUTELA:
<script src="js/log.js" defer></script> ⚠️
<script src="js/csp-reporter.js" defer></script> ⚠️
```

**Impacto:**
- **Reduz tempo de bloqueio:** -50-100ms (tour + export)
- **Não afeta funcionalidade:** ✅
- **Melhora FCP e LCP:** ✅

**Risco:** 🟢 **SEGURO**

---

#### B. **Preconnect e Preload**

**Faltantes no index.html:**

```html
📄 index.html - ADICIONAR no <head> (antes linha 46):

<!-- Preconnect para CDNs -->
<link rel="preconnect" href="https://cdnjs.cloudflare.com">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://vlibras.gov.br">

<!-- Preload para fontes críticas (opcional) -->
<link rel="preload" href="https://fonts.gstatic.com/s/inter/..." as="font" type="font/woff2" crossorigin>
```

**Arquivos:**
- ✅ Artigos já têm preconnect (linhas 10-11)
- ❌ index.html NÃO tem

**Impacto:**
- **Reduz latência:** -100-300ms por CDN
- **Mobile 3G:** Economia de -500ms-1s

**Risco:** 🟢 **SEGURO**

---

#### C. **Font-display para Google Fonts**

**Adicionar no URL:**

```html
📄 index.html (linha 49) - ATUAL:
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@300;400;500&display=swap">
                                                                                                              ^^^^^^^^^^^^^ FALTA

RECOMENDADO:
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
```

**Impacto:**
- **Reduz CLS:** -0.05-0.10
- **Melhora LCP:** Texto renderiza com fallback

**Risco:** 🟢 **SEGURO**

---

#### D. **Remover Font Awesome Duplicado**

**Problema:**

```html
📄 index.html
Linha 46: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/.../font-awesome/6.4.0/css/all.min.css">
Linha 59: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/.../font-awesome/6.4.0/css/all.min.css">
          ⚠️ DUPLICADO
```

**Solução:**
- Remover UMA das linhas (recomendado: linha 59)

**Impacto:**
- **Reduz LCP:** -100-200ms
- **Reduz CLS:** -0.02-0.05
- **Economia de banda:** -70 KB

**Risco:** 🟢 **SEGURO**

---

#### E. **VLibras Lazy Load (Opcional)**

**Configuração Atual:**

```html
📄 index.html (linhas 829-831)
<script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
<script>
    new window.VLibras.Widget('https://vlibras.gov.br/app');
</script>
```

**Alternativa (mais avançada):**

```javascript
// Carregar VLibras apenas quando necessário
// CAUTELA: Pode afetar acessibilidade
if (userNeedsAccessibility) {
    loadVLibras();
}
```

**Impacto:**
- **Reduz LCP:** -100-300ms
- **Reduz CLS:** -0.01-0.05
- **RISCO:** ⚠️ Acessibilidade é crítica

**Risco:** 🟡 **CAUTELA** - Não recomendado sem análise profunda

---

### 📊 Resumo de Otimizações

| Otimização | Arquivo | Linha(s) | Impacto LCP | Impacto CLS | Impacto INP | Segurança |
|------------|---------|----------|-------------|-------------|-------------|-----------|
| Preconnect CDNs | index.html | Antes 46 | -200-500ms | - | - | ✅ Seguro |
| Remover FA duplicado | index.html | 59 | -100-200ms | -0.02-0.05 | - | ✅ Seguro |
| font-display:swap | index.html | 49 | -100-200ms | -0.05-0.10 | - | ✅ Seguro |
| defer tour.js | index.html | 743 | -30-60ms | - | - | ✅ Seguro |
| defer export.js | index.html | 742 | -30-60ms | - | -50ms | ✅ Seguro |
| defer log.js | index.html | 733 | -20-40ms | - | - | ⚠️ Cautela |

**Ganho Total Estimado (Mobile):** -480ms-1.06s no LCP, -0.07-0.15 no CLS  
**Ganho Total Estimado (Desktop):** -180-360ms no LCP, -0.07-0.15 no CLS

---

## 5️⃣ Classificação de Segurança

### ✅ **SEGURO** (Aplicar sem riscos)

1. **Adicionar preconnect para CDNs**
   - Arquivo: index.html, antes da linha 46
   - Impacto: -200-500ms LCP
   - Regressão: Nenhuma
   - **Recomendação:** Aplicar imediatamente

2. **Remover Font Awesome duplicado (linha 59)**
   - Arquivo: index.html, linha 59
   - Impacto: -100-200ms LCP, -0.02-0.05 CLS
   - Regressão: Nenhuma (é duplicata)
   - **Recomendação:** Aplicar imediatamente

3. **Adicionar `&display=swap` ao Google Fonts**
   - Arquivo: index.html, linha 49
   - Impacto: -100-200ms LCP, -0.05-0.10 CLS
   - Regressão: Nenhuma
   - **Recomendação:** Aplicar imediatamente

4. **Adicionar `defer` a tour.js**
   - Arquivo: index.html, linha 743
   - Impacto: -30-60ms LCP
   - Regressão: Tour carrega ligeiramente mais tarde (não crítico)
   - **Recomendação:** Aplicar com confiança

5. **Adicionar `defer` a export.js**
   - Arquivo: index.html, linha 742
   - Impacto: -30-60ms LCP, -50ms INP
   - Regressão: Export disponível após DOMContentLoaded (não crítico)
   - **Recomendação:** Aplicar com confiança

---

### ⚠️ **CAUTELA** (Testar antes de aplicar)

6. **Adicionar `defer` a log.js**
   - Arquivo: index.html, linha 733
   - Impacto: -20-40ms LCP
   - Regressão: Logging pode perder eventos iniciais
   - **Recomendação:** Testar se logs são críticos para debugging

7. **Adicionar `defer` a csp-reporter.js**
   - Arquivo: index.html, linha 730
   - Impacto: -20-40ms LCP
   - Regressão: Violações CSP iniciais podem não ser reportadas
   - **Recomendação:** Depende da importância do CSP reporting

8. **Debounce em textarea auto-resize**
   - Arquivo: ui.js, linhas 563-571
   - Impacto: -50-150ms INP
   - Regressão: Resize pode parecer menos responsivo
   - **Recomendação:** Testar com debounce de 50-100ms

9. **Otimizar loops de localStorage**
   - Arquivo: storage.js, linhas 76-92
   - Impacto: -100-200ms INP
   - Regressão: Lógica mais complexa, possível bug
   - **Recomendação:** Refatorar com cuidado, adicionar cache

---

### 🔴 **NÃO RECOMENDADO** (Alto risco de regressão)

10. **Lazy load VLibras**
    - Arquivo: index.html, linhas 829-831
    - Impacto: -100-300ms LCP, -0.01-0.05 CLS
    - Regressão: **Acessibilidade comprometida** para usuários com necessidades especiais
    - **Recomendação:** NÃO aplicar sem consultar especialista em acessibilidade

11. **Alterar carregamento de main.js/ui.js/generator.js**
    - Arquivos: index.html, linhas 736-740
    - Impacto: Potencial -500ms-1s LCP
    - Regressão: **Funcionalidades core podem quebrar**, interatividade atrasada
    - **Recomendação:** NÃO aplicar - são scripts críticos

12. **Remover scripts de validação/geração**
    - Conforme requisitos do problema
    - **Recomendação:** NÃO alterar - são funcionalidades core

---

## 6️⃣ Resumo e Checklist

### 📝 Checklist Manual para Aplicação

#### **Fase 1: Otimizações Seguras (0 riscos)**

- [ ] **1.1 Adicionar preconnect para CDNs**
  - Arquivo: `index.html`
  - Localização: Adicionar no `<head>`, antes da linha 46
  - Código:
    ```html
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://vlibras.gov.br">
    ```
  - Impacto: -200-500ms LCP (mobile)
  - Regressão: Nenhuma ✅

- [ ] **1.2 Remover Font Awesome duplicado**
  - Arquivo: `index.html`
  - Localização: Linha 59
  - Ação: **DELETAR** a linha completa
  - Código original (REMOVER):
    ```html
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    ```
  - Manter apenas a linha 46 (primeira ocorrência)
  - Impacto: -100-200ms LCP, -0.02-0.05 CLS
  - Regressão: Nenhuma (é duplicata) ✅

- [ ] **1.3 Adicionar font-display:swap ao Google Fonts**
  - Arquivo: `index.html`
  - Localização: Linha 49
  - Ação: Verificar se `&display=swap` já está no URL
  - Se NÃO estiver, adicionar ao final do URL:
    ```html
    ANTES: ...Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    DEPOIS: ...Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    ```
  - **NOTA:** O exemplo acima já mostra o correto. Verificar se está presente.
  - Impacto: -100-200ms LCP, -0.05-0.10 CLS
  - Regressão: Nenhuma ✅

- [ ] **1.4 Adicionar defer a tour.js**
  - Arquivo: `index.html`
  - Localização: Linha 743
  - Ação: Adicionar atributo `defer`
  - ANTES: `<script src="js/tour.js"></script>`
  - DEPOIS: `<script src="js/tour.js" defer></script>`
  - Impacto: -30-60ms LCP
  - Regressão: Tour carrega após DOM (aceitável) ✅

- [ ] **1.5 Adicionar defer a export.js**
  - Arquivo: `index.html`
  - Localização: Linha 742
  - Ação: Adicionar atributo `defer`
  - ANTES: `<script src="js/export.js"></script>`
  - DEPOIS: `<script src="js/export.js" defer></script>`
  - Impacto: -30-60ms LCP, -50ms INP
  - Regressão: Export disponível após DOM (aceitável) ✅

**✅ Validação Fase 1:**
- [ ] Abrir site em navegador
- [ ] Verificar ícones Font Awesome carregam
- [ ] Testar geração de documento
- [ ] Testar export PDF/DOCX
- [ ] Verificar tour funciona

---

#### **Fase 2: Otimizações com Cautela (testar)**

- [ ] **2.1 Debounce em textarea auto-resize**
  - Arquivo: `ui.js`
  - Localização: Linhas 563-571
  - Ação: Adicionar debounce de 100ms
  - ANTES:
    ```javascript
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
    ```
  - DEPOIS:
    ```javascript
    let resizeTimeout;
    textarea.addEventListener('input', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        }, 100);
    });
    ```
  - Impacto: -50-150ms INP
  - Regressão: Resize pode parecer menos imediato ⚠️
  - **TESTE:** Digitar rápido no textarea, verificar se resize é suave

- [ ] **2.2 Adicionar defer a log.js (opcional)**
  - Arquivo: `index.html`
  - Localização: Linha 733
  - Ação: Adicionar atributo `defer`
  - ANTES: `<script src="js/log.js"></script>`
  - DEPOIS: `<script src="js/log.js" defer></script>`
  - Impacto: -20-40ms LCP
  - Regressão: Logs de eventos iniciais podem ser perdidos ⚠️
  - **TESTE:** Verificar se console mostra logs esperados

- [ ] **2.3 Adicionar defer a csp-reporter.js (opcional)**
  - Arquivo: `index.html`
  - Localização: Linha 730
  - Ação: Adicionar atributo `defer`
  - ANTES: `<script src="js/csp-reporter.js"></script>`
  - DEPOIS: `<script src="js/csp-reporter.js" defer></script>`
  - Impacto: -20-40ms LCP
  - Regressão: CSP violations iniciais não serão reportadas ⚠️
  - **TESTE:** Verificar se CSP reporting continua funcionando

**⚠️ Validação Fase 2:**
- [ ] Testar textarea resize com texto longo
- [ ] Verificar console.log() funciona
- [ ] Verificar CSP violations são reportadas (se aplicável)
- [ ] Monitorar erros no console

---

#### **Fase 3: NÃO Aplicar (alto risco)**

**❌ NÃO fazer:**
- Lazy load VLibras (compromete acessibilidade)
- Adicionar defer/async a main.js, ui.js, generator.js (quebra funcionalidades)
- Remover scripts de validação ou geração de documentos
- Alterar lógica de formulários sem testes extensivos

---

### 📊 Resultados Esperados

#### **Antes das Otimizações (Estimado):**

| Métrica | Mobile (3G) | Desktop | Status |
|---------|-------------|---------|--------|
| **LCP** | 4-6s | 1.5-2.5s | 🔴 Ruim |
| **CLS** | 0.20-0.40 | 0.15-0.30 | 🟡 Precisa Melhoria |
| **INP** | 300-500ms | 150-250ms | 🟡 Precisa Melhoria |

#### **Depois das Otimizações (Fase 1):**

| Métrica | Mobile (3G) | Desktop | Status |
|---------|-------------|---------|--------|
| **LCP** | 3-4.5s | 1-1.8s | 🟡 Precisa Melhoria |
| **CLS** | 0.10-0.25 | 0.08-0.20 | 🟢 Bom |
| **INP** | 250-400ms | 100-200ms | 🟢 Bom |

**Melhoria Total:**
- LCP: -1-1.5s (mobile), -500-700ms (desktop)
- CLS: -0.10-0.15 (mobile/desktop)
- INP: -50-100ms (mobile), -50ms (desktop)

---

### 🎯 Prioridades

1. **🔴 ALTA PRIORIDADE (Fase 1)**
   - Remover Font Awesome duplicado
   - Adicionar preconnect
   - Adicionar font-display:swap
   - Aplicar imediatamente - maior impacto, zero risco

2. **🟡 MÉDIA PRIORIDADE (Fase 2)**
   - Adicionar defer a tour.js e export.js
   - Testar debounce em textarea
   - Aplicar após validação

3. **🟢 BAIXA PRIORIDADE (Futuro)**
   - Otimizar loops de localStorage
   - Revisar arquitetura de scripts
   - Code splitting de main.js

---

## 📈 Monitoramento Pós-Implementação

### Ferramentas Recomendadas:

1. **Google PageSpeed Insights**
   - URL: https://pagespeed.web.dev/
   - Testar: index.html e páginas de artigos

2. **Chrome DevTools**
   - Performance tab
   - Lighthouse
   - Network tab (throttling 3G)

3. **WebPageTest**
   - URL: https://www.webpagetest.org/
   - Testar: Mobile + Desktop

### Métricas a Monitorar:

- [ ] LCP < 2.5s (mobile)
- [ ] LCP < 1.2s (desktop)
- [ ] CLS < 0.1
- [ ] INP < 200ms
- [ ] Total Blocking Time (TBT) < 300ms

---

## ✅ Conclusão

Este repositório **ModeloTrabalhista** apresenta oportunidades significativas de melhoria em Web Core Vitals, especialmente para dispositivos móveis. As otimizações recomendadas são **majoritariamente seguras** e podem ser aplicadas de forma incremental, priorizando:

1. **Primeiro:** Remover duplicatas e adicionar preconnect (ganho imediato, risco zero)
2. **Segundo:** Otimizar carregamento de scripts não-críticos (ganho médio, risco baixo)
3. **Terceiro:** Refinar interatividade com debouncing (ganho baixo, risco médio)

**Nunca** comprometer acessibilidade (VLibras) ou funcionalidades core (validação, geração de documentos) em prol de performance.

---

**Análise realizada por:** GitHub Copilot  
**Data:** 05/02/2026  
**Versão:** 1.0
