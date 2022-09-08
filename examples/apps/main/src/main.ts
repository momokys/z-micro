import { createApp } from 'vue'
import store from '@/store'
import router from '@/router'
import App from './App.vue'
import common from './components/common'
import ElementPlus from 'element-plus'
import * as AllIcons from '@element-plus/icons-vue'
import '@zan-micro/core'

import 'element-plus/dist/index.css'
import 'virtual:windi.css'
import 'virtual:windi-devtools'
import '@/style/index.scss'

const app = createApp(App)

app.use(store).use(router).use(ElementPlus).use(common)

Object.entries(AllIcons).forEach(([iconName, icon]) => {
  app.component(iconName, icon)
})

app.mount('#app')
