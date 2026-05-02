/// <reference lib="webworker" />
export {};
const serviceWorker = globalThis;
const CACHE_NAME = 'waelio-cache-v6';
const APP_SHELL = ['/', '/index.html', '/styles.css', '/app.js', '/manifest.webmanifest', '/favicon.svg'];
serviceWorker.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
    void serviceWorker.skipWaiting();
});
serviceWorker.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve(false))))));
    void serviceWorker.clients.claim();
});
serviceWorker.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    const wantsHtml = request.mode === 'navigate' || (request.headers.get('accept') ?? '').includes('text/html');
    if (wantsHtml || url.pathname.startsWith('/api/')) {
        event.respondWith(fetch(request)
            .then((response) => {
            const responseClone = response.clone();
            void caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, responseClone))
                .catch(() => {
                // Ignore cache write failures.
            });
            return response;
        })
            .catch(async () => (await caches.match(request)) ?? Response.error()));
        return;
    }
    event.respondWith(caches.match(request).then((cachedResponse) => cachedResponse ?? fetch(request)));
});
