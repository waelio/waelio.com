import { onUnmounted, onMounted, ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { subscription } from 'src/interface'

export function useSubscriptions() {
  const { offlineReady } = useRegisterSW()
  // const publicVapidKey = import.meta.env.VITE_VID_PUBLIC
  const isSupported = !!(!offlineReady && typeof window !== 'undefined' && 'navigator' in window && 'serviceWorker' in navigator)
  const subscription: subscription = reactive()
  const isSubscribed = async(): Promise<boolean> => {
    try {
      const reg = await navigator.serviceWorker.ready
      subscription.value = await reg.pushManager.getSubscription()
      if (subscription.value)
        return subscription
      return false
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
      console.error(error.message)
      return false
    }
  }
  onMounted(() => {
    if (isSupported)
      // eslint-disable-next-line no-console
      console.log(isSubscribed())
  })
  onUnmounted(() => {
    if (subscription) subscription.value = null
  })
  const Subscribe = async() => {
    // eslint-disable-next-line no-console
    console.log('In Subscribe')
    return await true
  }
  const unSubscribe = async() => {
    // eslint-disable-next-line no-console
    console.log('In Unsubscribe')
    return await true
  }
  return { isSubscribed, isSupported, Subscribe, unSubscribe }
}
