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
            <ag-grid-vue
              class="ag-theme-alpine-dark sensor-grid"
              :columnDefs="columnDefs"
              :rowData="filteredSensors"
              :quickFilterText="searchTerm"
              :defaultColDef="defaultColDef"
              :gridOptions="gridOptions"
              :rowSelection="'multiple'"
              :animateRows="true"
              :pagination="true"
              :paginationPageSize="10"
              suppressMovableColumns
              @grid-ready="onGridReady"
              @selection-changed="onSelectionChanged"
            />
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
import { AgGridVue } from 'ag-grid-vue3'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import DataFreshnessIndicator from '@/components/common/DataFreshnessIndicator.vue'
import { meterSnapshots, organizationProfile, referenceNow } from '@/data/mockMeters'
import { formatAbsolute, formatClock, formatRelativeAgo, hoursBetween, toDate } from '@/utils/time'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import 'ag-grid-community/styles/ag-theme-alpine-dark.css'

ModuleRegistry.registerModules([AllCommunityModule])

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
const searchTerm = ref('')

const rawSensors = ref(meterSnapshots)

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

const columnDefs = ref([
  { field: 'sensorId', headerName: 'Sayaç', pinned: 'left', checkboxSelection: true, width: 150 },
  { field: 'typeLabel', headerName: 'Tip', enableRowGroup: true, width: 120 },
  { field: 'zone', headerName: 'Bölge', enableRowGroup: true, width: 160 },
  { field: 'commMethod', headerName: 'İletişim', enableRowGroup: true, width: 120 },
  {
    field: 'lastPacketLabel',
    headerName: 'Son veri',
    minWidth: 200,
    valueGetter: (params) => `${params.data.lastPacketLabel} • ${params.data.lastPacketAgo}`,
  },
  {
    field: 'freshnessBadge',
    headerName: 'Veri tazeliği',
    width: 160,
    cellRenderer: (params) => {
      if (!params.value) return ''
      const colors = {
        Takvimde: 'rgba(34,197,94,0.18)',
        Beklemede: 'rgba(251,191,36,0.18)',
        Pasif: 'rgba(248,113,113,0.18)',
      }
      const color = colors[params.value] || 'rgba(59,130,246,0.18)'
      return `<span style="display:inline-flex;align-items:center;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;background:${color};color:#f8fafc;">${params.value}</span>`
    },
  },
  { field: 'lastReading', headerName: 'Okuma', width: 130 },
  { field: 'battery', headerName: 'Batarya', width: 110 },
  { field: 'signal', headerName: 'Sinyal', width: 140 },
  { field: 'window', headerName: 'Pencere', width: 140 },
])

const defaultColDef = {
  resizable: true,
  sortable: true,
  filter: true,
  floatingFilter: true,
  minWidth: 120,
  flex: 1,
}

const gridOptions = {
  rowClassRules: {
    'row-delayed': (params) => params.data?.freshnessLevel === 'delayed',
    'row-missed': (params) => params.data?.freshnessLevel === 'missed',
  },
}

const gridApi = ref(null)
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
}

const selectAllRows = () => {
  gridApi.value?.selectAll()
}

const onSelectionChanged = (event) => {
  selectedRows.value = event.api.getSelectedRows()
}

const onGridReady = (params) => {
  gridApi.value = params.api
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
  if (viewMode.value === 'table' && gridApi.value) {
    gridApi.value.setGridOption('rowData', filteredSensors.value)
  }
})

onMounted(() => {
  applyRoutePrefill()
  initMap()
})

onBeforeUnmount(() => {
  gridApi.value = null
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
  background: linear-gradient(180deg, rgba(10, 14, 26, 0.95) 0%, rgba(12, 19, 32, 0.82) 100%);
}

.sensor-header {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  padding: 28px 32px;
  border-radius: 26px;
  background:
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.2), transparent 45%),
    rgba(13, 20, 34, 0.86);
  border: 1px solid rgba(59, 130, 246, 0.18);
  box-shadow: 0 26px 54px rgba(2, 12, 24, 0.55);
}

.header-left {
  flex: 1 1 420px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.header-chip {
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(45, 212, 191, 0.16);
  color: rgba(226, 232, 240, 0.9);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.header-left h1 {
  margin: 0;
  font-size: clamp(26px, 4vw, 34px);
  color: rgba(248, 250, 252, 0.98);
}

.header-left p {
  margin: 0;
  font-size: 15px;
  color: rgba(148, 163, 184, 0.86);
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
  background: rgba(10, 18, 32, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.2);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: rgba(148, 163, 184, 0.75);
}

.meta-value {
  font-size: 22px;
  font-weight: 700;
  color: rgba(248, 250, 252, 0.95);
}

.meta-hint {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.78);
}

.header-right {
  flex: 1 1 220px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  border-radius: 22px;
  background: rgba(10, 18, 32, 0.7);
  border: 1px solid rgba(45, 212, 191, 0.16);
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
  color: rgba(148, 163, 184, 0.75);
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: rgba(248, 250, 252, 0.95);
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
  color: rgba(148, 163, 184, 0.78);
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
  background: rgba(10, 18, 32, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 20px 40px rgba(2, 12, 24, 0.45);
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
  color: rgba(248, 250, 252, 0.94);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.filter-group:last-of-type {
  border-bottom: none;
}

.filter-title {
  font-size: 13px;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.75);
  letter-spacing: 0.3px;
}

.filter-chip {
  margin-bottom: 6px;
}

.plan-header span {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.78);
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
  background: rgba(10, 18, 32, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 24px 44px rgba(2, 12, 24, 0.45);
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.65);
}

.sensor-grid {
  width: 100%;
  min-height: 520px;
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
  border: 1px solid rgba(59, 130, 246, 0.18);
  background: rgba(10, 16, 28, 0.78);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
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
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.45);
}

.sensor-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sensor-id {
  font-weight: 700;
  color: rgba(248, 250, 252, 0.96);
}

.sensor-zone {
  display: block;
  font-size: 13px;
  color: rgba(148, 163, 184, 0.78);
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
  color: rgba(148, 163, 184, 0.75);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.sensor-value {
  font-size: 14px;
  color: rgba(226, 232, 240, 0.9);
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
  color: rgba(248, 250, 252, 0.94);
}

.map-subtitle {
  display: block;
  font-size: 13px;
  color: rgba(148, 163, 184, 0.78);
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
  color: rgba(148, 163, 184, 0.78);
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
  color: rgba(148, 163, 184, 0.8);
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
