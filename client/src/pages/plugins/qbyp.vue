<template>
  <q-page>
    <h1>Quran By Pixkels</h1>
    <div id="inspire" v-if="useQuranStore.GetS">
      {{ useQuranStore.GetS ? useQuranStore.GetS["name"] : useQuranStore.GetS }}
    </div>
    <q-select
      dense
      v-if="items"
      v-model="SuraIndex"
      :options="items"
      option-value="index"
      option-name="name"
      map-options
      emit-value
      :display-value="`Sura: ${SuraIndex}`"
      @update:model-value="GetSelected(SuraIndex)"
    />
    <ol v-if="useQuranStore.GetS && useQuranStore.GetS['aya']">
      <li v-for="(item, index) in useQuranStore.GetS['aya']" :key="index">
        <span class="q-mx-xs text-left">{{ item.index }}</span>
        <span>{{ item.name }}</span>
        <span>{{ item.ayah }}</span>
        <span>{{ item.text }}</span>
      </li>
    </ol>
  </q-page>
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import type { Ref } from "vue";
import { useQ2B } from "src/store/q2p.pinia";

interface AYA {
  index: number;
  name: string;
  ayah: string;
  text: string;
}
const useQuranStore = useQ2B();
const items = ref([]);
const SuraIndex = ref(1);
const sura: Ref<AYA[]> = ref([]);
const endPoint: string = "https://qbypixels.herokuapp.com/api/v1.0/quran";
const config = {
  headers: { "Access-Control-Allow-Origin": "*" },
};
onMounted(() => {
  getQutran();
  console.log("Quran By Pixkels");
});
const getQutran = async () => {
  const response = await fetch(endPoint, config);
  if (response.ok) {
    const data = await response.json();
    items.value = data;
    useQuranStore.setQuran(data);
  }
};
const GetSelected = async (SuraIndex: number) => {
  const response = await fetch(`${endPoint}/sura/${SuraIndex}`, config);
  if (response.ok) {
    const data = await response.json();
    sura.value = data;
    useQuranStore.setSura(data);
  }
};
</script>
