<template>
  <div
    class="flex flex-row justify-start items-start white-glassmorphism p-3 m-2 
    cursor-pointer hover:shadow-xl"
  >
    <div :class="`w-10 h-10 rounded-full flex justify-center items-center ${color}`">
      <Icon :icon="icon" />
    </div>
    <div class="ml-5 flex flex-col flex-1">
      <h3 class="mt-2 text-white text-lg">{{ title }}</h3>
      <p class="mt-1 text-white text-sm md:w-9/12">{{ subtitle }}</p>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { toRefs } from "vue";
const props = defineProps<{
  color?: string;
  icon?: string;
  title?: string;
  subtitle?: string;
  fontSize?: number;
  class?: string;
}>();
const { color, icon, title, subtitle } = toRefs(props);
</script>
<style lang="scss" scoped></style>
