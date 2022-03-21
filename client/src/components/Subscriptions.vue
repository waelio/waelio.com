<script setup lang="ts">
import { useSubscriptions } from "src/utils/useSubscriptions";
import { onMounted, ref } from "vue";
const { collectSubscriptions, isSubscribed, Subscribe, unSubscribe } = useSubscriptions();
collectSubscriptions();
const onSubscribe = async (): Promise<boolean> => {
  try {
    const subscription = Subscribe();
    // eslint-disable-next-line no-console
    console.log(
      "🚀 ~ file: index.md ~ line 42 ~ onSubscribe ~ subscription",
      !!subscription
    );
    return !!subscription;
  } catch (e) {
    console.error(e);
    return false;
  }
};
const existingUser = ref(false);
onMounted(() => {
  existingUser.value = !!isSubscribed;
});
const onUnsubscribe = async (): Promise<boolean> => {
  try {
    const subscription = await unSubscribe();
    // eslint-disable-next-line no-console
    console.log(
      "🚀 ~ file: index.md ~ line 49 ~ onUnsubscribe ~ subscription",
      !!subscription
    );
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
// eslint-disable-next-line no-console
</script>
<template>
  <div class="mx-auto links-list flex">
    <button
      v-if="!isSubscribed"
      style="background-color: gray"
      class="block mx-auto"
      @click="onSubscribe()"
    >
      <carbon:notification-filled /><span class="px-1 align-top">Subscribe</span>
    </button>
    <button
      v-else
      style="background-color: gray"
      class="block mx-auto"
      @click="onUnsubscribe()"
    >
      <carbon:notification-off-filled /><span class="px-1 align-top">Unsubscribe</span>
    </button>
  </div>
</template>
