// src/feathers.ts
import feathers from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
// import auth from '@feathersjs/authentication-client'
import io from 'socket.io-client'
// import { iff, discard } from 'feathers-hooks-common'

const socket = io(`${import.meta.env.VITE_API_URL}`, { transports: ['websocket'] })

// This variable name is important.  It becomes the internal alias for this server.
export const api = feathers()
  .configure(socketio(socket))
  // .configure(auth({ storage: window.localStorage }))
