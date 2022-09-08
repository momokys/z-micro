import Router from 'koa-router'
import config from '@/config'

const router: Router = new Router({
  prefix: config.baseURL,
})

router.post('/user/login', async (ctx) => {
  console.log('xxx')
  ctx.body = {
    data: {
      token: 'momoky',
    },
    code: 2000,
  }
})

router.get('/user/logout', async (ctx) => {
  ctx.body = {
    data: {},
    code: 2000,
  }
})

router.get('/user/cur', async (ctx) => {
  ctx.body = {
    data: {
      userName: 'momoky',
    },
    code: 2000,
  }
})

router.get('/user/app/list', async (ctx) => {
  ctx.body = {
    data: [
      {
        name: 'vue3',
        title: 'vue3 应用',
        host: 'http://localhost:7500',
        uri: '/vue3',
        icon: 'ElementPlus',
      },
    ],
    code: 2000,
  }
})

router.get('/user/menu/list', async (ctx) => {
  ctx.body = {
    data: [
      {
        menuId: 1,
        menuCode: 'SystemMenu',
        menuType: 'M',
        menuName: '菜单管理',
        parentId: 0,
        path: '/system/menu',
        src: '/src/views/system/menu/index.vue',
        icon: 'el-icon-menu',
      },
    ],
    code: 2000,
  }
})

export default router
