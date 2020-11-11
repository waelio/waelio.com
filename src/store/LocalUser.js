import { Auth } from 'aws-amplify'

const LocalUser = {
  namespaced: true,
  state: {
    User: null,
    signedIn: false
  },
  mutations: {
    updateUser (state, payload) {
      state.User = payload
      state.signedIn = (payload && Object.keys(payload).length > 0) || false
    }
  },
  actions: {
    async verifyState ({ commit }) {
      await Auth
        .currentAuthenticatedUser()
        .then(async user => {
          commit('updateUser', user)
          console.log('verifyState', user)
          return user
        })
        .catch(() => {
          commit('updateUser', null)
          return null
        })
    },
    signOut ({ commit, dispatch }) {
      Auth.signOut().then(() => {
        commit('updateUser', null)
        dispatch('routeToLogin')
      })
    },
    routeToLogin () {
      this.$router.push({ path: '/auth/process' })
    }
  },
  getters: {
    User (state) {
      return state.User
    },
    signedIn (state) {
      return state.signedIn
    }
  }
}
export default LocalUser
