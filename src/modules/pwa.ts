import { UserModule } from '~/types'

// https://github.com/antfu/vite-plugin-pwa#automatic-reload-when-new-content-available
export const install: UserModule = ({ isClient, router }) => {
  if (!isClient)
    return
  import('~/pwa.ts')

  router.isReady().then(async() => {
    const { registerSW } = await import('virtual:pwa-register')
    registerSW({ immediate: true })
  })
}
