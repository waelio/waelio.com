<template>
  <div class="flex w-full justify-center items-center 2xl:px-20 gradient-bg-transactions">
    <div class="flex flex-col md:p-12 py-12 px-4">
      <h3 class="text-white text-3xl text-center my-2">
        {{
          currentAccount
            ? "Latest Transactions"
            : "Connect your account to see the latest transactions"
        }}
      </h3>
      <div class="flex flex-wrap justify-center items-center mt-10">
        <TransactionsCard
          v-for="(transaction, i) in newTransactions"
          :key="{ i }"
          {...transaction}
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useTransactions } from "src/store/transactions.pinia";
// import { ref } from "vue";
import dummyData from "src/statics/dummyData";
const _transactions = useTransactions();
const transactions = _transactions.transactions;
const currentAccount = _transactions.currentAccount;
const newTransactions = [...dummyData, ...transactions].reverse();
</script>
<style lang="scss" scoped>
.hidden {
  display: none;
}
</style>
