// Ensure global File exists during SSR to satisfy libraries that reference it (e.g., undici)
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
        // @ts-expect-error define polyfill on globalThis
        globalThis.File = PolyfillFile
    }
})
