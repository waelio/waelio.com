import { defineStore } from 'pinia'
// type Difficulty = {label: string, value: string}
export const useSudoku = defineStore({
  id: 'sudoku',
  state: () => {
    return {
      chosenDifficulty: 3,
      difficulty: [
        {
          label: 'easy',
          value: 3,
        },
        {
          label: 'medium',
          value: 7,
        },
        {
          label: 'hard',
          value: 10,
        },
        {
          label: 'insane',
          value: 17,
        },
      ],
      stats: [],
      boxes: [
        {
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
  actions: {
    setDifficulty(payload: number) {
      this.chosenDifficulty = payload
    },
    addStats(payload: { id: number}) {
      let lastID = 0
      const statsSize = this.stats.length
      lastID = (
        this.stats.length > 0
        && this.stats[statsSize - 1]
        && (this.stats[statsSize - 1].id)
      )
        ? this.stats[statsSize - 1].id + 1
        : statsSize + 1

      payload.id = lastID
      this.stats.push(payload)
    },
    deleteStats() {
      this.stats = []
    },
  },
  getters: {
    myBoxes: state => state.boxes,
    difficulties: state => state.difficulty,
    myDifficulty: state => state.chosenDifficulty,
    myStats: state => state.stats,
  },
})
