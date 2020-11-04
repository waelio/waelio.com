<template>
  <div>
    <q-btn icon="arrow_back" @click="$router.go(-1)" label="Back" color="warning" />
    <h3 class="text-center">{{shoppingList && shoppingList.name}}</h3>
    <div v-if="shoppingList && shoppingList.shoppingItems.length">
      <pre>{{shoppingList.shoppingItems}}</pre>
    </div>
    <div v-else class="q-mx-auto">
      <p class="bg-warning text-white text-center q-py-sm">Empty Shopping Items</p>
      <q-btn  color="green" icon="add_task" label="Add Item" />
    </div>

    <pre>{{shoppingList}}</pre>
  </div>
</template>

<script>
// import { graphqlOperation } from 'aws-amplify'
import { getTask } from 'src/graphql/queries'
import { API } from 'aws-amplify'

export default {
  name: 'OneItem',
  async beforeCreate () {
    const vm = this
    if (this.$route.params.id) {
      try {
        const id = this.$route.params.id
        const response = await API.graphql({
          query: getTask,
          variables: { id: id }
        })
        if (response) {
          vm.shoppingList = response.data.getShoppingList
        }
      } catch (error) {
        console.error(error)
      }
    }
  },
  data () {
    return {
      shoppingList: null
    }
  }
}
</script>
<style>
</style>
