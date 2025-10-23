<template>
  <v-app-bar color="grey-lighten-4" flat height="64">
    <!-- Arama kutusu -->
    <v-text-field
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      placeholder="Sayaç, kullanıcı veya adres ara..."
      hide-details
      variant="solo-filled"
      density="comfortable"
      class="mx-4"
      style="max-width: 350px"
    />

    <v-spacer></v-spacer>

    <!-- Bildirim ikonu -->
    <v-btn icon>
      <v-icon>mdi-bell-outline</v-icon>
    </v-btn>

    <!-- Profil & Logout -->
    <v-menu transition="fade-transition" location="bottom end">
      <template #activator="{ props }">
        <v-btn v-bind="props" icon>
          <v-avatar color="grey-darken-2" size="36">
            <span class="text-white text-body-2">B</span>
          </v-avatar>
        </v-btn>
      </template>

      <v-list>
        <v-list-item>
          <v-list-item-title>Profil</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Yardım</v-list-item-title>
        </v-list-item>
        <v-divider />
        <v-list-item @click="logout">
          <v-list-item-title class="text-red">Çıkış Yap</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
import { ref } from 'vue'

const search = ref('')

function logout() {
  alert('Çıkış yapıldı (mock).')
}
</script>
