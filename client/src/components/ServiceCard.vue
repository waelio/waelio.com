<template>
  <div
    class="flex flex-row justify-start items-start white-glassmorphism p-3 m-2 cursor-pointer hover:shadow-xl"
  >
    <div class="`w-10 h-10 rounded-full flex justify-center items-center ${color}`">
      {{ icon }}
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
  color: {
    type: String;
    default: "bg-[#2952E3]";
  };
  icon: {
    type: String;
    default: "BsShieldFillCheck";
  };
  title: {
    type: String;
    default: "Security gurantee";
  };
  subtitle: {
    type: String;
    default: "Security is guranteed. We always maintain privacy and maintain the quality of our products";
  };
}>();
const { color, icon, title, subtitle } = toRefs(props);
</script>
<style lang="scss" scoped></style>
