import { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/refresh',
    name: '',
    component: () => import('@/views/refresh/index.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
  },
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: '',
        name: 'Micro',
        meta: {
          title: '首页',
        },
        component: () => import('@/views/micro/index.vue'),
      },
      {
        path: '/home',
        name: 'Home',
        meta: {
          title: '首页',
        },
        component: () => import('@/views/home/index.vue'),
      },
    ],
  },
]

export default routes
