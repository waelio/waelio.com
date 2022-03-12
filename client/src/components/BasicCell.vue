<script lang="ts">
import type { GridLocation } from "~/.d";
import type { ComputedRef } from "vue";
export default {
  inheritAttrs: true,
};
</script>
<script lang="ts" setup>
import { computed } from "vue";
const props = defineProps({
  _location: { type: Object, default: { row: 0, col: 0 } },
  _value: { type: [Number, String], default: 0 },
  _selectedNumber: { type: [Number, String], default: 0 },
});
defineEmits(["change"]);
let myValue: number | string = props._value;
const myLocation: GridLocation = props._location;
const myStyle = computed(() => {
  return !!AmISelected.value ? "isSelected" : "";
});
const AmISelected: ComputedRef<boolean> = computed(() => {
  return props._value == props._selectedNumber;
});
</script>
<template>
  <input
    readonly
    :class="`single-sudoku-cell cell ${AmISelected ? 'good' : ''} row-${
      myLocation.row
    } col-${myLocation.col} sudoku-cell-${+myLocation.row + +myLocation.col} ${myStyle}`"
    :ref="`ROW${myLocation.row}COL${myLocation.col}`"
    v-model="myValue"
    :myValue="myValue"
    @click="$emit('change', myValue)"
  />
</template>
<style lang="scss">
.cell:hover {
  cursor: pointer;
}
.sudoku-grid {
  display: grid;
  align-content: center;
  justify-content: center;
  align-items: center;
  justify-items: center;
  grid-template-rows: repeat(1, 9vmin);
  gap: 0;
  margin: 1.5rem 0;
  width: 100%;

  overflow: hidden;
}
.row-grid {
  display: grid;
  align-content: center;
  justify-content: center;
  align-items: center;
  justify-items: center;
  grid-template-rows: repeat(1, 9vmin);
  grid-template-columns: repeat(9, 9vmin);
  gap: 0;
}
.cell {
  width: 9vmin;
  height: 9vmin;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  align-items: center;
  border-radius: 0.1em;
  padding: 0.0075vmin;
  text-align: center;
  border: 0.1vmin solid #c3c3c3;
  --hue: 115;
  --saturation: 51%;
  --lightness: 47%;
  --good-cell: hsl(
    var(--hue, 200),
    var(--saturation, 1%),
    calc(var(--lightness-offset, 0%) + var(--lightness, 51%))
  );
  border-color: hsl(
    var(--hue, 200),
    var(--saturation, 1%),
    calc(var(--lightness-offset, 0%) + var(--lightness, 51%))
  );
}
.cell.row-0.col-0 {
  --hue: 0;
  --saturation: 0%;
  --lightness: 100%;
  --lightness-offset: -10%;
}
.cell.good {
  border: 0.15rem solid var(--good-cell);
  color: var(--good-cell);
  font-weight: bolder;
}
.cel:active,
.cel:focus,
.cel:focus-visible,
.cel:focus-within {
  border-color: hsl(
    var(--hue, 200),
    var(--saturation, 1%),
    calc(var(--lightness-offset, 0%) + var(--lightness, 51%))
  );
  color: #8b8b8b;
}
.cell.isSelected {
  border: 0.2rem solid #f44336 ;
  color: #f44336 ;
  font-weight: bolder;
}
</style>
