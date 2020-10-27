<template>
  <div class="row justify-around align-center q-px-0 q-mx-auto pt-0 q-pb-xs">
    <div class="col-xs-6 col-sm-6 col-md-6 col-lg-4 col-xl-4">
      <h4 class="q-my-sm width-100 border-white">Projects</h4>
      <div class="col">
        <q-btn
          align="center"
          flat
          size="md"
          stretch
          to="/projects/picmymenu"
          text-color="white"
          label="Picmymenu"
          :class="{'active':$route.params.projectName ==='picmymenu'}"
        />
      </div>
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-4 col-xl-4">
        <q-btn
          align="center"
          flat
          size="md"
          stretch
          to="/projects/sudoku"
          text-color="white"
          label="Sudoku"
          :class="{'active':$route.params.projectName ==='sudoku'}"
        />
      </div>
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-4 col-xl-4">
        <q-btn
          align="center"
          flat
          size="md"
          stretch
          to="/projects/q2p"
          text-color="white"
          label="Q2P"
          :class="{'active':$route.params.projectName ==='q2b'}"
        />
      </div>
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-4 col-xl-4">
        <q-btn
          align="center"
          flat
          size="md"
          stretch
          to="/projects/picmymenu"
          text-color="white"
          label="Picmymenu"
          :class="{'active':$route.params.projectName ==='picmymenu'}"
        />
      </div>
    </div>
    <div class="col-xs-6 col-sm-6 col-md-6 col-lg-4 col-xl-4">
      <h4 class="q-my-sm text-center width-100 border-white">General</h4>
      <div class="col">
        <q-btn
          align="center"
          flat
          size="md"
          stretch
          to="/privacy"
          text-color="white"
          label="Privacy"
          :class="{'active': $route.name === 'privacy'}"
        />
      </div>
      <div class="col">
        <q-btn
          align="center"
          flat
          size="md"
          stretch
          to="/terms"
          text-color="white"
          label="Terms"
          :class="{'active': $route.name === 'terms'}"
        />
      </div>
      <div class="col">
        <q-btn
          align="center"
          flat
          size="md"
          stretch
          to="/contact"
          text-color="white"
          label="Write me"
          :class="{'active': $route.name === 'contact'}"
        />
      </div>
      <div class="col">
        <q-select
          align="center"
          class="text-center items-center pt-0 capitalize text-h5"
          borderless
          hide-dropdown-icon
          item-aligned
          label-color="white"
          :label="$i18n.locale.name || 'English'"
          hide-selected
          v-model="$i18n.locale"
          :options-value="item => item.value"
          :option-label="item => item.name"
          standout
          :options="[
            { value: 'en-us', name: 'English' },
            { value: 'ar-ps', name: 'Arabic' },
            { value: 'he-il', name: 'Hebrew' }
          ]"
        >
        </q-select>
      </div>
    </div>
    <div class="col-xs-6 col-sm-6 col-md-6 col-lg-4 col-xl-4">
      <h4 class="q-my-sm text-center width-100 border-white">About Me</h4>
      <div class="col">
        <q-btn
          align="center"
          flat
          size="md"
          stretch
          to="/timeline"
          text-color="white"
          label="Portfolio"
          :class="{'active': $route.name === 'timeline'}"
        />
      </div>
    </div>
    <div class="col-12">
      <q-splitter v-model="splitterMode" horizontal />
    </div>
  </div>
</template>

<script>
/* eslint-disable quotes */
export default {
  name: "FooterNavs",
  data () {
    return {
      splitterMode: 50
    }
  }
}
</script>

<style lang="scss" scoped>
.pt-0 {
  padding-top: 0;
}
.active {
  background-color: $secondary
}
</style>
