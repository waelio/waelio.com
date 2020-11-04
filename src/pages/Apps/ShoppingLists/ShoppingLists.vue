<template>
  <div
    class="todox q-mx-auto items-center relative-position"
    style="max-width: 420px"
  >
    <h1 class="text-h4 text-center">Shopping Lists</h1>
    <q-btn
      id="addSListButton"
      class="q-mb-md"
      ref="openButton"
      v-bind="props2"
      @click="morphy(isCreating, { action: 'isCreating' })"
    />
    <!-- Add Task Form -->
    <TaskEdit
      v-bind="props1"
      v-if="isCreating"
      :Task="{}"
      :CreateTaskInput="CreateTaskInput"
      :props1="props1"
      :isCreating="isCreating"
      :isEditing="false"
      class="full-width q-my-md"
      ref="addForm"
    />
    <!-- List Tasks -->
    <div class="q-mx-auto full-width">
      <q-list
        bordered
        separator
        padding
        class="rounded-borders border-green"
        style="max-width: 420px;"
      >
        <q-item-label header class="text-center">Tasks</q-item-label>
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
          <template v-slot:right> Edit List <q-icon name="edit" /> </template>

          <q-list>
            <Task
              :Task="shoppingL"
              clickable
              @click="() => $router.push('list/' + shoppingL.id)"
            ></Task>
            <!-- Edit Form -->
            <q-dialog
              v-model="isEditing"
              persistent
              :maximized="maximizedToggle"
              transition-show="slide-up"
              transition-hide="slide-down"
              @hide="isEditing=false"
            >
              <q-card class="bg-primary text-white">
                <q-bar>
                  <q-space />

                  <q-btn
                    dense
                    flat
                    icon="minimize"
                    @click="maximizedToggle = false"
                    :disable="!maximizedToggle"
                  >
                    <q-tooltip
                      v-if="maximizedToggle"
                      content-class="bg-white text-primary"
                      >Minimize</q-tooltip
                    >
                  </q-btn>
                  <q-btn
                    dense
                    flat
                    icon="crop_square"
                    @click="maximizedToggle = true"
                    :disable="maximizedToggle"
                  >
                    <q-tooltip
                      v-if="!maximizedToggle"
                      content-class="bg-white text-primary"
                      >Maximize</q-tooltip
                    >
                  </q-btn>
                  <q-btn dense flat icon="close" v-close-popup>
                    <q-tooltip content-class="bg-white text-primary"
                      >Close</q-tooltip
                    >
                  </q-btn>
                </q-bar>
                <q-card-section class="q-pt-none">
                  <TaskEdit
                    @closeModal="maximizedToggle = false"
                    @refreshData="onListAllShoppingLists()"
                    style="max-width: 520px"
                    class="bg-grey-2 q-mx-auto q-my-md q-pa-xl fit"
                    :Task="shoppingL"
                    :CreateTaskInput="shoppingL"
                    :props1="{}"
                    :isCreating="false"
                    :isEditing="isEditing"
                    ref="editForm"
                  />
                </q-card-section>
              </q-card>
            </q-dialog>
            <!-- End Edit Form -->
          </q-list>
        </q-slide-item>
      </q-list>
    </div>
  </div>
</template>
<script>
/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'
import { API, graphqlOperation, Storage } from 'aws-amplify'
import { listTasks, listPrivateNotes } from 'src/graphql/queries'
import * as mutations from 'src/graphql/mutations'
import { morph, date, Loading } from 'quasar'
import uuidV4 from 'uuid/v4'
import Task from 'components/Task'
import TaskEdit from 'components/TaskEdit'

export default {
  name: 'ShoppingList',
  components: {
    Task,
    TaskEdit
  },
  beforeCreate () {
    this.$Auth
      .currentAuthenticatedUser()
      .then(user => {
        this.user = user
        this.signedIn = true
      })
      .catch(() => this.$router.push({ name: 'authenticate' }))
  },
  mounted () {
    this.onListAllShoppingLists()
  },
  data () {
    return {
      maximizedToggle: true,
      toggleForm: false,
      cancelAdding: false,
      shsHolder: [],
      name: '',
      newname: '',
      CreateTaskInput: {
        id: null,
        title: '',
        description: '',
        icon: 'pending_actions',
        completed: false
      },
      user: {},
      selected: null,
      activeId: null,
      isCreating: false,
      isEditing: false,
      isDeleting: false,
      owner: 'foo' // this is just a placeholder and will get updated by AppSync resolver
    }
  },
  methods: {
    morphy (newState, payload) {
      this[payload.action] = newState !== true
      morph({
        from: `#${payload.action}ListForm`,
        onToggle: () => {
          this[payload.action] = !newState
        },
        duration: 500,
        tween: true,
        onEnd: end => {
          end === 'from' && this.onToggle()
        }
      })
    },
    getTimeAgo (targetDate) {
      const unit = 'days'
      return date.getDateDiff(targetDate, this.dateNow, unit)
    },
    onRight ({ reset }, one) {
      this.isEditing = true
      this.selected = one.id
      reset()
    },
    onLeft ({ reset }, one) {
      this.$q
        .dialog({
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
    async onListAllShoppingLists () {
      console.log('onListAllShoppingLists')
      this.shsHolder = await this.getAllShoppingLists()
      return Promise.resolve(true)
    },
    async getAllShoppingLists () {
      Loading.show({ message: 'Loading data' })
      console.log('getAllShoppingLists')
      const aListData = await API.graphql(graphqlOperation(listTasks))
      Loading.hide()
      return aListData.data.listTasks.items
    },
    async deleteList (id) {
      this.deleting = true
      this.activeId = id
      const dList = await API.graphql({
        query: mutations.deleteTask,
        variables: { input: { id } }
      })

      // this.shsHolder = this.shsHolder.filter(one => one.id !== id)
      this.deleting = false
      this.activeId = null
      if (dList) this.onListAllShoppingLists()
      return Promise.resolve(true)
    }
  },
  computed: {
    dateNow () {
      const timeStamp = Date.now()
      const formattedString = date.formatDate(timeStamp, 'YYYY-MM-DD')
      return formattedString
    },
    props1 () {
      return this.isCreating === true
        ? {
          class: 'full-width q-mx-auto'
        }
        : {
          class: 'q-ml-xl bg-blue q-px-xl q-py-lg text-white',
          style: 'display: none'
        }
    },
    props2 () {
      return this.isCreating === true
        ? {
          color: 'red',
          icon: 'close',
          label: 'Close',
          class: 'q-px-md'
        }
        : {
          color: 'green',
          icon: 'playlist_add',
          label: 'Add List'
        }
    }
  }
}
</script>
<style scoped>
* {
  box-sizing: border-box;
}
.special-border {
  border: 1px solid var(--silver);
}
</style>
