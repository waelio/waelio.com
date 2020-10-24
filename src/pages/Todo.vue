<template>
  <div class="todo">
    <div v-if="$apollo.loading">
      <div class="text-xs-center">
        <q-circular-progress
          indeterminate
          size="50px"
          color="lime"
          class="q-ma-md"
        />
      </div>
    </div>
    <q-form ref="form" @submit.prevent.stop="onCreate" class="q-pa-md">
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
          :rules="[val => (val && val.length > 0) || 'Missing name']"
          v-model="name"
        />

        <div class="row center">
          <q-btn type="submit" :loading="creating" label="Create Shopping List" class="todoButton">
          </q-btn>
        </div>

        <q-list
          bordered
          class="q-mt-md rounded-borderes"
          style="max-width=600px"
        >
          <q-item-label header>My Lists</q-item-label>
          <q-item v-for="shoppingL in shsHolder" :key="shoppingL.id">
            <q-item-section top avatar>
              <q-avatar color="primary" text-color="white" icon="reorder" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6">{{ shoppingL.name }}</q-item-label>
              <q-item-label caption lines="2">{{ shoppingL.id }}</q-item-label>
            </q-item-section>
            <q-item-section top side>
              <div class="text-grey-8 q-gutter-xs">
                <q-item-label caption>{{ shoppingL.updatedAt }}</q-item-label>
                <q-btn
                  class="gt-xs"
                  size="12px"
                  color="orange"
                  flat
                  dense
                  round
                  :loading="editing"
                  icon="edit"
                  @click="onEdit(shoppingL)"
                />
                <q-btn
                  class="gt-xs"
                  size="12px"
                  color="red"
                  flat
                  dense
                  round
                  :loading="deleting"
                  icon="delete"
                  @click="deleteList(shoppingL.id)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-form>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'
import { API, graphqlOperation, Storage } from 'aws-amplify'
import { listShoppingItems, listShoppingLists } from '../graphql/queries'
import * as mutations from '../graphql/mutations'
import {
  createShoppingList,
  deleteShoppingList,
  updateShoppingList
} from '../graphql/mutations'
import uuidV4 from 'uuid/v4'
import { date } from 'quasar'

export default {
  name: 'ShoppingList',
  beforeCreate () {
    this.$Auth
      .currentAuthenticatedUser()
      .then(user => {
        this.user = user
        this.signedIn = true
      })
      .catch(() => this.$router.push({ name: 'auth' }))
  },
  async mounted () {
    this.onListAllShoppingLists()
  },
  data () {
    return {
      shsHolder: [],
      name: '',
      user: {},
      creating: false,
      adding: false,
      editing: false,
      deleting: false,
      owner: 'foo' // this is just a placeholder and will get updated by AppSync resolver
    }
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
        this.createShoppingList()
      }
    },
    async onListAllShoppingLists () {
      this.shsHolder = await this.getAllShoppingLists()
      return Promise.resolve(true)
    },
    async getAllShoppingLists () {
      const aListData = await API.graphql(graphqlOperation(listShoppingLists))
      return aListData.data.listShoppingLists.items
    },
    async deleteList (id) {
      this.deleting = true
      const dList = await API.graphql({
        query: mutations.deleteShoppingList,
        variables: { input: { id } }
      })

      // this.shsHolder = this.shsHolder.filter(one => one.id !== id)
      this.deleting = false
      if (dList) this.onListAllShoppingLists()
      return Promise.resolve
    },
    async createShoppingList () {
      const creating = true
      const name = this.name
      // const owner = this.user.username

      const id = uuidV4()
      const nList = {
        id,
        name
      }

      const nListResult = await API.graphql({
        query: mutations.createShoppingList,
        variables: { input: nList }
      })
      this.creating = false
      this.name = null
      this.$refs.form.reset()
      if (nListResult) {
        this.onListAllShoppingLists()
      }
    },
    onEdit (eList) {
      this.editing = true
    }
  },
  computed: {
    date () {
      const timeStamp = Date.now()
      const formattedString = date.formatDate(timeStamp, 'YYYY-MM-DD')
      return formattedString
    }
  },
  apollo: {
    ShoppingLists: {
      query: gql(listShoppingLists),
      update: data => data.listShoppingLists.items
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
