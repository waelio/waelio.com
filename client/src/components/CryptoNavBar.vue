<template>
  <nav class="w-full flex md:justify-center justify-between items-center p-4">
    <div class="md:flex-[0.5] flex-initial justify-center items-center">
      <img
        :src="logo"
        alt="logo"
        class="w-32 cursor-pointer"
        @click="() => router.push('/')"
      />
    </div>
    <ul
      class="text-white md:flex hidden list-none flex-row justify-between items-center flex-initial"
    >
      <NavBarItem
        v-for="(item, index) in ['Market', 'Exchange', 'Tutorials', 'Wallets']"
        :key="item + index"
        :title="item"
      />

      <li
        class="bg-[#2952e3] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#2546bd]"
      >
        Login
      </li>
    </ul>
    <div class="flex relative">
      <ul class="flex text-white">
        <NavBarItem
          v-for="(item, index) in ['Market', 'Exchange', 'Tutorials', 'Wallets']"
          :key="item + index"
          :title="item"
          classprops="my-2 text-lg"
          :to="`/${item.toLowerCase()}`"
        />
      </ul>
    </div>
  </nav>
</template>
<script lang="ts" setup>
import logo from "/waelio_logo.png";
const router = useRouter();
</script>
