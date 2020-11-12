/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */
/* eslint-disable no-undef */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');
import * as googleAnalytics from 'workbox-google-analytics'
import { Notify } from 'quasar'
import { notifyMe } from '../src/utils/notify'
import { precacheAndRoute } from 'workbox-precaching'
import { setCacheNameDetails, skipWaiting, clientsClaim } from 'workbox-core'
import { register } from 'register-service-worker'

skipWaiting()
clientsClaim()
setCacheNameDetails({
  prefix: 'my-app',
  suffix: 'v1',
  precache: 'install-time',
  runtime: 'run-time',
  waelioDatastore: 'waelio.com'
})
precacheAndRoute()

register(process.env.SERVICE_WORKER_FILE, {

  registrationOptions: { scope: './' },

  ready (/* registration */) {
    // console.log('Service worker is active.')
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
    notifyMe('No internet connection found. App is running in offline mode.')
  },

  error (/* err */) {
    // console.error('Error during service worker registration:', err)
  }
})
