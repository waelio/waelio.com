import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import { Notify } from 'quasar'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default async function ({ store, ssrContext, Vue }) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })
  Router.beforeResolve(async (to, from, next) => {
    await store.dispatch('LocalUser/verifyState').then(payload => {
      const User = store.state.LocalUser.User
      console.log('2- beforeResolve: User', User)
      if (to.matched.some(record => record.meta.requiresAuth)) {
        if (User) {
          next()
        } else {
          Notify.show({ type: 'error', message: 'User not LoggedIn' })
          if (from.fullPath !== '/auth/process') {
            next({ name: 'process' })
          }
        }
      }
      next()
    })
  })

  return Router
}
