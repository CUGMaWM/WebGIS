import { createRouter, createWebHistory } from 'vue-router'
import Map from '../views/webMap.vue'

const routes = [
  {
<<<<<<< HEAD
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
<<<<<<< HEAD
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
=======
    name: 'Map',
    component: Map
  }
]

>>>>>>> parent of 4d3387b (修复了某人存在亲妈的BUG)
=======
    path: '/',
    name: 'Map',
    component: Map
  }
]

>>>>>>> parent of 4d3387b (修复了某人存在亲妈的BUG)
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

export default router
