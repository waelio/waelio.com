
if (!import.meta.env.SSR && typeof window !== 'undefined') {
  self.addEventListener('push', (e) => {
    const data = e.data.json()
    // eslint-disable-next-line no-console
    console.log('Push Received...')
    self.registration.showNotification(data.title, {
      body: 'Notified by Waelio.com!',
      icon: 'https://picmymenu.s3.eu-west-3.amazonaws.com/waelio_logo.png',
    })
  })
  // import('./feathers.ts')
  // import('./store/store.pinia.ts')
}
