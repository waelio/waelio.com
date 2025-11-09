
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T


export const Counter: typeof import("../app/components/Counter.vue")['default']
export const DarkToggle: typeof import("../app/components/DarkToggle.vue")['default']
export const Footer: typeof import("../app/components/Footer.vue")['default']
export const InputEntry: typeof import("../app/components/InputEntry.vue")['default']
export const Logos: typeof import("../app/components/Logos.vue")['default']
export const PageView: typeof import("../app/components/PageView.vue")['default']
export const UnoIcon: typeof import("../node_modules/.pnpm/@unocss+nuxt@66.5.4_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@unocss/nuxt/runtime/UnoIcon.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const ColorScheme: typeof import("../node_modules/.pnpm/@nuxtjs+color-mode@3.5.2_magicast@0.3.5/node_modules/@nuxtjs/color-mode/dist/runtime/component.vue3.vue")['default']
export const VitePwaManifest: typeof import("../node_modules/.pnpm/@vite-pwa+nuxt@1.0.7_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest")['default']
export const NuxtPwaManifest: typeof import("../node_modules/.pnpm/@vite-pwa+nuxt@1.0.7_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest")['default']
export const NuxtPwaAssets: typeof import("../node_modules/.pnpm/@vite-pwa+nuxt@1.0.7_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@vite-pwa/nuxt/dist/runtime/components/NuxtPwaAssets")['default']
export const PwaAppleImage: typeof import("../node_modules/.pnpm/@vite-pwa+nuxt@1.0.7_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaAppleImage")['default']
export const PwaAppleSplashScreenImage: typeof import("../node_modules/.pnpm/@vite-pwa+nuxt@1.0.7_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaAppleSplashScreenImage")['default']
export const PwaFaviconImage: typeof import("../node_modules/.pnpm/@vite-pwa+nuxt@1.0.7_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaFaviconImage")['default']
export const PwaMaskableImage: typeof import("../node_modules/.pnpm/@vite-pwa+nuxt@1.0.7_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaMaskableImage")['default']
export const PwaTransparentImage: typeof import("../node_modules/.pnpm/@vite-pwa+nuxt@1.0.7_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaTransparentImage")['default']
export const NuxtPage: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyCounter: LazyComponent<typeof import("../app/components/Counter.vue")['default']>
export const LazyDarkToggle: LazyComponent<typeof import("../app/components/DarkToggle.vue")['default']>
export const LazyFooter: LazyComponent<typeof import("../app/components/Footer.vue")['default']>
export const LazyInputEntry: LazyComponent<typeof import("../app/components/InputEntry.vue")['default']>
export const LazyLogos: LazyComponent<typeof import("../app/components/Logos.vue")['default']>
export const LazyPageView: LazyComponent<typeof import("../app/components/PageView.vue")['default']>
export const LazyUnoIcon: LazyComponent<typeof import("../node_modules/.pnpm/@unocss+nuxt@66.5.4_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@unocss/nuxt/runtime/UnoIcon.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyColorScheme: LazyComponent<typeof import("../node_modules/.pnpm/@nuxtjs+color-mode@3.5.2_magicast@0.3.5/node_modules/@nuxtjs/color-mode/dist/runtime/component.vue3.vue")['default']>
export const LazyVitePwaManifest: LazyComponent<typeof import("../node_modules/.pnpm/@vite-pwa+nuxt@1.0.7_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest")['default']>
export const LazyNuxtPwaManifest: LazyComponent<typeof import("../node_modules/.pnpm/@vite-pwa+nuxt@1.0.7_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest")['default']>
export const LazyNuxtPwaAssets: LazyComponent<typeof import("../node_modules/.pnpm/@vite-pwa+nuxt@1.0.7_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@vite-pwa/nuxt/dist/runtime/components/NuxtPwaAssets")['default']>
export const LazyPwaAppleImage: LazyComponent<typeof import("../node_modules/.pnpm/@vite-pwa+nuxt@1.0.7_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaAppleImage")['default']>
export const LazyPwaAppleSplashScreenImage: LazyComponent<typeof import("../node_modules/.pnpm/@vite-pwa+nuxt@1.0.7_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaAppleSplashScreenImage")['default']>
export const LazyPwaFaviconImage: LazyComponent<typeof import("../node_modules/.pnpm/@vite-pwa+nuxt@1.0.7_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaFaviconImage")['default']>
export const LazyPwaMaskableImage: LazyComponent<typeof import("../node_modules/.pnpm/@vite-pwa+nuxt@1.0.7_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaMaskableImage")['default']>
export const LazyPwaTransparentImage: LazyComponent<typeof import("../node_modules/.pnpm/@vite-pwa+nuxt@1.0.7_magicast@0.3.5_vite@7.1.12_jiti@2.6.1_terser@5.39.0_yaml@2.8.1_/node_modules/@vite-pwa/nuxt/dist/runtime/components/nuxt4/PwaTransparentImage")['default']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.2.0_@parcel+watcher@2.5.1_@vue+compiler-sfc@3.5.22_db0@0.3.4_eslint@9.38.0_jiti@_371e054bb07e43a6c952e6b043a25548/node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
