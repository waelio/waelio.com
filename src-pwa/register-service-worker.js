/* eslint-disable no-undef */
import * as googleAnalytics from 'workbox-google-analytics'
import { Notify } from 'quasar'
import { notifyMe } from './notify'
import { precacheAndRoute } from 'workbox-precaching'
import { setCacheNameDetails, skipWaiting, clientsClaim } from 'workbox-core'

skipWaiting()
clientsClaim()
setCacheNameDetails({
  prefix: 'my-app',
  suffix: 'v1',
  precache: 'install-time',
  runtime: 'run-time',
  waelioDatastore: 'ww'
})
const cacheFiles = [{
  revision: 'e653ab4d124bf16b5232',
  url: 'https://aws-amplify.github.io/img/amplify.svg'
}]
self.__precacheManifest = cacheFiles.concat(self.__precacheManifest || [])
precacheAndRoute(self.__precacheManifest, {})

register(process.env.SERVICE_WORKER_FILE, {

  // registrationOptions: { scope: './' },

  ready (/* registration */) {
    // console.log('Service worker is active.')
  },

  registered (/* registration */) {
    console.log('Service worker has been registered.')
    notifyMe(true)
  },

  cached (/* registration */) {
    console.log('Content has been cached for offline use.')
  },

  updatefound (/* registration */) {
    console.log('New content is downloading.')
  },

  updated (registration) {
    // registration -> a ServiceWorkerRegistration instance
    console.log('New content is available; please refresh.')
    Notify.create({
      message: 'messages.update_available',
      icon: 'cloud_download',
      closeBtn: 'labels.update',
      timeout: 10000,
      onDismiss () {
        location.reload()
      }
    })
  },

  offline () {
    googleAnalytics.initialize()
    // console.log('No internet connection found. App is running in offline mode.')
  },

  error (/* err */) {
    // console.error('Error during service worker registration:', err)
  }
})
