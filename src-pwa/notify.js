export function notifyMe (notification) {

  if (!('Notification' in window)) {
    alert('This browser does not support desktop notification')
  } else if (Notification.permission === 'granted') {
    notification = new Notification('Welcome!')
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(function (permission) {
      if (permission === 'granted') {
        notification = new Notification('Hi there!')
      }
    })
  }
  return notification
}
