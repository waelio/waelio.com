// src/feathers.ts
import feathers from '@feathersjs/feathers'
import io from 'socket.io-client'
import socketio from '@feathersjs/socketio-client'
import rest from '@feathersjs/rest-client'
import auth from '@feathersjs/authentication-client'
import axios from 'axios'
import { iff, discard } from 'feathers-hooks-common'

axios.defaults.headers.common['Access-Control-Allow-Origin'] = import.meta.env.VITE_MY_URL
const socket = io(import.meta.env.VITE_API_URL, { transports: ['websocket'] })
const restClient = rest(import.meta.env.VITE_API_URL)

// eslint-disable-next-line import/no-mutable-exports
export const api = feathers().configure(auth({ storage: window.localStorage })).configure(socketio(socket))
export const api2 = feathers().configure(restClient.axios(axios))
