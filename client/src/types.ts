import { ViteSSGContext } from 'vite-ssg'
import { waelioUtils } from './waelio-utils.d'

export type UserModule = (ctx: ViteSSGContext) => void
export type WaelioUtils = (ctx: waelioUtils) => void
