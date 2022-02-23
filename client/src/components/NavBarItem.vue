<template>
  <router-link :class="'mx-4 cursor-pointer' + `${props.classprops}`" :to="`/plugins/crypto/${props.title}`">{{
    props.title
  }}</router-link>
</template>
<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  classprops: {
    type: String,
    default: "",
  },
});
</script>
