<template>
  <form v-on:submit.prevent>
    <input v-model="form.message" placeholder="Enter your message..." />
    <button @click="sendMessage">Send</button>
  </form>
</template>
<script>
import { DataStore } from '@aws-amplify/datastore'
import { Chatty } from 'src/models'

export default {
  data () {
    return {
      form: {}
    }
  },
  methods: {
    sendMessage () {
      const { message } = this.form
      if (!message) return
      DataStore.save(new Chatty({
        user: this.user.username,
        message: message,
        createdAt: new Date().toISOString()
      })).then(() => {
        this.form = { message: '' }
        this.loadMessages()
      }).catch(e => {
        console.log('error creating message...', e)
      })
    }
  }
}
</script>
