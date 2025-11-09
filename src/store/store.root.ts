import { defineStore } from 'pinia'
import { history as importedHistory, projects as importedProjects } from 'src/statics'

export const useStore = defineStore({
  id: 'com.waelio.app',
  state: () => ({
    history: importedHistory,
    projects: importedProjects,
  }),
  getters: {
    History: state => state.history,
    Projects: state => state.projects,
  },
})
