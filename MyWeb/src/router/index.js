import { createRouter, createWebHistory } from 'vue-router'

// 构造路由表
const routes = [
  {
    path: '/webMap',
    name: 'webMap',
    component: () => import('../views/webMap.vue')
  },
  {
    path: '/publicMap',
    name: 'publicMap',
    component: () => import('../views/layers/publicMap.vue')
  },
  {
    path: '/OGCMap',
    name: 'OGCMap',
    component: () => import('../views/layers/OGCMap.vue')
  },
  {
    path: '/OSMap',
    name: 'OSMap',
    component: () => import('../views/layers/openSourceMap.vue')
  }
]

// 构造路由对象
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
  redirect: '/webMap'
})

export default router
