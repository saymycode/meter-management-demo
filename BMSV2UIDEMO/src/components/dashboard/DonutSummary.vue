<template>
  <div class="donut-wrapper">
    <div class="donut-header">
      <div>
        <h3>{{ title }}</h3>
        <p>{{ subtitle }}</p>
      </div>
      <slot name="action" />
    </div>
    <div class="donut-body">
      <div class="donut-canvas">
        <canvas ref="canvasRef" />
      </div>
      <ul class="donut-legend">
        <li v-for="segment in legend" :key="segment.label">
          <span class="legend-dot" :style="{ background: segment.color }" />
          <div class="legend-text">
            <span class="legend-label">{{ segment.label }}</span>
            <span class="legend-value">{{ segment.valueLabel }} • {{ segment.percentage }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart, ArcElement, Tooltip } from 'chart.js/auto'

Chart.register(ArcElement, Tooltip)

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
  colors: {
    type: Array,
    default: () => []
  }
})

const canvasRef = ref(null)
let chartInstance

const total = computed(() => props.values.reduce((acc, value) => acc + value, 0))

const legend = computed(() => {
  return props.labels.map((label, index) => {
    const value = props.values[index] ?? 0
    const color = props.colors[index] ?? 'rgba(56, 189, 248, 0.6)'
    const percentage = total.value > 0 ? ((value / total.value) * 100).toFixed(1) : '0.0'
    const valueLabel = value.toLocaleString('tr-TR')
    return { label, valueLabel, percentage: `%${percentage}`, color }
  })
})

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
    type: 'doughnut',
    data: {
      labels: props.labels,
      datasets: [
        {
          data: props.values,
          backgroundColor: props.colors,
          borderWidth: 0,
          hoverOffset: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: (context) => {
              const value = context.parsed
              const percentage = total.value > 0 ? ((value / total.value) * 100).toFixed(1) : '0.0'
              return `${value.toLocaleString('tr-TR')} sayaç • %${percentage}`
            }
          }
        }
      }
    }
  })
}

onMounted(buildChart)

watch(() => props.values.slice(), buildChart)
watch(() => props.labels.slice(), buildChart)
watch(() => props.colors.slice(), buildChart)

onBeforeUnmount(destroyChart)
</script>

<style scoped>
.donut-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.donut-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.donut-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: rgba(226, 232, 240, 0.95);
}

.donut-header p {
  margin: 4px 0 0;
  font-size: 13px;
  color: rgba(148, 163, 184, 0.78);
}

.donut-body {
  display: flex;
  align-items: center;
  gap: 22px;
}

.donut-canvas {
  position: relative;
  width: 180px;
  height: 180px;
}

.donut-legend {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
}

.donut-legend li {
  display: flex;
  align-items: center;
  gap: 12px;
}

.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.legend-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.legend-label {
  font-weight: 600;
  color: rgba(226, 232, 240, 0.92);
}

.legend-value {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.78);
}

@media (max-width: 960px) {
  .donut-body {
    flex-direction: column;
    align-items: flex-start;
  }

  .donut-canvas {
    width: 200px;
    height: 200px;
  }
}
</style>
