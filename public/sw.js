const CACHE_NAME = 'imsoft-cache-v1';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/logos/logo-imsoft-blue.png',
  OFFLINE_URL
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Only handle local origin requests
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, but refresh in the background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Cache successful local assets
        if (response.status === 200 && (
          event.request.destination === 'document' ||
          event.request.destination === 'style' ||
          event.request.destination === 'script' ||
          event.request.destination === 'image' ||
          event.request.destination === 'font'
        )) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(async () => {
        // In case of offline navigate request, return offline.html
        if (event.request.mode === 'navigate') {
          const cache = await caches.open(CACHE_NAME);
          const offlineResponse = await cache.match(OFFLINE_URL);
          if (offlineResponse) return offlineResponse;
        }
      });
    })
  );
});
