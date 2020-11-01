<template>
  <q-page padding>
    One Item
    <pre>{{$route.params}}</pre>
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
    if (this.$route.params.slId) {
      try {
        const slId = this.$route.params.slId
        const response = await API.graphql({
          query: getShoppingList,
          variables: { id: slId }
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
