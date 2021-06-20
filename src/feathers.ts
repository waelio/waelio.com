// src/feathers.ts
import io from 'socket.io-client'
import socketio from '@feathersjs/socketio-client'
import feathers from '@feathersjs/feathers'

// eslint-disable-next-line import/no-mutable-exports
const socket = io(`${import.meta.env.VITE_API_URL}`, { transports: ['websocket'] })
export const api = feathers().configure(socketio(socket))
