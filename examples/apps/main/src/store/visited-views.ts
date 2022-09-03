import { defineStore } from 'pinia'

export type VisitedViewType = {
  fullPath: string
  path: string
  title: string
  query?: Record<string, any>
  params?: Record<string, any>
}

export const useVisitedViews = defineStore({
  id: 'visited-views',
  state: () => ({
    views: [{ fullPath: '/home', path: '/home', title: '首页' }] as VisitedViewType[],
  }),
  actions: {
    add(view: VisitedViewType) {
      const isExist = this.views.some((item) => item.path === view.path)
      if (!isExist && view.title) {
        this.views.push(view)
      }
    },
    del(view: VisitedViewType) {
      this.views = this.views.filter((item) => item.fullPath !== view.fullPath)
    },
  },
})
