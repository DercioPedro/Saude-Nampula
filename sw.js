// sw.js - Service Worker para o Saúde Nampula

const CACHE_NAME = 'saude-nampula-v2';
const urlsToCache = [
  '/',
  '/hospital',
  '/centros',
  '/farm',
  '/emer',
  '/sobre',
  '/dicas',
  '/info',
  '/styles/home.css',
  '/styles/darkmode.css',
  '/JS/api-config.js',
  '/JS/home.js',
  '/img/monitor.png',
  '/img/hospital.png',
  '/img/centros.png',
  '/img/comprimidos.png',
  '/img/call.png'
];

// Instalação
self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Intercepção de requisições
self.addEventListener('fetch', function (event) {
  var request = event.request;

  // Ignorar métodos que não sejam GET e pedidos para outros domínios
  if (request.method !== 'GET') return;

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegação (HTML): network-first para garantir conteúdo atualizado e indexável
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (cached) {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // Restantes recursos: cache-first
  event.respondWith(
    caches.match(request).then(function (response) {
      if (response) {
        return response;
      }

      return fetch(request).then(function (response) {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        var responseToCache = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(request, responseToCache);
        });

        return response;
      });
    })
  );
});
