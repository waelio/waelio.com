<template>
  <q-page>
    <div v-if="isGameStarted" class="content page">
      <div class="grid-sudoku">
        <div
          v-for="(row, i) in sudokuMatrix"
          :key="i"
          :ref="i"
          class="grid-row sdk-row"
          :class="{ highlightXY: selected.row == i,
                    ['_'+i]:true}"
        >
          <div
            v-for="(cell, ii) in row"
            :key="ii"
            :ref="ii"
            class="grid-col grid-cell sdk-col"
            :class="{
              highlightXY: selected.col == ii,
              isSelected: selectedNumber == cell,
              error: error && tempData[i][ii] === 0,
              ['_'+ii]:true
            }"
          >
            <div
              v-if="cell > 0"
              :title="cell"
              :class="{['_'+cell]:true}"
              class="grid-cell-editor sdk-cell"
              @click.stop="selectNumber(cell),
                           _markAccordingly({ row: i, col: ii })"
            >
              {{ cell }}
            </div>
            <Cell
              v-else
              v-model:key="cell"
              v-model="tempData[i][ii]"
              :grid="sudokuMatrix"
              :location="{ row: i, col: ii }"
              :selected-number="selectedNumber"
              :show-hints="showHints"
              class="grid-cell-editor"
              @focus="_validateThis({ row: i, col: ii }, selectedNumber)"
            ></Cell>
          </div>
        </div>
      </div>
      <div class="grid-numbers">
        <v-row class="numbers-row">
          <v-col v-for="r1 in legend.row1" :key="r1" class="numbers-col">
            <div
              class="numbers-input"
              :class="{ isSelected: selectedNumber == r1 }"
              @click.prevent="selectNumber(r1)"
            >
              <span class="sideByside">
                <div class="grid-identifier">{{ r1 }}</div>
              </span>
              <span class="sideByside">
                <template r1="r1">
                  <div class="gl">
                    <div
                      v-for="letter in letters"
                      :key="letter"
                    >{{ _inGrid(letter, r1) ? "." : " " }}</div>
                  </div>
                </template>
              </span>
            </div>
          </v-col>
        </v-row>
        <v-row class="numbers-row">
          <v-col v-for="r2 in legend.row2" :key="r2" width="20%" class="numbers-col">
            <div
              class="numbers-input"
              :class="{ isSelected: selectedNumber == r2 }"
              @click.prevent="selectNumber(r2)"
            >
              <span class="sideByside">
                <div class="grid-identifier">{{ r2 }}</div>
              </span>
              <span class="sideByside">
                <template r1="r1">
                  <div class="gl">
                    <div
                      v-for="letter in letters"
                      :key="letter"
                    >{{ _inGrid(letter, r2) ? "." : " " }}</div>
                  </div>
                </template>
              </span>
            </div>
          </v-col>
          <v-col width="20%" class="numbers-col">
            <v-btn class="numbers-input" @click="_markAccordingly({ row: 9, col: 9 })">
              Clear
            </v-btn>
          </v-col>
        </v-row>
      </div>
      <div class="actions-menu">
        <v-responsive>
          <v-row>
            <v-col class="action-column" size="20%">
              <v-btn
                class="startButton content"
                title="Restart Game"
                color="error"
                @click="initializeGame()"
              >
                <i aria-hidden="true" class="v-icon notranslate mdi mdi-restart theme--light"></i>
              </v-btn>
            </v-col>
            <v-col class="action-column" size="20%">
              <v-btn
                class="evaluateButton content"
                color="success"
                title="Test Result!"
                @click="evaluateGame()"
              >
                <i aria-hidden="true" class="v-icon notranslate mdi mdi-timer-off theme--light"></i>
              </v-btn>
            </v-col>
            <v-col class="action-column" size="20%">
              <v-btn
                class="evaluateButton content"
                color="warning"
                title="Start new Game"
                @click="()=>isGameStarted=false"
              >
                <i aria-hidden="true" class="v-icon notranslate mdi mdi-timer theme--light"></i>
              </v-btn>
            </v-col>
            <v-col class="action-column" size="20%">
              <v-btn title="Game Duration">
                {{ GameDuration }}
              </v-btn>
            </v-col>
            <v-col class="action-column" size="20%">
              <div
                class="emoji"
                :label="showHints ? '🧐' : '🤔'"
                @click="showHints = !showHints"
              >
                {{ showHints ? '🧐' : '🤔' }}
              </div>
            </v-col>
          </v-row>
        </v-responsive>
      </div>
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { useSudoku } from 'store/sudoku.pinia'
import { ref, onMounted, nextTick } from 'vue'
const sudoku = useSudoku()
onMounted(async() => {
  await nextTick()
})
const name = ref('Sudoku')
const dialogFail = ref(false)
const dialogSuccess = ref(false)
const tempData = ref(null)
const tempDataCopy = [[], [], [], [], [], [], [], [], []]
const grids  ref([])
const newGrids = ref([])
const sudokuMatrix = []
const originalMatrix = []
const legend = {
 row1 = [1, 2, 3, 4, 5],
 row2 = [6, 7, 8, 9]
},
const initializeGameText= "Start!"
const evaluateGameText= "Verify!"
const solved= false
const error= false
const isGameStarted= false
const selected= { row: null, col: null }
const selectedNumber= 1
const letters= ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
const alertDialog1Visible= false
const alertDialog2Visible= false
const board= []
const gameNumber= null
const gameErrors= 0
const gameTiming= null
const selectedItem= 3
const now= Date.now()
const showHints= false,
const possibilitiesArray= [
  { 1: 27 },
  { 2: 27 },
  { 3: 27 },
  { 4: 27 },
  { 5: 27 },
  { 6: 27 },
  { 7: 27 },
  { 8: 27 },
  { 9: 27 }
]
    

</script>

<style scoped>
#game_canvas{
  margin: 1rem auto;
  border: 1px solid lightgray;
}
</style>
