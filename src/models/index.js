// @ts-check
import { initSchema } from '@aws-amplify/datastore'
import { schema } from './schema'

const { ShoppingList, ShoppingItem, PrivateNote, List, Task, Chatty } = initSchema(schema)

export {
  ShoppingList,
  ShoppingItem,
  PrivateNote,
  List,
  Task,
  Chatty
}
