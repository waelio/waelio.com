<template>
  <div class="text-center" :class="isDark ? 'text-white' : 'text-dark'">
    Built at: {{ BuildTime }} ({{ timeAgo }})
  </div>
</template>
<script lang="ts" setup>
import { useTimeAgo } from "@vueuse/core";
import moment from "moment";
const date = "__DATE__";
const timeAgo = useTimeAgo(date);
const BuildTime: string = moment(date).format("ddd MMM DD, YYYY [at] HH:mm");
</script>
<style lang="scss"></style>
