self.addEventListener('push', (e) => { 
  console.log('Push Received...')
  const data = e.data.json()
  self.registration.showNotification(data.title, {
    body: 'Notified by Waelio.com!',
    icon: 'https://picmymenu.s3.eu-west-3.amazonaws.com/waelio_logo.png',
  })
})
