<script lang="ts">
import type { GridLocation } from "~/.d";
export default {
  inheritAttrs: true,
};
</script>
<script lang="ts" setup>
const props = defineProps({
  _location: { type: Object, default: { row: 0, col: 0 } },
  _value: { type: [Number, String], default: 0 },
});
const emit = defineEmits(["change"]);
let myValue: number = props._value;
const myLocation: GridLocation = props._location;
const myValueChange = (value: number) => {
  myValue = value;
  emit("change", myValue);
};
</script>
<template>
  <input
    readonly
    class="cell good"
    :class="`row-${myLocation.row} col-${myLocation.col}`"
    :ref="`ROW${myLocation.row}COL${myLocation.col}`"
    v-model="myValue"
    :myValue="myValue"
    @input="myValueChange"
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
  grid-template-rows: repeat(1, calc(var(--vw) / 9));
  gap: 0;
  margin: 1.5rem 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.row-grid {
  display: grid;
  align-content: center;
  justify-content: center;
  align-items: center;
  justify-items: center;
  grid-template-columns: repeat(9, calc(var(--vw) / 11));
  grid-template-rows: repeat(1, calc(var(--vw) / 9));
  gap: 0;
}
.cell {
  width: calc(var(--vw) / 9);
  height: calc(var(--vw) / 9);
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  align-items: center;
  border-radius: 0.1em;
  padding: 0.01em;
  text-align: center;
  border: 1px solid #c3c3c3;
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
  border: 0.1rem solid var(--good-cell);
  color: var(--good-cell);
  font-weight: bold;
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
}
</style>
