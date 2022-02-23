import { defineStore } from 'pinia'
export const useForm = defineStore('formData', {
  state: () => ({
    addressTo: "",
    amount: 0.1,
    keyword: "",
    message: "",
    timestamp: Date.now(),
    isLoading: false,
  }),
  actions: {
    setAddressTo(setAddressTo: string) {
      this.addressTo = setAddressTo
    },
    setAmount(setAmount: number) {
      this.amount = setAmount
    },
    setKeyword(setKeyword: string) {
      this.keyword = setKeyword
    },
    setMessage(setMessage: string) {
      this.message = setMessage
    },
    setIsLoading(isLoading: boolean) {
      this.isLoading = isLoading
    }
  },
  getters: {
    addressTo: function (state) { return state.addressTo },
    amount: function (state) { return state.amount },
    keyword: function (state) { return state.keyword },
    message: function (state) { return state.message },
    timestamp: function (state) { return state.timestamp },
    isLoading: function (state) { return state.isLoading }
  }
})