
import { Notify } from 'quasar'
export default async ({ app, router, Vue }) => {
  Notify.setDefaults({
    position: 'bottom',
    type: 'info',
    timeout: 5000

  })
  const Notification = {
    info (message) {
      Notify.create({
        type: 'info',
        message
      })
      // show(message, { type: 'info' })
    },
    success (message) {
      Notify.create({
        type: 'positive',
        message
      })
    },
    warning (message) {
      Notify.create({
        type: 'warning',
        message
      })
    },
    error (message) {
      Notify.create({
        type: 'negative',
        message
      })
    }
  }

  Vue.prototype.$notification = {
    info: Notification.info,
    success: Notification.success,
    warning: Notification.warning,
    error: Notification.error,
    create: Notify.create
  }
  Vue.prototype.$notify = Notify
}
