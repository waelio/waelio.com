import _ from 'lodash'
import { computed, getCurrentInstance } from 'vue'
const props = defineProps(['grid', 'location', 'selectedNumber', 'showHints'])
const instance = getCurrentInstance();

const myPossibilities = possibilities


const showHintsText = () => {
  const Possibilities = JSON.stringify(possibilities)
  return showHints
    ? possibilities.length === 1
      ? selectedNumber === possibilities[0]
        ? '🎁'
        : Possibilities
      : Possibilities
    : null
},
const getColumn = (location, grid) => {
  const holder = []
  grid.forEach((row) => {
    holder.push(row[location.col])
  })
  return holder
}
const recall = () => {
  instance.parent.parent._validateThis(
    props.location,
    props.selectedNumber,
  )
}
/**
 * Find in which Grid a coordinates reside
 * @param {object} location
 * @property {number} location.row - Row in an array
 * @property {number} location.col - Column in array
 *
 * @author Wael Wahbeh
 */
const _whereAmI = () => {
  const { row, col } = props.location
  let result
  result = _.find(boxes, (box) => {
    return (
      box.from.row <= row
      && box.to.row >= row
      && box.from.col <= col
      && box.to.col >= col
    )
  })

  return JSON.parse(JSON.stringify(result))
}


mapGetters(['boxes'])
const possibilities = computed(() => {
  return []
  // let theGrid = _whereAmI(),
  //   grid = _.flattenDeep(instance.parent.instance.parent.newGrids[theGrid.name]),
  //   col = getColumn(props.location, props.grid),
  //   row = props.grid[props.location.row],
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
})
const theOne = computed(() => {
  return (
    possibilities.value.length === 1
    && possibilities[0] === props.selectedNumber
  )
}
  ,
