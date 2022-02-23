<template>
  <div class="currency-converter">
    <div class="title">
      <img src="/exchange.png" />
      <h1 class="text-h3">Currency Converter</h1>
    </div>
    <div class="exchange-rate">
      <p>
        {{ fromCurrencyAmount }}{{ fromCurrencyCode }} Equals
        {{ toCurrencyAmount * exchangeRate }}{{ toCurrencyCode }}
      </p>
    </div>
    <div class="from-currency">
      <q-input dense type="number" step="0.1" v-model="fromCurrencyAmount" />
      <q-select
        v-model="f_select"
        label-slot
        :options="fromSelectOptions"
        @change="onFromSelect"
      >
        <template v-slot:selected-item="scope">
          {{ scope.opt.label }} - {{ scope.opt.value }}
        </template>
      </q-select>
    </div>
    <div class="to-currency">
      <q-input dense type="number" step="0.1" v-model="toCurrencyAmount" />
      <q-select v-model="t_select" :options="toSelectOptions">
        <template v-slot:selected-item="scope">
          {{ scope.opt.label }} - {{ scope.opt.value }}
        </template>
      </q-select>
    </div>
  </div>
</template>
<script lang="ts">
// import { useI18n } from "vue-i18n";
import { ref, unref, onMounted, reactive, computed, inject, provide } from "vue";
import type { Ref } from "vue";
// import axios from "axios";
import IPData from "ipdata";
import { useStore } from "~/store/store.root";
import { useHead } from "@vueuse/head";
import {
  envy,
  cacheConfig,
  currencyLayer,
  fetchConfig,
  fetchConfigOptions,
  renderer,
} from "src/utils/converterHelper";
export default {
  setup() {
    const siteData = reactive({
      title: "Waelio | Currency Converter",
      description: "Currency converter",
      keywords: "usd, eur, bitcoin, eth",
    });
    const DATA_PRECISION = 2;
    let exchangeRate = ref(1);
    let currenciesList = ref([]);
    let ECO_MODE = ref(true);
    const f_select: Ref<{ label: string; value: any }> = ref({
      label: "ILS",
      value: "Israeli New Sheqel",
    });
    const t_select: Ref<{ label: string; value: any }> = ref({
      label: "USD",
      value: "United States Dollar",
    });
    const fromSelectOptions: Ref<{ label: string; value: any }[]> = ref([]);
    const toSelectOptions: Ref<{ label: string; value: any }[]> = ref([]);

    // HELPERS : get inputs values
    const fromCurrencyCode: Ref<string> = ref("NIS");
    const fromCurrencyAmount: Ref<number> = ref(1.0);
    const toCurrencyCode: Ref<string> = ref("USD");
    const toCurrencyAmount: Ref<number> = ref(1.0);
    const apiSecret: string = envy({ name: "IP_DATA_KEY" });
    const ipdata = new IPData(apiSecret, cacheConfig);
    const store = useStore();
    const newExchangeRate = () => {
      async () => await getExchangeRate(fromCurrencyCode, toCurrencyCode);
    };

    const getIpAddress = async function () {
      return ipdata
        .lookup()
        .then(
          (data) => {
            store.setUserInfo(data);
            console.log(data);
            return data.ip;
          },
          (error) => {
            console.log(error);
          }
        )
        .catch((err) => {
          console.log(err);
          return false;
        });
    };
    // GET ALL CURRENCIES CODES AND NAMES
    const getCurrenciesList = async function () {
      const options: fetchConfigOptions = {
        url: currencyLayer.list(),
        method: "get",
        cors: false,
        content: "application/json",
      };
      const config = fetchConfig(options);
      const response = await fetch(config);
      const data = await response.data
      const currencies = data.currencies;
      store.setUserCurrencies(currencies);
      return currencies;
    };
    // GET USER'S LOCAL CURRENCY
    const getUserCurrency = async () => {
      const ip = await getIpAddress();
      if (ip) {
        return {
          name: store.localCurrency.name,
          code: store.localCurrency.code,
        };
      }
    };
    // get exchange rate
    const getExchangeRate = async function (fromCurrencyCode, toCurrencyCode) {
      const amount = 1;

      const response = await fetch(
        currencyLayer.convert(fromCurrencyCode, toCurrencyCode, amount)
      );
      const data = await response.json();
      const rate = data.result;
      return rate;
    };

    const convert = async function (direction) {
      if (direction === "from->to") {
        fromCurrencyAmount.value = (unref(fromCurrencyAmount) * exchangeRate).toString();
        // .slice(0, DATA_PRECISION);
        // .toFixed(DATA_PRECISION)
      } else if (direction === "to->from") {
        toCurrencyAmmount.value = (toCurrencyAmount / exchangeRate)
          .toFixed(DATA_PRECISION)
          .toString();
      }
    };
    // INITIALIZE APP
    const init = async () => {
      await getUserCurrency();
      currenciesList = await getCurrenciesList();
      fromSelectOptions.value = Object.keys(currenciesList).map((key) => {
        return {
          value: currenciesList[key],
          label: key,
        };
      });
      toSelectOptions.value = Object.keys(currenciesList).map((key) => {
        return {
          value: currenciesList[key],
          label: key,
        };
      });
      exchangeRate.value = await getExchangeRate(
        fromCurrencyCode.value,
        toCurrencyCode.value
      );
      convert("from->to");
    };
    useHead({
      // Can be static or computed
      title: computed(() => siteData.title),
      meta: [
        {
          name: "description",
          content: computed(() => siteData.description),
          keywords: computed(() => siteData.keywords),
        },
      ],
    });
    onMounted(async () => {
      provide("document", document);
      await init();
    });
    return {
      fromCurrencyCode,
      fromCurrencyAmount,
      toCurrencyCode,
      toCurrencyAmount,
      f_select,
      t_select,
      exchangeRate,
      currenciesList,
      ECO_MODE,
      init,
      convert,
      getExchangeRate,
      getCurrenciesList,
      getUserCurrency,
      getIpAddress,
      fromSelectOptions,
      toSelectOptions,
      newExchangeRate,
    };
  },
};
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
}

.currency-converter {
  background-color: #fafafa;
  padding: 1rem;
  border-radius: 5px;

  max-width: 800px;

  // box-shadow: rgba(0, 0, 0, 0.5) 1px 1px 15px 1px;
}
.currency-converter .title {
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 2rem;
  font-weight: bold;
}
.currency-converter .title img {
  width: 60px;
  margin-right: 15px;
}
.exchange-rate {
  margin: 2rem 0;
}
.exchange-rate p {
  font-size: 1.2rem;
}

.from-currency,
.to-currency {
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
}
input,
select {
  width: 49%;
  height: 50px;
  font-size: 1.5rem;
}
input {
  padding-left: 5px;
}
</style>
