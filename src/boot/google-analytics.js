/* eslint-disable no-undef */
import ga from 'src/utils/analytics.js'

export default ({ router }) => {
  router.afterEach((to, from) => {
    ga.logPage(to.path, to.name, sessionId)
  })
}
