import { defineStore } from 'pinia'
import { history as importedHistory, projects as importedProjects } from 'src/statics'

export const useStore = defineStore({
  id: 'com.waelio.app',
  state: () => ({
    history: importedHistory,
    projects: importedProjects,
    userInfo: {},
    currencies: {}
  }),
  actions: {
    setUserInfo(info) {
      this.userInfo = info
    },
    setUserCurrencies(currencies) {
      this.currencies = currencies
    }
  },
  getters: {
    History: state => state.history,
    Projects: state => state.projects,
    user: state => state.userInfo,
    iP: state  => state.userInfo ?state.userInfo['ip'] : '0.0.0.0',
    fiat: state => state.currencies,
    localCurrency: state => state.userInfo ? state.userInfo['currency'] : {},
  }
})
