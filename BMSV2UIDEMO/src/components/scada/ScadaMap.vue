<template>
  <div ref="mapRoot" class="scada-map"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  meters: {
    type: Array,
    required: true,
  },
  selectedMeterId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['select-meter'])

const mapRoot = ref(null)
let mapInstance
let markerLayer
const markerRegistry = new Map()
let initializedBounds = false

const statusColors = {
  normal: '#38bdf8',
  info: '#38bdf8',
  warning: '#f97316',
  alarm: '#ef4444',
}

const typeColors = {
  water: '#38bdf8',
  electric: '#facc15',
}

const buildTooltip = (meter) =>
  `\
  <div class="tooltip-card">\
    <strong>${meter.id}</strong>\
    <span>${meter.zone}</span>\
    <span>${meter.communication}</span>\
  </div>\
`

const focusOnMeter = (meter, { minZoom = 14, duration = 1.1 } = {}) => {
  if (!mapInstance || !meter) return
  const targetLatLng = L.latLng(meter.lat, meter.lng)
  const nextZoom = Math.max(mapInstance.getZoom(), minZoom)
  mapInstance.flyTo(targetLatLng, nextZoom, {
    duration,
    easeLinearity: 0.25,
    noMoveStart: true,
  })
}

const createMarker = (meter) => {
  const statusColor = statusColors[meter.status] ?? '#38bdf8'
  const typeColor = typeColors[meter.type] ?? '#38bdf8'
  const baseColor = meter.status === 'warning' || meter.status === 'alarm' ? statusColor : typeColor

  const circle = L.circleMarker([meter.lat, meter.lng], {
    radius: 10,
    color: baseColor,
    weight: 2,
    fillColor: baseColor,
    fillOpacity: 0.85,
    className: `scada-circle ${meter.type} ${meter.status}`,
  })

  circle.on('click', () => emit('select-meter', meter.id))
  circle.bindTooltip(buildTooltip(meter), {
    direction: 'top',
    offset: [0, -12],
    permanent: false,
    opacity: 0.95,
    className: 'scada-tooltip',
  })

  return circle
}

const ensureMarker = (meter) => {
  if (!markerLayer) return
  let marker = markerRegistry.get(meter.id)
  if (!marker) {
    marker = createMarker(meter)
    marker.addTo(markerLayer)
    markerRegistry.set(meter.id, marker)
  } else {
    marker.setLatLng([meter.lat, meter.lng])
    const statusColor = statusColors[meter.status] ?? '#38bdf8'
    const typeColor = typeColors[meter.type] ?? '#38bdf8'
    const baseColor = meter.status === 'warning' || meter.status === 'alarm' ? statusColor : typeColor
    marker.setStyle({
      color: baseColor,
      fillColor: baseColor,
    })
    marker.setTooltipContent(buildTooltip(meter))
  }

  if (meter.id === props.selectedMeterId) {
    marker.setStyle({ weight: 3, radius: 12 })
  } else {
    marker.setStyle({ weight: 2, radius: 10 })
  }
}

const removeUnusedMarkers = (nextMeters) => {
  const validIds = new Set(nextMeters.map((meter) => meter.id))
  markerRegistry.forEach((marker, id) => {
    if (!validIds.has(id)) {
      marker.remove()
      markerRegistry.delete(id)
    }
  })
}

const redrawMarkers = () => {
  if (!mapInstance) return
  props.meters.forEach(ensureMarker)
  removeUnusedMarkers(props.meters)

  if (!initializedBounds && props.meters.length) {
    const bounds = L.latLngBounds(props.meters.map((meter) => [meter.lat, meter.lng]))
    mapInstance.fitBounds(bounds.pad(0.2))
    initializedBounds = true
  }
}

onMounted(() => {
  if (!mapRoot.value) return

  mapInstance = L.map(mapRoot.value, {
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: true,
    dragging: true,
  }).setView([39.9334, 32.8597], 6)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(mapInstance)

  markerLayer = L.layerGroup().addTo(mapInstance)
  redrawMarkers()

  setTimeout(() => {
    mapInstance?.invalidateSize()
  }, 200)
})

watch(
  () => props.meters,
  () => {
    redrawMarkers()
  },
  { deep: true },
)

watch(
  () => props.selectedMeterId,
  (next) => {
    if (!next) return
    const meter = props.meters.find((candidate) => candidate.id === next)
    if (meter) {
      focusOnMeter(meter)
    }
    redrawMarkers()
  },
)

onBeforeUnmount(() => {
  markerRegistry.forEach((marker) => marker.remove())
  markerRegistry.clear()
  markerLayer?.remove()
  mapInstance?.remove()
})
</script>

<style scoped>
.scada-map {
  width: 100%;
  height: 100%;
  border-radius: 28px;
  overflow: hidden;
}

:deep(.leaflet-container) {
  background: #0f172a;
}

:deep(.leaflet-control-container) {
  display: none;
}

:deep(.scada-circle) {
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.6);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.scada-circle.alarm) {
  box-shadow: 0 0 18px rgba(239, 68, 68, 0.7);
}

:deep(.scada-circle.warning) {
  box-shadow: 0 0 18px rgba(249, 115, 22, 0.7);
}

:deep(.scada-circle:hover) {
  transform: scale(1.15);
}

:deep(.scada-tooltip) {
  background: rgba(15, 23, 42, 0.85);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 12px;
  padding: 8px 10px;
  box-shadow: 0 12px 32px rgba(8, 15, 31, 0.45);
}

:deep(.scada-tooltip .tooltip-card) {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

:deep(.scada-tooltip strong) {
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
}
</style>
