// src/feathers.ts
import feathers from '@feathersjs/feathers'
import io from 'socket.io-client'
import socketio from '@feathersjs/socketio-client'
import rest from '@feathersjs/rest-client'
import axios from 'axios'
const socket = io(import.meta.env.VITE_API_URL, { transports: ['websocket'] })
const restClient = rest(import.meta.env.VITE_API_URL)

// eslint-disable-next-line import/no-mutable-exports
export const api = feathers().configure(socketio(socket))
export const api2 = feathers().configure(restClient.axios(axios))
