import { Plugin, App } from 'vue'

const commonComponents: Plugin = (app: App) => {
  const components = import.meta.globEager('./*/index.ts') as Record<string, any>
  Object.entries(components).forEach(([, item]) => {
    if (item.default && item.default.install) {
      item.default.install(app)
    }
  })
}

export default commonComponents

export * from './view'
export * from './icon'
