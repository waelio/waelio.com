<template>
  <div class="q-pa-sm q-mx-auto special-border">
    <q-form
      :id="locIsCreating ? 'isCreatingListForm' : 'isEditingListForm'"
      :ref="locIsCreating ? 'addForm' : 'editForm'"
      v-bind="props1"
      @submit.prevent="locIsCreating ? onCreate() : onEdit(TempHolder)"
    >
      <h2 class="text-subtitle1 text-black text-center q-my-sx">
        {{ locIsCreating ? "Add" : "Edit" }} List
      </h2>
      <q-input
        v-model="TempHolder.title"
        type="text"
        ref="title"
        filled
        label="title"
        hint="List Title"
        clearable
        lazy-rules
        :rules="[val => (val && val.length > 0) || 'Missing title']"
        class="q-my-sm"
      />
      <q-input
        filled
        v-model="TempHolder.description"
        label="Task description"
        hint="Task descpription"
        type="text"
        ref="description"
        clearable
        class="q-my-sm"
      />
      <q-input
        filled
        clearable
        v-model="TempHolder.icon"
        type="text"
        ref="icon"
        :icon="TempHolder.icon"
        label="Task Icon"
        class="q-my-sm"
      />

      <q-btn
        type="submit"
        :label="locIsCreating ? 'Create' : 'Edit' + ' Shopping List'"
        class="full-width q-my-md q-mx-auto"
        :color="isReadyForm ? 'primary' : 'warning'"
        :disable="!isReadyForm"
        stretch
      />
    </q-form>
  </div>
</template>
<script>
import { API } from 'aws-amplify'
import * as mutations from 'src/graphql/mutations'
import uuidV4 from 'uuid/v4'
export default {
  name: 'TaskEdit',
  props: ['Task', 'CreateTaskInput', 'props1', 'isCreating', 'isEditing'],
  beforeMount () {
    this.locIsCreating = this.isCreating
    this.locIsEditing = this.isEditing
    this.TempHolder = this.isCreating ? {} : this.Task
  },
  data () {
    return {
      TempHolder: {},
      locIsCreating: false,
      locIsEditing: false
    }
  },
  methods: {
    onCreate () {
      console.log('in OnCreate')
      this.$refs.title.validate()
      this.$refs.icon.validate()
      if (this.$refs.title.hasError || this.$refs.icon.hasError) {
        this.formHasError = true
        this.$q.notify({
          color: 'negative',
          message: 'Missing form fields'
        })
        return false
      }
      return this.createShoppingList()
    },
    onEdit (eList) {
      console.log('in onEdit')
      if (this.$refs.title.hasError || this.$refs.icon.hasError) {
        this.formHasError = true
        this.$q.notify({
          color: 'negative',
          message: 'Missing form fields'
        })
        return false
      }
      return this.editShoppingList(eList)
    },
    async createShoppingList () {
      this.locIsCreating = true
      const newTask = {
        id: uuidV4(),
        title: this.TempHolder.title,
        description: this.TempHolder.description,
        icon: this.TempHolder.icon,
        completed: false
      }
      console.log(newTask)
      API.graphql({
        query: mutations.createTask,
        variables: { input: newTask }
      })
        .then(success => {
          this.locIsCreating = false
          this.TempHolder = {
            id: null,
            title: '',
            description: '',
            icon: 'pending_actions',
            completed: false
          }
          this.$refs.addForm.reset()
          this.onListAllShoppingLists()
          this.$q.notify({
            icon: 'done',
            color: 'positive',
            message: 'Submitted'
          })
          this.$emit('closeModal', true)
          this.$emit('refreshData', true)
          return true
        })
        .catch(exception => {
          this.$emit('closeModal', true)
          return this.$q.notify({
            icon: 'report_probelm',
            color: 'negative',
            message: exception
          })
        })
    },
    async editShoppingList (eList) {
      this.activeId = eList.id
      this.selected = null
      this.locIsEditing = true
      const editedList = {
        id: eList.id,
        title: this.TempHolder.title,
        icon: this.TempHolder.icon,
        completed: this.TempHolder.completed
      }
      const eListRes = await API.graphql({
        query: mutations.updateTask,
        variables: { input: editedList }
      })
      this.activeId = null
      this.locIsEditing = false
      if (eListRes) {
        this.$emit('closeModal', true)
        this.$emit('refreshData', true)
        return true
      }
    }
  },
  computed: {
    isReadyForm () {
      return !!(this.TempHolder.title && this.TempHolder.icon)
    }
  }
}
</script>
<style></style>
