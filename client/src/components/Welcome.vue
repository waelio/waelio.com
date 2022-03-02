<template>
  <div class="max-wh flex w-full h-full justify-center items-center text-white">
    <div class="flex w-full justify-center items-center">
      <div
        class="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4"
      >
        <div class="flex flex-1 justify-start items-start flex-col mf:mr-10">
          <h1 class="text-3xl sm:text-5xl text-white text-gradient py-1">
            Send Crypto <br />
            across the world
          </h1>
          <p class="text-left mt-5 text-white font-light md:w-9/12 w-11/12 text-base">
            Explore the crypto world. Buy and sell cryptocurrencies easily on Waelio.
          </p>

          <q-btn
            v-if="!currentAccount"
            type="button"
            @click="connectWallet"
            class="text-white mr-2 flex flex-row justify-center items-center my-5 bg-[#2952e3] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]"
            label="Connect Wallet"
            icon="play_circle_filled"
          />

          <div class="grid sm:grid-cols-3 grid-cols-2 w-full mt-10">
            <div :class="`rounded-tl-2xl ${companyCommonStyles}`">Reliability</div>
            <div class="`${companyCommonStyles}`">Security</div>
            <div :class="`sm:rounded-tr-2xl ${companyCommonStyles}`">Ethereum</div>
            <div :class="`sm:rounded-bl-2xl ${companyCommonStyles}`">Web 3.0</div>
            <div :class="`${companyCommonStyles}`">Low Fees</div>
            <div :class="`rounded-br-2xl ${companyCommonStyles}`">Blockchain</div>
          </div>
        </div>

        <div
          v-if="currentAccount"
          class="flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10"
        >
          <div
            class="p-3 flex justify-end items-start flex-col rounded-xl h-40 sm:w-72 w-full my-5 eth-card .white-glassmorphism"
          >
            <div class="flex justify-between flex-col w-full h-full">
              <div class="flex justify-between items-start">
                <div
                  class="w-10 h-10 rounded-full border-2 border-white flex justify-center items-center"
                >
                  <Icon icon="cib:ethereum" />
                </div>
                <Icon icon="clarity:shield-check-solid" fontSize="17" color="#fff" />
              </div>
              <div>
                <p class="text-white font-light text-sm">
                  {{ shortenAddress(currentAccount) }}
                </p>
                <p class="text-white font-semibold text-lg mt-1">Ethereum</p>
              </div>
            </div>
          </div>
          <div
            class="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism"
          >
            <Input
              placeholder="Address To"
              name="addressTo"
              type="text"
              v-model="addressTo"
              :handleChange="handleChange"
            />
            <Input
              placeholder="Amount (ETH)"
              name="amount"
              type="number"
              v-model="amount"
              :handleChange="handleChange"
            />
            <Input
              placeholder="Keyword (Gif)"
              name="keyword"
              type="text"
              v-model="keyword"
              :handleChange="handleChange"
            />
            <Input
              placeholder="Enter Message"
              name="message"
              type="text"
              v-model="message"
              :handleChange="handleChange"
            />
            <div class="h-[1px] w-full bg-gray-400 my-2" />
            <Loader v-if="isLoading" />
            <button
              v-else
              type="button"
              @click.prevent="handleChange"
              class="text-white w-full mt-2 border-[1px] p-2 border-[#3d4f7c] hover:bg-[#3d4f7c] rounded-full cursor-pointer"
            >
              Send now
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { toRefs } from "vue";
import { shortenAddress } from "~/utils/cryptoHelpers";
import { useForm } from "~/store/form.pinia";
import { useTransactions } from "~/store/transactions.pinia";
import { connectWallet, sendTransaction } from "~/utils/TransactionContext";
import { Icon } from "@iconify/vue";
const formData = useForm();
const _Transactions = useTransactions();
const companyCommonStyles =
  "min-h-[70px] sm:px-0 px-2 sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray-400 text-sm font-light text-white";

// Transactions Store
const { currentAccount } = toRefs(_Transactions);
const { addressTo, amount, keyword, message, isLoading } = formData;
const handleChange = () => {
  if (!addressTo || !amount || !keyword || !message) return;
  sendTransaction();
};
</script>
<style lang="scss">
.max-wh {
  max-width: 100vw;
  max-height: 100vh;
}
</style>

