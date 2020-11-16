/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */
// importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js')
/* eslint-disable */
import { precacheAndRoute } from 'workbox-precaching'
import * as googleAnalytics from 'workbox-google-analytics'
import { Notify } from 'quasar'
import { notifyMe } from 'src/utils/notifyMe'
import { setCacheNameDetails, skipWaiting, clientsClaim } from 'workbox-core'
import { register } from 'register-service-worker'

setCacheNameDetails({
  prefix: 'waelio.com',
  suffix: 'v1',
  precache: 'install-time',
  runtime: 'run-time',
  waelioDatastore: 'waelio.com'
})
skipWaiting()
clientsClaim()
const cacheFiles = [{
 "revision": "e653ab4d124bf16b5232",
 "url": "https://aws-amplify.github.io/img/amplify.svg"
}]

self.__precacheManifest = cacheFiles.concat(
      {
        name: 'Wael Wahbeh',
        short_name: 'Waelio',
        description: 'Personal Portfolio Website with current projects, links to previous projects. Contact US page as well as support page for other online projects. Welcome Friends.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        files: [
          {
            src: 'pdf/Waels_Resume_Fresh.pdf',
            type: 'application/pdf'
          }
        ],
        images: [],
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }, [cacheFiles])
precacheAndRoute(self.__WB_MANIFEST)
register(process.env.SERVICE_WORKER_FILE, {
  // registrationOptions: { scope: './' },
  ready (/* registration */) {
    console.log('ready')
    console.log('Service worker is active.')
  },
  registered (/* registration */) {
    // console.log('Service worker has been registered.')
    notifyMe(true)
  },
  cached (/* registration */) {
    // console.log('Content has been cached for offline use.')
  },
  updatefound (/* registration */) {
    // console.log('New content is downloading.')
  },
  updated (registration) {
    // registration -> a ServiceWorkerRegistration instance
    // console.log('New content is available; please refresh.')
    notifyMe('New content is available; please refresh.')
    Notify.create({
      message: 'New Update available',
      color: 'warning',
      icon: 'cloud_download',
      closeBtn: 'Update',
      timeout: 10000,
      onDismiss () {
        location.reload()
      }
    })
  },
  offline () {
    googleAnalytics.initialize()
    // console.log('No internet connection found. App is running in offline mode.')
    notifyMe('No internet connection found. App is running in offline mode.')
  },
  error (/* err */) {
    // console.error('Error during service worker registration:', err)
  }
})
