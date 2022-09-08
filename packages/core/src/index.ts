import { MicroApp } from './micro'
import { MicroContainer } from './container'

// 注册自定义组件
;(() => {
  window.customElements.define('micro-app', MicroApp)
  window.customElements.define('micro-container', MicroContainer)
})()

export * from './micro'
export * from './container'
export * from './version'
