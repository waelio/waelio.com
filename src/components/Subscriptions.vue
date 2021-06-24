<template>
  <div
    class="mx-auto links-list flex"
  >
    <button style="background-color:gray" class="block mx-auto" @click="onSubscribe">
      <carbon:notification-filled /><span class="px-1 align-top">Subscribe</span>
    </button>
    <button style="background-color:gray" class="block mx-auto" @click="onUnsubscribe">
      <carbon:notification-off-filled /><span class="px-1 align-top">Unsubscribe</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useSubscriptions } from 'src/utils/useSubscriptions'
const { isSubscribed, Subscribe, unSubscribe } = useSubscriptions()
// eslint-disable-next-line no-console
console.log(isSubscribed())
const onSubscribe = async(): Promise<boolean> => {
  try {
    const subscription = await Subscribe()
    // eslint-disable-next-line no-console
    console.log('🚀 ~ file: index.md ~ line 42 ~ onSubscribe ~ subscription', !!subscription)
    return !!subscription
  }
  catch (e) {
    console.error(e)
    return false
  }
}
const onUnsubscribe = async(): Promise<boolean> => {
  try {
    const subscription = await unSubscribe()
    // eslint-disable-next-line no-console
    console.log('🚀 ~ file: index.md ~ line 49 ~ onUnsubscribe ~ subscription', !!subscription)
    return true
  }
  catch (e) {
    console.error(e)
    return false
  }
}
</script>

<style>

</style>
