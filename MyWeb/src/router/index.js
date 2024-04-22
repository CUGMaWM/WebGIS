import { createRouter, createWebHistory } from 'vue-router'

// 构造路由表
const routes = [
  {
    path: '/',
    redirect: '/webMap'
  },
  {
    path: '/webMap',
    name: 'webMap',
    component: () => import('../views/webMap.vue')
  }
]

// 构造路由对象
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

export default router
