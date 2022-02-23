import _ from 'lodash'
import { mapGetters } from 'vuex'
export default {
  props: ['grid', 'location', 'selectedNumber', 'showHints'],
  data() {
    return {
      myPossibilities: this.possibilities,
    }
  },
  methods: {
    showHintsText() {
      const Possibilities = JSON.stringify(this.possibilities)
      return showHints
        ? this.possibilities.length === 1
          ? selectedNumber === possibilities[0]
            ? '🎁'
            : Possibilities
          : Possibilities
        : null
    },
    getColumn: (location, grid) => {
      const holder = []
      grid.forEach((row) => {
        holder.push(row[location.col])
      })
      return holder
    },
    recall() {
      this.$parent.$parent._validateThis(
        this.$props.location,
        this.$props.selectedNumber,
      )
    },
    /**
     * Find in which Grid a coordinates reside
     * @param {object} location
     * @property {number} location.row - Row in an array
     * @property {number} location.col - Column in array
     *
     * @author Wael Wahbeh
     */
    _whereAmI() {
      const { row, col } = this.$props.location
      let result
      result = _.find(this.boxes, (box) => {
        return (
          box.from.row <= row
          && box.to.row >= row
          && box.from.col <= col
          && box.to.col >= col
        )
      })

      return JSON.parse(JSON.stringify(result))
    },
  },
  computed: {
    ...mapGetters(['boxes']),
    possibilities() {
      return []
      // let theGrid = this._whereAmI(),
      //   grid = _.flattenDeep(this.$parent.$parent.newGrids[theGrid.name]),
      //   col = this.getColumn(this.$props.location, this.$props.grid),
      //   row = this.$props.grid[this.$props.location.row],
      //   tpl = [1, 2, 3, 4, 5, 6, 7, 8, 9],
      //   holder = [];
      // tpl.forEach(cell => {
      //   if (
      //     !row.includes(cell) &&
      //     !col.includes(cell) &&
      //     !grid.includes(cell)
      //   ) {
      //     holder.push(cell);
      //   }
      // });
      // return holder;
    },
    theOne: () => {
      this.possibilities/* ? */
      return (
        this.possibilities.length === 1
        && this.possibilities[0] === this.$props.selectedNumber
      )
    },
  },
}
