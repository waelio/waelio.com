import { ViteSSGContext } from 'vite-ssg'
import waelioUtils from 'waelioUtils.d.ts'

export type UserModule = (ctx: ViteSSGContext) => void
export type WaelioUtils = (ctx: waelioUtils) => void
