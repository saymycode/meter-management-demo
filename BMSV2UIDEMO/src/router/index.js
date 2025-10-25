import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Electricity from '../views/Electricity.vue'
import Water from '../views/Water.vue'
import Sensor from '../views/Sensor.vue'
import Settings from '../views/Settings.vue'
import Reports from '../views/Reports.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/homeview', name: 'homeview', component: HomeView },
    { path: '/electricity', name: 'electricity', component: Electricity },
    { path: '/water', name: 'water', component: Water },
    { path: '/sensor', name: 'sensor', component: Sensor },
    { path: '/settings', name: 'settings', component: Settings },
    { path: '/reports', name: 'reports', component: Reports },
  ],
})

export default router
