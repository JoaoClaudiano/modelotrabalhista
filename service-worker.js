// Service Worker para ModeloTrabalhista PWA
// Versão 1.1.0 - Com suporte a Cache Busting

const CACHE_NAME = 'modelotrabalhista-v1.1';
const OFFLINE_URL = '/modelotrabalhista/index.html';

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
    'cdn.jsdelivr.net'
  ];
  
  // Verifica se é do mesmo domínio ou de um CDN confiável
  const isTrusted = urlObj.origin === location.origin || 
                    trustedDomains.includes(urlObj.hostname);
  
  // Verifica se tem extensão cacheável
  const hasExtension = CACHEABLE_EXTENSIONS.test(urlObj.pathname);
  
  return isTrusted && hasExtension;
}

// Recursos essenciais para cache inicial
const ESSENTIAL_RESOURCES = [
  '/modelotrabalhista/',
  '/modelotrabalhista/index.html',
  '/modelotrabalhista/css/style.css',
  '/modelotrabalhista/css/responsive.css',
  '/modelotrabalhista/assets/css/print.css',
  '/modelotrabalhista/js/main.js',
  '/modelotrabalhista/js/ui.js',
  '/modelotrabalhista/js/generator.js',
  '/modelotrabalhista/js/storage.js',
  '/modelotrabalhista/js/export.js',
  '/modelotrabalhista/js/log.js',
  '/modelotrabalhista/js/analytics.js',
  '/modelotrabalhista/js/acessibilidade.js',
  '/modelotrabalhista/js/tour.js',
  '/modelotrabalhista/models/templates.json',
  '/modelotrabalhista/assets/manifest.json',
  '/modelotrabalhista/assets/web-app-manifest-192x192.png',
  '/modelotrabalhista/assets/web-app-manifest-512x512.png',
  '/modelotrabalhista/assets/apple-touch-icon.png',
  '/modelotrabalhista/assets/favicon-96x96.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando v1.1...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pré-cache de recursos essenciais');
        return cache.addAll(ESSENTIAL_RESOURCES);
      })
      .then(() => {
        console.log('[Service Worker] Instalação concluída');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Erro ao instalar:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando v1.1...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Ativação concluída');
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
    // Se não é cacheável, apenas faz a requisição normal
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
