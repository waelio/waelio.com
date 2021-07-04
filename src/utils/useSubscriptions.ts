import { onUnmounted, onBeforeMount, ref, watchEffect, computed } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { subscription as Interface } from 'src/interface/index'
import { subAdd, subDel } from './subscriptionsHelper'

export function useSubscriptions() {
  const { offlineReady } = useRegisterSW()
  const publicVapidKey = import.meta.env.VITE_VID_PUBLIC
  const isSupported = !!(!offlineReady && typeof window !== 'undefined' && 'navigator' in window && 'serviceWorker' in navigator)

  const localSubscription: Interface = ref({})

  if (isSupported) {
    self.addEventListener('push', (e) => {
      // eslint-disable-next-line no-console
      console.log('Push Received...')
      const data = e.data.json()
      self.registration.showNotification(data.title, {
        body: 'Notified by Waelio.com!',
        icon: 'https://picmymenu.s3.eu-west-3.amazonaws.com/waelio_logo.png',
      })
    })
  }

  const collectSubscriptions = async(): Promise<boolean> => {
    try {
      const register = await navigator.serviceWorker.ready
      localSubscription.value = await register.pushManager.getSubscription()
      return localSubscription
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
      return false
    }
  }
  const subscription: Interface = computed({
    get: () => localSubscription.value,
    set: (newSubscription = null) => newSubscription || collectSubscriptions(),
  })
  const isSubscribed = computed(() => !!(subscription.value && subscription.value.endpoint))

  onBeforeMount(async() => {
    if (isSupported)
      watchEffect(() => subscription.value = localSubscription.value)
  })

  onUnmounted(() => {
    if (subscription.value) subscription.value = null
  })
  const Subscribe = async() => {
    try {
      const register = await navigator.serviceWorker.ready
      const newSubscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      })
      if (await newSubscription) {
        localSubscription.value = newSubscription
        subAdd(newSubscription)
      }
      return !!newSubscription
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
      return false
    }
  }
  const unSubscribe = async() => {
    try {
      const register = await navigator.serviceWorker.ready
      const currentSubscription = await register.pushManager.getSubscription()
      if (!currentSubscription) {
        // eslint-disable-next-line no-console
        console.log('no subscription')
        localSubscription.value = {}
        subscription.value = {}
        // eslint-disable-next-line no-alert
        alert('You are not subscribed')
        return true
      }
      currentSubscription.unsubscribe()
      await subDel(currentSubscription)
      localSubscription.value = {}
      subscription.value = {}
      // eslint-disable-next-line no-alert
      alert('You\'ve been unsubscribed!')
      return true
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
      return false
    }
  }
  return { collectSubscriptions, isSupported, Subscribe, unSubscribe, subscription, isSubscribed }
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
