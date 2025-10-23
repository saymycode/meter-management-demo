import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import 'ag-grid-enterprise' // En kolay yol: tüm enterprise özelliklerini alırsın

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          primary: '#0f766e',
          secondary: '#14b8a6',
          surface: '#ffffff',
          background: '#f4f6fb',
          info: '#0284c7',
          success: '#22c55e',
          warning: '#f97316',
          error: '#ef4444',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#2dd4bf',
          secondary: '#38bdf8',
          surface: '#101a2c',
          background: '#020817',
          info: '#0ea5e9',
          success: '#34d399',
          warning: '#fb923c',
          error: '#f87171',
        },
      },
    },
  },
})
// EN ÜSTE (main.js ya da bu Vue dosyası)
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise'

// daha önce yanlış yaptığın şu importu SİL:
// import { RowGroupingModule } from 'ag-grid-community'  // ❌

ModuleRegistry.registerModules([AllCommunityModule, RowGroupingModule, RowGroupingPanelModule])

createApp(App).use(router).use(createPinia()).use(vuetify).mount('#app')
