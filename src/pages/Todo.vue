<template>
  <div class="todox q-mx-auto" style="max-width: 420px">
    <h1 class="text-h4 text-center">Shopping Lists</h1>
    <q-form ref="form" @submit.prevent.stop="onCreate" class="full-width q-mx-auto">
      <div class="q-pa-sm q-mx-auto special-border" >
        <h2 class="text-subtitle1 text-grey-6 text-center q-my-sx">New List</h2>
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
          <q-btn
            type="submit"
            :loading="creating"
            label="Create Shopping List"
            class="width-100 q-mx-auto"
            color="primary"
          >
          </q-btn>
        </div>
      </div>
    </q-form>
    <div class="q-mx-auto full-width">
      <q-list bordered class="q-mt-md rounded-borders">
        <q-item-label header class="text-center">My Lists</q-item-label>

        <q-slide-item
          v-for="shoppingL in shsHolder"
          :key="shoppingL.id"
          @left="opt => onLeft(opt, shoppingL)"
          @right="opt => onRight(opt, shoppingL)"
          left-color="red"
          right-color="warning"
        >
          <template v-slot:left>
            Delete List <q-icon name="delete" />
          </template>
          <template v-slot:right>
            Edit List <q-icon name="edit" />
          </template>
          <q-item clickable @click="$router.push({name:'shoppinglist', params: {slId: shoppingL.id}})" >
            <q-item-section top avatar>
              <q-avatar color="primary" text-color="white" icon="reorder" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6">{{ shoppingL.name }}</q-item-label>
              <q-item-label caption class="ellipsis" :alt="shoppingL.id" lines="2">{{ shoppingL.id }}</q-item-label>
            </q-item-section>
            <q-item-section top side>
              <div class="text-grey-8 q-gutter-xs">
                <q-item-label caption class="text-center">{{ getTimeAgo(shoppingL.createdAt).toFixed(2) }} <br>minutes ago</q-item-label>
              </div>
            </q-item-section>
          </q-item>
          <q-item class="full-width" v-if="editing && selected === shoppingL.id">

            <q-input filled ref="newname" class="width-50"  type="text" v-model="newname" label="New list Name *" lazy-rules
            :rules="[ val => val !== null && val !== '' || 'Please type your List Name']"
            />
            <q-btn
                  color="orange"
                  text-color="white"
                  style="max-height:55px; width: 75%"
                  class="q-ml-sm q-px-xs"
                  label="Save"
                  glossy
                  dense
                  icon="edit"
fh                :disabled="!newname"
                  :loading="editing && activeId === shoppingL.id"
                  @click.prevent="activeId = shoppingL.id, onEdit(shoppingL)"
                />
          </q-item>
        </q-slide-item>
      </q-list>
    </div>
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
      newname: '',
      user: {},
      selected: null,
      activeId: null,
      creating: false,
      adding: false,
      editing: false,
      deleting: false,
      owner: 'foo' // this is just a placeholder and will get updated by AppSync resolver
    }
  },

  methods: {
    getTimeAgo (targetDate) {
      const unit = 'minutes'
      return date.getDateDiff(targetDate, this.dateNow, unit)
    },
    onRight ({ reset }, one) {
      console.log('right')
      this.editing = true
      this.selected = one.id
      reset()
    },
    onLeft ({ reset }, one) {
      this.$q.dialog({
        title: 'Confirms!',
        message: 'Are you sure you want to delete this Shopping List?',
        ok: {
          push: true
        },
        cancel: {
          push: true,
          color: 'negative'
        }
      })
        .onOk(() => {
          console.log('Gonna Delete')
          this.deleting = true
          this.activeId = one.id
          this.deleteList(one.id)
          reset()
        })
        .onCancel(() => {
          console.log('Gonna Cancel')
          this.deleting = false
          reset()
        })
        .onDismiss(() => {
          console.log('Gonna Dismiss')
          reset()
        })
    },
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
    onEdit (eList) {
      // this.$refs.newname.validate()
      if (this.$refs.newname.hasError) {
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
        this.editShoppingList(eList)
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
      this.activeId = id
      const dList = await API.graphql({
        query: mutations.deleteShoppingList,
        variables: { input: { id } }
      })

      // this.shsHolder = this.shsHolder.filter(one => one.id !== id)
      this.deleting = false
      this.activeId = null
      if (dList) this.onListAllShoppingLists()
      return Promise.resolve(true)
    },
    async createShoppingList () {
      this.creating = true
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
    async editShoppingList (eList) {
      this.activeId = eList.id
      this.selected = null
      this.editing = true
      const editedList = {
        id: eList.id,
        name: this.newname
      }
      const eListRes = await API.graphql({
        query: mutations.updateShoppingList,
        variables: { input: editedList }
      })
      this.activeId = null
      this.editing = false
      this.newname = null
      if (eListRes) {
        this.onListAllShoppingLists()
      }
    }
  },
  computed: {
    dateNow () {
      const timeStamp = Date.now()
      const formattedString = date.formatDate(timeStamp, 'YYYY-MM-DD')
      return formattedString
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
* {
  box-sizing: border-box;
}
.special-border {
  border: 1px solid var(--silver);
}
</style>
