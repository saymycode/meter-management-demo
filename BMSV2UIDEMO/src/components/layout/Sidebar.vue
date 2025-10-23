<template>
  <v-navigation-drawer app permanent color="grey-darken-4" width="230">
    <v-list dense>
      <v-list-item>
        <v-list-item-title class="text-h6 text-white"> Sayaç Yönetimi </v-list-item-title>
      </v-list-item>

      <v-divider class="my-2"></v-divider>

      <v-list-item v-for="item in menuItems" :key="item.title" :to="item.to" link>
        <v-list-item-icon>
          <v-icon color="white">{{ item.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-title class="text-white">{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
  { title: 'Elektrik', icon: 'mdi-flash', to: '/electricity' },
  { title: 'Su', icon: 'mdi-water', to: '/water' },
  { title: 'Sensor', icon: 'mdi-fire', to: '/sensor' },
  { title: 'Ayarlar', icon: 'mdi-cog', to: '/settings' },
]
</script>

<style scoped>
.text-white {
  color: white !important;
}
</style>
