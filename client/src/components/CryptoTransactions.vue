<template>
  <div
    class="flex w-full justify-center items-center 2xl:px-20 gradient-bg-transactions"
  >
    <div class="flex flex-col md:p-12 py-12 px-4">
      <h3 class="text-white text-3xl text-center my-2">
        {{
          storeTransactions._currentAccount
            ? "Latest Transactions"
            : "Connect your account to see your transactions"
        }}
      </h3>
      <div class="flex flex-wrap justify-center items-center mt-10">
        <TransactionCard
          v-for="(trnx, i) in mixedData"
          :key="i"
          :addressFrom="trnx.addressFrom"
          :addressTo="trnx.addressTo"
          :amount="trnx.amount"
          :message="trnx.message"
          :timestamp="trnx.timestamp"
          :url="trnx.url"
          :keyword="trnx.keyword"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useTransactions } from "src/store/transactions.pinia";
import dummyData from "src/statics/dummyData.js";

const storeTransactions = useTransactions();
const mixedData = reactive(
  [...dummyData, ...storeTransactions.transactions].reverse()
);
</script>
