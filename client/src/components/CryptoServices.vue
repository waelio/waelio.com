
<script lang="ts" setup>
</script>
<template>
  <div class="flex w-full justify-center items-center gradient-bg-services">
    <div class="flex mf:flex-row flex-col items-center justify-between md:p-20 py-12 px-4">
      <div class="flex-1 flex flex-col justify-start items-start">
        <h1 class="text-white text-3xl sm:text-5xl py-2 text-gradient ">
          Services that we
          <br />
          continue to improve
        </h1>
        <p class="text-left my-2 text-white font-light md:w-9/12 w-11/12 text-base">
          The best choice for buying and selling your crypto assets, with the
          various super friendly services we offer
        </p>
      </div>

      <div class="flex-1 flex flex-col justify-start items-center">
        <ServiceCard
          color="bg-[#2952E3]"
          title="Security gurantee"
          icon="BsShieldFillCheck" fontSize={21} class="text-white" />}
          subtitle="Security is guranteed. We always maintain privacy and maintain the quality of our products"
        />
        <ServiceCard
          color="bg-[#8945F8]"
          title="Best exchange rates"
          icon="BiSearchAlt"
          subtitle="Security is guranteed. We always maintain privacy and maintain the quality of our products"
        />
        <ServiceCard
          color="bg-[#F84550]"
          title="Fastest transactions"
          icon="<RiHeart2Fill"
          subtitle="Security is guranteed. We always maintain privacy and maintain the quality of our products"
        />
      </div>
    </div>
  </div>

</template>