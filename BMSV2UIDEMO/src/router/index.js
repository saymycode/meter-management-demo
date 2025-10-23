import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import Electricity from '../views/Electricity.vue'
import Water from '../views/Water.vue'
import Sensor from '../views/Sensor.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: Dashboard },
    { path: '/electricity', name: 'electricity', component: Electricity },
    { path: '/water', name: 'water', component: Water },
    { path: '/sensor', name: 'sensor', component: Sensor },
  ],
})

export default router
