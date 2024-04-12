import { createRouter, createWebHistory } from 'vue-router'
import Map from '../views/webMap.vue'

const routes = [
  {
    path: '/',
    name: 'Map',
    component: Map
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

export default router
