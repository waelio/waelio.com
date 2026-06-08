export async function disableWaelioRuntimeCaching(): Promise<void> {
    if (typeof window === "undefined") {
        return;
    }

    if ("serviceWorker" in navigator) {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((registration) => registration.unregister().catch(() => false)));
        } catch {
            // Ignore service worker cleanup failures.
        }
    }

    if ("caches" in globalThis) {
        try {
            const keys = await caches.keys();
            // Delete ALL caches — no prefix filter — so stale npm API responses never persist.
            await Promise.all(keys.map((key) => caches.delete(key).catch(() => false)));
        } catch {
            // Ignore cache cleanup failures.
        }
    }
}
