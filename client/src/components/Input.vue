<template>
<input
    :placeholder="props.placeholder"
    :type="props.type"
    step="0.0001"
    :value="props.value"
    :onChange="props.handleChange(props.name)"
    className="my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white border-none text-sm white-glassmorphism"
  />
</template>
<script lang="ts" setup>
const props = defineProps({
  placeholder: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  value: {
    type: String,
    default: '',
  },
  handleChange: {
    type: Function,
    default: () => {},
  },
  name: {
    type: String,
    default: '',
  },
});
</script>