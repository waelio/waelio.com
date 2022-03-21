<template>
  <i class="letter" :style="{ backgroundColor: Pix }" :title="letter"></i>
</template>
<script lang="ts" setup>
import { onMounted, watch, computed } from "vue";
import { useQ2B } from "src/store/q2p.pinia";
const props = defineProps(["letter", "styling"]);
const useQuranStore = useQ2B();
const Legend = useQuranStore.Legend;
onMounted(() => {
  console.log("Quran By Pixkels");
});
const Pix = computed(() => Legend.find((one) => one.letter === props.letter).color);
</script>
<style scoped lang="scss">
i {
  direction: rtl;
  color: black;
  border-radius: 16px;
  width: 10px;
  height: 10px;
  display: inline-block;
  word-wrap: inherit;
}
</style>
