/* eslint-disable no-console */
import { api } from '~/modules/feathers'
const publicVapidKey = import.meta.env.VITE_VID_PUBLIC

if (typeof window !== 'undefined') {
  self.addEventListener('push', (e) => {
    const data = e.data.json()
    console.log('Push Received...')
    self.registration.showNotification(data.title, {
      body: 'Notified by Waelio.com!',
      icon: 'https://picmymenu.s3.eu-west-3.amazonaws.com/waelio_logo.png',
    })
  })
}
const unSubscribe = () => {
  if (typeof window !== 'undefined') {
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
          try {
            await api.service('subscribe').remove(subscription)
            // eslint-disable-next-line no-alert
            alert('You unsubscribed successfully!')
            return true
          }
          catch (error) {
            // Could not Delete Subscription from Database
            console.log(error)
            return false
          }
        }).catch((e) => {
          // Cannot Unsubscribe
          console.error(e)
          return false
        })
      })
    })
  }
}
const Send = async function() {
  if (typeof window !== 'undefined') {
    const register = await navigator.serviceWorker.register('worker.js', {
      scope: '/',
    })

    const data = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    })
    return await api.service('subscribe').create(data)
      .then((response) => {
        console.log('🚀 ~ file: pwa.ts ~ line 70 ~ .then ~ response', !!response)
        return response
      })
      .catch((error) => {
        console.log(error)
      })
  }
}

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

const isSubscribed = () => {
  if (typeof window !== 'undefined') {
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then(async(sub) => {
        console.log('🚀 ~ file: pwa.ts ~ line 105 ~ reg.pushManager.getSubscription ~ sub', !!sub)
        if (sub) {
          // No subscription
          console.log('Existing user')
          const { _id } = await api.service('subscribe').get(sub)
          if (_id) {
            console.log('Updating existing user')
            const success = await api.service('subscribe').update(_id, sub)
            console.log('Updating existing user:success', !!success)
          }
        }
        else {
          // Update the database subscription
          console.log('// No subscription')
          console.log('New user')
        }
      })
    })
  }
}

export { Send, unSubscribe, isSubscribed }
