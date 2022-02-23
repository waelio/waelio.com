import { createPinia } from 'pinia'
import { UserModule } from '~/types'

// https://github.com/antfu/vite-plugin-pwa#automatic-reload-when-new-content-available
export const install: UserModule = ({ app, isClient }) => {
  if (!isClient)
    return

  app.use(createPinia)
}
