// sw.js - Service Worker para o Saúde Nampula

const CACHE_NAME = 'saude-nampula-v1';
const urlsToCache = [
  '/',
  '/home.html',
  '/hospital.html',
  '/centros.html',
  '/farm.html',
  '/emer.html',
  '/sobre.html',
  '/dicas.html',
  '/info.html',
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
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Intercepção de requisições
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Retorna do cache se existir
        if (response) {
          return response;
        }
        
        // Se não existir no cache, busca da rede
        return fetch(event.request).then(function(response) {
          // Se não for uma resposta válida, retorna
          if (!response || response.status !== 200) {
            return response;
          }
          
          // Clona a resposta para guardar no cache
          var responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});
