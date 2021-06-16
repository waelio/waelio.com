import { ViteSSG } from 'vite-ssg'
import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:generated-layouts'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
// import { pinia } from '~/store/store.pinia' // import from the file you just created.

import 'virtual:windi.css'
import 'virtual:windi-devtools'
import './styles/main.css'

const routes = setupLayouts(generatedRoutes)
// eslint-disable-next-line curly
if (typeof window !== 'undefined') {
  import('./pwa')
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
