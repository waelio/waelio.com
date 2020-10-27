<template>
  <q-page padding>
    <q-img
      src="~assets/profile_pic.jpg"
      spinner-color="white"
      style="height: 140px; max-width: 150px"
    />
    <p class="text-bold">Wael Wahbeh</p>
    <p class="text-justify q-px-xs text-weight-medium">
      I am a diverse/eclecic professional in the IT world, with over 22 years of
      renowned success.
    </p>
    <p class="text-justify q-px-xs text-weight-medium">
      When I leader and a mentor to a company of professionals, We set the bar
      to the highest level in the market. The success was not due to my
      understanding of the product, but by my interpersonal skills, problem
      solving skills and my infinite capability to acquire knowledge.
    </p>
    <p class="text-justify q-px-xs text-weight-medium">
      For a decade, I have assumed numerous executive positions. I am avid about
      technological advancements and I love R&D. I have provided solutions such
      as CRM, ERP, Inventory Manager and Accounting Managers –some of which are
      being used today - for numerous prominent clients such Nike, PGA, NBA and
      other well-established businesses.
    </p>
    <p class="text-justify q-px-xs text-weight-medium">
      I am multilingual English, Arabic and Hebrew speaker, which are my native
      languages, however, I can speak basic Russian as well
    </p>
    <p class="text-justify q-px-xs text-weight-medium">
      Whenever possible, I am semi-professional aerial/sports photographer and
      video producer.
    </p>
    <router-link to="timeline" class="text-bold">My Programming timeline</router-link>
  </q-page>
</template>
<script>
export default {
  name: 'PageIndex',
  data () {
    return {
      src: '~assets/profile_pic.jpg'
    }
  }
}
</script>
