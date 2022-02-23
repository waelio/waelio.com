<script lang="ts" setup>
import { useI18n } from "vue-i18n";
// import { isDark, toggleDark } from "~/logic";

const { t} = useI18n();

</script>

<template>
  <nav class="nav text-md mb-2 mx-auto text-center">
    <router-link class="icon-btn mx-2 text-sm" to="/" :title="t('button.home')">{{
      t("button.home")
    }}</router-link
    >|
    <router-link class="icon-btn mx-2 text-sm" to="/about" :title="t('button.about')">{{
      t("button.about")
    }}</router-link
    >|
    <router-link
      class="icon-btn mx-2 text-sm"
      to="/contact"
      :title="t('button.Contact')"
      >{{ t("button.Contact") }}</router-link
    >|
    <router-link
      class="icon-btn mx-2 text-sm"
      to="/plugins"
      :title="t('button.Plugins')"
      >{{ t("button.Plugins") }}</router-link
    >
    <router-link
      class="hidden icon-btn mx-2 text-sm"
      to="/utils"
      :title="t('button.Utils')"
      >{{ t("button.Utils") }}</router-link
    >|
    <router-link class="icon-btn mx-2 text-sm" to="/Games" :title="t('button.Utils')">{{
      t("button.Games")
    }}</router-link    
    >
  </nav>
</template>
