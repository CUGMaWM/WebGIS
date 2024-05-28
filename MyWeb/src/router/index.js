import { createRouter, createWebHistory } from 'vue-router'

// 构造路由表
const routes = [
  {
    path: '/webMap',
    name: 'webMap',
    component: () => import('../views/webMap.vue')
  },
  {
    path: '/calArea',
    name: 'calArea',
    component: () => import('../views/layers/calArea.vue')
  },
  {
    path: '/calLine',
    name: 'calLine',
    component: () => import('../views/layers/calLine.vue')
  },
  {
    path: '/',
    redirect: '/webMap'
  },
  {
    path: '/heatMap',
    name: 'heatMap',
    component: () => import('../views/layers/SpatialAnalyse/heatMap.vue')
  },
  {
    path: '/mapMark',
    name: 'mapMark',
    component: () => import('../views/layers/SpatialAnalyse/mapMark.vue')
  }
]
// 构造路由对象
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})
export default router
