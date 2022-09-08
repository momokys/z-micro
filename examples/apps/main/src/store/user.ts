import { defineStore } from 'pinia'
import userApi from '@/api/user'
import { setToken, getToken, removeToken } from '@/http/token'
import { useApp } from "@/store/app";

export const useUser = defineStore({
  id: 'user',
  state: () => ({
    hasGetInfo: false,
    info: {
      userName: '',
      avatar: '',
    },
  }),
  actions: {
    hasLogin() {
      return getToken() !== undefined
    },
    async login(data: { userName: string; password: string }) {
      const res = await userApi.login(data)
      setToken(res.data.token)
      return res
    },
    async logout() {
      try {
        await userApi.logout()
      } finally {
        removeToken()
        this.hasGetInfo = false
      }
    },
    async loadCurUser() {
      if (!this.hasGetInfo && this.hasLogin()) {
        const res = await userApi.qryCurUser()
        this.info = res.data
        this.hasGetInfo = true

        const appStore = useApp()
        await appStore.loadAppList()
      }
      return this.info
    },
  },
})
