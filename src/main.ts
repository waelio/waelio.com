import { ViteSSG } from 'vite-ssg'
import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:generated-layouts'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
// import { pinia } from '~/store/store.pinia' // import from the file you just created.

import 'virtual:windi.css'
import 'virtual:windi-devtools'
import './styles/main.css'

const routes = setupLayouts(generatedRoutes)
// eslint-disable-next-line curly
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator)
    import('./pwa')
}
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updateSW = registerSW({
      onNeedRefresh() {
      // show a prompt to user
      },
      onOfflineReady() {
      // show a ready to work offline to user
      },
    })
  }
}
// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  { routes },
  (ctx) => {
    // install all modules under `modules/`
    Object.values(import.meta.globEager('./modules/*.ts')).map(i => i.install?.(ctx))
  },
)
