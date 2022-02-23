---
title: Waelio | Sudoku
---

<script lang="ts" setup>
import { reactive } from "vue";
import _ from "lodash";
import { useSudoku } from "src/store/sudoku.pinia";
import _shuffleArray from "waelio-utils/dist/waelioUtils";
import { isDark } from "~/logic";

const sudoku = useSudoku();
const state = reactive({
  name: "sudoku",
  dialogFail: false,
  dialogSuccess: false,
  tempData: null,
  tempDataCopy: [[], [], [], [], [], [], [], [], []],
  grids: [],
  newGrids: [],
  sudokuMatrix: [],
  originalMatrix: [],
  legend: {
    row1: [1, 2, 3, 4, 5],
    row2: [6, 7, 8, 9],
  },
  initializeGameText: "Start!",
  evaluateGameText: "Verify!",
  solved: false,
  error: false,
  isGameStarted: false,
  selected: { row: null, col: null },
  selectedNumber: 1,
  letters: ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
  alertDialog1Visible: false,
  alertDialog2Visible: false,
  board: [],
  gameNumber: null,
  gameErrors: 0,
  gameTiming: null,
  now: Date.now(),
  boxes: [],
  showHints: false,
  possibilitiesArray: [
    { 1: 27 },
    { 2: 27 },
    { 3: 27 },
    { 4: 27 },
    { 5: 27 },
    { 6: 27 },
    { 7: 27 },
    { 8: 27 },
    { 9: 27 },
  ],
});
const selectedItem = reactive({
  label: "easy",
  value: 3,
});
const difficulty = sudoku.difficulties;
const RandomizePuzzle = (theArray: number | null[][]) => {
  // const grids = [[], [], []]
  // const response = []
  // let counter: number = 0
  // let row: number = 0
  // while (row <= 2) {
  //   // Save each column in a new row
  //   grids[row].push(theArray[counter])
  //   counter++
  //   grids[row].push(theArray[counter])
  //   counter++
  //   grids[row].push(theArray[counter])
  //   counter++
  //   row++
  // }
  // const newOrder = _shuffleArray([0, 1, 2],{});
  // for (const section of newOrder) {
  //   response.push([].concat(...grids[section][0]))
  //   response.push([].concat(...grids[section][1]))
  //   response.push([].concat(...grids[section][2]))
  // }
  return theArray;
};
const _defineGrids = (array) => {
  const letters: string[] = state.letters;
  const boxes = state.boxes;
  const dumbMatrix = array;
  let dumbGrids;
  const grids: string[] = [];
  for (const L of letters) grids[L] = [];

  dumbGrids = grids;
  _.forEach(boxes, (box) => {
    let tmp: number[] = [];
    tmp.push(dumbMatrix[box.from.row + 0].slice(box.from.col, box.from.col + 3));
    tmp.push(dumbMatrix[box.from.row + 1].slice(box.from.col, box.from.col + 3));
    tmp.push(dumbMatrix[box.from.row + 2].slice(box.from.col, box.from.col + 3));
    dumbGrids[box.name] = tmp;
  });
  return dumbGrids;
};
const initializeGame = (): void => {
  //  newGame();
  // _resetParams()
  state.Error = false;
  state.tempData = state.tempDataCopy;
  const pick: number = Math.floor(Math.random() * state.sudokuMatrix.length);
  const temp = RandomizePuzzle(state.sudokuMatrix[pick]);
  // window.sessionStorage.setItem('temp', JSON.stringify(temp))
  // const nv = window.sessionStorage.getItem('temp')
  // state.originalMatrix = JSON.parse(nv)
  // window.sessionStorage.removeItem('temp')
  state.sudokuMatrix = temp;
  state.grids = _defineGrids(state.sudokuMatrix);
  // state.sudokuMatrix = _hideRandom(
  //   state.sudokuMatrix,
  //   state.myDifficulty,
  // )
  // state.newGrids = _defineGrids(state.sudokuMatrix)
  // state.initializeGameText = 'Restart'
  // state.isGameStarted = true
  // state.gameNumber = pick
  // state.gameTiming = Date.now()
  // state.gameErrors = 0
};
const _resetParams = () => {
  state.tempData = null;
  state.tempDataCopy = [[], [], [], [], [], [], [], [], []];
  state.grids = [];
  state.newGrids = [];
  state.sudokuMatrix = [];
  state.originalMatrix = [];
  state.initializeGameText = "Start!";
  state.evaluateGameText = "Verify!";
  state.solved = false;
  state.error = false;
  state.isGameStarted = false;
  state.selected = { row: null, col: null };
  state.selectedNumber = 1;
  state.alertDialog1Visible = false;
  state.alertDialog2Visible = false;
  state.gameNumber = null;
  state.gameErrors = 0;
  state.gameTiming = null;
};
const _hideRandom = (array: number | null[][], difficulty: number) => {
  const boxes = state.boxes;
  const newArray = array;
  const newOrder = _shuffleArray([0, 1, 2], {});
  for (const section of newOrder) {
    for (const row of newArray[section]) {
      for (const col of row) {
        if (col === 0) {
          const box = boxes[section];
          const from = box.from;
          const to = box.to;
          const row = Math.floor(Math.random() * (to.row - from.row + 1)) + from.row;
          const col = Math.floor(Math.random() * (to.col - from.col + 1)) + from.col;
          newArray[section][row][col] = 0;
        }
      }
    }
  }
  return newArray;
};
</script>

<template>
  <div class="homes">
    <h1>Sudoku Puzzle</h1>
    <div class="q-ml-none mr-auto w-45 text-left bg-yellow-300 rounded p-2 text-dark">
      <a target="_blank" class="text-xs" href="https://en.wikipedia.org/wiki/Sudoku"
        >How to Play?</a
      >
    </div>

    <q-select
      v-model="selectedItem"
      rounded
      autocomplete="true"
      :class="isDark ? 'bg-white text-dark' : 'text-yellow-500'"
      class="q-px-sm xl:w-50/100 lg:width-50/100 md:w-50/100 sm:w-full q-my-lg q-mx-auto rounded"
      :options="difficulty"
      label="Select Difficulty"
      option-text="label"
      option-value="value"
      @click.prevent="initializeGame"
    >
    </q-select>
    <q-btn
      color="green"
      text-color="white"
      class="q-my-lg"
      label="Standard"
      @click="initializeGame()"
    />
  </div>
</template>

<style></style>
