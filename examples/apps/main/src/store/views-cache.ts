import { defineStore } from 'pinia'

export const useViewCache = defineStore({
  id: 'view-cache',
  state: () => ({
    views: [] as string[],
  }),
  actions: {
    add(view: string) {
      this.views.push(view)
    },
    del() {},
  },
})
