self.addEventListener('push', (e) => {
  control.log(e)
  const data = e.data.json()
  console.log('Push Received...')
  self.registration.showNotification(data.title, {
    body: 'Notified by Waelio.com!',
    icon: 'https://picmymenu.s3.eu-west-3.amazonaws.com/waelio_logo.png',
  })
})
