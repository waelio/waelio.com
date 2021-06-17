// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { syncWithStorage, syncWithStorageCompressed } from 'feathers-pinia'
import { defineStore, BaseModel } from '~/store/store.pinia'
import { api } from '~/feathers'

export class Notifications extends BaseModel {}

const servicePath = 'notifications'
export const useNotifications = defineStore({ servicePath, Model: Notifications })

api.service(servicePath).hooks({})
const notificationsStore = useNotifications()

// Pass the "used" store as the first argument to `syncWithStorage`
syncWithStorage(notificationsStore, ['ids', 'itemsById'])
// Or use the version with LZW compression
// syncWithStorageCompressed(notificationsStore, ['ids', 'itemsById'])
