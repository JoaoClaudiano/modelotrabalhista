// Service Worker para ModeloTrabalhista PWA
// Versão 1.0.0

const CACHE_NAME = 'modelotrabalhista-v1';
const OFFLINE_URL = '/modelotrabalhista/index.html';

// Regex para arquivos cacheáveis
const CACHEABLE_EXTENSIONS = /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|json)$/;

// Recursos essenciais para cache inicial
const ESSENTIAL_RESOURCES = [
  '/modelotrabalhista/',
  '/modelotrabalhista/index.html',
  '/modelotrabalhista/style.css',
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

// Tracking para atualizações em background
const updatingResources = new Set();

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
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
  console.log('[Service Worker] Ativando...');
  
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
  const url = new URL(request.url);
  
  // Lista de domínios confiáveis para cache
  const trustedDomains = [
    'cdnjs.cloudflare.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ];
  
  // Ignora requisições que não são do mesmo domínio ou de CDNs confiáveis
  if (url.origin !== location.origin && 
      !trustedDomains.includes(url.hostname)) {
    return;
  }

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

  // Para outros recursos, usa cache-first
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Retorna do cache e atualiza em background (evita duplicatas)
          const requestUrl = request.url;
          if (!updatingResources.has(requestUrl)) {
            updatingResources.add(requestUrl);
            
            fetch(request)
              .then((response) => {
                if (response && response.status === 200) {
                  const responseToCache = response.clone();
                  caches.open(CACHE_NAME)
                    .then((cache) => {
                      cache.put(request, responseToCache);
                    })
                    .finally(() => {
                      updatingResources.delete(requestUrl);
                    });
                } else {
                  updatingResources.delete(requestUrl);
                }
              })
              .catch(() => {
                updatingResources.delete(requestUrl);
              });
          }
          
          return cachedResponse;
        }

        // Se não está no cache, busca da rede
        return fetch(request)
          .then((response) => {
            // Cacheia apenas respostas válidas
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clona a resposta antes de cachear
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Cacheia recursos estáticos usando a constante
                if (request.url.match(CACHEABLE_EXTENSIONS)) {
                  cache.put(request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // Se falhar completamente, tenta buscar do cache
            return caches.match(request);
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
