import { defineStore } from 'pinia'
import { _encrypt } from 'waelio-utils/dist/waelioUtils'
export const useTransactions = defineStore('transactions', {
  state: () => ({
    _addressFrom: '',
    _addressTo: '0x3ba453290bCabD7CCD24E3DdAeF6617F48d537b9',
    _amount: 0.1,
    _message: 'message',
    _timestamp: Date.now(),
    _url: '',
    _gifUrl: '',
    _keyword: 'hello',
    _transactions: [],
    _currentAccount: '',
    _transactionCount: 0,
    _currentWallet: '',
  }),
  actions: {
    setAddressFrom(addressFrom: string) {
      this._addressFrom = addressFrom
    },
    setAddressTo(addressTo: string) {
      this._addressTo = addressTo
    },
    setAmount(amount: number) {
      this._amount = amount
    },
    setMessage(message: string) {
      this._message = message
    },
    setTimestamp(timestamp: number) {
      this._timestamp = timestamp
    },
    setUrl(url: string) {
      this._url = url
    },
    setGifUrl(gifUrl: string) {
      this._gifUrl = gifUrl
    },
    setCurrentAccount(newAccount: string) {
      localStorage.removeItem('cec')
      this._currentAccount = newAccount
      localStorage.setItem('cec', _encrypt("salt", newAccount))
    },
    setTransactionCount(count: number) {
      this._transactionCount = count
    },
    setCurrentWallet(wallet: string) {
      this._currentWallet = wallet
    }
  },
  getters: {
    addressFrom: function (state) { return state._addressFrom },
    addressTo: function (state) { return state._addressTo },
    amount: function (state) { return state._amount },
    message: function (state) { return state._message },
    timestamp: function (state) { return state._timestamp },
    url: function (state) { return state._url },
    gifUrl: function (state) { return state._gifUrl },
    transactions: function (state) { return state._transactions },
    currentAccount: function (state) { return state._currentAccount },
    transactionCount: function (state) { return state._transactionCount },
    currentWallet: function (state) { return state._currentWallet },

  },
})
