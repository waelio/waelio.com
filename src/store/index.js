import Vue from 'vue'
import Vuex from 'vuex'
import LSidebar from 'src/store/LSidebar'
import Messages from 'src/store/Messages'
import LocalUser from 'src/store/LocalUser'

Vue.use(Vuex)

export default function (/* { ssrContext } */) {
  const store = new Vuex.Store({
    modules: {
      LocalUser,
      LSidebar,
      Messages
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  })

  return store
}
