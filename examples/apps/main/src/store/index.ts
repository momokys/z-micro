import { createPinia } from 'pinia'

const store = createPinia()

export default store

export * from './user'
export * from './setting'
export * from './app'
export * from './views-cache'
export * from './visited-views'
