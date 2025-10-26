import { createApp, h } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const iconAliases = {
  close: 'close',
  cancel: 'close',
  clear: 'close',
  complete: 'check',
  delete: 'delete',
  success: 'check_circle',
  info: 'info',
  warning: 'warning',
  error: 'error',
  prev: 'chevron_left',
  next: 'chevron_right',
  expand: 'expand_more',
  collapse: 'expand_less',
  delimiter: 'fiber_manual_record',
  sort: 'arrow_upward',
  menu: 'menu',
  subgroup: 'arrow_drop_down',
  dropdown: 'arrow_drop_down',
  radioOn: 'radio_button_checked',
  radioOff: 'radio_button_unchecked',
  checkboxOn: 'check_box',
  checkboxOff: 'check_box_outline_blank',
  checkboxIndeterminate: 'indeterminate_check_box',
  ratingEmpty: 'star',
  ratingFull: 'star',
  ratingHalf: 'star_half',
  loading: 'autorenew',
  first: 'first_page',
  last: 'last_page',
  unfold: 'unfold_more',
  file: 'description',
  plus: 'add',
  minus: 'remove',
  calendar: 'event',
}

const materialSymbols = {
  component: (props) => {
    if (typeof props.icon === 'string') {
      if (props.icon.startsWith('mdi:')) {
        const iconName = props.icon.substring(4)
        return h('i', { class: ['mdi', `mdi-${iconName}`], 'aria-hidden': 'true' })
      }

      if (props.icon.startsWith('mdi-')) {
        return h('i', { class: ['mdi', props.icon], 'aria-hidden': 'true' })
      }
    }

    return h(
      'span',
      {
        class: 'material-symbols-outlined',
        style: { fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" },
        'aria-hidden': 'true',
      },
      props.icon,
    )
  },
}

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'materialSymbols',
    aliases: iconAliases,
    sets: {
      materialSymbols,
    },
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          primary: '#1d4ed8',
          secondary: '#6366f1',
          surface: '#ffffff',
          background: '#e9eef7',
          info: '#0ea5e9',
          success: '#16a34a',
          warning: '#f59e0b',
          error: '#ef4444',
          electric: '#f59e0b',
          water: '#0ea5e9',
          sensor: '#10b981',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#60a5fa',
          secondary: '#a855f7',
          surface: '#101a2c',
          background: '#080f1f',
          info: '#38bdf8',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
          electric: '#facc15',
          water: '#38bdf8',
          sensor: '#34d399',
        },
      },
    },
  },
})
// EN ÜSTE (main.js ya da bu Vue dosyası)
createApp(App).use(router).use(createPinia()).use(vuetify).mount('#app')
