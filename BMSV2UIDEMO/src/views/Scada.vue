<template>
  <v-container fluid class="scada-wrapper" tag="section">
    <header class="scada-header">
      <div>
        <p class="header-eyebrow">Gerçek zamanlı izleme merkezi</p>
        <h1>SCADA gözetim ekranı</h1>
        <p class="header-subtitle">
          Tüm su ve elektrik sayaçları tek panelde. Canlı paketler, coğrafi harita ve olay akışı anlık güncellenir.
        </p>
      </div>
      <div class="header-actions">
        <v-btn-toggle v-model="resourceFilter" mandatory rounded="pill" class="resource-toggle" color="primary">
          <v-btn value="all" variant="text">
            <v-icon size="18">public</v-icon>
            <span>Tümü</span>
          </v-btn>
          <v-btn value="water" variant="text">
            <v-icon size="18">water_drop</v-icon>
            <span>Su</span>
          </v-btn>
          <v-btn value="electric" variant="text">
            <v-icon size="18">bolt</v-icon>
            <span>Elektrik</span>
          </v-btn>
        </v-btn-toggle>
        <v-chip prepend-icon="schedule" class="pulse-chip" variant="flat">
          Son paket: {{ lastEventRelative }}
        </v-chip>
      </div>
    </header>

    <section class="scada-grid">
      <div class="map-column">
        <div class="map-card">
          <ScadaMap
            :meters="displayedMeters"
            :selected-meter-id="selectedMeterId"
            @select-meter="telemetryStore.setActiveMeter"
          />
          <div class="map-overlay">
            <div class="overlay-card">
              <div class="overlay-title">Sayaç özetleri</div>
              <div class="overlay-metrics">
                <div class="overlay-metric">
                  <span class="metric-label">Aktif sayaç</span>
                  <span class="metric-value">{{ meterCounts.all }}</span>
                </div>
                <div class="overlay-metric">
                  <span class="metric-label">Su</span>
                  <span class="metric-value">{{ meterCounts.water }}</span>
                </div>
                <div class="overlay-metric">
                  <span class="metric-label">Elektrik</span>
                  <span class="metric-value">{{ meterCounts.electric }}</span>
                </div>
              </div>
              <div class="overlay-foot">
              <v-icon size="18">sensors</v-icon>
              <span>Harita katmanı paket geldikçe yeşil ışıkla yanar.</span>
            </div>
          </div>
          </div>
        </div>
      </div>

      <div class="event-column">
        <v-card class="event-feed" elevation="0">
          <div class="event-header">
            <div>
              <h2>Canlı olay akışı</h2>
              <span class="event-subtitle">Son 30 paket içindeki kritik durumlar</span>
            </div>
            <v-chip :color="trendColor" variant="flat" size="small" class="trend-chip">
              <v-icon size="16">monitor_heart</v-icon>
              <span>{{ activeLoadLabel }}</span>
            </v-chip>
          </div>
          <v-divider class="my-3" />
          <div class="event-list">
            <div
              v-for="event in liveEvents"
              :key="event.id"
              class="event-item"
              :class="[`tone-${event.tone}`, { 'is-active': event.meterId === selectedMeterId }]"
              @click="telemetryStore.setActiveMeter(event.meterId)"
            >
              <div class="event-timestamp">{{ formatClock(event.timestamp) }}</div>
              <div class="event-body">
                <div class="event-title">{{ event.message }}</div>
                <div class="event-meta">
                  <span>{{ event.meterLabel }} • {{ event.zone }}</span>
                  <span>{{ event.communication }}</span>
                  <span>RSSI {{ event.signal }}</span>
                </div>
              </div>
              <div class="event-health">
                <v-icon size="16">monitor_heart</v-icon>
                <span>{{ event.healthScore }}%</span>
              </div>
            </div>
            <div v-if="!liveEvents.length" class="event-empty">
              <v-icon size="48">satellite_alt</v-icon>
              <p>Henüz veri yok. Telemetri simülasyonu bağlantı kurulunca otomatik başlayacak.</p>
            </div>
          </div>
        </v-card>

        <v-card class="requirements-card" elevation="0">
          <h2>SCADA gereklilikleri</h2>
          <ul>
            <li v-for="req in scadaRequirements" :key="req.title">
              <div class="req-title">{{ req.title }}</div>
              <p>{{ req.description }}</p>
            </li>
          </ul>
        </v-card>
      </div>
    </section>

    <section class="detail-grid" v-if="selectedMeter">
      <v-card class="detail-card" elevation="0">
        <header class="detail-header">
          <div>
            <p class="detail-eyebrow">Aktif sayaç</p>
            <h2>{{ selectedMeter.id }}</h2>
            <span>{{ selectedMeter.zone }} • {{ selectedMeter.location }}</span>
          </div>
          <v-chip :color="selectedTone" variant="flat" class="status-chip">
            <v-icon size="16">sensors</v-icon>
            <span>{{ selectedStatusLabel }}</span>
          </v-chip>
        </header>

        <div class="detail-body">
          <div class="detail-column">
            <div class="detail-field">
              <span>Son iletişim</span>
              <strong>{{ formatClock(selectedMeter.lastCommunication) }}</strong>
            </div>
            <div class="detail-field">
              <span>İletişim tipi</span>
              <strong>{{ selectedMeter.communication }}</strong>
            </div>
            <div class="detail-field">
              <span>Batarya</span>
              <strong>{{ selectedMeter.battery }}</strong>
            </div>
          </div>
          <div class="detail-column">
            <div class="detail-field">
              <span>Güncel tüketim</span>
              <strong>{{ selectedMeter.lastReading }}</strong>
            </div>
            <div class="detail-field">
              <span>Son 24 saat</span>
              <strong>
                {{ selectedMeter.consumption.last24h }}
                {{ selectedMeter.type === 'water' ? 'm³' : 'kWh' }}
              </strong>
            </div>
            <div class="detail-field">
              <span>Önceki 24 saat</span>
              <strong>
                {{ selectedMeter.consumption.previous24h }}
                {{ selectedMeter.type === 'water' ? 'm³' : 'kWh' }}
              </strong>
            </div>
          </div>
        </div>
      </v-card>
    </section>
  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import ScadaMap from '../components/scada/ScadaMap.vue'
import { scadaRequirements, useTelemetryStore } from '../store/telemetry'

const telemetryStore = useTelemetryStore()
const resourceFilter = ref('all')
const meterCounts = computed(() => telemetryStore.meterCounts)
const liveEvents = computed(() => telemetryStore.liveEvents)
const displayedMeters = computed(() => telemetryStore.getMetersByType(resourceFilter.value))
const selectedMeterId = computed(() => telemetryStore.activeMeterId)
const selectedMeter = computed(() => telemetryStore.activeMeter)

const lastEventRelative = computed(() => {
  if (!telemetryStore.lastEventAt) return 'bekleniyor'
  const value = telemetryStore.lastEventAt
  if (!value) return 'bekleniyor'
  const diff = Date.now() - new Date(value).getTime()
  if (diff < 60000) return 'az önce'
  if (diff < 3600000) return `${Math.round(diff / 60000)} dk önce`
  return `${Math.round(diff / 3600000)} sa önce`
})

const trendColor = computed(() => {
  if (!liveEvents.value.length) return 'info'
  const last = liveEvents.value[0]
  if (last.severity === 'alarm') return 'error'
  if (last.severity === 'warning') return 'warning'
  return 'success'
})

const activeLoadLabel = computed(() => {
  if (!liveEvents.value.length) return 'Hat beklemede'
  const last = liveEvents.value[0]
  if (last.severity === 'alarm') return 'Alarm yoğunluğu arttı'
  if (last.severity === 'warning') return 'Saha gözlem altında'
  return 'Akış stabil'
})

const formatClock = (timestamp) => {
  if (!timestamp) return '—'
  return new Date(timestamp).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const selectedStatusLabel = computed(() => {
  if (!selectedMeter.value) return ''
  switch (selectedMeter.value.status) {
    case 'alarm':
      return 'Kritik alarm'
    case 'warning':
      return 'Uyarı durumu'
    default:
      return 'Stabil'
  }
})

const selectedTone = computed(() => {
  if (!selectedMeter.value) return 'primary'
  if (selectedMeter.value.status === 'alarm') return 'error'
  if (selectedMeter.value.status === 'warning') return 'warning'
  return 'success'
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

.scada-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 12px;
  padding-bottom: 32px;
}

.scada-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
}

.header-eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--muted-text);
  margin-bottom: 6px;
}

.scada-header h1 {
  margin: 0;
  font-size: 28px;
  color: var(--heading-color);
}

.header-subtitle {
  margin: 8px 0 0;
  color: var(--muted-text);
  max-width: 620px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.resource-toggle {
  background: var(--surface-elevated);
  border-radius: 999px;
  padding: 4px;
  box-shadow: inset 0 0 0 1px var(--border-soft);
}

.resource-toggle :deep(.v-btn) {
  font-weight: 600;
  letter-spacing: 0.2px;
}

.pulse-chip {
  background: var(--accent-surface);
  color: var(--accent-color);
  font-weight: 600;
  box-shadow: 0 12px 26px rgba(37, 99, 235, 0.22);
}

.scada-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.map-card {
  position: relative;
  height: 520px;
}

.map-overlay {
  position: absolute;
  top: 24px;
  left: 24px;
  display: flex;
  gap: 16px;
}

.overlay-card {
  backdrop-filter: blur(18px);
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  padding: 18px 20px;
  min-width: 220px;
  color: #e2e8f0;
  box-shadow: 0 18px 36px rgba(8, 15, 31, 0.55);
}

.overlay-title {
  font-size: 14px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  opacity: 0.8;
}

.overlay-metrics {
  display: flex;
  gap: 18px;
  margin: 16px 0;
}

.overlay-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.overlay-metric .metric-label {
  font-size: 12px;
  opacity: 0.7;
}

.overlay-metric .metric-value {
  font-size: 24px;
  font-weight: 700;
}

.overlay-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  opacity: 0.85;
}

.event-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.event-feed {
  padding: 24px;
  border-radius: 24px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
}

.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.event-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--heading-color);
}

.event-subtitle {
  color: var(--muted-text);
}

.trend-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: inherit;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 8px;
}

.event-item {
  border-radius: 18px;
  padding: 14px 16px;
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 18px;
  align-items: center;
  background: var(--surface-elevated);
  border: 1px solid transparent;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.event-item:hover {
  transform: translateY(-2px);
  border-color: var(--border-soft);
  box-shadow: 0 18px 26px rgba(15, 23, 42, 0.18);
}

.event-item.is-active {
  border-color: var(--accent-color);
  box-shadow: 0 22px 36px rgba(59, 130, 246, 0.25);
}

.event-timestamp {
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
  color: var(--muted-text);
}

.event-title {
  font-weight: 600;
  color: var(--heading-color);
}

.event-meta {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: var(--muted-text);
}

.event-health {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: var(--heading-color);
}

.event-empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--muted-text);
  display: grid;
  gap: 12px;
  place-items: center;
}

.tone-info {
  border-left: 4px solid rgba(56, 189, 248, 0.6);
}

.tone-warning {
  border-left: 4px solid rgba(251, 146, 60, 0.6);
}

.tone-alarm {
  border-left: 4px solid rgba(248, 113, 113, 0.7);
}

.requirements-card {
  padding: 24px;
  border-radius: 24px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
}

.requirements-card h2 {
  margin: 0 0 16px;
  color: var(--heading-color);
}

.requirements-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.requirements-card li {
  background: var(--surface-elevated);
  border-radius: 16px;
  padding: 14px 16px;
  border: 1px solid var(--border-soft);
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.12);
}

.req-title {
  font-weight: 600;
  color: var(--heading-color);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
}

.detail-card {
  padding: 24px;
  border-radius: 24px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-header h2 {
  margin: 4px 0;
  font-size: 24px;
  color: var(--heading-color);
}

.detail-eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--muted-text);
}

.status-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: inherit;
}

.detail-body {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.detail-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-field span {
  display: block;
  font-size: 12px;
  color: var(--muted-text);
}

.detail-field strong {
  font-size: 18px;
  color: var(--heading-color);
}

@media (max-width: 1280px) {
  .scada-grid {
    grid-template-columns: 1fr;
  }

  .map-card {
    height: 420px;
  }

  .event-column {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .event-feed,
  .requirements-card {
    flex: 1 1 100%;
  }
}

@media (max-width: 960px) {
  .scada-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .map-overlay {
    position: static;
    margin-top: 16px;
  }

  .overlay-card {
    width: 100%;
  }
}
</style>
