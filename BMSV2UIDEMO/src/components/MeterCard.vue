<template>
  <v-card :color="color" class="pa-5 text-center text-white">
    <v-icon size="48">{{ icon }}</v-icon>
    <h3>{{ title }}</h3>
    <h1>{{ value }} <small>{{ unit }}</small></h1>
  </v-card>
</template>

<script setup>
defineProps({
  title: String,
  value: Number,
  unit: String,
  icon: String,
  color: String,
})
</script>
