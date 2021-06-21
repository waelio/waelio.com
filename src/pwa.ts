/* eslint-disable import/no-duplicates */

/* eslint-disable no-console */
const publicVapidKey = import.meta.env.VITE_VID_PUBLIC
const isClient = (): boolean => Boolean(typeof window !== 'undefined' && 'serviceWorker' in navigator)
const urlBase64ToUint8Array = (base64String): string => {
  if (isClient) {
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
}
const unSubscribe = async() => {
  if (isClient) {
    try {
      const reg = await navigator.serviceWorker.register('worker.js', { scope: '/' })
      const subscription = await reg.pushManager.getSubscription()
      if (!subscription) {
        console.log('no subscription')
        // eslint-disable-next-line no-alert
        alert('You are not subscribed')
        return true
      }
      const successful = await subscription.unsubscribe()
      // You've successfully unsubscribed
      console.log('unsubscribe success', successful)
      const { api } = await import('~/feathers')
      await api.service('subscribe').remove(subscription)
      // eslint-disable-next-line no-alert
      alert('You unsubscribed successfully!')
      return true
    }
    catch (error) {
      // Could not Delete Subscription from Database
      console.log(error)
      return error.message
    }
  }
}
const Subscribe = async function(): string {
  if (isClient) {
    try {
      const register = await navigator.serviceWorker.register('worker.js', {
        scope: '/',
      })
      const data = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      })
      const { api } = await import('~/feathers')
      const response = api.service('subscribe').create(data)
      console.log('🚀 ~ file: pwa.ts ~ line 70 ~ .then ~ response', !!response)
      return true
    }
    catch (error) {
      console.log(error)
      return error.message
    }
  }
}

const isSubscribed = async(): boolean => {
  if (isClient) {
    try {
      const reg = await navigator.serviceWorker.register('worker.js', { scope: '/' })
      const subscription = await reg.pushManager.getSubscription()
      console.log('🚀 ~ file: pwa.ts ~ line 105 ~ reg.pushManager.getSubscription ~ sub', !!subscription)
      if (subscription) {
        // Is subscribed: Subscription exits
        console.log('Existing user')
        const { api } = await import('~/feathers')
        const { _id } = await api.service('subscribe').get(subscription)
        // Update the database subscription
        if (_id) {
          console.log('Updating existing user')
          const success = await api.service('subscribe').update(_id, subscription)
          console.log('Updating existing user:success', !!success)
        }
        return true
      }
      else {
      // New User
        console.log('// No subscription')
        console.log('New user')
        return false
      }
    }
    catch (error) {
      consol.error(error)
      return error.message
    }
  }
}

export { Subscribe, unSubscribe, isSubscribed, isClient }
