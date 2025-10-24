<template>
  <v-container fluid class="sensor-shell" tag="section">
    <div class="sensor-header">
      <div class="sensor-heading">
        <div class="sensor-badge">Su sayaçları</div>
        <h1 class="sensor-title">Sayaç listesi</h1>
        <p class="sensor-subtitle">
          Kurumunuzun LoRa ve GPRS sayaçları günde üç kez veri gönderir. Aşağıdaki liste son alınan partiye göre
          güncellendi; geciken sayaçlar otomatik olarak vurgulanır.
        </p>
      </div>
      <div class="sensor-header-meta">
        <div class="meta-card">
          <span class="meta-label">Son veri alımı</span>
          <span class="meta-value">{{ lastBatchLabel }}</span>
          <v-chip :color="freshnessChip.color" size="small" variant="tonal">{{ freshnessChip.label }}</v-chip>
          <span class="meta-hint">{{ lastBatchAgo }}</span>
        </div>
        <div class="meta-card">
          <span class="meta-label">Bir sonraki pencere</span>
          <span class="meta-value">{{ nextWindowLabel }}</span>
          <span class="meta-hint">{{ nextWindowCountdown }}</span>
        </div>
      </div>
    </div>

    <v-row class="sensor-content" no-gutters>
      <v-col cols="12" md="3" class="filter-column">
        <v-card class="filter-card" elevation="0">
          <div class="filter-header">
            <h2>Filtreler</h2>
            <v-btn color="primary" density="comfortable" variant="text" @click="resetFilters">Temizle</v-btn>
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
                v-for="bucket in freshnessOptions"
                :key="bucket"
                :value="bucket"
                class="filter-chip"
                color="teal"
                filter
                variant="tonal"
              >
                {{ bucket }}
              </v-chip>
            </v-chip-group>
          </div>

          <div class="filter-group">
            <span class="filter-title">İletişim yöntemi</span>
            <v-chip-group v-model="selectedComm" column multiple>
              <v-chip
                v-for="method in communicationOptions"
                :key="method"
                :value="method"
                class="filter-chip"
                color="blue"
                filter
                variant="tonal"
              >
                {{ method }}
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

        <v-card class="schedule-card" elevation="0">
          <h2>İletim pencereleri</h2>
          <p>Beklenen parti saatleri ve mevcut durum.</p>
          <ul class="schedule-timeline">
            <li v-for="slot in scheduleTimeline" :key="slot.key" :class="['timeline-item', slot.status]">
              <div class="timeline-dot" />
              <div class="timeline-body">
                <span class="timeline-time">{{ slot.time }}</span>
                <span class="timeline-status">{{ slot.statusLabel }}</span>
                <span class="timeline-note">{{ slot.note }}</span>
              </div>
            </li>
          </ul>
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
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              clearable
            />

            <div class="toolbar-actions">
              <v-btn color="primary" variant="text" @click="selectAllRows">Tümünü seç</v-btn>
              <v-btn
                color="primary"
                prepend-icon="mdi-clipboard-text"
                variant="flat"
                :disabled="selectedRows.length === 0"
                @click="sendWorkOrder"
              >
                İş emri planla
              </v-btn>
              <v-btn-toggle v-model="viewMode" class="view-toggle" density="comfortable" mandatory>
                <v-btn value="table" icon="mdi-table" />
                <v-btn value="cards" icon="mdi-view-grid-outline" />
              </v-btn-toggle>
            </div>
          </div>

          <div class="list-meta">
            <v-chip class="meta-chip" color="primary" variant="tonal">Toplam: {{ filteredStats.total }}</v-chip>
            <v-chip class="meta-chip" color="success" variant="tonal">Takvimde: {{ filteredStats.onTime }}</v-chip>
            <v-chip class="meta-chip" color="amber-darken-2" variant="tonal">
              1 çevrim gecikmeli: {{ filteredStats.delayed }}
            </v-chip>
            <v-chip class="meta-chip" color="red-darken-2" variant="tonal">
              2+ çevrim gecikmeli: {{ filteredStats.missed }}
            </v-chip>
          </div>

          <div v-if="viewMode === 'table'" class="grid-wrapper">
            <ag-grid-vue
              ref="gridRef"
              class="ag-theme-alpine sensor-grid"
              :columnDefs="columnDefs"
              :rowData="filteredSensors"
              :quickFilterText="searchTerm"
              :defaultColDef="defaultColDef"
              :gridOptions="gridOptions"
              :localeText="localeText"
              animateRows
              pagination
              :paginationPageSize="8"
              rowSelection="multiple"
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
                    <v-chip :color="sensor.freshnessChipColor" size="small" variant="tonal">
                      {{ sensor.freshnessBadge }}
                    </v-chip>
                  </div>
                  <div class="sensor-card-body">
                    <div class="sensor-row">
                      <span class="sensor-label">Son veri</span>
                      <span class="sensor-value">{{ sensor.lastPacketDisplay }}</span>
                    </div>
                    <div class="sensor-row">
                      <span class="sensor-label">Durum</span>
                      <span class="sensor-value">{{ sensor.status }} • {{ sensor.commMethod }}</span>
                    </div>
                    <div class="sensor-row">
                      <span class="sensor-label">Okuma</span>
                      <span class="sensor-value">{{ sensor.lastReading }} • {{ sensor.window }}</span>
                    </div>
                    <div class="sensor-row">
                      <span class="sensor-label">Batarya / Sinyal</span>
                      <span class="sensor-value">{{ sensor.battery }} • {{ sensor.signal }}</span>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card>

        <v-card class="map-card" elevation="0">
          <div class="map-header">
            <div>
              <h2>Konum görünümü</h2>
              <span class="map-subtitle">Son parti: {{ lastBatchLabel }} • {{ lastBatchAgo }}</span>
            </div>
            <v-chip prepend-icon="mdi-map-marker-path" size="small" variant="tonal">DMA odaklı</v-chip>
          </div>
          <div id="sensor-map" class="map-container" />
          <div class="map-legend">
            <div class="legend-item">
              <span class="legend-dot on-time" /> Takvimde
            </div>
            <div class="legend-item">
              <span class="legend-dot delayed" /> 1 çevrim gecikmeli
            </div>
            <div class="legend-item">
              <span class="legend-dot missed" /> 2+ çevrim gecikmeli
            </div>
          </div>
        </v-card>

        <v-row class="log-row" no-gutters>
          <v-col cols="12" lg="6">
            <v-card class="log-card" elevation="0">
              <div class="log-header">
                <div>
                  <h2>İş emri geçmişi</h2>
                  <span>Son gönderilen işlemler</span>
                </div>
                <v-btn color="primary" size="small" variant="text">Tamamını gör</v-btn>
              </div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>Kod</th>
                    <th>Sayaç</th>
                    <th>Tip</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in workOrderData.slice(0, 6)" :key="entry.workOrderId">
                    <td>{{ entry.workOrderId }}</td>
                    <td>{{ entry.sensorId }}</td>
                    <td>{{ entry.type }}</td>
                    <td>{{ entry.status }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-col>

          <v-col cols="12" lg="6">
            <v-card class="log-card" elevation="0">
              <div class="log-header">
                <div>
                  <h2>Alarm listesi</h2>
                  <span>Partilere göre gruplanan açık uyarılar</span>
                </div>
                <v-btn color="primary" size="small" variant="text">Alarm yönetimi</v-btn>
              </div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>Kod</th>
                    <th>Sayaç</th>
                    <th>Alarm</th>
                    <th>Seviye</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="alert in alertData.slice(0, 6)" :key="alert.alertId">
                    <td>{{ alert.alertId }}</td>
                    <td>{{ alert.sensorId }}</td>
                    <td>{{ alert.type }}</td>
                    <td>{{ alert.severity }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-col>
        </v-row>
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
      <v-card-title class="text-h6 d-flex align-center justify-space-between">
        <span>İş emri planla</span>
        <v-btn icon="mdi-close" variant="text" @click="workOrderPanel = false" />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <div class="text-subtitle-2 mb-3 text-grey-darken-1">
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
            density="comfortable"
            class="mb-3"
          />
        </template>

        <template v-else-if="selectedWorkOrderType === 'Firmware Güncelleme'">
          <v-text-field
            v-model="workOrderPayload.firmwareVersion"
            label="Hedef firmware sürümü"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
        </template>

        <template v-else-if="selectedWorkOrderType === 'Sensör Sıfırlama'">
          <v-text-field
            v-model="workOrderPayload.resetReason"
            label="Sıfırlama nedeni"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
        </template>

        <v-textarea v-model="workOrderPayload.description" label="Açıklama" variant="outlined" rows="2" />
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-end">
        <v-btn color="grey" variant="text" @click="workOrderPanel = false">İptal</v-btn>
        <v-btn color="primary" variant="flat" @click="confirmSendWorkOrder">Gönder</v-btn>
      </v-card-actions>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-enterprise'
import { ModuleRegistry } from 'ag-grid-community'
import { AllEnterpriseModule } from 'ag-grid-enterprise'
ModuleRegistry.registerModules([AllEnterpriseModule])
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const nowRef = ref(new Date())
const lastBatchReceived = ref(new Date(Date.now() - 1000 * 60 * 165))
const scheduleWindows = [8, 12, 24]

const formatTime = (date) =>
  new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'long'
  }).format(date)

const formatRelative = (from, to) => {
  const diffMinutes = Math.round((to.getTime() - from.getTime()) / 60000)
  const absMinutes = Math.abs(diffMinutes)
  const hours = Math.floor(absMinutes / 60)
  const minutes = absMinutes % 60
  const buildText = () => {
    if (hours === 0) return `${minutes} dk`
    if (minutes === 0) return `${hours} saat`
    return `${hours} saat ${minutes} dk`
  }
  return diffMinutes >= 0 ? `${buildText()} sonra` : `${buildText()} önce`
}

const formatAgo = (date, reference) => formatRelative(date, reference).replace('sonra', 'önce')

const getFreshnessChip = (lastBatch, now) => {
  const diffMinutes = Math.max(0, (now.getTime() - lastBatch.getTime()) / 60000)
  if (diffMinutes <= 180) {
    return {
      label: 'Takvimde',
      color: 'success',
      helper: `Son parti ${formatAgo(lastBatch, now)} alındı`
    }
  }
  if (diffMinutes <= 360) {
    return {
      label: '1 çevrim gecikti',
      color: 'amber-darken-2',
      helper: `Son parti ${formatAgo(lastBatch, now)} alındı`
    }
  }
  return {
    label: '2+ çevrim gecikti',
    color: 'red-darken-2',
    helper: `Son parti ${formatAgo(lastBatch, now)} alındı`
  }
}

const getWindowDate = (base, hour) => {
  const result = new Date(base)
  if (hour === 24) {
    result.setDate(result.getDate() + 1)
    result.setHours(0, 0, 0, 0)
  } else {
    result.setHours(hour, 0, 0, 0)
  }
  return result
}

const scheduleTimeline = computed(() => {
  return scheduleWindows.map((hour) => {
    const now = nowRef.value
    const windowDate = getWindowDate(now, hour)
    const lastBatch = lastBatchReceived.value
    let status = 'upcoming'
    let statusLabel = 'Bekleniyor'
    let note = `${formatTime(windowDate)} hedef`

    if (lastBatch.getTime() >= windowDate.getTime()) {
      status = 'completed'
      statusLabel = 'Tamamlandı'
      note = `${formatAgo(windowDate, lastBatch)} içerisinde alındı`
    } else if (now.getTime() >= windowDate.getTime()) {
      status = 'delayed'
      statusLabel = 'Gecikti'
      note = 'Son parti bekleniyor'
    }

    return {
      key: `${hour}-${status}`,
      time: hour === 24 ? '24:00' : `${hour.toString().padStart(2, '0')}:00`,
      status,
      statusLabel,
      note
    }
  })
})

const nextWindow = computed(() => {
  const now = nowRef.value
  for (const hour of scheduleWindows) {
    const candidate = getWindowDate(now, hour)
    if (candidate.getTime() > now.getTime()) {
      return candidate
    }
  }
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  tomorrow.setHours(scheduleWindows[0], 0, 0, 0)
  return tomorrow
})

const nextWindowLabel = computed(() => formatTime(nextWindow.value))
const nextWindowCountdown = computed(() => formatRelative(nowRef.value, nextWindow.value))
const lastBatchLabel = computed(() => formatTime(lastBatchReceived.value))
const lastBatchAgo = computed(() => formatAgo(lastBatchReceived.value, nowRef.value))
const freshnessChip = computed(() => getFreshnessChip(lastBatchReceived.value, nowRef.value))

const statusOptions = ['Aktif', 'Gecikmeli', 'Offline']
const freshnessOptions = ['Takvimde', '1 çevrim gecikmeli', '2+ çevrim gecikmeli']
const communicationOptions = ['LoRa', 'GPRS']

const selectedStatuses = ref([])
const selectedFreshness = ref([])
const selectedComm = ref([])
const selectedZones = ref([])
const searchTerm = ref('')

const minutesAgo = (minutes) => new Date(nowRef.value.getTime() - minutes * 60000).toISOString()

const sensors = ref([
  {
    sensorId: 'ASK-2401',
    zone: 'Çankaya DMA-3',
    location: 'Atatürk Bulvarı 112',
    commMethod: 'LoRa',
    lastReading: '132.4 m³',
    lastPacketAt: minutesAgo(110),
    window: '12:00',
    status: 'Aktif',
    battery: '%86',
    signal: '-78 dBm',
    freshnessMinutes: 110,
    lat: 39.9208,
    lng: 32.8541
  },
  {
    sensorId: 'ASK-2409',
    zone: 'Keçiören Kuzey',
    location: 'Fatih Cd. 45',
    commMethod: 'LoRa',
    lastReading: '98.2 m³',
    lastPacketAt: minutesAgo(220),
    window: '12:00',
    status: 'Gecikmeli',
    battery: '%74',
    signal: '-83 dBm',
    freshnessMinutes: 220,
    lat: 39.9882,
    lng: 32.8661
  },
  {
    sensorId: 'ASK-2412',
    zone: 'Mamak Konut',
    location: 'Esertepe Mh. 14',
    commMethod: 'GPRS',
    lastReading: '65.7 m³',
    lastPacketAt: minutesAgo(360),
    window: '08:00',
    status: 'Offline',
    battery: '%52',
    signal: '—',
    freshnessMinutes: 360,
    lat: 39.9339,
    lng: 32.908
  },
  {
    sensorId: 'ASK-2420',
    zone: 'Yenimahalle Sanayi',
    location: 'İvedik OSB 5. Cadde',
    commMethod: 'LoRa',
    lastReading: '154.9 m³',
    lastPacketAt: minutesAgo(95),
    window: '12:00',
    status: 'Aktif',
    battery: '%89',
    signal: '-74 dBm',
    freshnessMinutes: 95,
    lat: 39.9822,
    lng: 32.7316
  },
  {
    sensorId: 'ASK-2435',
    zone: 'Sincan Endüstri',
    location: 'Organize Sanayi 9. Sk',
    commMethod: 'GPRS',
    lastReading: '201.3 m³',
    lastPacketAt: minutesAgo(420),
    window: '08:00',
    status: 'Offline',
    battery: '%48',
    signal: '—',
    freshnessMinutes: 420,
    lat: 39.968,
    lng: 32.6487
  },
  {
    sensorId: 'ASK-2442',
    zone: 'Altındağ Merkez',
    location: 'Hacı Bayram Mh. 18',
    commMethod: 'LoRa',
    lastReading: '84.1 m³',
    lastPacketAt: minutesAgo(160),
    window: '12:00',
    status: 'Gecikmeli',
    battery: '%66',
    signal: '-87 dBm',
    freshnessMinutes: 160,
    lat: 39.9472,
    lng: 32.8627
  },
  {
    sensorId: 'ASK-2450',
    zone: 'Çankaya DMA-1',
    location: 'Tunus Cd. 72',
    commMethod: 'LoRa',
    lastReading: '72.3 m³',
    lastPacketAt: minutesAgo(70),
    window: '12:00',
    status: 'Aktif',
    battery: '%91',
    signal: '-70 dBm',
    freshnessMinutes: 70,
    lat: 39.9034,
    lng: 32.8597
  },
  {
    sensorId: 'ASK-2466',
    zone: 'Mamak Konut',
    location: 'Boğaziçi Mh. 41',
    commMethod: 'GPRS',
    lastReading: '52.9 m³',
    lastPacketAt: minutesAgo(510),
    window: '00:00',
    status: 'Offline',
    battery: '%44',
    signal: '—',
    freshnessMinutes: 510,
    lat: 39.933,
    lng: 32.9112
  },
  {
    sensorId: 'ASK-2474',
    zone: 'Keçiören Kuzey',
    location: 'Osmangazi Mh. 9',
    commMethod: 'LoRa',
    lastReading: '104.2 m³',
    lastPacketAt: minutesAgo(125),
    window: '12:00',
    status: 'Aktif',
    battery: '%83',
    signal: '-79 dBm',
    freshnessMinutes: 125,
    lat: 39.9994,
    lng: 32.844
  }
])

const zoneOptions = computed(() => {
  const set = new Set()
  sensors.value.forEach((sensor) => set.add(sensor.zone))
  return Array.from(set)
})

const resolveFreshness = (minutes) => {
  if (minutes <= 180) {
    return {
      badge: 'Takvimde',
      filter: 'Takvimde',
      chipColor: 'success',
      level: 'on-time',
      tone: 'rgba(16, 185, 129, 0.18)',
      description: 'Son pencere verisi alındı.'
    }
  }
  if (minutes <= 360) {
    return {
      badge: '1 çevrim gecikmeli',
      filter: '1 çevrim gecikmeli',
      chipColor: 'amber-darken-2',
      level: 'delayed',
      tone: 'rgba(245, 158, 11, 0.18)',
      description: 'Son pencere verisi eksik.'
    }
  }
  return {
    badge: '2+ çevrim gecikmeli',
    filter: '2+ çevrim gecikmeli',
    chipColor: 'red-darken-2',
    level: 'missed',
    tone: 'rgba(248, 113, 113, 0.18)',
    description: '24 saati aşan gecikme var.'
  }
}

const decoratedSensors = computed(() => {
  return sensors.value.map((sensor) => {
    const lastPacketDate = new Date(sensor.lastPacketAt)
    const freshness = resolveFreshness(sensor.freshnessMinutes)
    return {
      ...sensor,
      lastPacketDate,
      lastPacketLabel: formatTime(lastPacketDate),
      lastPacketAgo: formatAgo(lastPacketDate, nowRef.value),
      lastPacketDisplay: `${formatTime(lastPacketDate)} • ${formatAgo(lastPacketDate, nowRef.value)}`,
      freshnessBadge: freshness.badge,
      freshnessLevel: freshness.level,
      freshnessFilter: freshness.filter,
      freshnessChipColor: freshness.chipColor,
      freshnessTone: freshness.tone,
      freshnessDescription: freshness.description
    }
  })
})

const filteredSensors = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return decoratedSensors.value.filter((sensor) => {
    if (selectedStatuses.value.length && !selectedStatuses.value.includes(sensor.status)) {
      return false
    }
    if (selectedFreshness.value.length && !selectedFreshness.value.includes(sensor.freshnessFilter)) {
      return false
    }
    if (selectedComm.value.length && !selectedComm.value.includes(sensor.commMethod)) {
      return false
    }
    if (selectedZones.value.length && !selectedZones.value.includes(sensor.zone)) {
      return false
    }
    if (!term) {
      return true
    }
    const haystack = `${sensor.sensorId} ${sensor.zone} ${sensor.location} ${sensor.commMethod} ${sensor.status}`.toLowerCase()
    return haystack.includes(term)
  })
})

const filteredStats = computed(() => {
  let onTime = 0
  let delayed = 0
  let missed = 0
  filteredSensors.value.forEach((sensor) => {
    if (sensor.freshnessFilter === 'Takvimde') onTime += 1
    else if (sensor.freshnessFilter === '1 çevrim gecikmeli') delayed += 1
    else missed += 1
  })
  return {
    total: filteredSensors.value.length,
    onTime,
    delayed,
    missed
  }
})

const columnDefs = ref([
  { field: 'sensorId', headerName: 'Sayaç ID', checkboxSelection: true, pinned: 'left', width: 140 },
  { field: 'zone', headerName: 'Bölge', enableRowGroup: true, width: 170 },
  { field: 'commMethod', headerName: 'İletişim', enableRowGroup: true, width: 130 },
  {
    field: 'lastPacketDisplay',
    headerName: 'Son veri',
    sortable: true,
    comparator: (a, b, nodeA, nodeB) => nodeA.data.lastPacketDate - nodeB.data.lastPacketDate,
    minWidth: 220
  },
  {
    field: 'freshnessBadge',
    headerName: 'Veri tazeliği',
    minWidth: 160,
    cellRenderer: (params) => {
      if (!params.data) return ''
      return `<span style="display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;background:${params.data.freshnessTone};color:#0f172a;">${params.value}</span>`
    }
  },
  {
    field: 'status',
    headerName: 'Durum',
    width: 140,
    cellRenderer: (params) => {
      if (!params.data) return params.value
      const colors = {
        Aktif: '#10B981',
        Gecikmeli: '#F59E0B',
        Offline: '#EF4444'
      }
      const color = colors[params.value] || '#1F2937'
      return `<span style="display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;background:rgba(15,23,42,0.05);color:${color};border:1px solid rgba(15,23,42,0.08);">${params.value}</span>`
    }
  },
  { field: 'lastReading', headerName: 'Son okuma', width: 130 },
  { field: 'battery', headerName: 'Batarya', width: 110 },
  { field: 'signal', headerName: 'Sinyal', width: 120 },
  { field: 'window', headerName: 'Planlanan pencere', width: 160 }
])

const defaultColDef = {
  resizable: true,
  sortable: true,
  flex: 1,
  minWidth: 120,
  filter: true,
  enableRowGroup: true,
  floatingFilter: true
}

const gridOptions = {
  rowClassRules: {
    'sensor-row-delayed': (params) => params.data?.freshnessLevel === 'delayed',
    'sensor-row-missed': (params) => params.data?.freshnessLevel === 'missed'
  },
  suppressRowClickSelection: false
}

const gridRef = ref(null)
const selectedRows = ref([])
const viewMode = ref('table')

const workOrderPanel = ref(false)
const workOrderTypes = ['Kalibrasyon', 'Firmware Güncelleme', 'Sensör Sıfırlama']
const selectedWorkOrderType = ref(null)
const workOrderPayload = ref({ description: '', calibrationCode: '', firmwareVersion: '', resetReason: '' })

const workOrderData = ref([
  {
    sensorId: 'ASK-2401',
    workOrderId: 'WO-9001',
    type: 'Kalibrasyon',
    payload: 'TEMP_SET=24.0',
    status: 'Tamamlandı',
    createdDate: '2025-09-12 08:45',
    sentDate: '2025-09-12 08:47',
    responseDate: '2025-09-12 08:51'
  },
  {
    sensorId: 'ASK-2409',
    workOrderId: 'WO-9002',
    type: 'Firmware Güncelleme',
    payload: 'FW=v2.1.4',
    status: 'Gönderildi',
    createdDate: '2025-09-14 14:05',
    sentDate: '2025-09-14 14:06',
    responseDate: '-'
  },
  {
    sensorId: 'ASK-2412',
    workOrderId: 'WO-9003',
    type: 'Sensör Sıfırlama',
    payload: 'RESET=GAS',
    status: 'Bekliyor',
    createdDate: '2025-09-15 11:18',
    sentDate: '-',
    responseDate: '-'
  },
  {
    sensorId: 'ASK-2435',
    workOrderId: 'WO-9004',
    type: 'Kalibrasyon',
    payload: 'FLOW_RANGE=200',
    status: 'Tamamlandı',
    createdDate: '2025-09-10 09:30',
    sentDate: '2025-09-10 09:32',
    responseDate: '2025-09-10 09:35'
  },
  {
    sensorId: 'ASK-2466',
    workOrderId: 'WO-9005',
    type: 'Firmware Güncelleme',
    payload: 'FW=v3.0.0',
    status: 'Başarısız',
    createdDate: '2025-09-09 07:50',
    sentDate: '2025-09-09 07:52',
    responseDate: '2025-09-09 07:58'
  },
  {
    sensorId: 'ASK-2442',
    workOrderId: 'WO-9006',
    type: 'Sensör Sıfırlama',
    payload: 'RESET=HUM',
    status: 'Tamamlandı',
    createdDate: '2025-09-11 16:20',
    sentDate: '2025-09-11 16:22',
    responseDate: '2025-09-11 16:24'
  }
])

const alertData = ref([
  {
    alertId: 'AL-501',
    sensorId: 'ASK-2435',
    type: 'Basınç düşüşü',
    severity: 'Kritik',
    createdDate: '2025-09-15 03:20',
    status: 'Açık'
  },
  {
    alertId: 'AL-502',
    sensorId: 'ASK-2442',
    type: 'İletişim kaybı',
    severity: 'Yüksek',
    createdDate: '2025-09-14 19:05',
    status: 'İzlemede'
  },
  {
    alertId: 'AL-503',
    sensorId: 'ASK-2412',
    type: 'Debi eşiği aşıldı',
    severity: 'Kritik',
    createdDate: '2025-09-13 12:45',
    status: 'Açık'
  },
  {
    alertId: 'AL-504',
    sensorId: 'ASK-2466',
    type: 'Sayaç kapalı',
    severity: 'Yüksek',
    createdDate: '2025-09-16 05:32',
    status: 'Açık'
  },
  {
    alertId: 'AL-505',
    sensorId: 'ASK-2409',
    type: 'Geciken veri paketi',
    severity: 'Orta',
    createdDate: '2025-09-16 04:12',
    status: 'İzlemede'
  },
  {
    alertId: 'AL-506',
    sensorId: 'ASK-2474',
    type: 'Kaçak ihtimali',
    severity: 'Orta',
    createdDate: '2025-09-15 22:18',
    status: 'Açık'
  }
])

const localeText = {
  noRowsToShow: 'Gösterilecek kayıt yok',
  page: 'Sayfa',
  of: '/',
  to: '→',
  next: 'Sonraki',
  last: 'Son',
  first: 'İlk',
  previous: 'Önceki',
  applyFilter: 'Filtreyi uygula',
  clearFilter: 'Filtreyi temizle',
  resetFilter: 'Filtreyi sıfırla',
  searchOoo: 'Ara...',
  filterOoo: 'Filtrele...'
}

const selectAllRows = () => {
  if (gridRef.value?.api) {
    gridRef.value.api.selectAll()
    selectedRows.value = gridRef.value.api.getSelectedRows()
  }
}

const onSelectionChanged = () => {
  selectedRows.value = gridRef.value?.api?.getSelectedRows() || []
}

const sendWorkOrder = () => {
  if (!selectedRows.value.length) {
    return
  }
  workOrderPanel.value = true
}

const confirmSendWorkOrder = () => {
  if (!selectedWorkOrderType.value) {
    alert('Lütfen bir iş emri tipi seçiniz.')
    return
  }

  console.log('İş emri tipi:', selectedWorkOrderType.value)
  console.log('Seçili sayaçlar:', selectedRows.value)
  console.log('Girilen veriler:', workOrderPayload.value)

  alert(`${selectedRows.value.length} sayaç için '${selectedWorkOrderType.value}' iş emri hazırlandı (örnek simülasyon).`)

  workOrderPanel.value = false
  selectedWorkOrderType.value = null
  workOrderPayload.value = { description: '', calibrationCode: '', firmwareVersion: '', resetReason: '' }
}

const resetFilters = () => {
  selectedStatuses.value = []
  selectedFreshness.value = []
  selectedComm.value = []
  selectedZones.value = []
  searchTerm.value = ''
}

let mapInstance = null
let mapMarkers = []

const initMap = () => {
  const mapContainer = document.getElementById('sensor-map')
  if (!mapContainer) return

  if (!mapInstance) {
    mapInstance = L.map(mapContainer).setView([39.9334, 32.8597], 11)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance)
  }

  renderMarkers()
}

const renderMarkers = () => {
  if (!mapInstance) return
  mapMarkers.forEach((marker) => marker.remove())
  mapMarkers = []

  filteredSensors.value.forEach((sensor) => {
    const color =
      sensor.freshnessLevel === 'missed'
        ? '#EF4444'
        : sensor.freshnessLevel === 'delayed'
          ? '#F59E0B'
          : '#10B981'

    const marker = L.circleMarker([sensor.lat, sensor.lng], {
      color,
      radius: 9,
      fillColor: color,
      fillOpacity: 0.85,
      weight: 1.5
    })
      .bindPopup(
        `<strong>${sensor.sensorId}</strong><br>${sensor.zone}<br>${sensor.lastPacketLabel} • ${sensor.lastPacketAgo}`
      )
      .addTo(mapInstance)

    mapMarkers.push(marker)
  })
}

watch(filteredSensors, () => {
  renderMarkers()
})

onMounted(() => {
  initMap()
})
</script>

<style scoped>
.sensor-shell {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.sensor-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 28px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(45, 212, 191, 0.12));
  border: 1px solid var(--border-soft);
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.08);
}

.sensor-heading {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 620px;
}

.sensor-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(15, 118, 110, 0.12);
  padding: 6px 12px;
  border-radius: 999px;
  color: #0f766e;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.sensor-title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  color: var(--heading-color);
}

.sensor-subtitle {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--muted-text);
}

.sensor-header-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: stretch;
}

.meta-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid var(--border-soft);
  min-width: 220px;
}

.meta-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted-text);
  font-weight: 600;
}

.meta-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--heading-color);
}

.meta-hint {
  font-size: 13px;
  color: var(--muted-text);
}

.sensor-content {
  gap: 24px;
}

.filter-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px;
  border-radius: 20px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--heading-color);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--muted-text);
}

.filter-chip {
  justify-content: flex-start;
}

.schedule-card {
  padding: 20px;
  border-radius: 20px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-card h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--heading-color);
}

.schedule-card p {
  margin: 0;
  font-size: 13px;
  color: var(--muted-text);
}

.schedule-timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.35);
  border: 3px solid rgba(148, 163, 184, 0.45);
  margin-top: 3px;
}

.timeline-item.completed .timeline-dot {
  background: rgba(34, 197, 94, 0.45);
  border-color: rgba(34, 197, 94, 0.6);
}

.timeline-item.delayed .timeline-dot {
  background: rgba(245, 158, 11, 0.45);
  border-color: rgba(245, 158, 11, 0.6);
}

.timeline-item.upcoming .timeline-dot {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.35);
}

.timeline-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-time {
  font-weight: 700;
  color: var(--heading-color);
}

.timeline-status {
  font-size: 13px;
  color: var(--muted-text);
}

.timeline-note {
  font-size: 12px;
  color: var(--muted-text);
}

.list-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.list-card {
  padding: 24px;
  border-radius: 24px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 22px;
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
  max-width: 460px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-toggle {
  border: 1px solid var(--border-soft);
  border-radius: 12px;
}

.list-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.meta-chip {
  font-size: 13px;
  letter-spacing: 0.3px;
}

.grid-wrapper {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--border-soft);
}

.sensor-grid {
  width: 100%;
  height: 520px;
}

.card-grid {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.sensor-card {
  padding: 18px;
  border-radius: 20px;
  border: 1px solid var(--border-soft);
  background: rgba(255, 255, 255, 0.75);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.sensor-card.on-time {
  border-color: rgba(16, 185, 129, 0.35);
}

.sensor-card.delayed {
  border-color: rgba(245, 158, 11, 0.35);
}

.sensor-card.missed {
  border-color: rgba(248, 113, 113, 0.35);
}

.sensor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.sensor-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.sensor-id {
  font-size: 16px;
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
  gap: 10px;
}

.sensor-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: var(--muted-text);
}

.sensor-label {
  font-weight: 600;
  color: var(--heading-color);
}

.sensor-value {
  text-align: right;
}

.map-card {
  border-radius: 24px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.map-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--heading-color);
}

.map-subtitle {
  font-size: 13px;
  color: var(--muted-text);
}

.map-container {
  width: 100%;
  height: 320px;
  border-radius: 18px;
  border: 1px solid var(--border-soft);
  overflow: hidden;
}

.map-legend {
  display: flex;
  gap: 14px;
  font-size: 12px;
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
}

.legend-dot.on-time {
  background: #10b981;
}

.legend-dot.delayed {
  background: #f59e0b;
}

.legend-dot.missed {
  background: #ef4444;
}

.log-row {
  gap: 24px;
}

.log-card {
  padding: 22px;
  border-radius: 20px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.log-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--heading-color);
}

.log-header span {
  font-size: 13px;
  color: var(--muted-text);
}

:global(.sensor-row-delayed) {
  background: rgba(245, 158, 11, 0.12) !important;
}

:global(.sensor-row-missed) {
  background: rgba(248, 113, 113, 0.12) !important;
}

:global(.sensor-row-delayed .ag-cell),
:global(.sensor-row-missed .ag-cell) {
  border-bottom-color: transparent !important;
}

:global(.ag-theme-alpine.sensor-grid) {
  --ag-font-size: 13px;
  --ag-header-background-color: #f8fafc;
  --ag-border-color: #e2e8f0;
  --ag-row-hover-color: rgba(14, 165, 233, 0.12);
}

@media (max-width: 1280px) {
  .sensor-header {
    flex-direction: column;
  }

  .sensor-header-meta {
    width: 100%;
  }
}

@media (max-width: 960px) {
  .sensor-content {
    flex-direction: column;
  }

  .toolbar-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
