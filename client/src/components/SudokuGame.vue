<template>
  <div class="game-sudoku expand-height">
    <div class="sudoku-game sudoku-grid">
      <Fragment
        :class="`row-grid row-${rindex + 1}`"
        v-for="(row, rindex) in grd"
        :key="rindex"
      >
        <BasicCell
          v-for="(col, cindex) in row"
          :key="cindex"
          :_selectedNumber="selectedNumber"
          :_location="{ col: cindex + 1, row: rindex + 1 > 9 ? 1 : rindex + 1 }"
          :_value="`${col.toString()}`"
          @change="setSeletedNumber"
        />
      </Fragment>
    </div>
    <div class="grid-numbers">
      <div class="flex row numbers-row">
        <div v-for="r1 in legend.row1" :key="r1">
          <div
            @click.prevent="setSelectNumber(r1)"
            class="numbers-input"
            :class="{ ['__' + r1]: true, isSelected: selectedNumber == r1 }"
          >
            <span class="sideByside">
              <div
                class="grid-identifier"
                :class="['numbers-col', SolvedNumber(r1) ? 'Solved' : 'Unsolved']"
              >
                {{ r1 }}
              </div>
            </span>
            <span class="sideByside">
              <template r1="r1">
                <div class="gl" :ref="'gn_' + r1">
                  <div v-for="(letter, index) in letters" :key="`${letter}_${index}`">
                    {{ _inGrid(dummyMatrix, letter) ? "." : " " }}
                  </div>
                </div>
              </template>
            </span>
          </div>
        </div>
      </div>
      <div class="flex row numbers-row">
        <div width="20%" v-for="r2 in legend.row2" :key="r2">
          <div
            @click.prevent="setSelectNumber(r2)"
            class="numbers-input"
            :class="{ ['__' + r2]: true, isSelected: selectedNumber == r2 }"
          >
            <span class="sideByside">
              <div
                class="grid-identifier"
                :class="['numbers-col', SolvedNumber(r2) ? 'Solved' : 'Unsolved']"
              >
                {{ r2 }}
              </div>
            </span>
            <span class="sideByside">
              <template r1="r1">
                <div class="gl" :ref="'gn_' + r2">
                  <div v-for="(letter, index) in letters" :key="`${letter}_${index}`">
                    {{ _inGrid(dummyMatrix, letter) ? "." : " " }}
                  </div>
                </div>
              </template>
            </span>
          </div>
        </div>
        <div width="20%" class="numbers-col">
          <q-btn stretch class="numbers-input full-width" @click="setSelectNumber(0)"
            >Clear</q-btn
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SudokuGrid, GridLetters, Letter } from "src/types";
import _ from "lodash";
import { reactive, ref } from "vue";
import type { Ref } from "vue";
import { Matrix } from "src/statics/matrix";
// import { useSudoku } from "src/store/sudoku.pinia";
const letters: Ref<GridLetters> = ref(["A", "B", "C", "D", "E", "F", "G", "H", "I"]);
const randomGameNumber = () => Math.floor(Math.random() * Matrix.length) + 1;
const dummyMatrix: SudokuGrid = Matrix[randomGameNumber()];
const grd = reactive(dummyMatrix);
const selectedNumber: Ref<number> = ref(1);
const setSeletedNumber = (num: number) => {
  selectedNumber.value = num;
};
const _inGrid = (grid: SudokuGrid, needle: Letter) => {
  let tmp = _.flattenDeep(dummyMatrix[grid]);
  return _.includes(tmp, needle);
};

const legend = {
  row1: [1, 2, 3, 4, 5],
  row2: [6, 7, 8, 9],
};
const setSelectNumber = (value: number) => {
  if (selectedNumber.value !== value) {
    selectedNumber.value = value;
  } else {
    selectedNumber.value = 0;
  }
};
const SolvedNumber = (value) => {
  return _.countBy(dummyMatrix, _.identity);
};
</script>

<style lang="scss">
* {
  transition: all 500ms ease-in-out;
}
.expand-height {
  height: var(--vh);
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  align-content: space-between;
}
.content {
  margin: auto;
  background-color: #ffffff;
  display: grid;
  height: 100%;
}

.page {
  height: 100%;
  background-color: white;
}
.grid-sudoku {
  display: grid;
  background: #ffffff;
  outline: 3px solid #c3c3c3;
  margin: 1px 1px 5px 1px;
  grid-template-rows: repeat(9, 1fr);
  overflow: hidden;
  padding: 0px;
  grid-row-gap: 0px;
  gap: 0;
  row-gap: 0;
  column-gap: 0;
  box-shadow: 0px 3px 13px -1px green;
}

.grid-identifier {
  left: 50px;
}

.grid-row {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  height: 5.7vh;
}

.grid-row:nth-child(-n + 3),
.grid-row:nth-child(n + 3),
.grid-row:nth-child(n + 7) {
  background-color: #ffffff;
}

.grid-row .grid-cell:nth-child(-n + 3),
.grid-row .grid-cell:nth-child(n + 7) {
  background-color: #ffffff;
}
.grid-row:nth-child(-n + 3),
.grid-row:nth-child(n + 7) {
  background-color: #e9e8e8;
}

.grid-row:nth-child(4) .grid-cell:nth-child(-n + 3),
.grid-row:nth-child(5) .grid-cell:nth-child(-n + 3),
.grid-row:nth-child(6) .grid-cell:nth-child(-n + 3),
.grid-row:nth-child(4) .grid-cell:nth-child(n + 7),
.grid-row:nth-child(5) .grid-cell:nth-child(n + 7),
.grid-row:nth-child(6) .grid-cell:nth-child(n + 7) {
  background-color: #e9e8e8;
}
.grid-cell {
  display: block;
  padding: 11%;
  outline: 1px solid #cec7c7ba;
  overflow: hidden;
  cursor: grab;
}
.grid-cell-editor {
  visibility: visible;
  display: flow-root;
  width: 100%;
  min-height: 1rem;
  border-radius: 2px;
  padding: 0;
  background-color: transparent;
  font-family: "Dosis", sans-serif;
  font-weight: bold;
  text-align: center;
  font-size: 1rem;
  vertical-align: middle;
  line-height: 100%;
  height: 100%;
  word-break: break-all;
}
.grid-numbers {
  display: flex;
  margin: auto;
  background: white;
  overflow: visible;
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: center;
  align-items: center;
}
.numbers-row {
  align-content: space-between;
  justify-content: space-between;
  align-items: center;
}
.numbers-col {
  box-shadow: -3px 7px 11px -7px #48a64c;
  flex-basis: 0;
  -webkit-box-flex: 0;
  flex-grow: 1;
  max-width: 20vw;
  width: 15vmin;
}
.numbers-input {
  border: 1px solid #48a64c !important;
  height: 2.5rem !important;
  display: flex !important;
  margin: auto !important;
  border-radius: 4px !important;
  background-color: #e9e8e8 !important;
  color: #535d1a !important;
  font-weight: bold !important;
  visibility: visible !important;
  cursor: pointer;
  text-align: center !important;
  flex-direction: row-reverse;
}

.numbers-col * {
  cursor: pointer;
}
.numbers-col:hover {
  background-color: #48a64c;
  border-radius: 5px;
  transform: translateY(-5px);
  box-shadow: -7px 10px 9px -7px #48a64c;
}
.numbers-col .isSelected {
  transform: translateY(0);
  box-shadow: 5px 25px 24px -10px #48a64c;
  color: #ffffff !important;
}

input.grid-cell-editor[readonly],
input.grid-cell-editor[disabled] {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.highlightXY label {
  color: #ffffff;
}
.grid-row .error {
  background-color: #f44336 !important;
  color: white !important;
}
.grid-row.highlightXY,
.grid-row.highlightXY .grid-cell,
.grid-cell.highlightXY {
  background-color: #4caf5029 !important;
  color: #f57c00 !important;
  font-weight: bold;
  word-break: break-all;
  letter-spacing: 1px;
}
.isSelected {
  background-color: #48a64c !important;
  color: #f2f3ed;
  font-weight: bold;
}
.mark-button {
  cursor: pointer;
}
.sideByside {
  display: inline-block;
  height: auto;
  clear: none;
}
.emoji {
  font-size: 2rem;
  line-height: 2rem;
}
.gl {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  font-size: 20px;
  font-weight: bolder;
  grid-gap: 5px;
  grid-auto-rows: 3px;
  margin: -10px 5.4vw auto auto;
  flex-wrap: wrap;
  padding: 0 1vw;
}
.grid-identifier {
  display: block;
  font-size: 2rem;
  text-indent: -1rem;
  padding-right: 0.3rem;
  height: 100%;
  margin: auto;
  line-height: 100%;
  color: #4caf50;
}
.isSelected .grid-identifier.Solved {
  color: #ffffff;
}

.startButton {
  margin: auto;
  display: table;
}
.evaluateButton {
  margin: auto;
  display: table;
}
.entrance {
  width: 90vw;
  margin: 3rem auto;
  background-color: white;
  height: 100vh;
  padding: 2rem;
}
.hints {
  font-size: 2rem;
  margin: auto;
  text-align: center;
  display: block;
}

#hints-checkbox {
  display: none;
}
.actions-menu .action-column {
  width: 20vw;
  margin: auto;
}
div.actions-menu {
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  flex-direction: column;
  margin: auto;
}
div.actions-menu ons-button {
  margin: auto;
  display: table;
  font-size: 2rem;
  background-color: #ffffff;
  color: #6583a0;
  border: none;
}
.Unsolved {
  color: #ff5252;
  vertical-align: middle;
  line-height: 100%;
  font-style: italic;
  margin-right: 2px;
}
.dance {
  margin: auto;
  padding: 0rem !important;
  height: 100%;
  display: block;
  position: relative;
  line-height: 100%;
  min-height: unset;
  font-size: 1.7rem !important;
}
</style>
