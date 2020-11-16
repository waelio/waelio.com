
export function notifyMe (notification) {
  if (('Notification' in window)) {
    if (Notification.permission === 'granted') {
      return new Notification(notification || 'Welcome to Waelio.com!')
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(function (permission) {
        if (permission === 'granted') {
          return new Notification(notification || 'Hi there!')
        }
      })
    }
  }
}
