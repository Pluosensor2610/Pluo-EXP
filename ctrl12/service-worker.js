const CACHE_NAME = 'pluo-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './unidades.html',
  './equipo.html',
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap',
  'https://fonts.gstatic.com/',
  'https://unpkg.com/mqtt@5.10.0/dist/mqtt.min.js',
  'https://www.gstatic.com/firebasejs/10.3.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.3.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore-compat.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  if (event.request.method !== 'GET') {
    return;
  }
  
  if (url.hostname === 'broker.hivemq.com' || url.hostname === '192.168.1.1') {
    return;
  }
  
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) return response;
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      }).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});
