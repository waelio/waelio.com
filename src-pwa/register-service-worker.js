/* eslint-disable no-undef */
import * as googleAnalytics from 'workbox-google-analytics'
import { Notify } from 'quasar'

if (typeof importScripts === 'function') {
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js')
}

if (workbox) {
  console.log('Yay! Workbox is loaded 🎉')
  workbox.core.setCacheNameDetails({ prefix: 'waelio-datastore' })
  workbox.core.skipWaiting()
  workbox.core.clientsClaim()
  const cacheFiles = [{
    revision: 'e653ab4d124bf16b5232',
    url: 'https://aws-amplify.github.io/img/amplify.svg'
  }]
  self.__precacheManifest = cacheFiles.concat(self.__precacheManifest || [])
  workbox.precaching.precacheAndRoute(self.__precacheManifest, {})
} else {
  console.log('Boo! Workbox didn\'t load 😬')
}

// events passes a ServiceWorkerRegistration instance in their arguments.

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (/* registration */) {
    // console.log('Service worker is active.')
  },

  registered (/* registration */) {
    console.log('Service worker has been registered.')
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
