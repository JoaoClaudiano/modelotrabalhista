# Integração do Sistema de Skeleton Screen

Este documento explica como integrar o sistema de skeleton screen no projeto ModeloTrabalhista.

## Passo 1: Incluir o Script

O arquivo `skeleton.js` já está disponível em `js/utils/skeleton.js`. Para usá-lo em qualquer página, adicione o script antes do fechamento do `</body>`:

```html
<!-- Adicionar antes de outros scripts ou no final do body -->
<script src="/js/utils/skeleton.js"></script>
```

**Nota:** O CSS do skeleton já está incluído em `css/style.css`, então não é necessário adicionar nenhum link CSS adicional.

## Passo 2: Exemplo de Uso no index.html

Para usar o skeleton screen na página principal, você pode adicionar algo como:

```html
<!-- Exemplo: Lista de modelos de documentos -->
<div id="models-container">
    <div class="model-card skeleton skeleton-card">
        <div class="model-icon skeleton skeleton-avatar"></div>
        <h3 class="model-title skeleton skeleton-title">Carregando...</h3>
        <p class="model-description skeleton skeleton-text">Carregando descrição...</p>
    </div>
</div>

<script src="/js/utils/skeleton.js"></script>
<script>
// Exemplo de uso com carregamento dinâmico
async function loadModels() {
    // Simula carregamento de dados
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Remove skeleton quando os dados estiverem prontos
    hideAllSkeletons();
}

// Executar quando a página carregar
document.addEventListener('DOMContentLoaded', loadModels);
</script>
```

## Passo 3: Exemplo de Uso em Páginas de Modelos

Para páginas de modelos individuais (ex: `modelos/pedido-demissao.html`):

```html
<!-- Formulário com skeleton enquanto carrega configurações salvas -->
<form id="document-form">
    <input type="text" id="nome" class="skeleton" placeholder="Nome completo">
    <input type="email" id="email" class="skeleton" placeholder="Email">
    <textarea id="mensagem" class="skeleton" placeholder="Mensagem"></textarea>
</form>

<script src="/js/utils/skeleton.js"></script>
<script>
async function loadSavedData() {
    // Mostrar skeleton
    showSkeleton('#document-form input, #document-form textarea');
    
    // Carregar dados salvos (localStorage, API, etc)
    const savedData = localStorage.getItem('documentData');
    if (savedData) {
        const data = JSON.parse(savedData);
        document.getElementById('nome').value = data.nome || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('mensagem').value = data.mensagem || '';
    }
    
    // Remover skeleton após carregar
    setTimeout(() => {
        hideAllSkeletons();
    }, 500);
}

document.addEventListener('DOMContentLoaded', loadSavedData);
</script>
```

## Passo 4: Integração com DocumentGenerator

Para integrar com a classe `DocumentGenerator` existente:

```javascript
// Em js/generator.js ou onde DocumentGenerator é usado
class DocumentGenerator {
    async generateDocument(type, data) {
        // Mostrar skeleton no preview
        showSkeleton('#document-preview');
        
        try {
            // Gerar documento
            const content = await this.renderTemplate(type, data);
            
            // Atualizar preview
            document.getElementById('document-preview').innerHTML = content;
            
            // Remover skeleton
            hideSkeleton('#document-preview');
        } catch (error) {
            // Remover skeleton mesmo em caso de erro
            hideSkeleton('#document-preview');
            throw error;
        }
    }
}
```

## Passo 5: Uso Avançado com Lazy Loading

Para combinar com o sistema de lazy loading existente (`js/utils/lazy-loading.js`):

```javascript
// Exemplo de carregamento de imagens com skeleton
async function loadImageWithSkeleton(imgElement) {
    // Adicionar skeleton
    imgElement.classList.add('skeleton', 'skeleton-image');
    
    // Aguardar carregamento da imagem
    await new Promise((resolve, reject) => {
        if (imgElement.complete) {
            resolve();
        } else {
            imgElement.addEventListener('load', resolve);
            imgElement.addEventListener('error', reject);
        }
    });
    
    // Remover skeleton
    hideSkeleton(imgElement);
}
```

## Exemplos de Classes CSS Disponíveis

```html
<!-- Avatar/Imagem circular -->
<img class="skeleton skeleton-avatar" src="..." alt="Avatar">

<!-- Título -->
<h2 class="skeleton skeleton-title">Título</h2>

<!-- Texto normal -->
<p class="skeleton skeleton-text">Texto de descrição</p>

<!-- Card completo -->
<div class="skeleton skeleton-card">Conteúdo do card</div>

<!-- Botão -->
<button class="skeleton skeleton-button">Clique aqui</button>

<!-- Imagem -->
<img class="skeleton skeleton-image" src="..." alt="Imagem">
```

## Boas Práticas de Integração

1. **Use skeleton apenas para conteúdo que demora a carregar** (mais de 300ms)
2. **Mantenha as dimensões dos elementos** usando `min-height`, `min-width` para evitar Layout Shift
3. **Remova skeleton progressivamente** para melhor experiência do usuário
4. **Sempre remova skeleton** mesmo em caso de erro no carregamento

## Verificação de Funcionamento

Para testar se o sistema está funcionando:

1. Abra o console do navegador (F12)
2. Digite: `typeof skeletonManager`
3. Se retornar `"object"`, o sistema está carregado corretamente

Ou execute os testes automatizados em: `/test-skeleton.html`

## Recursos

- **Demo completa**: [/demo-skeleton.html](../demo-skeleton.html)
- **Testes automatizados**: [/test-skeleton.html](../test-skeleton.html)
- **Documentação completa**: [/docs/SKELETON_SCREEN.md](./SKELETON_SCREEN.md)
