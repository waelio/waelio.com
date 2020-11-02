<template>
  <q-page padding>
    One Item
    <pre>{{shoppingList}}</pre>
  </q-page>
</template>

<script>
// import { graphqlOperation } from 'aws-amplify'
import { getShoppingList } from 'src/graphql/queries'
import { API } from 'aws-amplify'

export default {
  name: 'OneItem',
  async beforeCreate () {
    const vm = this
    if (this.$route.params.id) {
      try {
        const id = this.$route.params.id
        const response = await API.graphql({
          query: getShoppingList,
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
