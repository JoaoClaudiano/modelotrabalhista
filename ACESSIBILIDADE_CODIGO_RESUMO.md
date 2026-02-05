# Resumo dos Códigos Associados ao Botão e Card de Acessibilidade

## Visão Geral
O sistema de acessibilidade do ModeloTrabalhista consiste em um botão flutuante único e um card de configurações que aparece ao clicar no botão.

---

## Arquivo Principal: `/js/acessibilidade.js`

### Classe Principal
**`AcessibilidadeManager`** (Linha 3)
- Gerencia todo o sistema de acessibilidade
- Responsável por criar, controlar e aplicar configurações de acessibilidade

### Componentes Principais

#### 1. **Botão de Acessibilidade** (`accessibility-toggle`)

**Criação:** Linhas 71-95
```javascript
createAccessibilityButton() {
    const button = document.createElement('button');
    button.id = 'accessibility-toggle';
    button.className = 'accessibility-toggle';
    button.innerHTML = '<i class="fas fa-universal-access"></i>';
    button.title = 'Acessibilidade';
    // ...
}
```

**Características:**
- **ID:** `accessibility-toggle`
- **Classe CSS:** `.accessibility-toggle`
- **Ícone:** FontAwesome `fa-universal-access`
- **Posição:** Fixo, canto inferior direito (bottom: 20px, right: 20px)
- **Ação:** Abre/fecha o card ao clicar (linha 89: `button.onclick = () => this.toggleCard()`)

**Estilos CSS:** Linhas 452-480
- Design circular (border-radius: 50%)
- Gradiente azul/roxo: `linear-gradient(135deg, #3b82f6, #8b5cf6)`
- Tamanho: 56px × 56px
- Efeito hover: escala para 1.1
- Quando ativo: muda para gradiente vermelho/laranja

#### 2. **Card de Acessibilidade** (`accessibility-card`)

**Criação:** Linhas 98-180
```javascript
createFloatingCard() {
    const card = document.createElement('div');
    card.id = 'accessibility-card';
    card.className = 'accessibility-card';
    // ...
}
```

**Características:**
- **ID:** `accessibility-card`
- **Classe CSS:** `.accessibility-card`
- **Posição:** Fixo, acima do botão (bottom: 90px, right: 20px)
- **Largura:** 320px
- **Visibilidade:** Controlada pela classe `.visible`

**Estilos CSS:** Linhas 483-735
- Design card flutuante com sombra
- Background branco com border-radius 16px
- Animação de entrada/saída
- Responsivo para mobile

**Estrutura do Card:**

##### a) Header (Linhas 107-112)
- Título "Acessibilidade" com ícone
- Botão de fechar (X)
- Background gradiente azul/roxo
- **Classe:** `.accessibility-card-header`

##### b) Seção: Tamanho do Texto (Linhas 115-129)
- Botão diminuir: `[data-action="decrease-font"]`
- Indicador de tamanho atual: `#font-size-value`
- Botão aumentar: `[data-action="increase-font"]`
- Botão resetar: `[data-action="reset-font"]`
- **Classe:** `.accessibility-card-controls`

##### c) Seção: Tema (Linhas 131-147)
- Botão tema claro: `[data-action="set-theme"][data-value="light"]`
- Botão tema escuro: `[data-action="set-theme"][data-value="dark"]`
- Botão alto contraste: `[data-action="set-theme"][data-value="high-contrast"]`
- **Classe:** `.accessibility-card-buttons`

##### d) Seção: Outras Opções (Linhas 149-168)
- Switch: Sublinhar links (`#link-underline-switch`)
- Switch: Fontes legíveis (`#readable-fonts-switch`)
- **Classe:** `.accessibility-card-switches`

##### e) Footer (Linhas 170-174)
- Botão "Restaurar Padrões": `[data-action="reset-all"]`
- **Classe:** `.accessibility-card-footer`

---

## Funcionalidades de Acessibilidade

### 1. Controle de Tamanho de Fonte (Linhas 321-345)
```javascript
adjustFontSize(direction)
applyFontSize(size)
```
- Aumenta/diminui fonte em incrementos de 2px
- Intervalo: 12px - 24px
- Padrão: 16px

### 2. Temas (Linhas 269-319)
```javascript
setTheme(theme)
applyTheme(theme)
```
Três opções:
- **light:** Tema claro padrão
- **dark:** Fundo #1a1a1a, texto #f0f0f0
- **high-contrast:** Fundo preto, texto branco, links amarelos

### 3. Sublinhar Links (Linhas 347-374)
```javascript
applyLinkUnderline(enabled)
```
- Adiciona sublinhado a todos os links de texto
- Exclui: botões, navbar, títulos

### 4. Fontes Legíveis (Linhas 376-396)
```javascript
applyReadableFonts(enabled)
```
- Aplica Arial/Helvetica
- Aumenta espaçamento entre letras (0.5px)
- Line-height: 1.6

---

## Controles e Eventos

### Função Toggle (Linhas 182-197)
```javascript
toggleCard()
```
- Alterna visibilidade do card
- Adiciona/remove classe `.visible` no card
- Adiciona/remove classe `.active` no botão
- Gerencia aria-hidden

### Event Handlers (Linhas 199-238)
- **Click no botão de fechar:** Fecha o card
- **Click nos botões de ação:** `handleCardAction()`
- **Mudança nos switches:** Atualiza configurações
- **Click fora do card:** Fecha automaticamente
- **Tecla ESC:** Fecha o card

### Atalho de Teclado (Linhas 749-757)
- **Alt + A:** Abre/fecha o card

---

## Armazenamento (Linhas 44-68)

### LocalStorage
- **Chave:** `modelotrabalhista_accessibility_settings`
- **Conteúdo:** JSON com todas as configurações
```javascript
{
    theme: 'light',
    fontSize: 16,
    highContrast: false,
    readableFonts: false,
    linkUnderline: false
}
```

---

## Integração com Outros Módulos

### 1. `/js/main.js` (Linhas 15, 29, 1175-1186)
```javascript
this.accessibility = window.AcessibilidadeManager ? new AcessibilidadeManager() : null;
this.setupAccessibility();
```
- Inicializa o sistema de acessibilidade na aplicação principal
- Anuncia ações para leitores de tela

### 2. `/js/analytics.js` (Linhas 451-460)
```javascript
document.addEventListener('accessibility_toggled', (e) => {
    this.trackEvent('accessibility_used', {...});
});
```
- Rastreia uso das funcionalidades de acessibilidade

### 3. `/index.html` (Linha 727)
```html
<script src="js/acessibilidade.js" async></script>
```
- Script carregado assincronamente

---

## IDs e Seletores Importantes

### IDs
- `#accessibility-toggle` - Botão principal
- `#accessibility-card` - Card de opções
- `#font-size-value` - Display do tamanho da fonte
- `#link-underline-switch` - Switch de sublinhar links
- `#readable-fonts-switch` - Switch de fontes legíveis

### Classes CSS
- `.accessibility-toggle` - Botão
- `.accessibility-toggle.active` - Botão ativo
- `.accessibility-card` - Card
- `.accessibility-card.visible` - Card visível
- `.accessibility-card-header` - Cabeçalho
- `.accessibility-card-content` - Conteúdo
- `.accessibility-card-section` - Seção
- `.accessibility-card-btn` - Botões
- `.accessibility-card-btn.active` - Botão ativo
- `.accessibility-card-switches` - Container de switches
- `.accessibility-card-footer` - Rodapé

### Data Attributes
- `[data-action="increase-font"]` - Aumentar fonte
- `[data-action="decrease-font"]` - Diminuir fonte
- `[data-action="reset-font"]` - Resetar fonte
- `[data-action="set-theme"]` - Mudar tema
- `[data-value="light|dark|high-contrast"]` - Valor do tema
- `[data-action="reset-all"]` - Resetar tudo

---

## Responsividade

### Desktop (> 768px)
- Botão: 56px × 56px, bottom: 20px, right: 20px
- Card: width: 320px, bottom: 90px, right: 20px

### Tablet (≤ 768px) - Linhas 701-719
- Botão: 52px × 52px, bottom: 16px, right: 16px
- Card: width: auto, bottom: 80px, horizontal: 16px
- Temas em coluna única

### Mobile (≤ 480px) - Linhas 722-735
- Fonte reduzida nos botões (13px)
- Padding reduzido

---

## Acessibilidade (A11y)

### ARIA Labels
- `aria-label="Abrir menu de acessibilidade"` (botão)
- `aria-label="Opções de acessibilidade"` (card)
- `aria-label="Fechar"` (botão fechar)
- `aria-hidden="true|false"` (card)
- `role="dialog"` (card)

### Suporte a Reduced Motion (Linhas 738-743)
```css
@media (prefers-reduced-motion: reduce) {
    .accessibility-toggle,
    .accessibility-card {
        transition: none;
    }
}
```

---

## Inicialização

### Processo de Inicialização (Linhas 760-772)
1. `DOMContentLoaded` dispara
2. Aguarda 500ms
3. Cria instância: `new AcessibilidadeManager()`
4. Expõe globalmente: `window.accessibility`
5. Expõe classe: `window.AcessibilidadeManager`

### Fluxo Interno (Linhas 23-41)
1. `safeInit()` com try-catch
2. `loadSettings()` - carrega do localStorage
3. `setupEventListeners()` - configura atalhos
4. `createAccessibilityButton()` - cria UI
5. `applyAllSettings()` - aplica configurações salvas

---

## Dependências Externas

1. **FontAwesome** - Ícones
   - `fa-universal-access` (botão principal)
   - `fa-times` (fechar)
   - `fa-text-height`, `fa-minus`, `fa-plus`, `fa-redo` (controles)
   - `fa-sun`, `fa-moon`, `fa-adjust` (temas)
   - `fa-underline`, `fa-font`, `fa-cog`, `fa-palette` (opções)

2. **LocalStorage API** - Persistência de dados

---

## Resumo Executivo

### Botão de Acessibilidade
- **Arquivo:** `/js/acessibilidade.js`
- **Linhas principais:** 71-95, 452-480
- **ID:** `accessibility-toggle`
- **Função:** Abrir/fechar card de configurações

### Card de Acessibilidade
- **Arquivo:** `/js/acessibilidade.js`
- **Linhas principais:** 98-180, 483-735
- **ID:** `accessibility-card`
- **Função:** Interface de configurações de acessibilidade

### Funcionalidades
1. Ajuste de tamanho de fonte (12-24px)
2. Três temas (claro, escuro, alto contraste)
3. Sublinhar links
4. Fontes legíveis
5. Persistência de preferências

### Tecnologias
- JavaScript Vanilla (ES6+)
- CSS3 (Grid, Flexbox, Custom Properties)
- LocalStorage
- FontAwesome Icons
- ARIA (Web Accessibility)
