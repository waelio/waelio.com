/* eslint-disable no-console */
const publicVapidKey = import.meta.env.VITE_VID_PUBLIC
// eslint-disable-next-line import/no-mutable-exports

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
export { Send }
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
