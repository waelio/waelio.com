const CACHE_NAME = 'waelio-cache-v9';
const ASSET_VERSION = '20251113';
const v = (path) => `${path}?v=${ASSET_VERSION}`;
const APP_SHELL = [
  '/',
  '/index.html',
  v('/styles.css'),
  v('/app.js'),
  v('/theme.js'),
  v('/ga.js'),
  v('/consent.js'),
  '/favicon.svg',
  '/social-card.svg',
  v('/manifest.webmanifest'),
  '/about.html',
  '/contact.html',
  '/privacy.html',
  '/terms.html',
  '/thanks.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const wantsHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (wantsHTML || url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req))
    );
  } else {
    event.respondWith(
      caches.match(req).then((res) => res || fetch(req))
    );
  }
});
