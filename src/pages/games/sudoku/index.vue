<template>
  <div class="home">
    <h1>Sudoku Puzzle</h1>
    <p>Please go to settings and choose difficulty level.</p>
    <p>
      This game is customized to run best on mobile phones,
      not all but most. More refinement coming soon.
    </p>
    <div>
      <a target="_blank" href="https://en.wikipedia.org/wiki/Sudoku">How to Play?</a>
    </div>
    <q-btn
      color="green"
      label="Start"
    />
    <q-select
      v-mode="selectedItem"
      style="width: 100%"
      :options="difficulty"
      label="Select Difficulty"
      option-text="name"
      option-value="value"
      @click.prevent="initializeGame()"
    >
    </q-select>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useSudoku } from 'src/store/sudoku.pinia'
import { _shuffleArray } from 'waelio-utils'
const name = ref('sudoku')
const dialogFail = false
const dialogSuccess = false
let tempData = null
let tempDataCopy = [[], [], [], [], [], [], [], [], []]
let grids = []
let newGrids = []
let sudokuMatrix = []
let originalMatrix = []
const legend = {
  row1: [1, 2, 3, 4, 5],
  row2: [6, 7, 8, 9],
}
let initializeGameText = 'Start!'
let evaluateGameText = 'Verify!'
let solved = false
let error = false
let isGameStarted = false
let selected = { row: null, col: null }
let selectedNumber = 1
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
let alertDialog1Visible = false
let alertDialog2Visible = false
const board = []
let gameNumber = null
let gameErrors = 0
let gameTiming = null
const now = Date.now()
const showHints = false
const possibilitiesArray = [
  { 1: 27 },
  { 2: 27 },
  { 3: 27 },
  { 4: 27 },
  { 5: 27 },
  { 6: 27 },
  { 7: 27 },
  { 8: 27 },
  { 9: 27 },
]

const selectedItem = {
  label: 'easy',
  value: 3,
}
const sudoku = useSudoku()
const { difficulty } = sudoku.$state
/**
     * Shuffle the Matrix 3 row at a time
     * @param {array} array
     * @returns {array}
     *
     * @author Wael Wahbeh
     */
const RandomizePuzzle = (array: number[][]): Array<any> => {
  const grids = [[], [], []]
  const response = []
  let counter = 0
  let row = 0
  while (row <= 2) {
    // Save each column in a new row
    grids[row].push(array[counter])
    counter++
    grids[row].push(array[counter])
    counter++
    grids[row].push(array[counter])
    counter++
    row++
  }
  const newOrder = _shuffleArray([0, 1, 2])
  for (const section of newOrder) {
    response.push([].concat(...grids[section][0]))
    response.push([].concat(...grids[section][1]))
    response.push([].concat(...grids[section][2]))
  }
  return response
}
/**
     * A location defined by x & y named row and loc
     * @typedef {Object} location
     * @property {number} row - Row in an array
     * @property {number} col - Column in Array
     */
/**
     * Entry Point
     * Setup the game
     *
     * @returns {void}
     */
const initializeGame = (): void => {
  // newGame();
  resetParams()
  error = false
  tempData = tempDataCopy
  const pick = Math.floor(Math.random() * Matrix.length)
  const temp = _RandomizePuzzle(Matrix[pick])
  sessionStorage.setItem('temp', JSON.stringify(temp))
  originalMatrix = JSON.parse(sessionStorage.getItem('temp'))
  sessionStorage.removeItem('temp')
  sudokuMatrix = temp
  grids = _defineGrids(sudokuMatrix)
  sudokuMatrix = _hideRandom(
    sudokuMatrix,
    myDifficulty,
  )
  newGrids = _defineGrids(sudokuMatrix)
  initializeGameText = 'Restart'
  isGameStarted = true
  gameNumber = pick
  gameTiming = Date.now()
  gameErrors = 0
}
const _resetParams = () => {
  tempData = null
  tempDataCopy = [[], [], [], [], [], [], [], [], []]
  grids = []
  newGrids = []
  sudokuMatrix = []
  originalMatrix = []
  initializeGameText = 'Start!'
  evaluateGameText = 'Verify!'
  solved = false
  error = false
  isGameStarted = false
  selected = { row: null, col: null }
  selectedNumber = 1
  alertDialog1Visible = false
  alertDialog2Visible = false
  gameNumber = null
  gameErrors = 0
  gameTiming = null
}
</script>
<style >

</style>
