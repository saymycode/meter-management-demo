import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
const repoBase = process.env.VITE_APP_BASE_PATH || '/meter-management-demo/BMSV2UIDEMO/'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  base: repoBase,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
