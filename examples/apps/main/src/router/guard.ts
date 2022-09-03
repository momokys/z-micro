import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import nprogress from 'nprogress'
import { useUser, useApp } from '@/store'
import routeConfig from '@/config/route'

export function globalBeforeGuard() {
  return async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    nprogress.start()
    const user = useUser()
    const appStore = useApp()
    if (!user.hasLogin() && !routeConfig.permitList.includes(to.name as string)) {
      // 未登录，并且不是白名单
      next({ name: routeConfig.loginName })
    } else if (user.hasLogin() && !user.hasGetInfo) {
      await user.loadCurUser()
      const appIndex = appStore.findAppIndex(to)
      await appStore.setActiveApp(appIndex > 0 ? appIndex : 0)
      next({
        path: to.path,
      })
    } else if (user.hasLogin() && routeConfig.loginName === to.name) {
      next({ name: routeConfig.homeName })
    } else {
      next()
    }
  }
}

export function globalAfterEach() {
  return async () => {
    nprogress.done()
  }
}
