<template>
<q-page padding>
  <q-img src='~assets/profile_pic.jpg' spinner-color="white" style="height: 140px; max-width: 150px" />
  <p>Wael Wahbeh</p>
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
