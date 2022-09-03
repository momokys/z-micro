import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { globalBeforeGuard, globalAfterEach } from './guard'

const router = createRouter({
  routes,
  history: createWebHistory(),
})

router.beforeEach(globalBeforeGuard())
router.afterEach(globalAfterEach())

export default router
