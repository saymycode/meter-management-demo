<template>
  <div class="activity-wrapper">
    <div class="activity-header">
      <div>
        <h3>{{ title }}</h3>
        <p>{{ subtitle }}</p>
      </div>
      <slot name="action" />
    </div>
    <div class="activity-chart">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js/auto'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip)

const props = defineProps({
  title: String,
  subtitle: String,
  labels: {
    type: Array,
    default: () => []
  },
  values: {
    type: Array,
    default: () => []
  },
  color: {
    type: String,
    default: 'rgba(56, 189, 248, 0.65)'
  }
})

const canvasRef = ref(null)
let chartInstance

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = undefined
  }
}

const buildChart = () => {
  if (!canvasRef.value) return
  destroyChart()
  chartInstance = new Chart(canvasRef.value, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [
        {
          data: props.values,
          backgroundColor: props.color,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 22
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      layout: {
        padding: {
          left: 8,
          right: 16,
          top: 8,
          bottom: 8
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(148, 163, 184, 0.15)'
          },
          ticks: {
            color: 'rgba(148, 163, 184, 0.75)',
            callback: (value) => `${value}`
          }
        },
        y: {
          grid: {
            display: false
          },
          ticks: {
            color: 'rgba(226, 232, 240, 0.85)'
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.x.toLocaleString('tr-TR')} sayaç`
          }
        }
      }
    }
  })
}

onMounted(buildChart)
watch(() => props.values.slice(), buildChart)
watch(() => props.labels.slice(), buildChart)
watch(() => props.color, buildChart)
onBeforeUnmount(destroyChart)
</script>

<style scoped>
.activity-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.activity-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: rgba(226, 232, 240, 0.95);
}

.activity-header p {
  margin: 4px 0 0;
  font-size: 13px;
  color: rgba(148, 163, 184, 0.78);
}

.activity-chart {
  height: 280px;
}

@media (max-width: 960px) {
  .activity-chart {
    height: 320px;
  }
}
</style>
