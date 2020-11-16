import axios from 'axios'
import VueAxios from 'vue-axios'
const axiosInstance = axios.create({
  headers: {
    'Access-Control-Allow-Origins': [window && window.location.origin],
    'Content-Type': 'application/json',
    'Allow-Credentials': true
  }
})
export default async ({ app, router, Vue }) => {
  Vue.use(VueAxios, axios)
  Vue.prototype.$axios = axios
  Vue.prototype.$HTTP = axiosInstance
}
