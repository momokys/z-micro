import { MicroApp } from './src/micro'
import { MicroContainer } from './src/container'

// 注册自定义组件
;(() => {
  window.customElements.define('micro-app', MicroApp)
  window.customElements.define('micro-container', MicroContainer)
})()

export * from './src/micro'
export * from './src/container'
