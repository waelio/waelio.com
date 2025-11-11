// Minimal File polyfill for SSR to avoid "File is not defined" errors
// If Node provides a native File (Node 22+), we leave it untouched.
// Some libraries (e.g. undici consumers) may reference global File during SSR.
export default defineNuxtPlugin(() => {
    if (typeof globalThis.File === 'undefined') {
        class PolyfillFile extends Blob {
            name: string
            lastModified: number
            constructor(fileBits: BlobPart[], fileName: string, options: { type?: string, lastModified?: number } = {}) {
                super(fileBits, options)
                this.name = fileName.replace(/\/+$/, '')
                this.lastModified = options.lastModified || Date.now()
            }
        }
        // @ts-expect-error define polyfill
        globalThis.File = PolyfillFile
    }
})
