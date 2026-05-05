const CACHE_NAME = 'mandilink-cache-v1';
const URLS_TO_CACHE = ['/'];

// Install event: cache the home page and log installation
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Activate event: log activation and clean up old caches if any
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate event');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Fetch event: respond with cached home page if offline
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.endsWith('/')) {
    event.respondWith(
      caches.match('/').then(response => {
        return response || fetch(event.request);
      })
    );
  }
});