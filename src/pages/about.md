---
title: Waelio | About
---
<q-page padding>
  <p class="text-bold">{{ t("about.title") }}</p>
  <p class="text-justify text-lg">{{ t("about.p1") }}</p>
  <p class="text-justify text-lg">{{ t("about.p2") }}</p>
  <p class="text-justify text-lg">{{ t("about.p3") }}</p>        
  <p class="text-justify text-lg">{{ t("about.p4") }}</p>            
  <p class="text-justify text-lg">{{ t("about.p5") }}</p>            
</q-page>
<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()
</script>