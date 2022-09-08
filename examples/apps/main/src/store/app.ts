import { defineStore } from 'pinia'
import userApi from '@/api/user'
import { listToTrees } from '@/utils'
import { RouteLocationNormalized } from 'vue-router'
import { isNumber, isString } from 'lodash'

export type Menu = {
  path: string
  src?: string
  menuCode?: string
  menuName: string
  menuType: 'D' | 'M' | 'A'
  icon?: string
  children: Menu[]
}
export type App = {
  name: string
  title: string
  host: string
  uri: string
  icon: string
  menus: Menu[]
}

export const useApp = defineStore({
  id: 'app',
  state: () => ({
    activeIndex: -1,
    appList: [] as App[],
  }),
  getters: {
    activeApp: (state) => state.appList[state.activeIndex] ?? {},
  },
  actions: {
    async loadAppList() {
      const res = await userApi.qryAppList()
      const appList = (res.data as App[]).map((app) => ({
        ...app,
        menus: [],
      }))
      this.appList.push(...appList)
    },
    async setActiveApp(route: RouteLocationNormalized | string | number) {
      const activeIndex = isNumber(route) ? route : this.findAppIndex(route)
      if (activeIndex < 0) {
        throw new Error('not found app')
      }
      this.activeIndex = activeIndex
      if (this.appList[activeIndex].menus.length > 0) return
      const res = await userApi.qryMenuList(this.appList[activeIndex].name)
      this.appList[activeIndex].menus = listToTrees(res.data ?? [], {
        root: 0,
        id: 'menuId',
        parentId: 'parentId',
        children: 'children',
      })
    },
    findAppIndex(route: RouteLocationNormalized | string) {
      return this.appList.findIndex((app) => app.name === (isString(route) ? route : (route.name as string)))
    },
  },
})
