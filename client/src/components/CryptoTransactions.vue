<template>
  <div
    className="flex w-full justify-center items-center 2xl:px-20 gradient-bg-transactions"
  >
    <div className="flex flex-col md:p-12 py-12 px-4">
      <h3 className="text-white text-3xl text-center my-2">
        {{
          storeTransactions._currentAccount
            ? "Latest Transactions"
            : "Connect your account to see your transactions"
        }}
      </h3>
      <div className="flex flex-wrap justify-center items-center mt-10">
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
// type Dummy = {
//   id: string;
//   url: string;
//   message: string;
//   timestamp: string;
//   addressFrom: string;
//   amount: number;
//   addressTo: string;
//   keyword: string;
// };

const storeTransactions = useTransactions();
const mixedData = reactive(
  [...dummyData, ...storeTransactions.transactions].reverse()
);
</script>
