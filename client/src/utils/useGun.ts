import Gun from 'gun/gun'
const options = { peers: ['ws://localhost:9000/gun','ws://waelio.herokuapp.com/gun','ws://gun.waelio.com/gun'] }
const gun = new Gun(options)
const SEA = Gun.SEA
export { gun, SEA, Gun }


type _gun = typeof gun
type _SEA = typeof SEA
type _Gun = typeof Gun

interface _readyOptions {
  gun: _gun
  SEA: _SEA
  Gun: _Gun
}
const readyOptions: _readyOptions = { gun, SEA, Gun }

interface useGun {
  gun: _gun
  SEA: _SEA
  Gun: _Gun
  options: _readyOptions|{}
}

class UseGun implements useGun {
  options = {}
  gun = gun
  SEA = SEA
  Gun = Gun
  lib = {
    gun,
    SEA,
    Gun,
  }

  Constructor() {
    this.lib = { ...readyOptions }
    return this.lib
  }

  getGun = () => this.lib.gun

  encrypt = async (payload: CryptoKeyPair|[]|{}, key: string) => {
    const pair = await this.lib.SEA.pair(payload)
    const enc = await this.lib.SEA.encrypt(payload, key)
    const data = await this.lib.SEA.sign(enc, pair)
    return data
  }

 decrypt = async (payload: string|[]|{}, pub: string) =>{
    const msg = await this.lib.SEA.verify(payload, pub)
    const dec = await this.lib.SEA.decrypt(msg, pub)
    return dec
 }

  verify = async (payload: string|[]|{}, key: { pub:string }) => {
    const msg = await this.SEA.verify(payload, key.pub)
    const dec = await this.decrypt(msg, key.pub)

    const proof = await this.SEA.work(dec, key)
    const check = await this.SEA.work(payload, key)
    return await !!(proof === check)
  }
}
const useGun = new UseGun()

export { useGun }