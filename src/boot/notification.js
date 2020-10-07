import { Notify } from 'quasar'

export default async ({ app, router, Vue }) => {
  const Notification = {
    install: Vue => {
      const DEFAULT_OPTIONS = {
        icon: 'fa-info',
        duration: 5000
      }

      function info (msg, options = {}) {
        options.icon = 'fa-check'
        options.type = 'info'
        show(msg, options)
      }
      function success (msg, options = {}) {
        options.icon = 'fa-check'
        options.type = 'success'
        show(msg, options)
      }
      function warning (msg, options = {}) {
        options.icon = 'fa-exclamation'
        options.type = 'warning'
        show(msg, options)
      }
      function error (msg, options = {}) {
        options.icon = 'fa-exclamation'
        options.type = 'error'
        show(msg, options)
      }

      function show (msg, options = {}) {
        Notify.create({
          message: msg,
          ...Object.assign({}, DEFAULT_OPTIONS, options)
        }
        )
      }

      Vue.prototype.$notification = {
        info: info,
        success: success,
        warning: warning,
        error: error,
        show: show
      }
    }
  }
  Vue.use(Notification)
  Vue.prototype.$notify = Notification
}
