<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { useI18n } from "vue-i18n";
import { onMounted } from "vue";
const { t } = useI18n();
const width = ref(window.innerWidth);
const height = ref(window.innerHeight);
window.addEventListener(
  "resize",
  (e: Event) => {
    const { screen } = e.target as Window;
    width.value = screen.width;
    height.value = screen.height;
    document.querySelector("html")?.style.setProperty("--vh", height.value + "px");
    document.querySelector("html")?.style.setProperty("--vw", width.value + "px");
  },
  true
);
onMounted(() => {
  document.querySelector("html")?.style.setProperty("--vh", height.value + "px");
  document.querySelector("html")?.style.setProperty("--vw", width.value + "px");
});
useHead({
  title: "Waelio",
  meta: [{ name: "description", content: t("intro.desc") }],
});
</script>
<template>
  <router-view />
</template>
