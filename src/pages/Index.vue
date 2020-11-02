<template>
  <q-page padding>
    <q-img
      src="~assets/profile_pic.jpg"
      spinner-color="white"
      :ratio="1"
      style="height: 20vh; width: 20vh;"
    />
    <p class="text-bold">Wael Wahbeh</p>
    <p class="text-justify q-px-xs text-weight-medium">
      I am a diverse/eclecic professional in the IT world, with over 22 years of
      renowned success.
    </p>
    <p class="text-justify q-px-xs text-weight-medium">
      When I lead and a mentored a company of professionals, We did set the bar
      to the highest level in the market. The secret behind our success extends
      beyond my deep understanding of the products requirements, but rather my
      interpersonal skills with my team, my problem solving skills and my
      infinite ability to acquire knowledge.
    </p>
    <p class="text-justify q-px-xs text-weight-medium">
      For a over a decade, I have assumed numerous executive positions,
      futhermore, I have afinity for IoT and I am avid tracker of technological
      advancements. I have natural love for research and development and I have
      successfully provided solutions and products such as CRMs, ERPs, Inventory
      Managers and Accounting Managers –some of which are being used today - for
      numerous prominent clients such Nike, PGA, NBA and other well-established
      businesses.
    </p>
    <p class="text-justify q-px-xs text-weight-medium">
      I am a multilingual English, Arabic and Hebrew speaker, which are my
      native languages, however, I have learned to speak basic Russian as well.
    </p>
    <p class="text-justify q-px-xs text-weight-medium">
      Whenever possible, I am semi-professional aerial/sports photographer and
      video producer.
    </p>
    <q-splitter horizontal :value="spit" class="q-my-md" />
    <q-btn
      align="left"
      glossy
      stretch
      color="primary"
      icon="timeline"
      to="/timeline"
      text-color="white"
      label="My Programming timeline"
      :class="{ active: $route.name === 'timeline' }"
    />
    <q-splitter horizontal :value="spit" class="q-my-md" />
    <q-btn
      align="left"
      glossy
      stretch
      color="orange"
      icon="assignment"
      to="/resume"
      text-color="white"
      label="My curriculum vitae"
      :class="{ active: $route.name === 'resume' }"
    />

  </q-page>
</template>
<script>
import meta from 'src/utils/meta'
export default {
  name: 'PageIndex',
  data () {
    return {
      src: 'img/profile_pic.jpg',
      spit: 90,
      metaTags: {
        title: 'Home Page',
        description: 'My Welcome page. A little about my work experiences and about my look at work ethics.'
      }
    }
  },
  meta
}
</script>
