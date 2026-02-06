import { createRouter, createWebHistory } from 'vue-router'

// 定义路由表
const routes = [
  {
    path: '/',
    redirect: '/dashboard' // 默认跳转到看板
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard/index.vue'),
    meta: { title: '任务看板' }
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('@/views/Account/index.vue'),
    meta: { title: '账号管理' }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/Logs/index.vue'),
    meta: { title: '抢票日志' }
  }
]

const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 模式
  routes
})

export default router