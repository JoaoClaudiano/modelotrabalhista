// Service Worker para ModeloTrabalhista PWA
// Versão 1.8.0 - Fix para CSP cache e recursos externos

const CACHE_NAME = 'modelotrabalhista-v1.8';
const OFFLINE_URL = '/index.html';

// Regex para arquivos cacheáveis
const CACHEABLE_EXTENSIONS = /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|json)$/;

/**
 * Remove query strings de versão (?v=...) para normalização de cache
 * Isso permite que o SW reconheça o mesmo arquivo mesmo com versões diferentes
 * @param {string} url - URL completa
 * @returns {string} URL limpa sem query string de versão
 */
function getCleanUrl(url) {
  try {
    const urlObj = new URL(url);
    // Remove apenas o parâmetro 'v', mantendo outros parâmetros se existirem
    urlObj.searchParams.delete('v');
    return urlObj.toString();
  } catch (error) {
    console.warn('[Service Worker] URL inválida:', url, error);
    return url; // Retorna URL original se falhar
  }
}

/**
 * Verifica se uma URL deve ser cacheada
 * @param {string} url - URL para verificar
 * @returns {boolean}
 */
function isCacheable(url) {
  const urlObj = new URL(url);
  
  // Lista de domínios confiáveis para cache
  const trustedDomains = [
    'cdnjs.cloudflare.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdn.jsdelivr.net',
    'vlibras.gov.br'  // Adicionado para suporte ao VLibras
  ];
  
  // Verifica se é do mesmo domínio ou de um CDN confiável
  const isTrusted = urlObj.origin === location.origin || 
                    trustedDomains.includes(urlObj.hostname);
  
  // Verifica se tem extensão cacheável
  const hasExtension = CACHEABLE_EXTENSIONS.test(urlObj.pathname);
  
  // Caso especial: Google Fonts CSS (pathname começa com /css)
  const isGoogleFontsCSS = urlObj.hostname === 'fonts.googleapis.com' && 
                           urlObj.pathname.startsWith('/css');
  
  return isTrusted && (hasExtension || isGoogleFontsCSS);
}

// Recursos essenciais para cache inicial
const ESSENTIAL_RESOURCES = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/responsive.css',
  '/assets/css/print.css',
  '/js/main.js',
  '/js/ui.js',
  '/js/generator.js',
  '/js/storage.js',
  '/js/export.js',
  '/js/log.js',
  '/js/analytics.js',
  '/js/acessibilidade.js',
  '/js/tour.js',
  '/models/templates.json',
  '/assets/manifest.json',
  '/assets/web-app-manifest-192x192.png',
  '/assets/web-app-manifest-512x512.png',
  '/assets/apple-touch-icon.png',
  '/assets/favicon-96x96.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing v1.8...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching essential resources');
        return cache.addAll(ESSENTIAL_RESOURCES);
      })
      .then(() => {
        console.log('[Service Worker] Installation completed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation error:', error.message || error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating v1.8...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation completed successfully');
        console.log('[Service Worker] Old CSP-affected caches have been cleared');
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Para navegação (HTML), usa network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clona a resposta antes de cachear
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // Se falhar, tenta buscar do cache
          return caches.match(request)
            .then((response) => {
              if (response) {
                return response;
              }
              // Se não encontrar no cache, retorna a página offline
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }
  
  // Verifica se é cacheável
  if (!isCacheable(request.url)) {
    // Se não é cacheável, permite que o navegador faça a requisição normalmente
    event.respondWith(fetch(request));
    return;
  }

  // Para outros recursos (CSS, JS, etc), usa Stale-While-Revalidate
  // compatível com Cache Busting
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Buscar versão atualizada do servidor em paralelo
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  // Cacheia a resposta
                  cache.put(request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // Se falhar a requisição de rede, retorna null
            return null;
          });
        
        // Se tem cache, retorna imediatamente (Stale-While-Revalidate)
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Se não tem cache, aguarda a requisição de rede
        if (fetchPromise) {
          return fetchPromise;
        }
        
        // Fallback final: tentar cache novamente
        return caches.match(request).then(fallbackResponse => {
          return fallbackResponse || new Response('Offline - recurso não disponível', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Listener para mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        })
        .then(() => {
          return self.clients.matchAll();
        })
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'CACHE_CLEARED' });
          });
        })
    );
  }
});

// Listener para sincronização em background
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Implementar lógica de sincronização se necessário
      Promise.resolve()
    );
  }
});
