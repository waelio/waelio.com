<template>
  <q-item
    v-if="Task"
    clickable
    v-ripple
    :style="{ borderColor  : Task.completed ? 'green' : 'orange' }"
  >
    <q-item-section avatar top>
      <q-avatar :icon="Task.icon ? Task.icon : 'report'" class="bg-pink-2" text-color="white" />
    </q-item-section>
    <q-item-section>
      <q-item-label lines="1" :class="{ 'text-strikethrough': Task.completed }">{{ Task.title }}</q-item-label>
      <q-item-label v-show="Task.description" caption>{{ Task.description }}</q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-checkbox :value="Task.completed" class="n-pointer-events" />
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'TaskComponent',
  props: ['Task'],
  methods: {
    say (value) {
      this.$q.notify(value)
    }
  }
}
</script>

<style></style>
