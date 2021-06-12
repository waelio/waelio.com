<template>
  <main class="px-4 py-2 text-center text-gray-700 dark:text-gray-200">
    <Header />
    <router-view class="overflow-y-scroll mx-auto" />
    <Footer />
    <div class="mx-auto text-center opacity-25 text-sm">
      <router-link class="icon-btn mx-2" to="/" title="Waelio.com">
        Waelio.com
      </router-link>
    </div>
  </main>
</template>
