<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-container fluid class="meter-dashboard" tag="section">
    <section class="meter-header">
      <div class="header-left">
        <div class="header-chip">{{ organization.scope }} • Elektrik sayaçları</div>
        <h1>Elektrik dağıtım kontrol merkezi</h1>
        <p>
          Kurum kapsamındaki elektrik sayaçları LoRa ve GPRS ağları üzerinden gün içinde farklı
          zamanlarda veri gönderir. Bu ekran sensör sayfasıyla aynı düzeni kullanarak yüksek ve orta
          gerilim noktalarındaki tüketimi tek bakışta görmenizi sağlar.
        </p>
        <div class="header-meta">
          <DataFreshnessIndicator
            :last-update="lastPacket"
            :now="now"
            :pending-threshold-hours="24"
            :inactive-threshold-hours="48"
            title="Son elektrik verisi"
            window-hint="Sayaçlar 24 saatlik pencere içerisinde rastgele paket gönderir."
          />
          <div class="meta-grid">
            <div class="meta-item" v-for="metric in headerMetrics" :key="metric.label">
              <span class="meta-label">{{ metric.label }}</span>
              <span class="meta-value">{{ metric.value }}</span>
              <span class="meta-hint">{{ metric.hint }}</span>
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
            <span class="summary-value">{{ communicationBreakdown.LoRa.toLocaleString('tr-TR') }}</span>
          </div>
          <div>
            <span class="summary-label">GPRS</span>
            <span class="summary-value">{{ communicationBreakdown.GPRS.toLocaleString('tr-TR') }}</span>
          </div>
        </div>
        <div class="summary-note">
          <span class="summary-bullet">•</span>
          <span>Reaktif alarmlar gecikmeli gelebilir; tıpkı sensör ekranında olduğu gibi bekleyin.</span>
        </div>
      </div>
    </section>

    <v-row class="meter-content" no-gutters>
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
            <span class="filter-title">Bölgeler</span>
            <v-chip-group v-model="selectedZones" column multiple>
              <v-chip
                v-for="zone in zoneOptions"
                :key="zone"
                :value="zone"
                class="filter-chip"
                color="purple"
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
            <h2>Enerji yönetim notları</h2>
            <span>Su ve sensör panelleriyle aynı arayüz dili korunur.</span>
          </div>
          <v-list density="compact" class="plan-list">
            <v-list-item>
              <v-list-item-title>• Koyu kartlar ve neon vurgular sensör düzeniyle aynıdır.</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>• Tazelik çipleri tablo ve kartta aynı renk kodlarını kullanır.</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>• Başlık tipografisi ve boşluklar sensör ekranıyla eşleşir.</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>• Hover gölgeleri ve animasyon süreleri 160ms olarak kalır.</v-list-item-title>
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
                variant="flat"
                :disabled="selectedRows.length === 0"
                @click="openWorkOrder"
              >
                İş emri planla
              </v-btn>
              <v-btn-toggle v-model="viewMode" class="view-toggle" density="comfortable" mandatory>
                <v-btn value="table">Tablo</v-btn>
                <v-btn value="cards">Kart</v-btn>
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
                  {{ item.freshnessBucket }}
                </v-chip>
              </template>
              <template #item.lastPacketDisplay="{ item }">
                <div class="cell-secondary">
                  <span>{{ item.lastPacketDisplay }}</span>
                  <small>{{ item.location }}</small>
                </div>
              </template>
              <template #item.consumptionDeltaLabel="{ item }">
                <span :class="['mono', item.consumptionDelta >= 0 ? 'delta-positive' : 'delta-negative']">
                  {{ item.consumptionDeltaLabel }}
                </span>
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
                    <v-chip :color="sensor.freshnessChip" size="small" variant="tonal">
                      {{ sensor.freshnessBadge }}
                    </v-chip>
                  </div>
                  <div class="sensor-card-body">
                    <div class="sensor-row">
                      <span class="sensor-label">İletişim</span>
                      <span class="sensor-value">{{ sensor.commMethod }}</span>
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
                      <span class="sensor-label">24s tüketim</span>
                      <span class="sensor-value">{{ sensor.consumptionLabel }}</span>
                    </div>
                    <div class="sensor-row">
                      <span class="sensor-label">Önceki 24s</span>
                      <span class="sensor-value">{{ sensor.previousConsumptionLabel }}</span>
                    </div>
                    <div class="sensor-row">
                      <span class="sensor-label">Değişim</span>
                      <span class="sensor-value">{{ sensor.consumptionDeltaLabel }}</span>
                    </div>
                  </div>
                  <v-sparkline
                    :model-value="sensor.sparkline"
                    :smooth="12"
                    :line-width="3"
                    auto-draw
                    class="sensor-sparkline"
                    color="rgba(248,113,113,0.6)"
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
              <span class="map-subtitle">Son paket: {{ lastPacketLabel }} • {{ lastPacketAgo }}</span>
            </div>
            <v-chip size="small" variant="tonal">ASKİ kapsama alanı</v-chip>
          </div>
          <div id="electric-map" class="map-container" />
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
        <v-btn variant="text" @click="workOrderPanel = false">Kapat</v-btn>
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

  <transition name="slide-fade">
    <div v-if="workOrderNotification.visible" class="fancy-toast">
      <div class="toast-text">⚡ <strong>{{ workOrderNotification.message }}</strong></div>
    </div>
  </transition>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import DataFreshnessIndicator from '@/components/common/DataFreshnessIndicator.vue'
import { meterSnapshots, organizationProfile, referenceNow } from '@/data/mockMeters'
import { formatAbsolute, formatClock, formatRelativeAgo, hoursBetween, toDate } from '@/utils/time'

const organization = organizationProfile
const now = ref(new Date(referenceNow))

const statusOptions = ['Aktif', 'Beklemede', 'Pasif']
const freshnessOptions = ['< 24 saat', '24-48 saat', '48+ saat']
const communicationOptions = ['LoRa', 'GPRS']

const selectedStatuses = ref([])
const selectedFreshness = ref([])
const selectedComm = ref([])
const selectedZones = ref([])
const selectedGroupBy = ref([])
const searchTerm = ref('')
const selectedRows = ref([])
const viewMode = ref('table')

const workOrderPanel = ref(false)
const workOrderTypes = ['Okuma Yenile', 'Kesme Talimatı', 'Yeniden Enerjilendir']
const selectedWorkOrderType = ref(workOrderTypes[0])
const workOrderPayload = ref({ description: '' })
const workOrderNotification = ref({ visible: false, message: '' })

const rawSensors = ref(meterSnapshots.filter((meter) => meter.type === 'electric'))

const groupByOptions = [
  { title: 'Bölgeler', value: 'zone' },
  { title: 'Durum', value: 'status' },
  { title: 'İletişim', value: 'commMethod' },
]

const zoneOptions = computed(() =>
  Array.from(new Set(rawSensors.value.map((meter) => meter.zone))).sort(),
)

const tableHeaders = [
  { title: 'Sayaç', key: 'sensorId', sortable: true },
  { title: 'Trafo/Bölge', key: 'zone', sortable: true },
  { title: 'İletişim', key: 'commMethod', sortable: true },
  { title: 'Durum', key: 'status', sortable: true },
  { title: 'Veri tazeliği', key: 'freshnessBucket', sortable: true },
  { title: 'Son veri', key: 'lastPacketDisplay', sortable: false },
  { title: '24s tüketim', key: 'consumptionLabel', sortable: true },
  { title: 'Değişim', key: 'consumptionDeltaLabel', sortable: true },
]

const tableSortBy = ref([{ key: 'sensorId', order: 'asc' }])

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

const freshnessMap = {
  '< 24 saat': { badge: 'Güncel', chip: 'success', level: 'on-time' },
  '24-48 saat': { badge: 'Beklemede', chip: 'amber-darken-2', level: 'delayed' },
  '48+ saat': { badge: 'Pasif', chip: 'red-darken-2', level: 'missed' },
}

const sensorRecords = computed(() =>
  rawSensors.value.map((meter) => {
    const lastPacket = toDate(meter.lastCommunication)
    const status = classifyStatus(lastPacket)
    const freshness = classifyFreshness(lastPacket)
    const mapping = freshnessMap[freshness]
    const last24h = meter.consumption?.last24h ?? 0
    const prev24h = meter.consumption?.previous24h ?? 0
    const delta = last24h - prev24h

    return {
      sensorId: meter.id,
      zone: meter.zone,
      location: meter.location,
      commMethod: meter.communication,
      status,
      freshnessBucket: freshness,
      freshnessBadge: mapping.badge,
      freshnessChip: mapping.chip,
      freshnessLevel: mapping.level,
      lastPacketAt: lastPacket,
      lastPacketLabel: formatAbsolute(lastPacket),
      lastPacketAgo: formatRelativeAgo(lastPacket, now.value),
      lastPacketDisplay: `${formatClock(lastPacket)} • ${formatRelativeAgo(lastPacket, now.value)}`,
      lastReading: meter.lastReading ?? '—',
      consumptionValue: last24h,
      consumptionLabel:
        meter.consumption != null
          ? `${last24h.toLocaleString('tr-TR', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })} kWh`
          : '—',
      previousConsumptionLabel:
        meter.consumption != null
          ? `${prev24h.toLocaleString('tr-TR', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })} kWh`
          : '—',
      consumptionDelta: delta,
      consumptionDeltaLabel:
        meter.consumption != null
          ? `${delta >= 0 ? '+' : ''}${delta.toLocaleString('tr-TR', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })} kWh`
          : '—',
      lat: meter.lat,
      lng: meter.lng,
      sparkline: meter.consumption?.history ?? [],
    }
  }),
)

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

const headerMetrics = computed(() => {
  const total = sensorRecords.value.length || 1
  const active = sensorRecords.value.filter((sensor) => sensor.status === 'Aktif').length
  const pending = sensorRecords.value.filter((sensor) => sensor.status === 'Beklemede').length
  const averageConsumption =
    sensorRecords.value.reduce((sum, sensor) => sum + sensor.consumptionValue, 0) / total
  const peak = sensorRecords.value.reduce(
    (max, sensor) => Math.max(max, sensor.consumptionValue ?? 0),
    0,
  )

  return [
    {
      label: 'Aktif sayaç',
      value: active.toLocaleString('tr-TR'),
      hint: 'Son 24 saatte veri gönderen',
    },
    {
      label: 'Beklemede',
      value: pending.toLocaleString('tr-TR'),
      hint: '24-48 saattir suskun',
    },
    {
      label: 'Günlük tüketim ort.',
      value: `${averageConsumption.toLocaleString('tr-TR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} kWh`,
      hint: 'Son 24 saatin ortalaması',
    },
    {
      label: 'En yüksek yük',
      value: `${peak.toLocaleString('tr-TR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} kWh`,
      hint: 'Günlük maksimum değer',
    },
  ]
})

const lastPacket = computed(() =>
  sensorRecords.value.reduce(
    (latest, sensor) => (latest && latest > sensor.lastPacketAt ? latest : sensor.lastPacketAt),
    null,
  ),
)

const lastPacketLabel = computed(() => (lastPacket.value ? formatAbsolute(lastPacket.value) : '—'))
const lastPacketAgo = computed(() =>
  lastPacket.value ? formatRelativeAgo(lastPacket.value, now.value) : 'Veri yok',
)

const tableGroupBy = computed(() => selectedGroupBy.value.map((value) => ({ key: value })))

const statusChipColor = (status) => {
  if (status === 'Aktif') return 'success'
  if (status === 'Beklemede') return 'amber-darken-2'
  return 'red-darken-2'
}

const filteredSensors = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return sensorRecords.value.filter((sensor) => {
    const matchesStatus =
      selectedStatuses.value.length === 0 || selectedStatuses.value.includes(sensor.status)
    const matchesFreshness =
      selectedFreshness.value.length === 0 ||
      selectedFreshness.value.includes(sensor.freshnessBucket)
    const matchesComm =
      selectedComm.value.length === 0 || selectedComm.value.includes(sensor.commMethod)
    const matchesZone =
      selectedZones.value.length === 0 || selectedZones.value.includes(sensor.zone)
    const matchesTerm =
      term.length === 0 ||
      `${sensor.sensorId} ${sensor.zone} ${sensor.location} ${sensor.commMethod}`
        .toLowerCase()
        .includes(term)

    return matchesStatus && matchesFreshness && matchesComm && matchesZone && matchesTerm
  })
})

const filteredStats = computed(() => ({
  total: filteredSensors.value.length,
  active: filteredSensors.value.filter((sensor) => sensor.status === 'Aktif').length,
  pending: filteredSensors.value.filter((sensor) => sensor.status === 'Beklemede').length,
  inactive: filteredSensors.value.filter((sensor) => sensor.status === 'Pasif').length,
}))

const resetFilters = () => {
  selectedStatuses.value = []
  selectedFreshness.value = []
  selectedComm.value = []
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
  workOrderNotification.value = {
    visible: true,
    message: `${selectedRows.value.length} sayaç için ${selectedWorkOrderType.value} kuyruğa alındı`,
  }
  setTimeout(() => {
    workOrderNotification.value.visible = false
  }, 3600)
  selectedRows.value = []
  workOrderPayload.value.description = ''
}

const mapState = {
  instance: null,
  markers: [],
}

const initMap = () => {
  if (mapState.instance) return
  mapState.instance = L.map('electric-map', {
    zoomControl: false,
    attributionControl: false,
  }).setView([39.9334, 32.8597], 9)

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
      radius: 10,
      color: 'rgba(248,113,113,0.55)',
      weight: 1,
      fillColor:
        sensor.status === 'Aktif'
          ? 'rgba(248,113,113,0.7)'
          : sensor.status === 'Beklemede'
            ? 'rgba(251,191,36,0.7)'
            : 'rgba(148,163,184,0.6)',
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
.meter-dashboard {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  background: linear-gradient(180deg, rgba(10, 14, 26, 0.95) 0%, rgba(12, 19, 32, 0.82) 100%);
}

.meter-header {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  padding: 28px 32px;
  border-radius: 26px;
  background:
    radial-gradient(circle at top right, rgba(251, 113, 133, 0.2), transparent 45%),
    rgba(13, 20, 34, 0.86);
  border: 1px solid rgba(248, 113, 113, 0.24);
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
  background: rgba(248, 113, 113, 0.16);
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
  border: 1px solid rgba(248, 113, 113, 0.24);
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

.summary-bullet {
  font-size: 20px;
  line-height: 1;
}

.meter-content {
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
  gap: 18px;
}

.list-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
}

.toolbar-search {
  flex: 1 1 260px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.list-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.meta-chip {
  font-weight: 600;
  text-transform: none;
}

.grid-wrapper {
  border-radius: 20px;
  overflow: hidden;
}

.sensor-data-table :deep(table) {
  background: transparent;
}

.sensor-data-table :deep(thead tr) {
  background: rgba(15, 23, 42, 0.85);
}

.sensor-data-table :deep(th) {
  color: rgba(226, 232, 240, 0.85);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.4px;
}

.sensor-data-table :deep(td) {
  color: rgba(241, 245, 249, 0.92);
  font-size: 14px;
}

.sensor-data-table :deep(tbody tr:hover) {
  background: rgba(248, 113, 113, 0.12);
}

.cell-primary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cell-id {
  font-weight: 600;
  color: rgba(248, 250, 252, 0.95);
}

.cell-zone {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.78);
}

.cell-secondary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cell-secondary small {
  color: rgba(148, 163, 184, 0.72);
}

.card-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sensor-card {
  padding: 18px 20px;
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.2);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.sensor-card.on-time {
  box-shadow: 0 18px 36px rgba(248, 113, 113, 0.18);
}

.sensor-card.delayed {
  box-shadow: 0 18px 36px rgba(251, 191, 36, 0.14);
}

.sensor-card.missed {
  box-shadow: 0 18px 36px rgba(148, 163, 184, 0.18);
}

.sensor-card:hover {
  transform: translateY(-4px);
}

.sensor-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sensor-id {
  font-size: 18px;
  font-weight: 700;
  color: rgba(248, 250, 252, 0.96);
}

.sensor-zone {
  display: block;
  font-size: 13px;
  color: rgba(148, 163, 184, 0.75);
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

.delta-positive {
  color: rgba(34, 197, 94, 0.85);
}

.delta-negative {
  color: rgba(248, 113, 113, 0.85);
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
  background: rgba(248, 113, 113, 0.75);
}

.legend-dot.pending {
  background: rgba(251, 191, 36, 0.75);
}

.legend-dot.inactive {
  background: rgba(148, 163, 184, 0.75);
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

.mono {
  font-family: 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
  letter-spacing: 0.3px;
}

.no-data {
  padding: 24px;
  text-align: center;
  color: rgba(148, 163, 184, 0.9);
}

.slide-fade-enter-active {
  transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide-fade-leave-active {
  transition: all 0.4s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.fancy-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: rgba(248, 113, 113, 0.95);
  color: white;
  padding: 16px 22px;
  border-radius: 14px;
  box-shadow: 0 14px 26px rgba(248, 113, 113, 0.4);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  font-size: 15px;
  font-weight: 500;
}

@media (max-width: 960px) {
  .meter-dashboard {
    padding: 18px;
  }

  .meter-header {
    padding: 24px;
  }

  .list-card,
  .map-card {
    padding: 20px;
  }
}
</style>
