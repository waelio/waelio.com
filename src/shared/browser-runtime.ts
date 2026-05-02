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
            const waelioKeys = keys.filter((key) => key.startsWith("waelio-cache"));
            await Promise.all(waelioKeys.map((key) => caches.delete(key).catch(() => false)));
        } catch {
            // Ignore cache cleanup failures.
        }
    }
}
