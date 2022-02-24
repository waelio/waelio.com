export interface Subscription {
  endpoint: string
  expirationTime: Date | null
  keys: {
    p256dh: string
    auth: string
  }
}
