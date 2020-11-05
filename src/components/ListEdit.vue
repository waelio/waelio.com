<template>
  <div class="q-pa-sm q-mx-auto special-border">
    <q-form
      :id="locIsCreatingList ? 'isCreatingList' : 'isEditingList'"
      :ref="locIsCreatingList ? 'addForm' : 'editForm'"
      v-bind="props1"
      @submit.prevent="locIsCreatingList ? onCreate() : onEdit(TempHolder)"
    >
      <h2 class="text-subtitle1 text-black text-center q-my-sx">
        {{ locIsCreatingList ? "Add" : "Edit" }} List
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

      <q-btn
        type="submit"
        :label="locIsCreatingList ? 'Create' : 'Edit' + ' List'"
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
  name: 'ListEdit',
  props: ['List', 'CreateListInput', 'props1', 'isCreatingList', 'isEditingList'],
  beforeMount () {
    this.locIsCreatingList = this.isCreatingList
    this.locIsEditingList = this.isEditing
    this.TempHolder = this.isCreatingList ? {} : this.List
  },
  data () {
    return {
      TempHolder: {},
      locIsCreatingList: false,
      locIsEditingList: false
    }
  },
  methods: {
    onCreate () {
      console.log('in OnCreate')
      this.$refs.title.validate()
      if (this.$refs.title.hasError) {
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
      this.locIsCreatingList = true
      const newList = {
        id: uuidV4(),
        title: this.TempHolder.title,
        tasks: []
      }
      console.log(newList)
      API.graphql({
        query: mutations.createList,
        variables: { input: newList }
      })
        .then(success => {
          this.locIsCreatingList = false
          this.TempHolder = {
            id: null,
            title: ''
          }
          this.$refs.addForm.reset()
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
        icon: this.TempHolder.completed ? 'check_box' : 'check_box_outline_blank',
        completed: this.TempHolder.completed
      }
      const eListRes = await API.graphql({
        query: mutations.updateList,
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
      return !!(this.TempHolder.title)
    }
  }
}
</script>
<style></style>
