import { ViteSSG } from 'vite-ssg'
import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:generated-layouts'
import { createPinia } from 'pinia'
// import '@pnotify/core/dist/PNotify.css'
// import '@pnotify/mobile/dist/PNotifyMobile.css'
import App from './App.vue'
import 'virtual:windi.css'
import 'virtual:windi-devtools'
import './styles/main.css'

const routes = setupLayouts(generatedRoutes)
export const createApp = ViteSSG(
  App,
  { routes },
  async(ctx) => {
    Object.values(import.meta.globEager('./modules/*.ts')).map(i => i.install?.(ctx))
    const { app, initialState } = ctx
    const pinia = createPinia()
    app.use(pinia)

    if (import.meta.env.SSR)
      initialState.pinia = pinia.state.value
    else
      pinia.state.value = initialState.pinia || {}
  },

)
