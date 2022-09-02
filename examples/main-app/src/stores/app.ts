import { defineStore } from 'pinia'

export const useAppStore = defineStore({
  id: 'app',
  state: () => ({
    activeApp: 'vue3',
  }),
  actions: {
    setActiveApp(name: string) {
      this.activeApp = name
    },
  },
})
