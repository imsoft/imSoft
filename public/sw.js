// v2: navegación network-first + nunca cachear redirecciones.
// v1 cacheaba '/' (una redirección a /es|/en) y la servía cache-first:
// Chromium rechaza respuestas redirigidas cacheadas en navegaciones (ERR_FAILED).
const CACHE_NAME = 'imsoft-cache-v2';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/logos/logo-imsoft-blue.png',
  OFFLINE_URL
];

const CACHEABLE_DESTINATIONS = ['document', 'style', 'script', 'image', 'font'];

function isCacheable(response) {
  return response && response.status === 200 && !response.redirected;
}

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

  // Navigations (HTML): network-first, so a deploy or a bad cached copy
  // never leaves the user stuck on a stale page.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (isCacheable(response)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedPage = await cache.match(event.request);
          if (cachedPage) return cachedPage;
          const offlineResponse = await cache.match(OFFLINE_URL);
          if (offlineResponse) return offlineResponse;
          return Response.error();
        })
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, but refresh in the background
        fetch(event.request).then((networkResponse) => {
          if (isCacheable(networkResponse)) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});

        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (isCacheable(response) && CACHEABLE_DESTINATIONS.includes(event.request.destination)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
