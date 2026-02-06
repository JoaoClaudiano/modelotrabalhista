# Service Worker e PWA

Este documento descreve a implementação do Service Worker e Progressive Web App (PWA) no ModeloTrabalhista.

## 📱 O que foi implementado

### Service Worker (`service-worker.js`)
O service worker foi criado na raiz do projeto com as seguintes funcionalidades:

#### Estratégias de Cache
- **Cache-first para recursos estáticos**: CSS, JS, imagens, fontes e JSON são servidos primeiro do cache, com atualização em background
- **Network-first para HTML**: Páginas HTML são sempre buscadas da rede primeiro, com fallback para o cache offline
- **Offline fallback**: Quando offline, o usuário é redirecionado para a página principal em cache

#### Recursos em Cache
O service worker automaticamente faz cache de:
- ✅ Página principal (index.html)
- ✅ Todos os arquivos CSS
- ✅ Todos os arquivos JavaScript
- ✅ Templates JSON
- ✅ Ícones PWA (192x192 e 512x512)
- ✅ Manifest.json
- ✅ Favicon e Apple Touch Icon

#### Funcionalidades
- **Instalação automática**: O service worker é instalado automaticamente quando o usuário visita o site
- **Atualização automática**: Cache antigo é removido automaticamente quando há nova versão
- **Cache dinâmico**: Recursos acessados são automaticamente adicionados ao cache
- **Mensagens do cliente**: Suporte para limpar cache via mensagem do cliente

### Manifest (`assets/manifest.json`)
O manifest foi atualizado com:
- ✅ Caminhos absolutos para ícones (`/modelotrabalhista/assets/...`)
- ✅ Start URL absoluta (`/modelotrabalhista/`)
- ✅ Scope definido (`/modelotrabalhista/`)
- ✅ Display mode: standalone
- ✅ Theme color: #000000
- ✅ Background color: #ffffff

### Registro do Service Worker
O service worker foi registrado em **todos** os arquivos HTML do site:
- ✅ index.html (página principal)
- ✅ 6 páginas em `/pages/` (sobre, contato, termos, privacidade, disclaimer, example)
- ✅ 30 artigos em `/artigos/`

## 🚀 Como funciona

### Instalação do PWA
Quando o usuário visita o site:
1. O navegador detecta o manifest.json
2. O service worker é registrado automaticamente
3. Recursos essenciais são armazenados em cache
4. O navegador oferece a opção de "Instalar aplicativo"

### Uso Offline
Depois de instalado:
- O site funciona completamente offline
- Recursos já acessados ficam disponíveis
- Formulários continuam funcionando localmente
- Dados são salvos no localStorage

### Atualização
Quando há mudanças no site:
1. O service worker detecta a nova versão
2. Baixa os novos recursos em background
3. Remove cache antigo automaticamente
4. Aplica a atualização na próxima visita

## 🔧 Manutenção

### Atualizar versão do cache
Para forçar atualização de todos os caches, altere a constante `CACHE_NAME` no arquivo `service-worker.js`:

```javascript
const CACHE_NAME = 'modelotrabalhista-v2'; // Incrementar versão
```

### Adicionar novos recursos ao cache inicial
Edite o array `ESSENTIAL_RESOURCES` no `service-worker.js`:

```javascript
const ESSENTIAL_RESOURCES = [
  '/modelotrabalhista/',
  '/modelotrabalhista/novo-arquivo.css',
  // ...
];
```

### Limpar cache manualmente
No console do navegador (DevTools):

```javascript
// Limpar todo o cache
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});

// Desregistrar service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
```

## 📊 Verificação

### Testar PWA localmente
1. Abra o site em Chrome/Edge
2. Pressione F12 para abrir DevTools
3. Vá para a aba "Application"
4. Verifique "Service Workers" (deve estar ativo)
5. Verifique "Manifest" (deve mostrar os ícones)
6. Clique em "Cache Storage" para ver os arquivos em cache

### Testar funcionalidade offline
1. Com o site aberto, abra DevTools
2. Vá para a aba "Network"
3. Marque "Offline"
4. Recarregue a página
5. O site deve continuar funcionando

## 📱 Compatibilidade

O PWA funciona nos seguintes navegadores:
- ✅ Chrome/Edge (Desktop e Mobile)
- ✅ Firefox (Desktop e Mobile)
- ✅ Safari (iOS 11.3+)
- ✅ Samsung Internet
- ✅ Opera

## 🔍 URLs importantes

- Service Worker: `/modelotrabalhista/service-worker.js`
- Manifest: `/modelotrabalhista/assets/manifest.json`
- Ícone 192x192: `/modelotrabalhista/assets/web-app-manifest-192x192.png`
- Ícone 512x512: `/modelotrabalhista/assets/web-app-manifest-512x512.png`

## 📝 Notas técnicas

- O service worker usa a estratégia "cache-first with background update" para melhor performance
- Recursos de CDN (Font Awesome, Google Fonts, VLibras) são cacheados dinamicamente
- O cache é automaticamente limpo quando há nova versão
- Todos os caminhos usam `/modelotrabalhista/` como base para compatibilidade com GitHub Pages
