import Amplify, * as AmplifyModules from 'aws-amplify'
import { AmplifyPlugin, AmplifyEventBus } from 'aws-amplify-vue'
import AwsExports from '../aws-exports'
Amplify.configure(AwsExports)

export default async ({ router, Vue }) => {
  Vue.use(AmplifyPlugin, AmplifyModules)
  Vue.prototype.$Amplify = Amplify
  Vue.prototype.$AmplifyEventBus = AmplifyEventBus
  Vue.prototype.$Auth = AmplifyModules.Auth

  router.beforeResolve((to, from, next) => {
    try {
      if (to.matched.some(record => record.meta.requiresAuth)) {
      // eslint-disable-next-line no-unused-vars
        let user
        Vue.prototype.$Amplify.Auth.currentAuthenticatedUser()
          .then(data => {
            if (data && data.signInUserSession) {
              user = data
            }
            next()
          })
          .catch(exp => {
            Vue.prototype.$notification.error(exp)
            if (from.name !== 'auth') {
              next({
                path: '/auth'
              })
            }
          })
      }
      next()
    } catch (error) {
      Vue.prototype.$notification.error(error)
    }
  })
}
