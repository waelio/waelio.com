import { _encrypt, _decrypt } from 'waelio-utils'
import axios from 'axios'
axios.defaults.headers.common['Access-Control-Allow-Origin'] = import.meta.env.VITE_MY_URL
const salt = import.meta.env.VITE_MY_SAFE

const subAdd = async(newSubscription) => {
  if (!await newSubscription) throw new Error('No subscription!')
  return await axios.post(`${import.meta.env.VITE_API_URL}/subscribe`,
    { data: _encrypt(salt, newSubscription) })
}

const subDel = async(currentSubscription) => {
  if (!await currentSubscription) throw new Error('No subscription!')

  const newPayload = _encrypt(salt, currentSubscription)
  const DELETE = await axios({
    baseURL: import.meta.env.VITE_API_URL,
    url: '/subscribe',
    method: 'delete',
    params: { id: newPayload },
  })
  const eData = DELETE.data
  const cData = _decrypt(salt, eData)
  return cData
}

export { subGet, subAdd, subUpdate, subDel }
