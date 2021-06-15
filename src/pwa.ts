/* eslint-disable no-console */
const publicVapidKey = import.meta.env.VITE_VID_PUBLIC
// eslint-disable-next-line import/no-mutable-exports
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    self.addEventListener('push', (e) => {
      const data = e.data.json()
      console.log('Push Received...')
      self.registration.showNotification(data.title, {
        body: 'Notified by Waelio.com!',
        icon: 'https://picmymenu.s3.eu-west-3.amazonaws.com/waelio_logo.png',
      })
    })
  }
}
const unSubscribe = () => {
  if (typeof window !== 'undefined') {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((subscription) => {
          if (!subscription) {
            console.log('no subscription')
            // eslint-disable-next-line no-alert
            alert('You are not subscribed')
            return false
          }
          subscription.unsubscribe().then(async(successful) => {
            // You've successfully unsubscribed
            console.log('unsubscribe success', successful)
            await fetch(`${import.meta.env.VITE_API_URL}/subscribe?unsubscribe=true`, {
              method: 'POST',
              body: JSON.stringify(subscription),
              headers: {
                'content-type': 'application/json',
              },
            })
              .then(() => {
                // eslint-disable-next-line no-alert
                alert('You unsubscribed successfully!')
                return true
              })
              .catch((error) => {
                console.log(error)
                return false
              })
          }).catch((e) => {
            console.error(e)
            return false
          })
        })
      })
    }
  }
}
const Send = async function() {
  if (typeof window !== 'undefined') {
    if ('serviceWorker' in navigator) {
      const register = await navigator.serviceWorker.register('worker.js', {
        scope: '/',
      })

      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      })

      await fetch(`${import.meta.env.VITE_API_URL}/subscribe`, {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'content-type': 'application/json',
        },
      })
        .then(() => 'true')
        .catch((error) => {
          console.log(error)
        })
    }
  }
}
export { Send, unSubscribe }
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i)

  return outputArray
}
