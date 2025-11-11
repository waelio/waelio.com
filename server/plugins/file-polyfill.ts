// Nitro server plugin to polyfill global File before any runtime code uses undici internals.
export default async () => {
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
        // @ts-expect-error assign to global
        globalThis.File = PolyfillFile
    }
}
