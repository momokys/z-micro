import { App, AppContext, Plugin } from 'vue'

export type SFCInstall<T> = T & Plugin

export const withInstall = <T extends Record<string, any>>(sfc: T, installFn?: (app: App) => void) => {
  ;(sfc as SFCInstall<T>).install = (app: App) => {
    app.component(sfc.name, sfc)
    installFn?.(app)
  }
  return sfc as SFCInstall<T>
}
