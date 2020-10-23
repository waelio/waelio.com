<template>
  <div class="todo">
    <div v-if="$apollo.loading">
      <div class="text-xs-center">
        <q-circular-progress indeterminate size="50px" color="lime" class="q-ma-md"/>
      </div>
    </div>
    <form @submit.prevent.stop="onCreate" class="q-pa-md">
      <div class="q-pa-md" style="max-width: 420px">
        <q-input
          type="text"
          ref="name"
          filled
          color="teal"
          dense
          label="Name"
          clearable
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Missing name']"
          v-model="name"
        />

        <div class="row center">
          <q-btn type="submit" label="Create Todo" class="todoButton">
            <template v-slot:loading>
              <q-spinner-facebook/>
            </template>
          </q-btn>
        </div>

        <ul>
          <li class="todo" v-for="(shoppingList, index) in shoppingLists" :key="index">
            <p class="todoname">{{ shoppingList.name }}</p>
            <p @click="deleteList(shoppingList)" class="text button delete">Delete Shopping List</p>
          </li>
        </ul>
      </div>
    </form>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { listShoppingLists } from '../graphql/queries'
import { createShoppingList, deleteShoppingList } from '../graphql/mutations'
import uuidV4 from 'uuid/v4'
import { date } from 'quasar'

export default {
  name: 'ShoppingList',
  computed: {
    date () {
      const timeStamp = Date.now()
      const formattedString = date.formatDate(timeStamp, 'YYYY-MM-DD')
      return formattedString
    }
  },
  data () {
    return {
      name: '',
      owner: 'foo', // this is just a placeholder and will get updated by AppSync resolver
      shoppingLists: []
    }
  },
  beforeCreate () {
    this.$Auth.currentAuthenticatedUser()
      .then(user => {
        this.user = user
        this.signedIn = true
      })
      .catch(() => this.$router.push({ name: 'auth' }))
  },
  methods: {
    onCreate () {
      this.$refs.name.validate()

      if (this.$refs.name.hasError) {
        this.formHasError = true
        this.$q.notify({
          color: 'negative',
          message: 'Missing form fields'
        })
      } else {
        this.$q.notify({
          icon: 'done',
          color: 'positive',
          message: 'Submitted'
        })
        createShoppingList()
      }
    },
    deleteList (list) {
      this.$apollo.mutate({
        mutation: gql(deleteShoppingList),
        variables: {
          input: { id: list.id }
        },
        update: (store, { data: { deleteShoppingList } }) => {
          const data = store.readQuery({ query: gql(listShoppingLists) })
          console.log(data)
          data.shoppingLists.items = data.listShoppingLists.items.filter(todo => todo.id !== deleteShoppingList.id)
          store.writeQuery({ query: gql(listShoppingLists), data })
        },
        optimisticResponse: {
          __typename: 'Mutation',
          deleteShoppingList: {
            __typename: 'ShoppingList',
            ...listShoppingLists
          }
        }
      })
        .then(data => console.log(data))
        .catch(error => console.error(error))
    },
    createShoppingList () {
      const name = this.name
      // const owner = this.user.username

      const id = uuidV4()
      const todo = {
        id,
        name: name
      }

      this.$apollo.mutate({
        mutation: gql(createShoppingList),
        variables: { input: todo },
        update: (store, { data: { createShoppingList } }) => {
          const data = store.readQuery({ query: gql(listShoppingLists) })
          data.listTodos.items.push(createShoppingList)
          store.writeQuery({ query: gql(listShoppingLists), data })
        },
        optimisticResponse: {
          __typename: 'Mutation',
          createShoppingList: {
            __typename: 'ShoppingList',
            ...this.shoppingLists
          }
        }
      })
        .then(data => console.log(data))
        .catch(error => console.error('error!!!: ', error))
    }
  },
  apollo: {
    lists: {
      query: gql(listShoppingLists),
      update: data => data.shoppingLists.items
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
* {
  box-sizing: border-box;
}
.todoButton {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background-color: #2196f3;
  border: none;
  color: white;
  outline: none;
}
.button {
  cursor: pointer;
}
.button:hover {
  opacity: 0.5;
}
.todoname {
  margin-top: 4px;
  margin-bottom: 0px;
  font-weight: bold;
}
.text {
  margin-top: 4px;
  margin-bottom: 0px;
}
.delete {
  color: #2196f3;
}
.todo {
  display: block;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  text-align: center;
  padding-top: 8px;
  padding-bottom: 9px;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
</style>
