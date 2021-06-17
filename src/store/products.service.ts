import { syncWithStorage, syncWithStorageCompressed } from 'feathers-pinia'
import { defineStore, BaseModel } from '~/store/store.pinia'
import { api } from '~/modules/feathers'

export class Products extends BaseModel {}

const servicePath = 'api/v1/products'
export const useProducts = defineStore({ servicePath, Model: Products })

api.service(servicePath).hooks({})
const productsStore = useProducts()

// Pass the "used" store as the first argument to `syncWithStorage`
syncWithStorage(productsStore, ['ids', 'itemsById'])
// Or use the version with LZW compression
syncWithStorageCompressed(productsStore, ['ids', 'itemsById'])
