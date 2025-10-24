<template>
  <div class="freshness-indicator" :class="state">
    <div class="indicator-main">
      <span class="indicator-label">{{ title }}</span>
      <div class="indicator-values">
        <v-chip :color="stateMeta.color" class="indicator-chip" size="small" variant="flat">
          {{ stateMeta.label }}
        </v-chip>
        <span class="indicator-time">{{ lastUpdateLabel }}</span>
      </div>
    </div>
    <div class="indicator-meta">
      <span>{{ relativeHint }}</span>
      <span class="indicator-window">{{ windowHint }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatAbsolute, formatRelativeAgo, hoursBetween } from '@/utils/time'

const props = defineProps({
  lastUpdate: {
    type: [String, Date],
    required: true
  },
  now: {
    type: [String, Date],
    default: () => new Date()
  },
  pendingThresholdHours: {
    type: Number,
    default: 24
  },
  inactiveThresholdHours: {
    type: Number,
    default: 48
  },
  title: {
    type: String,
    default: 'Veri tazeliği'
  },
  windowHint: {
    type: String,
    default: 'Sayaçlar 24 saatlik pencere içinde rastgele veri gönderir.'
  }
})

const hoursSinceUpdate = computed(() => Math.max(0, hoursBetween(props.lastUpdate, props.now)))

const state = computed(() => {
  if (hoursSinceUpdate.value <= props.pendingThresholdHours) return 'fresh'
  if (hoursSinceUpdate.value <= props.inactiveThresholdHours) return 'pending'
  return 'stale'
})

const stateMeta = computed(() => {
  if (state.value === 'fresh') {
    return { label: 'Aktif', color: 'success' }
  }
  if (state.value === 'pending') {
    return { label: 'Beklemede', color: 'amber-darken-2' }
  }
  return { label: 'Gecikmeli', color: 'red-darken-2' }
})

const lastUpdateLabel = computed(() => formatAbsolute(props.lastUpdate))
const relativeHint = computed(() => `Son paket ${formatRelativeAgo(props.lastUpdate, props.now)} alındı`)
</script>

<style scoped>
.freshness-indicator {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.22);
  transition: border 0.3s ease, background 0.3s ease;
}

.freshness-indicator.fresh {
  border-color: rgba(45, 212, 191, 0.45);
  box-shadow: 0 12px 24px rgba(14, 165, 233, 0.15);
}

.freshness-indicator.pending {
  border-color: rgba(251, 191, 36, 0.35);
}

.freshness-indicator.stale {
  border-color: rgba(248, 113, 113, 0.4);
}

.indicator-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.indicator-label {
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.86);
}

.indicator-values {
  display: flex;
  align-items: center;
  gap: 10px;
}

.indicator-chip {
  font-weight: 600;
  text-transform: none;
}

.indicator-time {
  font-size: 14px;
  color: rgba(148, 163, 184, 0.9);
}

.indicator-meta {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.8);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.indicator-window {
  color: rgba(226, 232, 240, 0.75);
}
</style>
