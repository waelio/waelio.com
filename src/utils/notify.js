/* eslint-disable no-unused-vars */
export function notifyMe (notification) {
  if (!('Notification' in window)) {
    // alert('This browser does not support desktop notification')
  } else if (Notification.permission === 'granted') {
    notification = new Notification('Welcome to Waelio.com!')
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(function (permission) {
      if (permission === 'granted') {
        var send = new Notification(notification || 'Hi there!')
      }
    })
  }
  return notification
}
