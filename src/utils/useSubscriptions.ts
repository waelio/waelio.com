import { onUnmounted, onBeforeMount, ref, watchEffect, computed } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { subscription as Interface } from 'src/interface/index'
import { subAdd, subDel } from './subscriptionsHelper'

export function useSubscriptions() {
  const { offlineReady } = useRegisterSW()
  const publicVapidKey = import.meta.env.VITE_VID_PUBLIC
  const isSupported = !!(!offlineReady && typeof window !== 'undefined' && 'navigator' in window && 'serviceWorker' in navigator)

  const localSubscription: Interface = ref({})

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

// <template>
//   <div class="d-flex text-center" style="height: 20vh">
//     <div class="m-auto">
//       <h4>Your Position</h4>
//       Latitude: {{ currPos.lat.toFixed(2) }}, Longitude:
//       {{ currPos.lng.toFixed(2) }}
//     </div>
//     <div class="m-auto">
//       <h4>Distance</h4>
//       {{ distance.toFixed(2) }} miles
//     </div>
//     <div class="m-auto">
//       <h4>Clicked Position</h4>
//       <span v-if="otherPos">
//         Latitude: {{ otherPos.lat.toFixed(2) }}, Longitude:
//         {{ otherPos.lng.toFixed(2) }}
//       </span>
//       <span v-else>Click the map to select a position</span>
//     </div>
//   </div>
//   <div ref="mapDiv" style="width: 100%; height: 80vh" />
// </template>
