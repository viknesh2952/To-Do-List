const CACHE_NAME = 'todo-cache-v1';
const urlsToCache = [
  '/',
  '/To-Do-List/index.html',
  '/To-Do-List/styles.css',
  '/To-Do-List/app.js',
  '/To-Do-List/manifest.json',
  '/To-Do-List/icons/icon-512x512.png'
];

// Install the service worker and cache assets
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch from cache or network
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (cachedResponse) {
        // If the request is in the cache, return it
        if (cachedResponse) {
          return cachedResponse;
        }
        // Otherwise, fetch from network
        return fetch(event.request);
      })
  );
});

// Activate service worker and remove old caches
self.addEventListener('activate', function (event) {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
