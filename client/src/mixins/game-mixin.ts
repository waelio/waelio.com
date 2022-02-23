import { useSudoku } from "./../store/sudoku.pinia";
import _ from 'lodash'
import { mapActions, mapGetters } from 'vuex'
import { Matrix } from 'src/statics/matrix'
import{ onMounted, reactive, onBeforeMount, unref } from 'vue'
export default {
  setup(){
    onBeforeMount(()=> {
    const self = this
    setInterval(() => {
      self.now = Date.now()
    }, 1000)
    })
    onMounted(()=> {
    initializeGame()
    })
    const data = reactive({
      initializeGameText: 'Start!',
      evaluateGameText: 'Verify!',
      selected: { row: null, col: null },
      sudokuMatrix: [],
      originalMatrix: [],
      tempData: null,
      tempDataCopy: [[], [], [], [], [], [], [], [], []],
      grids: [],
      newGrids: [],
      gridWidth: 9,
      gridHeight: 9,
      cellSize: 39,
      roaming: 1,
      selectedNumber: 1,
      letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
      defaultTemplate: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      solved: false,
      error: false,
      now: Date.now(),
      isGameStarted: false,
      board: [],
      gameNumber: null,
      gameErrors: 0,
      gameTiming: null,
      showHints: false,
      possibilities: 'Cell.data',
      possibilitiesArray: [
        [[], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], []],
        [[], [], [], [], [], [], [], [], []],
      ],
    })
    
  
    // ...mapActions(['setDifficulty', 'addStats'])
    const sayHi = (x, y) =>{
      if (!x || !y) return
      const value = isValue(x, y)
      console.log('59:value', value)
      const test = !!value
      if (test === false && data.roaming > 0)
        setValue(x, y, data.roaming)

      alert(value)
    }
    const isOkay = (x, y, v, test = true) =>{
      return test
        ? !!(v === unref(data).sudokuMatrix[x][y])
        : !!(v === data.originalMatrix[x][y])
    }
    const toggleSelected = (value:number, test:boolean = false) => {
      if (test)
        data.roaming = value

      return (data.selectedNumber = value || 0)
    }
   const  setValue = (x:number, y:number, v:number) =>{
      data.sudokuMatrix[x][y].value = v
    }
    const isValue = (x, y, test = true) => {
      return test
        ? data.sudokuMatrix && data.sudokuMatrix[x] && data.sudokuMatrix[x][y]
          ? data.sudokuMatrix[x][y]
          : ' '
        : data.originalMatrix
          && data.originalMatrix[x]
          && data.originalMatrix[x][y]
          ? data.originalMatrix[x][y]
          : ' '
    }
    
    const _whereAmI = function(location) {
      const { row:[], col:[] } = location
      let result

      result = _.find(useSudoku().$state.boxes, (box) => {
        return (
          box.from.row <= row
          && box.to.row >= row
          && box.from.col <= col
          && box.to.col >= col
        )
      })
      return JSON.parse(JSON.stringify(result))
    }

    _const reCalc = () => {
      data.defaultTemplate.forEach((value, i) => {
        data.possibilitiesArray[i][i].push(value)
      })
    }
    
    const SolvedNumber = function(value) {
      return this[`Number_${value}`]() === 9
    }

    const initializeGame = () => {      
      // theCells.forEach(cell => cell.classList.remove("error"));
      data.error.value = false
      data.tempData.value = data.tempDataCopy.value
      const pick = Math.floor(Math.random() * Matrix.length)
      const temp = this._RandomizePuzzle(Matrix[pick])
      data.originalMatrix.value = _.cloneDeep(temp)
      data.sudokuMatrix.value = _.cloneDeep(temp)
      data.grids.value = this._defineGrids(this.sudokuMatrix)
      data.sudokuMatrix.value = this._hideRandom()
      data.newGrids.value = this._defineGrids(this.sudokuMatrix)
      data.initializeGameText.value = 'Restart'
      data.isGameStarted.value = true
      data.gameNumber.value = pick
      data.gameTiming.value = Date.now()
      data.gameErrors.value = 0
    }
   
    const _defineGrids = function(array) {
      const letters = data.letters
      const boxes = useSudoku().$state.boxes
      const dumbMatrix = []
      let dumbGrids
      const grids = []

      data.grids.value = letters.map(letter => ({
        [letter]: [],
      }))

      dumbGrids = data.grids
      console.log("%cMyProject%cline:140%cthis.grids", this.grids);

      _.forEach(boxes, (box, index) => {
        let tmp = [];
        tmp.push(
          dumbMatrix[box.from.row + index] // .slice(box.from.col, box.from.col + 3)
        );
        tmp.push(
          dumbMatrix[box.from.row + 1].slice(box.from.col, box.from.col + 3)
        );
        tmp.push(
          dumbMatrix[box.from.row + 2].slice(box.from.col, box.from.col + 3)
        );
        dumbGrids[box.name] = tmp;
        tmp = null;
      });

      return dumbGrids
    },
    /**
     * Delete Random elements based on difficulty
     * @param {array} [array] - Sudoku Matrix
     * @param {number} difficulty
     * @returns {array}
     */
    _hideRandom(array = this.sudokuMatrix, difficulty = this.myDifficulty) {
      for (let i = 0; i < array.length; ++i) {
        for (let k = 0; k < difficulty; ++k) {
          const randomColumnIndex = Math.floor(Math.random() * array.length)
          array[i][randomColumnIndex] = ''
        }
      }
      return array
    },
    /**
     * Shuffle the Matrix 3 row at a time
     * @param {array} array
     * @returns {array}
     *
     * @author Wael Wahbeh
     */
    _RandomizePuzzle(array) {
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
      const newOrder = this._shuffleArray([0, 1, 2])
      for (const section of newOrder) {
        response.push([].concat(...grids[section][0]))
        response.push([].concat(...grids[section][1]))
        response.push([].concat(...grids[section][2]))
      }
      return response
    },
    /**
     * Shuffle An Array
     * @param {array} array
     * @returns {array}
     *
     * @author Wael Wahbeh
     */
    _shuffleArray(array) {
      if (!array.length) return array
      const copy = []
      let n = array.length
      let i
      // While there remain elements to shuffle…
      while (n && !this._equals(copy, array)) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * n--)
        // And move it to the new array.
        copy.push(array.splice(i, 1)[0])
      }
      return copy
    },
    /**
     * Compare two arrays
     * @param {array} array
     * @param {array} needle
     * @returns {boolean}
     *
     * @author Wael Wahbeh
     */
    _equals(array, needle) {
      // if the other array is a falsy value, return
      if (!array) return false
      if (!needle) return false

      // compare lengths - can save a lot of time
      if (needle.length != array.length) return false

      for (let i = 0, l = needle.length; i < l; i++) {
        // Check if we have nested arrays
        if (needle[i] instanceof Array && array[i] instanceof Array) {
          // recurse into the nested arrays
          if ((!this._equals(array[i]), needle[i])) return false
        }
        else if (needle[i] != array[i]) {
          return false
        }
      }
      return true
    },
    /**
     * Rotate a multidimentional Array clockwise 90 degrees
     * @param {array} a
     * @returns {array}
     *
     * @author Wael Wahbeh
     */
    _rotateArray(a) {
      // Calculate the width and height of the Array
      const w = a.length || 0
      const h = a[0] instanceof Array ? a[0].length : 0

      // In case it is a zero matrix, no transpose needed.
      if (h === 0 || w === 0)
        return []

      /**
       * @type {number} i Counter
       * @type {number} j Counter
       * @type {Array<number>} t Transposed data is stored in this array.
       */
      let i
      let j
      const t = []

      // Loop through every item in the outer array (height)
      for (i = 0; i < h; i++) {
        // Insert a new row (array)
        t[i] = []

        // Loop through every item per item in outer array (width)
        for (j = 0; j < w; j++) {
          // Save transposed data.
          t[i][j] = a[j][i]
        }
      }

      return t
    },
  },
  computed: {
    ...mapGetters(['difficulty', 'myDifficulty', 'boxes']),
    cols() {
      return `${this.cellSize},`.repeat(this.gridWidth)
    },
    rows() {
      return `${this.cellSize},`.repeat(this.gridHeight)
    },
    _cols() {
      return this.sudokuMatrix
    },
    _rows() {
      return this._rotateArray(this.sudokuMatrix)
    },
    _grids() {
      return this.grids.map((grid, gi) => ({
        ...grid,
      }))
    },
  },
}
