import { createStore } from 'vuex'
import { UserModule } from '~/types'

// https://github.com/antfu/vite-plugin-pwa#automatic-reload-when-new-content-available
export const install: UserModule = ({ app, isClient }) => {
  if (!isClient)
    return
  const store = createStore({
    state() {
      return {
        chosenDifficulty: 3,
        difficulty: [{
          name: 'easy',
          value: 3,
        },
        {
          name: 'medium',
          value: 7,
        },
        {
          name: 'hard',
          value: 10,
        },
        {
          name: 'insane',
          value: 17,
        },
        ],
        stats: [],
        boxes: [{
          name: 'A',
          from: {
            row: 0,
            col: 0,
          },
          to: {
            row: 2,
            col: 2,
          },
        },
        {
          name: 'B',
          from: {
            row: 0,
            col: 3,
          },
          to: {
            row: 2,
            col: 5,
          },
        },
        {
          name: 'C',
          from: {
            row: 0,
            col: 6,
          },
          to: {
            row: 2,
            col: 8,
          },
        },
        {
          name: 'D',
          from: {
            row: 3,
            col: 0,
          },
          to: {
            row: 5,
            col: 2,
          },
        },
        {
          name: 'E',
          from: {
            row: 3,
            col: 3,
          },
          to: {
            row: 5,
            col: 5,
          },
        },
        {
          name: 'F',
          from: {
            row: 3,
            col: 6,
          },
          to: {
            row: 5,
            col: 8,
          },
        },
        {
          name: 'G',
          from: {
            row: 6,
            col: 0,
          },
          to: {
            row: 8,
            col: 2,
          },
        },
        {
          name: 'H',
          from: {
            row: 6,
            col: 3,
          },
          to: {
            row: 8,
            col: 5,
          },
        },
        {
          name: 'I',
          from: {
            row: 6,
            col: 6,
          },
          to: {
            row: 8,
            col: 8,
          },
        },
        ],
      }
    },
    mutations: {
      updateDifficulty(state, payload) {
        state.chosenDifficulty = payload
      },
      updateStats(state, payload) {
        let lastID = 0
        if (state.stats.length > 0)
          lastID = state.stats[state.stats.length - 1].id + 1

        payload.id = lastID
        state.stats.push(payload)
      },
      resetStats(state) {
        state.stats = []
      },
    },
    actions: {
      setDifficulty(context, payload) {
        context.commit('updateDifficulty', payload)
      },
      addStats(context, payload) {
        context.commit('updateStats', payload)
      },
      deleteStats(context) {
        context.commit('resetStats')
      },
    },
    getters: {
      boxes(state) {
        return state.boxes
      },
      difficulty(state) {
        return state.difficulty
      },
      myDifficulty(state) {
        return state.chosenDifficulty
      },
      stats(state) {
        return state.stats
      },
    },
  })
  app.use(store)
}
