import { DataStore, Predicates } from '@aws-amplify/datastore'
import { Chatty } from 'src/models'
import { notifyMe } from 'src/utils/notify'

const Messages = {
  namespaced: true,
  name: 'Messages',
  state: {
    Messages: [],
    Message: {},
    Subscription: null
  },
  mutations: {
    addMessages (state, payload) {
      state.Messages = payload
    },
    clearMessages (state) {
      state.Messages = []
    },
    setMessage (state, payload) {
      state.Message = payload
    },
    setSubscription (state, payload) {
      state.Subscription = payload
    },
    killSubscription (state) {
      state.Subscription.unsubscribe()
    }
  },
  actions: {
    unsubscribe ({ commit }) {
      commit('killSubscription')
    },
    observeMessages ({ commit, dispatch }) {
      DataStore.observe(Chatty).subscribe(msg => {
        notifyMe(msg.message)
        dispatch('getDatastoreMessages')
      })
      // commit('setSubscription', subscription)
    },
    async getDatastoreMessages ({ commit, getters }) {
      DataStore.query(Chatty, Predicates.ALL).then(messages => {
        commit('addMessages', messages)
      })
      return await getters.Messages
    },
    sendMessage ({ commit }, payload) {
      if (!payload.message || !payload.user) return
      DataStore.save(new Chatty({
        user: payload.user.username,
        message: payload.message,
        createdAt: new Date().toISOString()
      })).then(() => {
        commit('setMessage', {})
      }).catch(e => {
        console.log('error creating message...', e)
      })
    },
    async deleteMessage ({ dispatch }, message) {
      await DataStore.delete(message)
      dispatch('getDatastoreMessages')
    }
  },
  getters: {
    Messages (state) {
      return state.Messages
    },
    Message (state) {
      return state.Message
    }
  }

}

export default Messages
