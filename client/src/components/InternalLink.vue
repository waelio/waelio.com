<template>
  <q-item v-ripple clickable>
    <q-item-section>
      <q-btn
        dense
        fab
        glossy
        :color="props.color"
        :class="props.classes"
        :to="props.to"
        >{{ props.text }}</q-btn
      >
    </q-item-section>
  </q-item>
</template>
<script lang="ts" setup>
const props = defineProps({
  color: {
    type: String,
    default: "primary",
  },
  to: {
    type: String,
    default: "/#",
  },
  classes: {
    type: String,
    default: "max-width:1em q-my-sm q-mx-sm",
  },
  text: {
    type: String,
    default: "Internal Link",
  },
});
</script>
