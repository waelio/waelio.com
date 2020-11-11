<template>
  <q-splitter
    draggable="false"
    emit-immediately
    unit="px"
    @input="setHeight"
    :value="splitterMode"
    separator-class="absolute-top"
    class="full-width cursor-pointer"
    style="max-height:174px"
    horizontal
  >
    <template v-slot:before>
      <div class="row justify-around align-center scroll fit hide-scrollbar" id="footer-navs">
        <div class="col-xs-3 col-sm-3 col-md-4 col-lg-3 col-xl-3">
          <q-list>
            <q-item-label
              ><h4 class="text-h5 q-my-sm text-center border-white">
                Projects
              </h4></q-item-label
            >
            <q-item dense>
              <q-item-section>
                <q-btn
                  class="q-pl-0"
                  align="center"
                  flat
                  size="md"
                  stretch
                  to="/projects/picmymenu"
                  text-color="white"
                  label="Picmymenu"
                  :class="{ active: $route.params.projectName === 'picmymenu' }"
                />
              </q-item-section>
            </q-item>
            <q-item dense>
              <q-item-section>
                <q-btn
                  class="q-pl-0"
                  align="center"
                  flat
                  size="md"
                  stretch
                  to="/projects/sudoku"
                  text-color="white"
                  label="Sudoku"
                  :class="{ active: $route.params.projectName === 'sudoku' }"
                />
              </q-item-section>
            </q-item>
            <q-item dense>
              <q-item-section>
                <q-btn
                  class="q-pl-0"
                  align="center"
                  flat
                  size="md"
                  stretch
                  to="/projects/q2p"
                  text-color="white"
                  label="Q2P"
                  :class="{ active: $route.params.projectName === 'q2b' }"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div class="col-xs-3 col-sm-3 col-md-4 col-lg-3 col-xl-3">
          <q-list>
            <q-item-label
              ><h4 class="text-h5 q-my-sm text-center border-white">
                General
              </h4></q-item-label
            >
            <q-item dense>
              <q-item-section>
                <q-btn
                  class="q-pl-0"
                  align="center"
                  flat
                  size="md"
                  stretch
                  to="/privacy"
                  text-color="white"
                  label="Privacy"
                  :class="{ active: $route.name === 'privacy' }"
                />
              </q-item-section>
            </q-item>
            <q-item dense>
              <q-item-section>
                <q-btn
                  class="q-pl-0"
                  align="center"
                  flat
                  size="md"
                  stretch
                  to="/terms"
                  text-color="white"
                  label="Terms"
                  :class="{ active: $route.name === 'terms' }"
                />
              </q-item-section>
            </q-item>
            <q-item dense>
              <q-item-section>
                <q-btn
                  class="q-pl-0"
                  align="center"
                  flat
                  size="md"
                  stretch
                  to="/contact"
                  text-color="white"
                  label="Contact"
                  :class="{ active: $route.name === 'contact' }"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div class="col-xs-3 col-sm-3 col-md-4 col-lg-3 col-xl-3">
          <q-list>
            <q-item-label
              ><h4 class="text-h5 q-my-sm text-center border-white">
                About Me
              </h4></q-item-label
            >
            <q-item dense>
              <q-item-section>
                <q-btn
                  class="q-pl-0"
                  align="center"
                  flat
                  size="md"
                  stretch
                  to="/timeline"
                  text-color="white"
                  label="Portfolio"
                  :class="{ active: $route.name === 'timeline' }"
                />
              </q-item-section>
            </q-item>
            <q-item dense>
              <q-item-section>
                <q-btn
                  class="q-pl-0"
                  align="center"
                  flat
                  size="md"
                  stretch
                  to="/wael"
                  text-color="white"
                  label="Wael"
                  :class="{ active: $route.name === 'wael' }"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </template>
    <template v-slot:separator>
      <q-avatar color="info" text-color="white" size="40px"
      @dblclick="handleDblClick" v-touch-hold.mouse="" icon="drag_indicator" />
    </template>
    <template v-slot:after>
      <p class="bg-white text-primary text-center text-thin text-small">
        &copy;Waelio.com 2020 {{ $t("All rights reserved") }}
      </p>
    </template>
  </q-splitter>
</template>

<script>
/* eslint-disable quotes */
/* eslint-disable vue/valid-v-bind */
export default {
  name: "FooterNavs",
  data () {
    return {
      splitterMode: 174,
      info: null
    }
  },
  methods: {
    setHeight (payload) {
      this.splitterMode = payload
    },
    handleHold ({ evt, ...info }) {
      this.info = info
      this.splitterMode = info.position.top
    },
    handleDblClick () {
      this.splitterMode = this.splitterMode > 0 ? 0 : 174
    }
  }
}
</script>

<style lang="scss" scoped>
.pt-0 {
  padding-top: 0;
}
.active {
  background-color: $secondary;
}
#footer-navs #special-select .q-field__label {
  text-align: center !important;
}
</style>
