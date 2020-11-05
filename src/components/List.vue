<template>
  <q-item
    v-if="List"
    clickable
    v-ripple
  >
    <q-item-section>
      <q-item-label lines="1">{{ List.title }}</q-item-label>
      <q-item-label lines="2">{{ List.owner }}</q-item-label>
    </q-item-section>
    <q-item-section>
      <q-item-label lines="1">{{ List.tasks.nextToken || [] }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'List',
  props: ['List']
}
</script>

<style></style>
