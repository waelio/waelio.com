<template>
  <q-page class="q-px-xs q-py-sm">
    <iframe
      :src="displayProjec.url"
      class="fit"
      style="min-height: 40em"
      :key="displayProjec.name"
      frameborder="0"
    ></iframe>
  </q-page>
</template>
<script>
export default {
  name: 'ProjectsPage',
  data () {
    return {
      projects: [
        {
          name: 'Picmymenu',
          slug: 'picmymenu',
          url: 'https://picmymenu.com'
        },
        {
          name: 'Sudoku17',
          slug: 'sudoku',
          url: 'https://sudoku17.netlify.app'
        },
        {
          name: 'Quran in Pixels',
          slug: 'q2p',
          url: 'https://qpic-php.herokuapp.com/index.php'
        }
      ]
    }
  },
  computed: {
    displayProjec () {
      const proj = this.$route.params.projectName.toLowerCase()
      return this.projects.find((project) => {
        if (project.slug === proj) return project
      })
    }
  }
}
</script>
<style></style>
