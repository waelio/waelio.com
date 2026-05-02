/// <reference lib="webworker" />

export { };

const serviceWorker = globalThis as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = 'waelio-cache-v8';
const APP_SHELL: string[] = [
    '/',
    '/index.html',
    '/login.html',
    '/styles.css',
    '/app.js',
    '/login.js',
    '/manifest.webmanifest',
    '/favicon.png?v=20260502',
    '/logo.png?v=20260502',
];

serviceWorker.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
    void serviceWorker.skipWaiting();
});

serviceWorker.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve(false))),
        )),
    );
    void serviceWorker.clients.claim();
});

serviceWorker.addEventListener('fetch', (event: FetchEvent) => {
    const request = event.request;
    const url = new URL(request.url);
    const wantsHtml = request.mode === 'navigate' || (request.headers.get('accept') ?? '').includes('text/html');

    if (wantsHtml || url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseClone = response.clone();
                    void caches.open(CACHE_NAME)
                        .then((cache) => cache.put(request, responseClone))
                        .catch(() => {
                            // Ignore cache write failures.
                        });
                    return response;
                })
                .catch(async () => (await caches.match(request)) ?? Response.error()),
        );
        return;
    }

    event.respondWith(caches.match(request).then((cachedResponse) => cachedResponse ?? fetch(request)));
});
