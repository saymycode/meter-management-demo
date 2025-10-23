<script setup>
import { RouterView } from 'vue-router'
import Sidebar from './components/layout/Sidebar.vue'
import TopBar from './components/layout/TopBar.vue'
</script>

<template>
  <v-app>
    <Sidebar />
    <v-main>
      <TopBar />
      <v-container fluid class="pa-4 bg-grey-lighten-4">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>
