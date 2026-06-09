const CACHE = 'hospitonet-v1';

// API paths — always go to network, never cache
const API_PREFIXES = ['/api', '/otp', '/patient', '/appointment'];

const isApiCall = (url) =>
  API_PREFIXES.some(p => new URL(url).pathname.startsWith(p));

// ── Install: pre-cache the app shell ──────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(['/', '/index.html']).catch(() => {})
    )
  );
  self.skipWaiting();
});

// ── Activate: remove stale caches ─────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: stale-while-revalidate for assets, network-only for API ────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (isApiCall(request.url)) return; // let API calls bypass the SW entirely

  event.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(request);

      const networkPromise = fetch(request)
        .then(response => {
          if (response.ok && response.type !== 'opaque') {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached); // offline fallback — return cached version

      // Return cached immediately, update in background (stale-while-revalidate)
      return cached || networkPromise;
    })
  );
});
