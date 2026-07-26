const CACHE = 'hospitonet-v1';

// API paths — always go to network, never cache
const API_PREFIXES = ['/api', '/otp', '/patient', '/appointment-graphql'];

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

// ── Push: show a system notification for the payload otp-service sent ────────
self.addEventListener('push', event => {
  let data = { title: 'Hospitonet', body: 'You have a new notification.' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch { /* non-JSON payload — fall back to defaults */ }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: { url: data.url || '/notifications' },
    })
  );
});

// ── Notification click: focus an existing tab or open a new one at the deep link ──
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
