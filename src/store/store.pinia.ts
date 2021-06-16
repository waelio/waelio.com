// store/store.pinia.ts
import { createPinia } from 'pinia'
import { setup } from 'feathers-pinia'
import { api } from '~/modules/feathers'

export const pinia = createPinia()

export const { defineStore, BaseModel } = setup({
  pinia,
  clients: { api },
  idField: '_id',
})
