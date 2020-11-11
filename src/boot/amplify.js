import Amplify, * as AmplifyModules from 'aws-amplify'
import { API, AmplifyPlugin, AmplifyEventBus } from 'aws-amplify-vue'
import AwsExports from '../aws-exports'
Amplify.configure(AwsExports)

export default async ({ router, Vue, store }) => {
  Vue.use(AmplifyPlugin, AmplifyModules)
  Vue.prototype.$Amplify = Amplify
  Vue.prototype.$AmplifyEventBus = AmplifyEventBus
  Vue.prototype.$Auth = AmplifyModules.Auth
  Vue.prototype.$Api = API

  // router.beforeResolve((to, from, next) => {
  //   store.dispatch('LocalUser/verifyState')
  //   try {
  //     let user
  //     if (to.matched.some(record => record.meta.requiresAuth)) {
  //       Vue.prototype.$Amplify.Auth.currentAuthenticatedUser()
  //         .then(data => {
  //           if (data && data.signInUserSession) {
  //             user = data
  //           }
  //           next({ to: to.fullPath, params: { test: user }, replace: true })
  //         })
  //         .catch(exp => {
  //           user = null
  //           Vue.prototype.$notification.error(exp)
  //           if (from.name !== 'auth') {
  //             next({
  //               path: '/auth/process'
  //             })
  //           }
  //         })
  //     }
  //     next({ to: to.fullPath, params: { test: user }, replace: true })
  //   } catch (error) {
  //     Vue.prototype.$notification.error(error)
  //   }
  // })
}
// window.location = 'https://auth.waelio.com/login?client_id=2erlvso7q5ufgss3cl2c0acerv&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://waelio.com/'
