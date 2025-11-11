// Minimal File polyfill for SSR to avoid "File is not defined" errors.
// This is necessary for some libraries (e.g., consumers of undici) that may
// reference the global `File` object during server-side rendering.
// If Node.js provides a native File object (e.g., Node 22+), this polyfill will not be applied.
export default defineNuxtPlugin(() => {
    if (typeof globalThis.File === 'undefined') {
        class PolyfillFile extends Blob {
            name: string
            lastModified: number
            constructor(fileBits: BlobPart[], fileName: string, options: { type?: string; lastModified?: number } = {}) {
                super(fileBits, options)
                this.name = fileName.replace(/\/+$/, '')
                this.lastModified = options.lastModified || Date.now()
            }
        }
        // @ts-expect-error define polyfill on globalThis
        globalThis.File = PolyfillFile
    }
})
