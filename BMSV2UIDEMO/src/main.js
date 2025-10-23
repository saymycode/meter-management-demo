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
})
// EN ÜSTE (main.js ya da bu Vue dosyası)
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise'

// daha önce yanlış yaptığın şu importu SİL:
// import { RowGroupingModule } from 'ag-grid-community'  // ❌

ModuleRegistry.registerModules([AllCommunityModule, RowGroupingModule, RowGroupingPanelModule])

createApp(App).use(router).use(createPinia()).use(vuetify).mount('#app')
