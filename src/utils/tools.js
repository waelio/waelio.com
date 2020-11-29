export function JSONToQueryString (payload) {
  payload = JSON.parse(JSON.stringify(payload))
  return Object.keys(payload)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}`).join('&')
}
export function QueryStringToJSON (payload) {
  var pairs = payload.slice(1).split('&')
  var result = {}
  pairs.forEach(pair => {
    pair = pair.split('=')
    result[pair[0]] = decodeURIComponent(pair[1] || '')
  })
  return JSON.parse(JSON.stringify(result))
}
export function resetString (payload) {
  return decodeURIComponent(encodeURIComponent(payload))
}
export function snakeToCamel (payload) {
  return (typeof payload !== 'string') ? payload : payload.replace(/([-_]\w)/g, g => g[1].toUpperCase())
}
export async function decodePayload (jwtToken, refreshToken = false) {
  const Buffer = require('buffer/').Buffer
  let payload
  if (refreshToken) {
    try {
      payload = await jwtToken && jwtToken
      // payload = escape(encodeURIComponent(payload))
      payload = payload.split('.')[1]
      console.log('Payload', payload)
      const step1 = Buffer.from(payload, 'base64')
      console.log('step1:Buffer.from', step1)
      const step34 = step1.toString('utf8')
      console.log('step34.toString', step34)
      const step4 = JSON.parse(step34)
      console.log('step4:JSON.parse', step4)
      return await step4
    } catch (err) {
      console.error('err', err)
      console.error('jwtToken', jwtToken)
      return jwtToken// await JSON.parse(Buffer.from(await jwtToken.split('.')[1], 'base64').toString('utf8'))
    }
  } else {
    payload = await jwtToken && jwtToken.split('.')[1]
    try {
      return await JSON.parse(Buffer.from(await payload, 'base64').toString('utf8'))
    } catch (err) {
      console.error(err)
      return await jwtToken// await JSON.parse(Buffer.from(await jwtToken.split('.')[1], 'base64').toString('utf8'))
    }
  }
}
export function calculateClockDrift (iatAccessToken, iatIdToken) {
  const now = Math.floor(new Date() / 1000)
  const iat = Math.min(iatAccessToken, iatIdToken)
  return now - iat
}
export async function Base64 (payload) {
  return await btoa(unescape(encodeURIComponent(payload)))
}
export async function reParseString (payload) {
  return await JSON.parse(JSON.stringify(await payload))
}
