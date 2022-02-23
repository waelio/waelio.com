<template>
  <div class="possibilities" :class="{ dance: theOne && showHints }" @click="recall()">
    {{
      showHints
        ? possibilities.length === 1
          ? selectedNumber === possibilities[0]
            ? "🎁"
            : possibilities
          : possibilities
        : null
    }}
  </div>
</template>
<script lang="ts" setup>
import _ from "lodash";
import { useSudoku } from "~/store/sudoku.pinia";
import { ref, computed } from "vue";
const props = defineProps(["grid", "location", "selectedNumber", "showHints"]);

// const emit = defineEmit(["recall"]);
const possibilities = computed(function () {
  const theGrid = _whereAmI();
  const grid = _.flattenDeep(vm.$parent.$parent.newGrids[theGrid.name]);
  const col = getColumn(props.location, props.grid);
  const row = props.grid[props.location.row];
  const tpl = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const holder: number[] = [];
  tpl.forEach((cell) => {
    if (!row.includes(cell) && !col.includes(cell) && !grid.includes(cell))
      holder.push(cell);
  });
  return holder;
});
const myPossibilities = possibilities.value;
const theOne = computed(
  () => myPossibilities.length === 1 && possibilities[0] === props.selectedNumber
);

const showHints = computed(function () {
  return props.showHints && myPossibilities.length > 1;
});
const getColumn = (location: { col: string | number }, grid: any[]) => {
  const holder = [];
  grid.forEach((row: { [x: string]: any }) => {
    holder.push(row[location.col]);
  });
  return holder;
};
const recall = function () {
  $parent.$parent._validateThis(props.location, props.selectedNumber);
};
const _whereAmI = function (r?: number, c?: number) {
  const { row, col } = props.location;
  const result = _.find(
    boxes,
    (box: { from: { row: number; col: number }; to: { row: number; col: number } }) => {
      return (
        box.from.row <= row &&
        box.to.row >= row &&
        box.from.col <= col &&
        box.to.col >= col
      );
    }
  );
  return JSON.parse(JSON.stringify(result));
};
</script>

<style scpoed>
* {
  transition: all 1s ease-in-out;
}
.possibilites {
  font-size: xx-small !important;
  line-height: 1.6;
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
}
.dance {
  /* outline: 3px solid red !important;
  margin-top: -0.5rem;
  padding: 0.2rem !important; */
}
</style>
