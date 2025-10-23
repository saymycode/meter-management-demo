<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="4">
        <MeterCard title="Elektrik" unit="kWh" :value="1283" icon="mdi-flash" color="yellow-darken-2" />
      </v-col>
      <v-col cols="12" md="4">
        <MeterCard title="Su" unit="m³" :value="432" icon="mdi-water" color="blue-darken-2" />
      </v-col>
      <v-col cols="12" md="4">
        <MeterCard title="Doğalgaz" unit="m³" :value="728" icon="mdi-fire" color="red-darken-2" />
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12">
        <SensorChart />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import MeterCard from '../components/MeterCard.vue'
import SensorChart from '../components/SensorChart.vue'
</script>
