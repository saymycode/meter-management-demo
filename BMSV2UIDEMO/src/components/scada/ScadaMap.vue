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
let layer
const markers = new Map()

const baseIcon = (meter, isSelected) =>
  L.divIcon({
    className: `scada-marker ${meter.type} ${meter.status} ${meter.flash ? 'is-flashing' : ''} ${
      isSelected ? 'is-selected' : ''
    }`,
    html: '<span></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })

const ensureMarker = (meter) => {
  if (!layer) return
  let marker = markers.get(meter.id)
  const icon = baseIcon(meter, meter.id === props.selectedMeterId)
  if (!marker) {
    marker = L.marker([meter.lat, meter.lng], { icon })
    marker.on('click', () => emit('select-meter', meter.id))
    marker.addTo(layer)
    markers.set(meter.id, marker)
  } else {
    marker.setLatLng([meter.lat, meter.lng])
    marker.setIcon(icon)
  }
}

const removeUnusedMarkers = (nextMeters) => {
  const validIds = new Set(nextMeters.map((meter) => meter.id))
  markers.forEach((marker, id) => {
    if (!validIds.has(id)) {
      marker.remove()
      markers.delete(id)
    }
  })
}

const redrawMarkers = () => {
  if (!mapInstance) return
  props.meters.forEach(ensureMarker)
  removeUnusedMarkers(props.meters)
}

onMounted(() => {
  if (!mapRoot.value) return
  mapInstance = L.map(mapRoot.value, {
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: true,
  }).setView([39.9334, 32.8597], 10)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(mapInstance)

  layer = L.layerGroup().addTo(mapInstance)
  redrawMarkers()
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
    const marker = markers.get(next)
    if (marker && mapInstance) {
      mapInstance.panTo(marker.getLatLng())
    }
    redrawMarkers()
  },
)

onBeforeUnmount(() => {
  markers.forEach((marker) => marker.remove())
  markers.clear()
  layer?.remove()
  mapInstance?.remove()
})
</script>

<style scoped>
.scada-map {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.32);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

:deep(.leaflet-control-container) {
  display: none;
}

.scada-marker {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.75);
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 18px rgba(59, 130, 246, 0.6);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: pulse 6s ease-in-out infinite;
}

.scada-marker span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 18px currentColor;
}

.scada-marker.water {
  color: #38bdf8;
}

.scada-marker.electric {
  color: #facc15;
}

.scada-marker.warning {
  color: #f97316;
}

.scada-marker.alarm {
  color: #f87171;
}

.scada-marker.info,
.scada-marker.normal {
  color: #34d399;
}

.scada-marker.is-selected {
  transform: scale(1.4);
  box-shadow: 0 0 24px rgba(147, 197, 253, 0.9);
}

.scada-marker.is-flashing span {
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.9);
    opacity: 0.7;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.7;
  }
}
</style>
