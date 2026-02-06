# Otimizações de Performance Web - ModeloTrabalhista

## Resumo das Melhorias Implementadas

Este documento descreve as otimizações de performance implementadas para reduzir o LCP (Largest Contentful Paint) de 5.1s para menos de 2.5s e melhorar significativamente a experiência do usuário.

## 1. Critical Rendering Path Optimization

### 1.1 Critical CSS Inline

**Problema**: CSS externo bloqueia a renderização inicial da página.

**Solução**: Extraímos e incluímos CSS crítico inline no `<head>` para renderização imediata:

```html
<style>
    /* Critical CSS Variables */
    :root {
        --primary-color: #2563eb;
        --dark-color: #1f2937;
        /* ... outras variáveis críticas */
    }
    
    /* Critical Reset */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { font-family: var(--font-body); /* ... */ }
    
    /* Critical header styles */
    .main-header { /* ... */ }
</style>
```

**Benefício**: FCP reduzido em ~30-40%, pois o navegador pode renderizar o conteúdo above-the-fold imediatamente.

### 1.2 Non-Blocking CSS Loading

**Problema**: Font Awesome e Google Fonts bloqueiam a renderização.

**Solução**: Técnica de carregamento assíncrono com fallback:

```html
<!-- Font Awesome - Load with media=print trick for non-blocking -->
<link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
      as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="..."></noscript>

<!-- Google Fonts with font-display swap -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@300;400;500&display=swap" 
      as="style" onload="this.onload=null;this.rel='stylesheet'">
```

**Benefício**: 
- Fontes não bloqueiam renderização
- `font-display: swap` previne FOIT (Flash of Invisible Text)
- Página renderiza com fontes do sistema e depois substitui

## 2. Resource Hints

### 2.1 DNS Prefetch

**Implementação**:
```html
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://fonts.gstatic.com">
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
```

**Benefício**: Resolve DNS em paralelo durante o parsing do HTML, reduzindo latência de conexão.

### 2.2 Preconnect

**Implementação**:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
```

**Benefício**: Estabelece conexões TCP/TLS antecipadamente, economizando 100-500ms por origem.

### 2.3 Preload

**Implementação**:
```html
<link rel="preload" href="css/style.css?v=1770389835" as="style">
<link rel="preload" href="js/main.js?v=1770389835" as="script">
<link rel="preload" href="js/ui.js?v=1770389835" as="script">
<link rel="preload" href="js/generator.js?v=1770389835" as="script">
```

**Benefício**: Força o navegador a carregar recursos críticos com alta prioridade.

## 3. JavaScript Loading Optimization

### 3.1 Estratégia de Carregamento

**Antes**:
```html
<script src="js/csp-reporter.js"></script>
<script src="js/log.js"></script>
<script src="js/analytics.js" async></script>
<script src="js/ui.js" defer></script>
```

**Depois**:
```html
<!-- Core modules (defer for optimal performance) -->
<script src="js/csp-reporter.js" defer></script>
<script src="js/log.js" defer></script>
<script src="js/ui.js" defer></script>
<script src="js/main.js" defer></script>

<!-- Non-critical modules (async) -->
<script src="js/analytics.js" async></script>
<script src="js/acessibilidade.js" async></script>
```

**Diferenças**:
- **defer**: Scripts executam após parsing do HTML, na ordem que aparecem
- **async**: Scripts executam assim que baixam, sem ordem garantida
- **sem atributo**: Bloqueia parsing (evitado)

**Benefício**: Parsing do HTML nunca é bloqueado, reduzindo TTI (Time to Interactive).

### 3.2 Lazy Loading de Scripts Não-Críticos

```javascript
// Tour.js loaded on-demand (lazy loaded after page load)
window.addEventListener('load', function() {
    setTimeout(function() {
        const tourScript = document.createElement('script');
        tourScript.src = 'js/tour.js';
        tourScript.async = true;
        document.body.appendChild(tourScript);
    }, 1000); // Load after 1 second delay
});
```

**Benefício**: Recursos não-essenciais carregam depois que a página está interativa.

## 4. IndexedDB Performance Best Practices

### 4.1 Problema Identificado

IndexedDB pode bloquear a thread principal se usado de forma síncrona ou com operações pesadas durante o carregamento inicial.

### 4.2 Recomendações de Implementação

#### A. Adiar Operações de IndexedDB

```javascript
// BAD: IndexedDB during page load
document.addEventListener('DOMContentLoaded', function() {
    initializeIndexedDB(); // BLOCKS
    loadDataFromDB(); // BLOCKS
});

// GOOD: IndexedDB after load
window.addEventListener('load', function() {
    setTimeout(function() {
        initializeIndexedDB();
        loadDataFromDB();
    }, 100);
});
```

#### B. Usar Web Workers para Operações Pesadas

```javascript
// worker.js
self.addEventListener('message', function(e) {
    // Operações pesadas de IndexedDB aqui
    const data = processLargeDataset(e.data);
    self.postMessage(data);
});

// main.js
const worker = new Worker('worker.js');
worker.postMessage(largeDataset);
worker.addEventListener('message', function(e) {
    displayData(e.data);
});
```

#### C. Batch Operations e Transactions

```javascript
// BAD: Individual operations
for (const item of items) {
    await db.add(item); // Múltiplas transactions
}

// GOOD: Batch operation
const transaction = db.transaction(['store'], 'readwrite');
const store = transaction.objectStore('store');
for (const item of items) {
    store.add(item); // Single transaction
}
await transaction.complete;
```

#### D. Lazy Loading de Dados

```javascript
// BAD: Load all data on startup
async function init() {
    const allData = await db.getAll(); // Pode ter 1000s de registros
    displayData(allData);
}

// GOOD: Load on-demand with pagination
async function init() {
    // Load only first page
    const firstPage = await db.getPage(0, 20);
    displayData(firstPage);
}

// Load more when needed
async function loadMore(page) {
    const nextPage = await db.getPage(page, 20);
    appendData(nextPage);
}
```

### 4.3 Verificação de Storage.js

Verificar se o arquivo `js/storage.js` segue estas práticas:

```javascript
// storage.js - Padrão Recomendado
class StorageManager {
    constructor() {
        this.db = null;
        this.initialized = false;
    }
    
    // Inicializar de forma assíncrona após page load
    async init() {
        if (this.initialized) return;
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ModeloTrabalhista', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                this.initialized = true;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('documents')) {
                    db.createObjectStore('documents', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }
    
    // Operações devem ser rápidas
    async save(document) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['documents'], 'readwrite');
            const store = transaction.objectStore('documents');
            const request = store.add(document);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // Pagination para lista
    async getRecent(limit = 10) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['documents'], 'readonly');
            const store = transaction.objectStore('documents');
            const request = store.getAll();
            
            request.onsuccess = () => {
                // Retornar apenas os últimos N itens
                const results = request.result.slice(-limit).reverse();
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }
}

// Inicializar após page load
let storage;
window.addEventListener('load', () => {
    setTimeout(() => {
        storage = new StorageManager();
    }, 100);
});
```

## 5. Cache Strategy

### 5.1 Service Worker Cache

O `service-worker.js` já implementa cache, mas certifique-se de:

1. **Não cachear excessivamente**: Cache apenas recursos essenciais
2. **Atualizar cache regularmente**: Use versioning
3. **Limpar cache antigo**: Remove versões antigas

```javascript
// service-worker.js - Best Practice
const CACHE_NAME = 'modelotrabalhista-v1.2';
const MAX_CACHE_SIZE = 50; // Limite de itens

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
```

## 6. Performance Monitoring

### 6.1 Core Web Vitals

Monitorar métricas em produção:

```javascript
// analytics.js - Web Vitals Tracking
import {onFCP, onLCP, onCLS, onFID, onTTFB} from 'web-vitals';

function sendToAnalytics(metric) {
    // Send to analytics service
    console.log(metric.name, metric.value);
}

onFCP(sendToAnalytics);
onLCP(sendToAnalytics);
onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onTTFB(sendToAnalytics);
```

### 6.2 Performance API

```javascript
// Monitorar carregamento de recursos
window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart);
    console.log('Load Complete:', perfData.loadEventEnd - perfData.loadEventStart);
    
    // Recursos individuais
    const resources = performance.getEntriesByType('resource');
    resources.forEach(resource => {
        if (resource.duration > 500) {
            console.warn(`Slow resource: ${resource.name} (${resource.duration}ms)`);
        }
    });
});
```

## 7. Compression e Minification

### 7.1 Server-Side Compression

Configurar no servidor (GitHub Pages já tem):
- **Gzip**: Compressão padrão (70-90% redução)
- **Brotli**: Melhor compressão (75-95% redução)

### 7.2 Asset Optimization

```bash
# Minificar CSS
npx cssnano css/style.css css/style.min.css

# Minificar JavaScript
npx terser js/main.js -o js/main.min.js -c -m

# Otimizar imagens
npx imagemin assets/**/*.{jpg,png} --out-dir=assets/optimized
```

## 8. Resultados Esperados

### Antes das Otimizações:
- **FCP**: 5.1s
- **LCP**: 5.1s
- **Speed Index**: 11.1s
- **TTI**: ~12s

### Depois das Otimizações (Esperado):
- **FCP**: ~1.5s (melhoria de 70%)
- **LCP**: ~2.2s (melhoria de 57%)
- **Speed Index**: ~3.5s (melhoria de 68%)
- **TTI**: ~3.8s (melhoria de 68%)

## 9. Checklist de Implementação

- [x] Critical CSS inline
- [x] Non-blocking font loading
- [x] Resource hints (dns-prefetch, preconnect, preload)
- [x] Script loading optimization (defer/async)
- [x] Lazy loading de scripts não-críticos
- [ ] IndexedDB optimization (verificar storage.js)
- [ ] Minification de assets (CSS/JS)
- [ ] Image optimization
- [ ] Performance monitoring em produção

## 10. Próximos Passos

1. **Verificar storage.js**: Aplicar padrões de IndexedDB recomendados
2. **Minificar assets**: Criar versões minificadas de CSS/JS
3. **Otimizar imagens**: Comprimir e converter para WebP
4. **Implementar monitoring**: Adicionar tracking de Web Vitals
5. **Testar em produção**: Validar melhorias com Lighthouse
6. **Iterar**: Continuar otimizando baseado em dados reais

## Referências

- [Web Vitals](https://web.dev/vitals/)
- [Critical Rendering Path](https://developers.google.com/web/fundamentals/performance/critical-rendering-path)
- [IndexedDB Best Practices](https://web.dev/indexeddb-best-practices/)
- [Resource Hints](https://www.w3.org/TR/resource-hints/)
- [Script Loading](https://html.spec.whatwg.org/multipage/scripting.html#attr-script-async)
