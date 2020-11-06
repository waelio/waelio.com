<template>
  <div
    class="todox q-mx-auto items-center relative-position"
    style="max-width: 420px"
  >
    <h1 class="text-h4 text-center">Shopping Lists</h1>
    <div class="row justify-around">
      <q-btn
        id="addListButton"
        class="q-mb-md"
        ref="openButton"
        v-bind="styListCreate"
        @click="morphy(isCreatingList, { action: 'isCreatingList' })"
      />
      <q-btn
        id="addTaskButton"
        class="q-mb-md"
        ref="openButton"
        v-bind="styTaskCreate"
        :disable="!allLists.length"
        @click="morphy(isCreatingTask, { action: 'isCreatingTask' })"
      />
    </div>
    <!-- Add List Form -->
    <q-dialog
      v-model="isCreatingList"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
      @hide="!dialogListAdd"
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
            <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section class="q-pt-none">
          <ListEdit
            id="isCreatingList"
            v-bind="styListCreate"
            v-if="isCreatingList"
            @closeModal="dialogListAdd=false,isCreatingList=false"
            @refreshData="()=>onLisLists()"
            :List="{}"
            :CreateListInput="CreateListInput"
            :props1="styListCreate"
            :isCreatingList="isCreatingList"
            :isEditingList="false"
            class="bg-white full-width q-mt-xl"
            ref="addForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- Add List Form -->
    <!-- Add Task Form -->
    <q-dialog
      id="isCreatingTask"
      v-model="isCreatingTask"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
      @hide="dialogTaskAdd===false"
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
            <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section class="q-pt-none">
          <TaskEdit
            id="isCreatingTask"
            v-bind="props1"
            v-if="isCreatingTask"
            @closeModal="()=>{isCreatingTask=false, dialogTaskAdd=false}"
            :Task="{}"
            :CreateTaskInput="CreateTaskInput"
            :props1="styTaskCreate"
            :isCreatingTask="isCreatingTask"
            :isEditingTask="false"
            class="full-width q-my-md"
            ref="addForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- List Tasks -->
    <div class="q-mx-auto full-width">
      <q-list
        bordered
        separator
        padding
        class="rounded-borders border-green"
        style="max-width: 420px;"
      >
        <q-item-label header class="text-center">Lists</q-item-label>
        <q-slide-item
          v-for="OneList in allLists"
          :key="OneList.id"
          @left="opt => onLeft(opt, OneList)"
          @right="opt => onRight(opt, OneList)"
          left-color="red"
          right-color="warning"
        >
          <template v-slot:left>
            Delete List <q-icon name="delete" />
          </template>
          <template v-slot:right> Edit List <q-icon name="edit" /> </template>

          <q-list>
            <List
              :List="OneList"
              clickable
              @click="() => $router.push('list/' + OneList.id)"
            ></List>
            <!-- Edit Form -->
            <q-dialog
              v-model="isEditingTask"
              persistent
              :maximized="maximizedToggle"
              transition-show="slide-up"
              transition-hide="slide-down"
              @hide="(isEditingTask = false), (maximizedToggle = false)"
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
                    @refreshData="onListListsLists()"
                    style="max-width: 520px"
                    class="bg-grey-2 q-mx-auto q-my-md q-pa-xl fit"
                    :Task="OneList"
                    :CreateTaskInput="OneList"
                    :props1="{}"
                    :isCreatingTask="false"
                    :isEditingTask="isEditingTask"
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
/* eslint-disable vue/no-unused-components */
import gql from 'graphql-tag'
import { API, graphqlOperation, Storage } from 'aws-amplify'
import { listTasks, listPrivateNotes, listLists } from 'src/graphql/queries'
import * as mutations from 'src/graphql/mutations'
import { morph, date, Loading } from 'quasar'
import uuidV4 from 'uuid/v4'
import List from 'components/List'
import Task from 'components/Task'
import TaskEdit from 'components/TaskEdit'
import ListEdit from 'components/ListEdit'
import { DataStore, Predicates } from '@aws-amplify/datastore'
import { ShoppingList } from 'src/models'

export default {
  name: 'ShoppingList',
  components: {
    List,
    Task,
    ListEdit,
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
  async mounted () {
    this.xllTasks = await DataStore.query(ShoppingList, Predicates.ALL)

    this.onLisLists()
  },
  data () {
    return {
      toggleForm: false,
      cancelAdding: false,
      allLists: [],
      allTasks: [],
      xllTasks: [],
      selected: null,
      activeId: null,
      isCreatingTask: false,
      isCreatingList: false,
      isEditingTask: false,
      isEditingList: false,
      isDeletingTask: false,
      isDeletingList: false,
      maximizedToggle: true,
      dialogListAdd: false,
      dialogListEdit: false,
      dialogTaskAdd: false,
      dialogTaskEdit: false,
      name: '',
      CreateListInput: {
        id: null,
        title: '',
        tasks: []
      },
      CreateTaskInput: {
        id: null,
        title: '',
        list: null,
        description: '',
        completed: false
      },
      user: {},
      owner: 'foo' // this is just a placeholder and will get updated by AppSync resolver
    }
  },
  methods: {
    morphy (newState, payload) {
      this[payload.action] = newState !== true
      morph({
        from: `#${payload.action}`,
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
      this.isEditingTask = true
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
    async onLisLists () {
      console.log('onListAllShoppingLists')
      this.allLists = await this.listListsLists()
    },
    async onListTasks () {
      console.log('onListTasks')
      this.allTasks = await this.listListTasks()
    },
    async listListsLists () {
      Loading.show({ message: 'Loading Lists' })
      console.log('getAllShoppingLists')
      const response = await API.graphql(graphqlOperation(listLists))
      Loading.hide()
      if (response) {
        return response.data.listLists.items
      }
    },
    async listListTasks () {
      Loading.show({ message: 'Loading Tasks' })
      console.log('getAllShoppingLists')
      const response = await API.graphql(graphqlOperation(listTasks))
      Loading.hide()
      return response.data.listTasks.items
    },
    async deleteList (id) {
      this.deleting = true
      this.activeId = id
      const dList = await API.graphql({
        query: mutations.deleteTask,
        variables: { input: { id } }
      })

      // this.allTasks = this.allTasks.filter(one => one.id !== id)
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
      return this.isCreatingTask === true
        ? {
          class: 'full-width q-mx-auto'
        }
        : {
          class: 'q-ml-xl bg-blue q-px-xl q-py-lg text-white',
          style: 'display: none'
        }
    },
    styTaskCreate () {
      return this.isCreatingTask === true
        ? {
          color: 'red',
          icon: 'close',
          label: 'Close',
          class: 'q-px-md'
        }
        : {
          color: 'green',
          icon: 'playlist_add',
          label: 'Add Task'
        }
    },
    styListCreate () {
      return this.isCreatingList === true
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
