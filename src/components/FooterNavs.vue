<template>
  <div class="row justify-around align-center" id="footer-navs">
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
              align="center"
              flat
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
            <q-select
              class="no-padding"
              dense
              id="special-select"
              borderless
              hide-dropdown-icon
              item-aligned
              label-color="white"
              :label="$i18n.locale.name || 'Englisg'"
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
            <template v-slot:label>
              <div class="text-center">
                {{$i18n.locale.name|| 'English'}}
              </div>
            </template>
            </q-select>
          </q-item-section>
        </q-item>
      </q-list>
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
  background-color: $secondary;
}
#footer-navs #special-select .q-field__label {
  text-align: center!important;
}
</style>
