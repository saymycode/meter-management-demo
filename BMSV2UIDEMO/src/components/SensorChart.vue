<template>
  <v-card class="pa-4">
    <h3>Kullanım Grafiği</h3>
    <canvas id="usageChart"></canvas>
  </v-card>
</template>

<script setup>
import { onMounted } from 'vue'
import Chart from 'chart.js/auto'

onMounted(() => {
  const ctx = document.getElementById('usageChart')
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
      datasets: [
        {
          label: 'Elektrik (kWh)',
          data: [50, 55, 52, 60, 65, 62, 59],
          borderWidth: 2,
        },
        {
          label: 'Su (m³)',
          data: [12, 11, 13, 14, 10, 9, 11],
          borderWidth: 2,
        },
      ],
    },
  })
})
</script>
