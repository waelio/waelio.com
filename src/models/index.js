// @ts-check
import { initSchema } from '@aws-amplify/datastore'
import { schema } from './schema'

const { ShoppingList, ShoppingItem, List, Task, Chatty } = initSchema(schema)

export {
  ShoppingList,
  ShoppingItem,
  List,
  Task,
  Chatty
}
