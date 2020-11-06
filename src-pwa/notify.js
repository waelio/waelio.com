export function notifyMe (notification) {
  // Let's check if the browser supports notifications
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification')
  }
  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === 'granted') {
    // If it's okay let's create a notification
    notification = new Notification('Welcome!')
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === 'granted') {
        notification = new Notification('Hi there!')
      }
    })
  }
  return notification
}
