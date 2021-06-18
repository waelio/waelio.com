// src/feathers.ts
import feathers from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
// import auth from '@feathersjs/authentication-client'
import io from 'socket.io-client'

// eslint-disable-next-line import/no-mutable-exports
const socket = io(`${import.meta.env.VITE_API_URL}`, { transports: ['websocket'] })

const api = feathers()
  .configure(socketio(socket))
  // .configure(auth({
  //   storage: !import.meta.env.SSR ? window.localStorage : '',
  // }))

export { api }
