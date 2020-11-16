import Vue from 'vue'
import axios from 'axios'
const axiosInstance = axios.create({
  headers: {
    'Access-Control-Allow-Origin': [window && window.location.host],
    'Content-Type': 'application/json',
    'Allow-Credentials': true
  }
})

Vue.prototype.$axios = axiosInstance
