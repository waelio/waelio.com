export interface subscription {
  endpoint: string
  expirationTime: date | null
  keys: {
    p256dh: string
    auth: string
  }
}
