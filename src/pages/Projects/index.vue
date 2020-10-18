<template>
  <q-page class="q-px-xs q-py-sm">
    <component :is="ProjectPage"></component>
  </q-page>
</template>
<script>
export default {
  name: 'ProjectsPage',
  computed: {
    Project () {
      return this.$route.params.projectName.toLowerCase()
    },
    ProjectPage () {
      return () => Promise.resolve(require(`./${this.Project}/Index.vue`))
    }
  }
}
</script>
<style></style>
