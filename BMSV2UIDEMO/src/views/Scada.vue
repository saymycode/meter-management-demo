<template>
  <v-container fluid class="scada-page" tag="section">
    <header class="page-header">
      <div class="heading-block">
        <p class="eyebrow">SCADA izleme kontrolü</p>
        <h1>Canlı saha haritası</h1>
        <p class="description">
          Şebekedeki tüm su ve elektrik sayaçlarını tek ekranda takip edin. Harita üstünde lokasyonları,
          sağ panelde ise gelen tüm telemetri paketlerini canlı olarak görürsünüz.
        </p>
      </div>
      <div class="header-actions">
        <v-btn-toggle
          v-model="resourceFilter"
          mandatory
          rounded="pill"
          class="resource-toggle"
          color="primary"
        >
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
        <v-chip prepend-icon="update" class="last-update" variant="flat">
          Son paket: {{ lastEventRelative }}
        </v-chip>
      </div>
    </header>

    <section class="content-grid">
      <v-card class="map-panel" elevation="0">
        <div class="map-shell">
          <ScadaMap
            v-if="displayedMeters.length"
            :meters="displayedMeters"
            :selected-meter-id="selectedMeterId"
            @select-meter="telemetryStore.setActiveMeter"
          />
          <div v-else class="map-empty">
            <v-icon size="64">satellite_alt</v-icon>
            <p>Kayıtlı sayaç bulunamadı. Telemetri kaynağını kontrol edin.</p>
          </div>

          <aside class="map-infobar">
            <div class="infobar-header">
              <h2>Aktif sayaçlar</h2>
              <v-chip color="success" size="small" variant="flat">
                {{ displayedMeters.length }} aktif
              </v-chip>
            </div>
            <div class="infobar-metrics">
              <div class="metric-box">
                <span class="metric-label">Toplam</span>
                <strong class="metric-value">{{ meterCounts.all }}</strong>
              </div>
              <div class="metric-box">
                <span class="metric-label">Su</span>
                <strong class="metric-value">{{ meterCounts.water }}</strong>
              </div>
              <div class="metric-box">
                <span class="metric-label">Elektrik</span>
                <strong class="metric-value">{{ meterCounts.electric }}</strong>
              </div>
            </div>
            <div class="legend">
              <p>Durum göstergesi</p>
              <ul>
                <li>
                  <span class="legend-dot legend-ok"></span>
                  <span>Stabil</span>
                </li>
                <li>
                  <span class="legend-dot legend-warning"></span>
                  <span>Uyarı</span>
                </li>
                <li>
                  <span class="legend-dot legend-alarm"></span>
                  <span>Kritik alarm</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </v-card>

      <div class="side-panels">
        <v-card class="events-panel" elevation="0">
          <header class="panel-header">
            <div>
              <h2>Canlı olay akışı</h2>
              <p class="panel-subtitle">Son 30 telemetri paketindeki değişiklikler</p>
            </div>
            <v-chip :color="trendColor" size="small" variant="flat" class="trend-chip">
              <v-icon size="16">monitor_heart</v-icon>
              <span>{{ activeLoadLabel }}</span>
            </v-chip>
          </header>
          <v-divider class="my-4" />
          <div class="event-list">
            <article
              v-for="event in liveEvents"
              :key="event.id"
              :class="['event-row', `tone-${event.tone}`, { active: event.meterId === selectedMeterId }]"
              @click="telemetryStore.setActiveMeter(event.meterId)"
            >
              <div class="event-time">{{ formatClock(event.timestamp) }}</div>
              <div class="event-message">
                <h3>{{ event.message }}</h3>
                <p>{{ event.meterLabel }} • {{ event.zone }} • {{ event.communication }}</p>
              </div>
              <div class="event-meta">
                <span>RSSI {{ event.signal }}</span>
                <strong>{{ event.healthScore }}%</strong>
              </div>
            </article>
            <div v-if="!liveEvents.length" class="event-empty">
              <v-icon size="48">motion_photos_pause</v-icon>
              <p>Henüz veri yok. Simülasyon başladığında olaylar burada görünecek.</p>
            </div>
          </div>
        </v-card>

        <v-card class="requirements-panel" elevation="0">
          <header class="panel-header">
            <div>
              <h2>SCADA gereksinimleri</h2>
              <p class="panel-subtitle">Alarm ve saha operasyonlarına temel kurallar</p>
            </div>
          </header>
          <v-divider class="my-4" />
          <ul class="requirements-list">
            <li v-for="req in scadaRequirements" :key="req.title">
              <span class="req-title">{{ req.title }}</span>
              <p>{{ req.description }}</p>
            </li>
          </ul>
        </v-card>
      </div>
    </section>

    <section v-if="selectedMeter" class="detail-section">
      <v-card class="detail-card" elevation="0">
        <header class="detail-header">
          <div>
            <p class="eyebrow">Aktif sayaç</p>
            <h2>{{ selectedMeter.id }}</h2>
            <span class="detail-location">{{ selectedMeter.zone }} • {{ selectedMeter.location }}</span>
          </div>
          <v-chip :color="selectedTone" class="status-chip" variant="flat">
            <v-icon size="16">sensors</v-icon>
            <span>{{ selectedStatusLabel }}</span>
          </v-chip>
        </header>
        <div class="detail-grid">
          <dl>
            <dt>Son iletişim</dt>
            <dd>{{ formatClock(selectedMeter.lastCommunication) }}</dd>
          </dl>
          <dl>
            <dt>İletişim tipi</dt>
            <dd>{{ selectedMeter.communication }}</dd>
          </dl>
          <dl>
            <dt>Batarya</dt>
            <dd>{{ selectedMeter.battery }}</dd>
          </dl>
          <dl>
            <dt>Güncel tüketim</dt>
            <dd>{{ selectedMeter.lastReading }}</dd>
          </dl>
          <dl>
            <dt>Son 24 saat</dt>
            <dd>
              {{ selectedMeter.consumption.last24h }}
              {{ selectedMeter.type === 'water' ? 'm³' : 'kWh' }}
            </dd>
          </dl>
          <dl>
            <dt>Önceki 24 saat</dt>
            <dd>
              {{ selectedMeter.consumption.previous24h }}
              {{ selectedMeter.type === 'water' ? 'm³' : 'kWh' }}
            </dd>
          </dl>
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

const liveEvents = computed(() => telemetryStore.liveEvents)
const meterCounts = computed(() => telemetryStore.meterCounts)
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
.scada-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom: 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 32px;
}

.heading-block h1 {
  margin: 0;
  font-size: 32px;
  color: var(--heading-color);
}

.eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--muted-text);
  margin-bottom: 6px;
}

.description {
  margin: 8px 0 0;
  color: var(--muted-text);
  max-width: 640px;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
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

.last-update {
  background: var(--accent-surface);
  color: var(--accent-color);
  font-weight: 600;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.map-panel {
  padding: 0;
  border-radius: 28px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
}

.map-shell {
  position: relative;
  height: 540px;
}

.map-empty {
  height: 100%;
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--muted-text);
}

.map-infobar {
  position: absolute;
  top: 24px;
  left: 24px;
  width: 260px;
  backdrop-filter: blur(16px);
  background: rgba(15, 23, 42, 0.55);
  border-radius: 24px;
  padding: 20px;
  color: #e2e8f0;
  box-shadow: 0 22px 45px rgba(8, 15, 31, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.25);
  pointer-events: none;
}

.infobar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.infobar-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 18px 0;
}

.metric-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 12px;
  opacity: 0.75;
}

.metric-value {
  font-size: 22px;
  font-weight: 700;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
}

.legend ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 12px currentColor;
}

.legend-ok {
  color: #34d399;
}

.legend-warning {
  color: #f97316;
}

.legend-alarm {
  color: #f87171;
}

.side-panels {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.events-panel,
.requirements-panel {
  padding: 24px;
  border-radius: 24px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.panel-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--heading-color);
}

.panel-subtitle {
  margin: 6px 0 0;
  color: var(--muted-text);
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 8px;
}

.event-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 18px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid transparent;
  background: var(--surface-elevated);
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.event-row h3 {
  margin: 0 0 4px;
  font-size: 15px;
  color: var(--heading-color);
}

.event-row p {
  margin: 0;
  font-size: 13px;
  color: var(--muted-text);
}

.event-row .event-time {
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
  color: var(--muted-text);
}

.event-row .event-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-size: 13px;
  color: var(--muted-text);
}

.event-row strong {
  font-size: 16px;
  color: var(--heading-color);
}

.event-row.active {
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.event-row.tone-warning {
  border-left: 3px solid #f97316;
}

.event-row.tone-alarm {
  border-left: 3px solid #ef4444;
}

.event-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 12px;
  color: var(--muted-text);
}

.requirements-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.req-title {
  font-weight: 600;
  color: var(--heading-color);
}

.detail-section {
  display: flex;
}

.detail-card {
  width: 100%;
  padding: 28px;
  border-radius: 28px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 24px;
}

.detail-header h2 {
  margin: 0;
  font-size: 26px;
  color: var(--heading-color);
}

.detail-location {
  color: var(--muted-text);
}

.status-chip {
  font-weight: 600;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
}

.detail-grid dl {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

dt {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--muted-text);
}

dd {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--heading-color);
}

@media (max-width: 1280px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .map-shell {
    height: 420px;
  }
}

@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .map-infobar {
    position: static;
    width: 100%;
    margin-top: 16px;
  }

  .map-shell {
    display: flex;
    flex-direction: column;
    height: auto;
  }
}
</style>
