import { ViteSSG } from 'vite-ssg'
import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:generated-layouts'
import { createPinia } from 'pinia'
import { initQuasar } from './quasar'
import {runSetup} from './utils/setCssVars'
import App from './App.vue'
// import 'uno.css'
import 'virtual:windi.css'
import 'virtual:windi-devtools'
import './styles/main.scss'

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
    else {
      runSetup()
      initQuasar(app)
      pinia.state.value = initialState.pinia || {}
    }
  },

)
