import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createMicro } from '@zan-micro/core'

import App from './App.vue'
import router from './router'

import './assets/main.css'

createMicro()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
