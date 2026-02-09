# Sistema Global de Skeleton Screen com Shimmer Effect

Sistema de Skeleton Screen (tela de esqueleto) com efeito Shimmer para exibir estados de carregamento de forma elegante e performática usando apenas CSS Puro e JavaScript Vanilla.

## 🎯 Características

- **⚡ Alta Performance**: Animação otimizada para GPU usando `transform`, `will-change` e `backface-visibility`
- **🎨 Shimmer Effect**: Efeito de brilho animado que se move da esquerda para a direita
- **📱 Responsivo**: Funciona em todos os dispositivos e tamanhos de tela
- **♿ Acessível**: Respeita a preferência `prefers-reduced-motion` do usuário
- **🎯 Versatilidade**: Aplicável a qualquer elemento HTML (div, span, img, button, etc.)
- **📏 Zero Layout Shift**: Mantém as dimensões reais dos elementos para evitar CLS (Cumulative Layout Shift)
- **🚀 Fácil de Usar**: API simples e intuitiva

## 📦 Arquivos

- `css/style.css` - Estilos do skeleton screen (final do arquivo)
- `js/utils/skeleton.js` - Gerenciador de skeleton screens
- `demo-skeleton.html` - Página de demonstração completa

## 🚀 Como Usar

### 1. HTML: Adicione as classes skeleton

```html
<!-- Exemplo: Card de perfil -->
<div class="profile-card">
    <!-- Avatar circular com skeleton -->
    <img class="profile-avatar skeleton skeleton-avatar" alt="Avatar">
    
    <!-- Nome com skeleton -->
    <h3 class="profile-name skeleton skeleton-title">Nome do Usuário</h3>
    
    <!-- Descrição com skeleton -->
    <p class="profile-description skeleton skeleton-text">
        Descrição do usuário que será carregada...
    </p>
    
    <!-- Email com skeleton -->
    <p class="profile-email skeleton skeleton-text">
        email@example.com
    </p>
</div>
```

### 2. JavaScript: Remova o skeleton quando carregar

```javascript
// Incluir o script no HTML
<script src="js/utils/skeleton.js"></script>

// Remover skeleton de elementos específicos
hideSkeleton('.profile-avatar');

// Remover skeleton com delay (em milissegundos)
hideSkeleton('.profile-name', 500);

// Remover skeleton de todos os elementos
hideAllSkeletons();

// Usar com carregamento assíncrono
await loadWithSkeleton('.profile-card', async () => {
    const response = await fetch('/api/profile');
    const data = await response.json();
    // Processar e exibir os dados...
});
```

### 3. Incluir o script nas suas páginas

Adicione o script skeleton.js no final do `<body>` ou na seção `<head>`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <!-- ... outros links ... -->
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- Seu conteúdo aqui -->
    
    <!-- Incluir o skeleton.js -->
    <script src="js/utils/skeleton.js"></script>
    <script>
        // Seu código aqui
    </script>
</body>
</html>
```

## 🎨 Classes CSS Disponíveis

### Classes Base

- `.skeleton` - Aplica o efeito shimmer e torna o elemento não clicável
- `.skeleton-loaded` - Classe de transição aplicada automaticamente durante o fade-in

### Classes Utilitárias

- `.skeleton-text` - Para linhas de texto (altura: 1em)
- `.skeleton-title` - Para títulos (altura: 1.5em, largura: 60%)
- `.skeleton-avatar` - Para avatares circulares (border-radius: 50%)
- `.skeleton-card` - Para cards completos
- `.skeleton-button` - Para botões (altura: 40px)
- `.skeleton-image` - Para imagens

## 📚 API JavaScript

### SkeletonManager

Classe principal que gerencia os skeleton screens.

#### Métodos

##### `showSkeleton(selector)`
Adiciona a classe skeleton a um ou mais elementos.

```javascript
showSkeleton('.profile-avatar');
showSkeleton(document.getElementById('myElement'));
showSkeleton(document.querySelectorAll('.cards'));
```

**Parâmetros:**
- `selector` (string|Element|NodeList): Seletor CSS, elemento DOM, ou NodeList

---

##### `hideSkeleton(selector, delay)`
Remove a classe skeleton de um ou mais elementos com animação de fade-in.

```javascript
hideSkeleton('.profile-name');
hideSkeleton('.profile-description', 1000); // Com delay de 1 segundo
```

**Parâmetros:**
- `selector` (string|Element|NodeList): Seletor CSS, elemento DOM, ou NodeList
- `delay` (number): Delay opcional antes de remover (em ms). Padrão: 0

---

##### `hideAllSkeletons()`
Remove skeleton de todos os elementos que estão atualmente com skeleton.

```javascript
hideAllSkeletons();
```

---

##### `loadWithSkeleton(selector, loadFunction)`
Simula carregamento de conteúdo/API e remove skeleton quando completo.

```javascript
await loadWithSkeleton('.user-profile', async () => {
    const data = await fetch('/api/user/123');
    const user = await data.json();
    
    // Atualizar o DOM com os dados
    document.querySelector('.profile-name').textContent = user.name;
    document.querySelector('.profile-email').textContent = user.email;
});
```

**Parâmetros:**
- `selector` (string|Element|NodeList): Seletor CSS, elemento DOM, ou NodeList
- `loadFunction` (Function): Função assíncrona que carrega o conteúdo

---

##### `isLoading(element)`
Verifica se um elemento está com skeleton ativo.

```javascript
const element = document.querySelector('.profile-avatar');
if (skeletonManager.isLoading(element)) {
    console.log('Ainda carregando...');
}
```

**Parâmetros:**
- `element` (Element): Elemento DOM

**Retorna:** `boolean`

## 💡 Exemplos Práticos

### Exemplo 1: Card de Perfil com Carregamento Sequencial

```html
<div class="profile-card">
    <img id="avatar" class="profile-avatar skeleton skeleton-avatar" alt="Avatar">
    <h3 id="name" class="profile-name skeleton skeleton-title">Nome</h3>
    <p id="bio" class="profile-description skeleton skeleton-text">Bio</p>
</div>

<script src="js/utils/skeleton.js"></script>
<script>
async function loadProfile() {
    // Simula carregamento da API
    const response = await fetch('/api/profile');
    const profile = await response.json();
    
    // Atualiza e remove skeleton sequencialmente
    document.getElementById('avatar').src = profile.avatar;
    hideSkeleton('#avatar');
    
    setTimeout(() => {
        document.getElementById('name').textContent = profile.name;
        hideSkeleton('#name');
    }, 300);
    
    setTimeout(() => {
        document.getElementById('bio').textContent = profile.bio;
        hideSkeleton('#bio');
    }, 600);
}

loadProfile();
</script>
```

### Exemplo 2: Lista de Cards com Carregamento Dinâmico

```html
<div id="cards-container"></div>

<script src="js/utils/skeleton.js"></script>
<script>
async function loadCards() {
    // Criar cards com skeleton
    const container = document.getElementById('cards-container');
    for (let i = 0; i < 6; i++) {
        const card = document.createElement('div');
        card.className = 'card skeleton skeleton-card';
        card.innerHTML = `
            <div class="card-image skeleton skeleton-image"></div>
            <h3 class="card-title skeleton skeleton-title">Título</h3>
            <p class="card-text skeleton skeleton-text">Texto</p>
        `;
        container.appendChild(card);
    }
    
    // Carregar dados da API
    const response = await fetch('/api/cards');
    const cards = await response.json();
    
    // Atualizar cards e remover skeleton
    cards.forEach((cardData, index) => {
        setTimeout(() => {
            const cardElement = container.children[index];
            cardElement.querySelector('.card-image').style.backgroundImage = `url(${cardData.image})`;
            cardElement.querySelector('.card-title').textContent = cardData.title;
            cardElement.querySelector('.card-text').textContent = cardData.text;
            hideSkeleton(cardElement);
        }, index * 200); // Animação em cascata
    });
}

loadCards();
</script>
```

### Exemplo 3: Formulário com Carregamento de Dados

```html
<form id="user-form">
    <input type="text" id="name" class="skeleton" placeholder="Nome">
    <input type="email" id="email" class="skeleton" placeholder="Email">
    <textarea id="bio" class="skeleton" placeholder="Bio"></textarea>
    <button type="submit" class="skeleton skeleton-button">Salvar</button>
</form>

<script src="js/utils/skeleton.js"></script>
<script>
async function loadUserData() {
    await loadWithSkeleton('#user-form input, #user-form textarea, #user-form button', async () => {
        const response = await fetch('/api/user');
        const user = await response.json();
        
        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;
        document.getElementById('bio').value = user.bio;
    });
}

loadUserData();
</script>
```

## 🎬 Demonstração

Para ver o sistema em ação, abra o arquivo `demo-skeleton.html` no navegador:

```bash
# Usando Python 3
python3 -m http.server 8080

# Ou usando Node.js
npx http-server -p 8080
```

Em seguida, acesse: `http://localhost:8080/demo-skeleton.html`

## ⚙️ Detalhes Técnicos

### Performance e Otimização

O skeleton screen foi desenvolvido com foco em performance:

1. **GPU Acceleration**: Usa `transform: translateZ(0)` e `backface-visibility: hidden` para forçar a renderização na GPU
2. **will-change**: Propriedade `will-change: background-position` otimiza a animação
3. **Animação Eficiente**: A animação usa apenas `background-position`, que não causa reflows ou repaints
4. **Lightweight**: CSS e JavaScript puros, sem dependências externas

### Acessibilidade

- Respeita a preferência `prefers-reduced-motion` do usuário
- Elementos com skeleton são não-clicáveis (`pointer-events: none`)
- Texto fica invisível durante o loading (`opacity: 0`, `color: transparent`)
- Transição suave de fade-in quando o conteúdo carrega

### Compatibilidade

- ✅ Chrome/Edge (últimas versões)
- ✅ Firefox (últimas versões)
- ✅ Safari (últimas versões)
- ✅ Opera (últimas versões)
- ✅ Navegadores móveis (iOS Safari, Chrome Mobile)

## 🔧 Customização

### Personalizar Cores

Edite as variáveis CSS no arquivo `css/style.css`:

```css
.skeleton {
    background: linear-gradient(
        90deg,
        var(--light-color) 0%,      /* Cor base */
        #e0e0e0 20%,                 /* Cor do shimmer */
        var(--light-color) 40%,      /* Cor base */
        var(--light-color) 100%
    );
}
```

### Personalizar Velocidade da Animação

```css
.skeleton {
    animation: shimmer 1.5s ease-in-out infinite; /* Ajuste 1.5s para a velocidade desejada */
}
```

### Personalizar Transição de Fade-in

```css
.skeleton-loaded {
    animation: fadeIn 0.4s ease-in; /* Ajuste 0.4s para a duração desejada */
}
```

## 📝 Boas Práticas

1. **Mantenha as Dimensões Reais**: Use `min-height` e `min-width` nos elementos para evitar Layout Shift
2. **Carregamento Progressivo**: Remova o skeleton sequencialmente para melhor UX
3. **Feedback Visual**: Use delays entre elementos para criar uma animação fluida
4. **Não Abuse**: Use skeleton apenas para conteúdos que demoram mais de 300ms para carregar
5. **Conteúdo Placeholder**: Mantenha texto placeholder mesmo com skeleton para melhor estrutura semântica

## 📄 Licença

Este sistema faz parte do projeto ModeloTrabalhista e segue a mesma licença do projeto principal.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📚 Recursos Adicionais

- [Demo ao Vivo](demo-skeleton.html)
- [Documentação CSS](css/style.css)
- [Código JavaScript](js/utils/skeleton.js)

---

Desenvolvido com ❤️ para o projeto ModeloTrabalhista
