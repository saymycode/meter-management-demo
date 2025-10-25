<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-container fluid class="sensor-dashboard" tag="section">
    <section class="sensor-header">
      <div class="header-left">
        <div class="header-chip">{{ organization.scope }} • Sensör listesi</div>
        <h1>Kurumsal sayaç yönetimi</h1>
        <p>
          ASKİ'ye bağlı su ve elektrik sayaçları gün içinde rastgele saatlerde paket gönderir. Bu
          ekran yalnızca kurumunuza ait LoRa ve GPRS sayaçlarını gösterir; farklı organizasyonların
          verileri görünmez.
        </p>
        <div class="header-meta">
          <DataFreshnessIndicator
            :last-update="lastPacket"
            :now="now"
            :pending-threshold-hours="24"
            :inactive-threshold-hours="48"
            title="Son veri"
          />
          <div class="meta-grid">
            <div class="meta-item" v-for="meta in headerMetrics" :key="meta.label">
              <span class="meta-label">{{ meta.label }}</span>
              <span class="meta-value">{{ meta.value }}</span>
              <span class="meta-hint">{{ meta.hint }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="summary-item">
          <span class="summary-label">Toplam sayaç</span>
          <span class="summary-value">{{ totalSensors.toLocaleString('tr-TR') }}</span>
        </div>
        <div class="summary-split">
          <div>
            <span class="summary-label">LoRa</span>
            <span class="summary-value">{{
              communicationBreakdown.LoRa.toLocaleString('tr-TR')
            }}</span>
          </div>
          <div>
            <span class="summary-label">GPRS</span>
            <span class="summary-value">{{
              communicationBreakdown.GPRS.toLocaleString('tr-TR')
            }}</span>
          </div>
        </div>
        <div class="summary-note">
          <v-icon icon="bolt" size="18" />
          <span
            >Veriler canlı değil; her sayaç 24 saatlik pencere içinde rastgele saatlerde
            görünür.</span
          >
        </div>
      </div>
    </section>

    <v-row class="sensor-content" no-gutters>
      <v-col cols="12" md="3" class="filter-column">
        <v-card class="filter-card" elevation="0">
          <div class="filter-header">
            <h2>Filtreler</h2>
            <v-btn density="comfortable" variant="text" @click="resetFilters">Temizle</v-btn>
          </div>
          <div class="filter-group">
            <span class="filter-title">Durum</span>
            <v-chip-group v-model="selectedStatuses" column multiple>
              <v-chip
                v-for="status in statusOptions"
                :key="status"
                :value="status"
                class="filter-chip"
                color="primary"
                filter
                variant="tonal"
              >
                {{ status }}
              </v-chip>
            </v-chip-group>
          </div>
          <div class="filter-group">
            <span class="filter-title">Veri tazeliği</span>
            <v-chip-group v-model="selectedFreshness" column multiple>
              <v-chip
                v-for="option in freshnessOptions"
                :key="option"
                :value="option"
                class="filter-chip"
                color="teal"
                filter
                variant="tonal"
              >
                {{ option }}
              </v-chip>
            </v-chip-group>
          </div>
          <div class="filter-group">
            <span class="filter-title">İletişim</span>
            <v-chip-group v-model="selectedComm" column multiple>
              <v-chip
                v-for="comm in communicationOptions"
                :key="comm"
                :value="comm"
                class="filter-chip"
                color="blue"
                filter
                variant="tonal"
              >
                {{ comm }}
              </v-chip>
            </v-chip-group>
          </div>
          <div class="filter-group">
            <span class="filter-title">Sayaç tipi</span>
            <v-chip-group v-model="selectedTypes" column multiple>
              <v-chip
                v-for="type in typeOptions"
                :key="type"
                :value="type"
                class="filter-chip"
                color="purple"
                filter
                variant="tonal"
              >
                {{ type }}
              </v-chip>
            </v-chip-group>
          </div>
          <div class="filter-group">
            <span class="filter-title">Bölgeler</span>
            <v-chip-group v-model="selectedZones" column multiple>
              <v-chip
                v-for="zone in zoneOptions"
                :key="zone"
                :value="zone"
                class="filter-chip"
                color="amber"
                filter
                variant="tonal"
              >
                {{ zone }}
              </v-chip>
            </v-chip-group>
          </div>
        </v-card>

        <v-card class="plan-card" elevation="0">
          <div class="plan-header">
            <h2>Arayüz tutarlılık planı</h2>
            <span>Sensor ekranı için görsel prensipler</span>
          </div>
          <v-list density="compact" class="plan-list">
            <v-list-item>
              <v-list-item-title
                >• Koyu kartlar, neon aksanlar ve yuvarlatılmış köşeler HomeView ile
                aynıdır.</v-list-item-title
              >
            </v-list-item>
            <v-list-item>
              <v-list-item-title
                >• Veri tazeliği çip renkleri (yeşil/sarı/kırmızı) hem grid hem kart görünümünde
                tekrar eder.</v-list-item-title
              >
            </v-list-item>
            <v-list-item>
              <v-list-item-title
                >• Tipografi hiyerarşisi: başlıklar 20px, etiketler 13px üst-alt
                boşluklu.</v-list-item-title
              >
            </v-list-item>
            <v-list-item>
              <v-list-item-title
                >• Kart geçişlerinde hafif gölge ve hover ışımaları kullanılır; animasyonlar
                160ms.</v-list-item-title
              >
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="9" class="list-column">
        <v-card class="list-card" elevation="0">
          <div class="list-toolbar">
            <v-text-field
              v-model="searchTerm"
              class="toolbar-search"
              density="comfortable"
              hide-details
              label="Sayaç, bölge veya adres ara"
              prepend-inner-icon="search"
              variant="outlined"
              clearable
            />
            <div class="toolbar-actions">
              <v-select
                v-model="selectedGroupBy"
                :items="groupByOptions"
                class="group-select"
                density="comfortable"
                hide-details
                label="Grupla"
                multiple
                chips
                clearable
                variant="outlined"
              />
              <v-btn variant="text" @click="selectAllRows">Tümünü seç</v-btn>
              <v-btn
                color="primary"
                prepend-icon="assignment"
                variant="flat"
                :disabled="selectedRows.length === 0"
                @click="openWorkOrder"
              >
                İş emri planla
              </v-btn>
              <v-btn-toggle v-model="viewMode" class="view-toggle" density="comfortable" mandatory>
                <v-btn value="table" icon="table" />
                <v-btn value="cards" icon="grid_view" />
              </v-btn-toggle>
            </div>
          </div>

          <div class="list-meta">
            <v-chip class="meta-chip" color="primary" variant="tonal"
              >Toplam: {{ filteredStats.total }}</v-chip
            >
            <v-chip class="meta-chip" color="success" variant="tonal"
              >Aktif: {{ filteredStats.active }}</v-chip
            >
            <v-chip class="meta-chip" color="amber-darken-2" variant="tonal"
              >Beklemede: {{ filteredStats.pending }}</v-chip
            >
            <v-chip class="meta-chip" color="red-darken-2" variant="tonal"
              >Pasif: {{ filteredStats.inactive }}</v-chip
            >
          </div>

          <div v-if="viewMode === 'table'" class="grid-wrapper">
            <v-data-table
              v-model:selected="selectedRows"
              :headers="tableHeaders"
              :items="filteredSensors"
              :group-by="tableGroupBy"
              :sort-by="tableSortBy"
              :items-per-page="10"
              class="sensor-data-table"
              density="comfortable"
              item-value="sensorId"
              return-object
              show-select
              hover
              fixed-header
            >
              <template #item.sensorId="{ item }">
                <div class="cell-primary">
                  <span class="cell-id">{{ item.sensorId }}</span>
                  <span class="cell-zone">{{ item.zone }}</span>
                </div>
              </template>
              <template #item.status="{ item }">
                <v-chip :color="statusChipColor(item.status)" size="small" variant="tonal">
                  {{ item.status }}
                </v-chip>
              </template>
              <template #item.freshnessBucket="{ item }">
                <v-chip :color="item.freshnessChip" size="small" variant="tonal">
                  {{ item.freshnessBadge }}
                </v-chip>
              </template>
              <template #item.lastPacketDisplay="{ item }">
                <div class="cell-secondary">
                  <span>{{ item.lastPacketDisplay }}</span>
                  <small>{{ item.location }}</small>
                </div>
              </template>
              <template #no-data>
                <div class="no-data">Filtrelere uyan sayaç bulunamadı.</div>
              </template>
            </v-data-table>
          </div>

          <div v-else class="card-grid">
            <v-row dense>
              <v-col v-for="sensor in filteredSensors" :key="sensor.sensorId" cols="12" sm="6">
                <div class="sensor-card" :class="sensor.freshnessLevel">
                  <div class="sensor-card-header">
                    <div>
                      <span class="sensor-id">{{ sensor.sensorId }}</span>
                      <span class="sensor-zone">{{ sensor.zone }}</span>
                    </div>
                    <v-chip :color="sensor.freshnessChip" size="small" variant="tonal">{{
                      sensor.freshnessBadge
                    }}</v-chip>
                  </div>
                  <div class="sensor-card-body">
                    <div class="sensor-row">
                      <span class="sensor-label">Tip</span>
                      <span class="sensor-value"
                        >{{ sensor.typeLabel }} • {{ sensor.commMethod }}</span
                      >
                    </div>
                    <div class="sensor-row">
                      <span class="sensor-label">Son veri</span>
                      <span class="sensor-value">{{ sensor.lastPacketDisplay }}</span>
                    </div>
                    <div class="sensor-row">
                      <span class="sensor-label">Konum</span>
                      <span class="sensor-value">{{ sensor.location }}</span>
                    </div>
                    <div class="sensor-row">
                      <span class="sensor-label">Okuma</span>
                      <span class="sensor-value">{{ sensor.lastReading }}</span>
                    </div>
                    <div class="sensor-row">
                      <span class="sensor-label">Batarya / Sinyal</span>
                      <span class="sensor-value">{{ sensor.battery }} • {{ sensor.signal }}</span>
                    </div>
                  </div>
                  <v-sparkline
                    :model-value="sensor.sparkline"
                    :smooth="12"
                    :line-width="3"
                    auto-draw
                    class="sensor-sparkline"
                    color="rgba(59,130,246,0.6)"
                  />
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card>

        <v-card class="map-card" elevation="0">
          <div class="map-header">
            <div>
              <h2>Konum görünümü</h2>
              <span class="map-subtitle"
                >Son paket: {{ lastPacketLabel }} • {{ lastPacketAgo }}</span
              >
            </div>
            <v-chip prepend-icon="my_location" size="small" variant="tonal">Kurum kapsamı</v-chip>
          </div>
          <div id="sensor-map" class="map-container" />
          <div class="map-legend">
            <div class="legend-item"><span class="legend-dot active" /> Aktif</div>
            <div class="legend-item"><span class="legend-dot pending" /> Beklemede</div>
            <div class="legend-item"><span class="legend-dot inactive" /> Pasif</div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <v-navigation-drawer
    v-model="workOrderPanel"
    location="right"
    width="420"
    temporary
    scrim="false"
    elevation="10"
  >
    <v-card flat>
      <v-card-title class="drawer-title">
        <span>İş emri planla</span>
        <v-btn icon="close" variant="text" @click="workOrderPanel = false" />
      </v-card-title>
      <v-divider />
      <v-card-text>
        <div class="drawer-summary">
          Seçili sayaç sayısı: <strong>{{ selectedRows.length }}</strong>
        </div>
        <v-select
          v-model="selectedWorkOrderType"
          :items="workOrderTypes"
          label="İş emri tipi"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />
        <template v-if="selectedWorkOrderType === 'Kalibrasyon'">
          <v-text-field
            v-model="workOrderPayload.calibrationCode"
            label="Kalibrasyon kodu"
            variant="outlined"
          />
        </template>
        <template v-else-if="selectedWorkOrderType === 'Firmware Güncelleme'">
          <v-text-field
            v-model="workOrderPayload.firmwareVersion"
            label="Hedef sürüm"
            variant="outlined"
          />
        </template>
        <template v-else-if="selectedWorkOrderType === 'Sensör Sıfırlama'">
          <v-text-field
            v-model="workOrderPayload.resetReason"
            label="Sıfırlama nedeni"
            variant="outlined"
          />
        </template>
        <v-textarea
          v-model="workOrderPayload.description"
          label="Açıklama"
          variant="outlined"
          rows="3"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="workOrderPanel = false">İptal</v-btn>
        <v-btn color="primary" variant="flat" @click="confirmWorkOrder">Gönder</v-btn>
      </v-card-actions>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import DataFreshnessIndicator from '@/components/common/DataFreshnessIndicator.vue'
import { meterSnapshots, organizationProfile, referenceNow } from '@/data/mockMeters'
import { formatAbsolute, formatClock, formatRelativeAgo, hoursBetween, toDate } from '@/utils/time'
const organization = organizationProfile
const now = ref(new Date(referenceNow))
const route = useRoute()

const statusOptions = ['Aktif', 'Beklemede', 'Pasif']
const freshnessOptions = ['< 24 saat', '24-48 saat', '48+ saat']
const communicationOptions = ['LoRa', 'GPRS']
const typeOptions = ['Su', 'Elektrik']

const selectedStatuses = ref([])
const selectedFreshness = ref([])
const selectedComm = ref([])
const selectedTypes = ref([])
const selectedZones = ref([])
const selectedGroupBy = ref([])
const searchTerm = ref('')

const rawSensors = ref(meterSnapshots)

const groupByOptions = [
  { title: 'Bölgeler', value: 'zone' },
  { title: 'Durum', value: 'status' },
  { title: 'İletişim', value: 'commMethod' },
  { title: 'Sayaç tipi', value: 'typeLabel' },
]

const tableHeaders = [
  { title: 'Sayaç', key: 'sensorId', sortable: true },
  { title: 'Tip', key: 'typeLabel', sortable: true },
  { title: 'İletişim', key: 'commMethod', sortable: true },
  { title: 'Durum', key: 'status', sortable: true },
  { title: 'Veri tazeliği', key: 'freshnessBucket', sortable: true },
  { title: 'Son veri', key: 'lastPacketDisplay', sortable: false },
  { title: 'Okuma', key: 'lastReading', sortable: true },
  { title: 'Batarya', key: 'battery', sortable: true },
  { title: 'Sinyal', key: 'signal', sortable: true },
]

const tableSortBy = ref([{ key: 'sensorId', order: 'asc' }])

const tableGroupBy = computed(() => selectedGroupBy.value.map((value) => ({ key: value })))

const statusChipColor = (status) => {
  if (status === 'Aktif') return 'success'
  if (status === 'Beklemede') return 'amber-darken-2'
  return 'red-darken-2'
}

const classifyStatus = (lastCommunication) => {
  const hours = hoursBetween(lastCommunication, now.value)
  if (hours <= 24) return 'Aktif'
  if (hours <= 48) return 'Beklemede'
  return 'Pasif'
}

const classifyFreshness = (lastCommunication) => {
  const hours = hoursBetween(lastCommunication, now.value)
  if (hours <= 24) return '< 24 saat'
  if (hours <= 48) return '24-48 saat'
  return '48+ saat'
}

const sensorRecords = computed(() =>
  rawSensors.value.map((meter) => {
    const lastPacket = toDate(meter.lastCommunication)
    const status = classifyStatus(lastPacket)
    const freshness = classifyFreshness(lastPacket)
    const typeLabel = meter.type === 'water' ? 'Su' : 'Elektrik'
    const freshnessMap = {
      '< 24 saat': { badge: 'Takvimde', chip: 'success', level: 'on-time' },
      '24-48 saat': { badge: 'Beklemede', chip: 'amber-darken-2', level: 'delayed' },
      '48+ saat': { badge: 'Pasif', chip: 'red-darken-2', level: 'missed' },
    }
    const mapping = freshnessMap[freshness]

    return {
      sensorId: meter.id,
      zone: meter.zone,
      location: meter.location,
      commMethod: meter.communication,
      type: meter.type,
      typeLabel,
      lastReading: meter.lastReading ?? '-',
      battery: meter.battery ?? '—',
      signal: meter.signal ?? '—',
      window: meter.window ?? 'Dinamik 24s',
      status,
      freshnessBucket: freshness,
      freshnessBadge: mapping.badge,
      freshnessChip: mapping.chip,
      freshnessLevel: mapping.level,
      lastPacketAt: lastPacket,
      lastPacketLabel: formatAbsolute(lastPacket),
      lastPacketAgo: formatRelativeAgo(lastPacket, now.value),
      lastPacketDisplay: `${formatClock(lastPacket)} • ${formatRelativeAgo(lastPacket, now.value)}`,
      commSort: meter.communication,
      sparkline: meter.consumption?.history ?? [],
      lat: meter.lat,
      lng: meter.lng,
    }
  }),
)

const zoneOptions = computed(() => [...new Set(sensorRecords.value.map((sensor) => sensor.zone))])

const filteredSensors = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return sensorRecords.value.filter((sensor) => {
    if (selectedStatuses.value.length && !selectedStatuses.value.includes(sensor.status))
      return false
    if (selectedFreshness.value.length && !selectedFreshness.value.includes(sensor.freshnessBucket))
      return false
    if (selectedComm.value.length && !selectedComm.value.includes(sensor.commMethod)) return false
    if (selectedTypes.value.length && !selectedTypes.value.includes(sensor.typeLabel)) return false
    if (selectedZones.value.length && !selectedZones.value.includes(sensor.zone)) return false

    if (!term) return true
    const haystack =
      `${sensor.sensorId} ${sensor.zone} ${sensor.location} ${sensor.commMethod} ${sensor.status}`.toLowerCase()
    return haystack.includes(term)
  })
})

const filteredStats = computed(() => {
  const stats = { total: filteredSensors.value.length, active: 0, pending: 0, inactive: 0 }
  filteredSensors.value.forEach((sensor) => {
    if (sensor.status === 'Aktif') stats.active += 1
    else if (sensor.status === 'Beklemede') stats.pending += 1
    else stats.inactive += 1
  })
  return stats
})

const totalSensors = computed(() => sensorRecords.value.length)

const communicationBreakdown = computed(() =>
  sensorRecords.value.reduce(
    (acc, sensor) => {
      acc[sensor.commMethod] = (acc[sensor.commMethod] ?? 0) + 1
      return acc
    },
    { LoRa: 0, GPRS: 0 },
  ),
)

const headerMetrics = computed(() => [
  {
    label: 'Aktif sayaç',
    value: `${filteredStats.value.active.toLocaleString('tr-TR')}`,
    hint: `Toplamın %${totalSensors.value ? ((filteredStats.value.active / totalSensors.value) * 100).toFixed(1) : '0.0'}`,
  },
  {
    label: 'Beklemede',
    value: filteredStats.value.pending.toLocaleString('tr-TR'),
    hint: '24-48 saat arası',
  },
  {
    label: 'Pasif',
    value: filteredStats.value.inactive.toLocaleString('tr-TR'),
    hint: '48+ saat',
  },
])

const lastPacket = computed(() =>
  sensorRecords.value.reduce(
    (latest, sensor) => (sensor.lastPacketAt > latest ? sensor.lastPacketAt : latest),
    new Date(0),
  ),
)

const lastPacketLabel = computed(() => formatAbsolute(lastPacket.value))
const lastPacketAgo = computed(() => formatRelativeAgo(lastPacket.value, now.value))

const selectedRows = ref([])
const viewMode = ref('table')

const workOrderPanel = ref(false)
const workOrderTypes = ['Kalibrasyon', 'Firmware Güncelleme', 'Sensör Sıfırlama']
const selectedWorkOrderType = ref(null)
const workOrderPayload = ref({
  description: '',
  calibrationCode: '',
  firmwareVersion: '',
  resetReason: '',
})

const resetFilters = () => {
  selectedStatuses.value = []
  selectedFreshness.value = []
  selectedComm.value = []
  selectedTypes.value = []
  selectedZones.value = []
  selectedGroupBy.value = []
}

const selectAllRows = () => {
  selectedRows.value = [...filteredSensors.value]
}

const openWorkOrder = () => {
  workOrderPanel.value = true
}

const confirmWorkOrder = () => {
  workOrderPanel.value = false
}

const applyRoutePrefill = () => {
  const { status, communication, zone } = route.query
  if (status && statusOptions.includes(status)) selectedStatuses.value = [status]
  if (communication && communicationOptions.includes(communication))
    selectedComm.value = [communication]
  if (zone) selectedZones.value = [zone]
}

const mapState = {
  instance: null,
  markers: [],
}

const initMap = () => {
  if (mapState.instance) return
  mapState.instance = L.map('sensor-map', {
    zoomControl: false,
    attributionControl: false,
  }).setView([39.9334, 32.8597], 10)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
  }).addTo(mapState.instance)

  updateMarkers()
}

const updateMarkers = () => {
  if (!mapState.instance) return
  mapState.markers.forEach((marker) => marker.remove())
  mapState.markers = filteredSensors.value.map((sensor) => {
    const marker = L.circleMarker([sensor.lat, sensor.lng], {
      radius: 9,
      color: 'rgba(148,163,184,0.4)',
      weight: 1,
      fillColor:
        sensor.status === 'Aktif'
          ? 'rgba(34,197,94,0.65)'
          : sensor.status === 'Beklemede'
            ? 'rgba(251,191,36,0.7)'
            : 'rgba(248,113,113,0.75)',
      fillOpacity: 0.85,
    }).addTo(mapState.instance)
    marker.bindPopup(
      `<strong>${sensor.sensorId}</strong><br/>${sensor.location}<br/>${sensor.lastPacketDisplay}`,
    )
    return marker
  })
}

watch(filteredSensors, () => {
  updateMarkers()
  const availableIds = new Set(filteredSensors.value.map((sensor) => sensor.sensorId))
  selectedRows.value = selectedRows.value.filter((row) => availableIds.has(row.sensorId))
})

onMounted(() => {
  applyRoutePrefill()
  initMap()
})

onBeforeUnmount(() => {
  if (mapState.instance) {
    mapState.instance.remove()
    mapState.instance = null
  }
})
</script>

<style scoped>
.sensor-dashboard {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  background: var(--content-background);
  transition: background var(--transition-speed) ease;
}

.sensor-header {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  padding: 28px 32px;
  border-radius: 26px;
  background: var(--surface-elevated);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

.sensor-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(56, 189, 248, 0.18), transparent 55%);
  pointer-events: none;
  z-index: 0;
}

.header-left {
  position: relative;
  z-index: 1;
  flex: 1 1 420px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.header-chip {
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--accent-surface);
  color: var(--accent-highlight);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.header-left h1 {
  margin: 0;
  font-size: clamp(26px, 4vw, 34px);
  color: var(--heading-color);
}

.header-left p {
  margin: 0;
  font-size: 15px;
  color: var(--muted-text);
  line-height: 1.6;
  max-width: 640px;
}

.header-meta {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meta-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  min-width: 150px;
  padding: 14px 16px;
  border-radius: 18px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--muted-text);
}

.meta-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--heading-color);
}

.meta-hint {
  font-size: 13px;
  color: var(--muted-text);
}

.header-right {
  position: relative;
  z-index: 1;
  flex: 1 1 220px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  border-radius: 22px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
}

.summary-item,
.summary-split > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--muted-text);
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--heading-color);
}

.summary-split {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.summary-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--muted-text);
}

.sensor-content {
  row-gap: 28px !important;
}

.filter-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-card,
.plan-card {
  padding: 24px;
  border-radius: 24px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
  transition:
    background var(--transition-speed) ease,
    border-color var(--transition-speed) ease;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.filter-header h2,
.plan-header h2 {
  margin: 0;
  font-size: 18px;
  color: var(--heading-color);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-soft);
}

.filter-group:last-of-type {
  border-bottom: none;
}

.filter-title {
  font-size: 13px;
  text-transform: uppercase;
  color: var(--muted-text);
  letter-spacing: 0.3px;
}

.filter-chip {
  margin-bottom: 6px;
}

.plan-header span {
  font-size: 13px;
  color: var(--muted-text);
}

.plan-list {
  padding: 0;
  margin-top: 12px;
}

.list-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.list-card,
.map-card {
  padding: 24px;
  border-radius: 26px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition:
    background var(--transition-speed) ease,
    border-color var(--transition-speed) ease;
}

.list-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.toolbar-search {
  flex: 1 1 320px;
}

.toolbar-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.group-select {
  min-width: 220px;
}

.list-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.meta-chip {
  font-weight: 600;
}

.grid-wrapper {
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--border-soft);
  background: var(--surface-elevated);
}

.sensor-data-table {
  --v-table-header-height: 52px;
  background: transparent;
}

.sensor-data-table :deep(table) {
  background: transparent;
}

.sensor-data-table :deep(thead tr) {
  background: var(--surface-elevated);
}

.sensor-data-table :deep(th) {
  color: var(--muted-text);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.6px;
}

.sensor-data-table :deep(td) {
  color: var(--text-color);
  font-size: 14px;
}

.sensor-data-table :deep(tbody tr:hover) {
  background: rgba(56, 189, 248, 0.12);
}

.cell-primary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cell-id {
  font-weight: 700;
  font-size: 15px;
  color: var(--heading-color);
}

.cell-zone {
  font-size: 12px;
  color: var(--muted-text);
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.cell-secondary {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cell-secondary small {
  font-size: 12px;
  color: var(--muted-text);
}

.no-data {
  padding: 24px;
  text-align: center;
  color: var(--muted-text);
}

.card-grid {
  padding: 8px 4px;
}

.sensor-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid var(--border-soft);
  background: var(--surface-elevated);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color var(--transition-speed) ease;
}

.sensor-card.on-time {
  border-color: rgba(34, 197, 94, 0.32);
}

.sensor-card.delayed {
  border-color: rgba(251, 191, 36, 0.32);
}

.sensor-card.missed {
  border-color: rgba(248, 113, 113, 0.32);
}

.sensor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.35);
}

.sensor-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sensor-id {
  font-weight: 700;
  color: var(--heading-color);
}

.sensor-zone {
  display: block;
  font-size: 13px;
  color: var(--muted-text);
}

.sensor-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sensor-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.sensor-label {
  font-size: 13px;
  color: var(--muted-text);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.sensor-value {
  font-size: 14px;
  color: var(--heading-color);
  text-align: right;
}

.sensor-sparkline {
  height: 46px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.map-header h2 {
  margin: 0;
  font-size: 18px;
  color: var(--heading-color);
}

.map-subtitle {
  display: block;
  font-size: 13px;
  color: var(--muted-text);
}

.map-container {
  height: 320px;
  border-radius: 20px;
  overflow: hidden;
}

.map-legend {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--muted-text);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.legend-dot.active {
  background: rgba(34, 197, 94, 0.75);
}

.legend-dot.pending {
  background: rgba(251, 191, 36, 0.75);
}

.legend-dot.inactive {
  background: rgba(248, 113, 113, 0.75);
}

.drawer-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-summary {
  font-size: 14px;
  color: var(--muted-text);
  margin-bottom: 16px;
}

.row-delayed {
  background: rgba(251, 191, 36, 0.08) !important;
}

.row-missed {
  background: rgba(248, 113, 113, 0.08) !important;
}

@media (max-width: 960px) {
  .sensor-dashboard {
    padding: 18px;
  }

  .sensor-header {
    padding: 24px;
  }

  .list-card,
  .map-card {
    padding: 20px;
  }
}
</style>
