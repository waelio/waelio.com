import { Notify, Dialog, LoadingBar, Loading } from 'quasar'
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadingDefaults,
  loadingBarDefaults,
  defaultStyles,
  notifyDefaults,
} from './statics'

Notify.setDefaults(notifyDefaults)
LoadingBar.setDefaults(loadingBarDefaults)
export enum NoteActions {
  show = 'show',
  success = 'success',
  info = 'info',
  warning = 'warning',
  error = 'error',
  log = 'log',
  debug = 'debug',
  loading = 'loading',
}
export interface NoteInterface {
  
note: (action: NoteActions, loadingDefaults: any) => any
  loading?: typeof Loading
  dialog?: typeof Dialog
  show?: typeof Notify.create
  success?: typeof Notify.create
  info?: typeof Notify.create
  warning?: typeof Notify.create
  error?: typeof Notify.create
  log?: typeof console.log
  debug?: typeof console.log

}
const note: NoteInterface = {
note: function (action: NoteActions, loadingDefaults?: any): any {
throw new Error('Function not implemented.')
},
loading: Loading,
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
note.loading = function(action = 'show', loadingDefaults) {
  if (action === 'show') return Loading.show(true, config)
  return Loading.hide()
}
note.loading.prototype.start = function(params) {
  return note.loading('show', ...params)
}
note.loading.prototype.stop = function(params) {
  return note.loading('hide', ...params)
}

// eslint-disable-next-line no-empty-pattern
note.dialog = (...{}) => Dialog
note.show = function(message, style, config = {}) {
  const newStyle
    = style && defaultStyles[style]
      ? defaultStyles[style]
      : defaultStyles.success
  Object.assign(newStyle, config)
  const payload = { message, ...newStyle }
  return Notify.create(payload)
}

note.success = (message, config = {}) => note.show(message, 'success', config)

note.info = (message, config = {}) => note.show(message, 'info', config)

note.warning = (message, config = {}) => note.show(message, 'warning', config)

note.error = (error, config = {}) =>
  note.show(error || error.message || error.response, 'error', config)

// eslint-disable-next-line no-console
note.log = (...args) => console.log(...args)

note.debug = (title, err) => {
  if (err && err.message)
    // eslint-disable-next-line no-console
    console.log(title, JSON.stringify(err.message || {}, null, 2))
  else if (err)
    // eslint-disable-next-line no-console
    console.log(title, JSON.stringify(err || {}, null, 2))
  else
    // eslint-disable-next-line no-console
    console.log(title)
}

export { note, Notify }
