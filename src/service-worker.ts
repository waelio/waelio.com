/// <reference lib="webworker" />

export { };

const serviceWorker = globalThis as unknown as ServiceWorkerGlobalScope;
serviceWorker.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(serviceWorker.skipWaiting());
});

serviceWorker.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
        await serviceWorker.registration.unregister();
        await serviceWorker.clients.claim();
    })());
});
