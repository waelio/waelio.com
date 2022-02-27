<script lang="ts">
import { ref,  defineEmits } from 'vue'
import type { Difficulty } from '~/types'
import type { Ref } from 'vue'
setup(){
  const emit = defineEmits(['difficultyChanged'])
  const props = defineProps({
    difficulty: {
      type: Object,
    },
    difficultyChanged: {
      type: Function,
    },
  })
  const selectedItem: Ref<Difficulty> = ref({ name: 'Easy', value: 1 })
  return {
    emit,
    props,
    selectedItem,
  }
}
</script>
<template>
  <q-select
    v-model="props.selectedItem"
    lazy-rules
    dense
    autofocus
    emit-value
    label="Select Difficulty"
    :options="difficulty"
    option-label="name"
    option-value="value"
    @change="emit('difficultyChanged', selectedItem.value)"
  />
</template>
