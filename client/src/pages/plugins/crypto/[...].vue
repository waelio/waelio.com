<route lang="yaml">
meta:
  layout: simple
</route>
<template>
  <div class="min-h-screen max-hw gradient-bg-welcome">
    <CryptoNavBar />
    <Welcome />
    <CryptoServices />
    <CryptoTransactions />
  </div>
</template>
<script lang="ts" setup>
import { useTransactions } from "src/store/transactions.pinia";
import { _decrypt } from "waelio-utils/dist/waelioUtils";
onMounted(() => {
  const { setCurrentAccount } = useTransactions();
  const currentAccount = localStorage.getItem("cec");
  if (currentAccount) {
    setCurrentAccount(_decrypt("salt", currentAccount));
  }
});
</script>
<style lang="scss" scoped>
body {
  height: var(--vh) !important;
}
.max-wh {
  height: var(--vh);
  width: var(--vw);
}
</style>
