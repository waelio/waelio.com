/* eslint-disable no-console */
console.log('Service Worker Loaded...')

self.addEventListener('push', (e) => {
  const data = e.data.json()
  console.log('Push Received...')
  self.registration.showNotification(data.title, {
    body: 'Notified by Waelio.com!',
    icon: 'https://waelio.com/waelio_logo.png',
  })
})
