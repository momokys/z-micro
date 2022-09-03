import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { defineMicroApp, defineMicroContainer } from '@zan-micro/core'

import App from './App.vue'
// import router from './router'

import './assets/main.css'

defineMicroApp()
defineMicroContainer()

const app = createApp(App)

app.use(createPinia())
// app.use(router)

app.mount('#app')
