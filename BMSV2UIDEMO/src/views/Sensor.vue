<template>
  <v-container fluid class="sensor-shell" tag="section">
    <div class="sensor-header">
      <div class="sensor-heading">
        <div class="sensor-badge">Su sayaçları</div>
        <h1 class="sensor-title">Sayaç listesi</h1>
        <p class="sensor-subtitle">
          Kurumunuza ait LoRa ve GPRS sayaçları gün içinde yalnızca birkaç kez toplu veri gönderir. Bu liste son alınan partiye
          göre güncellendi ve ortalama aralık dışına çıkan sayaçlar vurgulandı.
        </p>
      </div>
      <div class="sensor-header-meta">
        <div class="meta-card">
          <span class="meta-label">Son veri alımı</span>
          <span class="meta-value">{{ lastBatchLabel }}</span>
          <span class="meta-hint">{{ lastBatchAgo }}</span>
        </div>
        <div class="meta-card">
          <span class="meta-label">Son 24 saatte parti</span>
          <span class="meta-value">{{ batchesInLastDay }}</span>
          <span class="meta-hint">Ortalama {{ averageIntervalLabel }} aralık</span>
        </div>
        <div class="meta-card">
          <span class="meta-label">Veri durumu</span>
          <v-chip :color="freshnessChip.color" size="small" variant="tonal">{{ freshnessChip.label }}</v-chip>
          <span class="meta-hint">{{ freshnessChip.helper }}</span>
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
            <span class="filter-title">Veri aralığı</span>
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

        <v-card class="update-card" elevation="0">
          <h2>Son gelen partiler</h2>
          <p>Gerçekleşen iletimler ve kapsama oranı.</p>
          <ul class="update-list">
            <li v-for="batch in recentBatches" :key="batch.id" class="update-item">
              <div class="update-time">{{ batch.timeLabel }}</div>
              <div class="update-meta">{{ batch.agoLabel }} • {{ batch.coverageLabel }}</div>
            </li>
          </ul>
          <div class="update-footer">
            <v-icon size="18" color="primary">mdi-timer-sand</v-icon>
            <span>{{ cadenceSummary }}</span>
          </div>
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
            <v-chip class="meta-chip" color="success" variant="tonal">Beklenen aralıkta: {{ filteredStats.onTime }}</v-chip>
            <v-chip class="meta-chip" color="amber-darken-2" variant="tonal">
              Kontrol edilmeli: {{ filteredStats.delayed }}
            </v-chip>
            <v-chip class="meta-chip" color="red-darken-2" variant="tonal">
              Müdahale gerekli: {{ filteredStats.missed }}
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
                      <span class="sensor-value">{{ sensor.lastReading }} • {{ sensor.batchLabel }}</span>
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
              <span class="legend-dot on-time" /> Beklenen aralıkta
            </div>
            <div class="legend-item">
              <span class="legend-dot delayed" /> Kontrol edilmeli
            </div>
            <div class="legend-item">
              <span class="legend-dot missed" /> Müdahale gerekli
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
const minutesAgo = (minutes) => new Date(nowRef.value.getTime() - minutes * 60000)

const batchHistory = ref([
  { id: 'batch-0', receivedAt: minutesAgo(75), meterCount: 15428, coverage: 0.92 },
  { id: 'batch-1', receivedAt: minutesAgo(320), meterCount: 15206, coverage: 0.9 },
  { id: 'batch-2', receivedAt: minutesAgo(645), meterCount: 15102, coverage: 0.88 },
  { id: 'batch-3', receivedAt: minutesAgo(980), meterCount: 15688, coverage: 0.94 },
  { id: 'batch-4', receivedAt: minutesAgo(1320), meterCount: 14974, coverage: 0.87 }
])

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

const formatDuration = (minutes) => {
  if (!minutes || Number.isNaN(minutes)) {
    return '-'
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (hours === 0) return `${mins} dk`
  if (mins === 0) return `${hours} saat`
  return `${hours} saat ${mins} dk`
}

const lastBatchReceived = computed(() => batchHistory.value[0]?.receivedAt ?? nowRef.value)

const batchIntervals = computed(() => {
  const items = batchHistory.value
  const result = []
  for (let index = 0; index < items.length - 1; index += 1) {
    const current = items[index]
    const next = items[index + 1]
    if (current && next) {
      result.push(Math.abs((current.receivedAt.getTime() - next.receivedAt.getTime()) / 60000))
    }
  }
  return result
})

const averageIntervalMinutes = computed(() => {
  const intervals = batchIntervals.value
  if (!intervals.length) {
    return 0
  }
  const total = intervals.reduce((sum, value) => sum + value, 0)
  return total / intervals.length
})

const batchesInLastDay = computed(
  () => batchHistory.value.filter((batch) => nowRef.value.getTime() - batch.receivedAt.getTime() <= 24 * 60 * 60000).length
)

const averageIntervalLabel = computed(() => formatDuration(averageIntervalMinutes.value))

const cadenceSummary = computed(() => {
  if (!batchHistory.value.length) {
    return 'Henüz parti alınmadı.'
  }
  return `Son 24 saatte ${batchesInLastDay.value} parti • Ortalama aralık ${averageIntervalLabel.value}`
})

const recentBatches = computed(() =>
  batchHistory.value.slice(0, 4).map((batch) => ({
    id: batch.id,
    timeLabel: formatTime(batch.receivedAt),
    agoLabel: formatAgo(batch.receivedAt, nowRef.value),
    coverageLabel: `%${Math.round(batch.coverage * 100)}`
  }))
)

const lastBatchLabel = computed(() => formatTime(lastBatchReceived.value))
const lastBatchAgo = computed(() => formatAgo(lastBatchReceived.value, nowRef.value))

const freshnessChip = computed(() => {
  const diffMinutes = Math.max(0, (nowRef.value.getTime() - lastBatchReceived.value.getTime()) / 60000)
  const baseline = averageIntervalMinutes.value || 240
  const watchThreshold = baseline * 1.5
  const actionThreshold = baseline * 2.4

  if (diffMinutes <= watchThreshold) {
    return {
      label: 'Beklenen aralıkta',
      color: 'success',
      helper: `Son parti ${lastBatchAgo.value}`
    }
  }
  if (diffMinutes <= actionThreshold) {
    return {
      label: 'Kontrol edilmeli',
      color: 'amber-darken-2',
      helper: `Son parti ${lastBatchAgo.value}`
    }
  }
  return {
    label: 'Müdahale gerekli',
    color: 'red-darken-2',
    helper: `Son parti ${lastBatchAgo.value}`
  }
})

const statusOptions = ['Aktif', 'Gecikmeli', 'Offline']
const freshnessOptions = ['Beklenen aralıkta', 'Kontrol edilmeli', 'Müdahale gerekli']
const communicationOptions = ['LoRa', 'GPRS']

const selectedStatuses = ref([])
const selectedFreshness = ref([])
const selectedComm = ref([])
const selectedZones = ref([])
const searchTerm = ref('')

const sensors = ref([
  {
    sensorId: 'ASK-2401',
    zone: 'Çankaya DMA-3',
    location: 'Atatürk Bulvarı 112',
    commMethod: 'LoRa',
    lastReading: '132.4 m³',
    lastPacketAt: minutesAgo(110).toISOString(),
    batchLabel: 'Parti #4532',
    status: 'Aktif',
    battery: '%86',
    signal: '-78 dBm',
    freshnessMinutes: 110,
    lat: 39.9209,
    lng: 32.8541
  },
  {
    sensorId: 'ASK-2405',
    zone: 'Yenimahalle sanayi',
    location: 'Organize Sanayi 3. Cadde',
    commMethod: 'GPRS',
    lastReading: '221.7 m³',
    lastPacketAt: minutesAgo(280).toISOString(),
    batchLabel: 'Parti #4531',
    status: 'Aktif',
    battery: '%78',
    signal: '-83 dBm',
    freshnessMinutes: 280,
    lat: 39.9727,
    lng: 32.7305
  },
  {
    sensorId: 'ASK-2409',
    zone: 'Keçiören konut hattı',
    location: 'Fatih Caddesi 54',
    commMethod: 'LoRa',
    lastReading: '89.2 m³',
    lastPacketAt: minutesAgo(460).toISOString(),
    batchLabel: 'Parti #4529',
    status: 'Gecikmeli',
    battery: '%74',
    signal: '-80 dBm',
    freshnessMinutes: 460,
    lat: 39.9836,
    lng: 32.8628
  },
  {
    sensorId: 'ASK-2412',
    zone: 'Altındağ tarihi merkez',
    location: 'Anafartalar Mahallesi 18',
    commMethod: 'LoRa',
    lastReading: '76.5 m³',
    lastPacketAt: minutesAgo(640).toISOString(),
    batchLabel: 'Parti #4528',
    status: 'Gecikmeli',
    battery: '%69',
    signal: '-88 dBm',
    freshnessMinutes: 640,
    lat: 39.9423,
    lng: 32.8611
  },
  {
    sensorId: 'ASK-2419',
    zone: 'Polatlı transfer hattı',
    location: 'Polatlı OSB Girişi',
    commMethod: 'GPRS',
    lastReading: '304.1 m³',
    lastPacketAt: minutesAgo(1500).toISOString(),
    batchLabel: 'Parti #4524',
    status: 'Offline',
    battery: '%41',
    signal: '-',
    freshnessMinutes: 1500,
    lat: 39.5866,
    lng: 32.1475
  },
  {
    sensorId: 'ASK-2423',
    zone: 'Mamak konut hattı',
    location: 'Başak Mahallesi 21',
    commMethod: 'LoRa',
    lastReading: '112.3 m³',
    lastPacketAt: minutesAgo(190).toISOString(),
    batchLabel: 'Parti #4530',
    status: 'Aktif',
    battery: '%82',
    signal: '-75 dBm',
    freshnessMinutes: 190,
    lat: 39.9298,
    lng: 32.8868
  },
  {
    sensorId: 'ASK-2431',
    zone: 'Sincan endüstriyel bölge',
    location: '1. Organize 5. Sokak',
    commMethod: 'GPRS',
    lastReading: '198.6 m³',
    lastPacketAt: minutesAgo(720).toISOString(),
    batchLabel: 'Parti #4527',
    status: 'Gecikmeli',
    battery: '%65',
    signal: '-91 dBm',
    freshnessMinutes: 720,
    lat: 39.9609,
    lng: 32.6205
  },
  {
    sensorId: 'ASK-2435',
    zone: 'İvedik terfi hattı',
    location: 'Kavaklıdere Mevkii',
    commMethod: 'LoRa',
    lastReading: '256.9 m³',
    lastPacketAt: minutesAgo(1480).toISOString(),
    batchLabel: 'Parti #4525',
    status: 'Offline',
    battery: '%58',
    signal: '-',
    freshnessMinutes: 1480,
    lat: 40.0006,
    lng: 32.8134
  },
  {
    sensorId: 'ASK-2442',
    zone: 'Gölbaşı kampüs',
    location: 'İncek Bulvarı 15',
    commMethod: 'LoRa',
    lastReading: '65.7 m³',
    lastPacketAt: minutesAgo(260).toISOString(),
    batchLabel: 'Parti #4531',
    status: 'Aktif',
    battery: '%91',
    signal: '-70 dBm',
    freshnessMinutes: 260,
    lat: 39.8056,
    lng: 32.8267
  },
  {
    sensorId: 'ASK-2447',
    zone: 'Elmadağ içme suyu',
    location: 'Şehitlik Mahallesi 9',
    commMethod: 'GPRS',
    lastReading: '142.8 m³',
    lastPacketAt: minutesAgo(510).toISOString(),
    batchLabel: 'Parti #4529',
    status: 'Gecikmeli',
    battery: '%67',
    signal: '-88 dBm',
    freshnessMinutes: 510,
    lat: 39.9204,
    lng: 33.2304
  },
  {
    sensorId: 'ASK-2452',
    zone: 'Etimesgut konut hattı',
    location: 'Şeker Mahallesi 61',
    commMethod: 'LoRa',
    lastReading: '104.6 m³',
    lastPacketAt: minutesAgo(140).toISOString(),
    batchLabel: 'Parti #4532',
    status: 'Aktif',
    battery: '%88',
    signal: '-72 dBm',
    freshnessMinutes: 140,
    lat: 39.9516,
    lng: 32.6221
  },
  {
    sensorId: 'ASK-2458',
    zone: 'Pursaklar dağıtım',
    location: 'Tevfik İleri Cad. 44',
    commMethod: 'LoRa',
    lastReading: '76.2 m³',
    lastPacketAt: minutesAgo(330).toISOString(),
    batchLabel: 'Parti #4530',
    status: 'Aktif',
    battery: '%84',
    signal: '-77 dBm',
    freshnessMinutes: 330,
    lat: 40.0381,
    lng: 32.8991
  },
  {
    sensorId: 'ASK-2466',
    zone: 'Ostim sanayi',
    location: '1234. Sokak 17',
    commMethod: 'GPRS',
    lastReading: '278.4 m³',
    lastPacketAt: minutesAgo(1380).toISOString(),
    batchLabel: 'Parti #4526',
    status: 'Offline',
    battery: '%49',
    signal: '-',
    freshnessMinutes: 1380,
    lat: 39.9753,
    lng: 32.7642
  },
  {
    sensorId: 'ASK-2474',
    zone: 'Ayaş kaynak',
    location: 'Ayaş Yolu 5. Km',
    commMethod: 'LoRa',
    lastReading: '88.5 m³',
    lastPacketAt: minutesAgo(380).toISOString(),
    batchLabel: 'Parti #4529',
    status: 'Gecikmeli',
    battery: '%72',
    signal: '-85 dBm',
    freshnessMinutes: 380,
    lat: 40.0219,
    lng: 32.3374
  },
  {
    sensorId: 'ASK-2479',
    zone: 'Beypazarı dağıtım',
    location: 'Zafer Mahallesi 6',
    commMethod: 'GPRS',
    lastReading: '156.3 m³',
    lastPacketAt: minutesAgo(260).toISOString(),
    batchLabel: 'Parti #4531',
    status: 'Aktif',
    battery: '%83',
    signal: '-82 dBm',
    freshnessMinutes: 260,
    lat: 40.1678,
    lng: 31.9215
  },
  {
    sensorId: 'ASK-2483',
    zone: 'Kazan endüstriyel bölge',
    location: 'Fabrika Caddesi 3',
    commMethod: 'LoRa',
    lastReading: '214.7 m³',
    lastPacketAt: minutesAgo(1240).toISOString(),
    batchLabel: 'Parti #4526',
    status: 'Offline',
    battery: '%52',
    signal: '-',
    freshnessMinutes: 1240,
    lat: 40.2315,
    lng: 32.6802
  },
  {
    sensorId: 'ASK-2489',
    zone: 'Şereflikoçhisar kuyular',
    location: 'Güney Mahallesi 2',
    commMethod: 'GPRS',
    lastReading: '198.1 m³',
    lastPacketAt: minutesAgo(310).toISOString(),
    batchLabel: 'Parti #4530',
    status: 'Aktif',
    battery: '%76',
    signal: '-79 dBm',
    freshnessMinutes: 310,
    lat: 38.9396,
    lng: 33.5381
  },
  {
    sensorId: 'ASK-2493',
    zone: 'Çubuk dağıtım',
    location: 'Yıldırım Beyazıt Cad. 28',
    commMethod: 'LoRa',
    lastReading: '134.2 m³',
    lastPacketAt: minutesAgo(125).toISOString(),
    batchLabel: 'Parti #4532',
    status: 'Aktif',
    battery: '%90',
    signal: '-69 dBm',
    freshnessMinutes: 125,
    lat: 40.2389,
    lng: 33.0326
  }
])

const zoneOptions = computed(() => {
  const set = new Set()
  sensors.value.forEach((sensor) => set.add(sensor.zone))
  return Array.from(set)
})

const resolveFreshness = (minutes) => {
  const baseline = averageIntervalMinutes.value || 240
  const watchThreshold = baseline * 1.5
  const actionThreshold = baseline * 2.4

  if (minutes <= watchThreshold) {
    return {
      badge: 'Beklenen aralıkta',
      filter: 'Beklenen aralıkta',
      chipColor: 'success',
      level: 'on-time',
      tone: 'rgba(16, 185, 129, 0.18)',
      description: 'Ortalama aralık içinde.'
    }
  }
  if (minutes <= actionThreshold) {
    return {
      badge: 'Kontrol edilmeli',
      filter: 'Kontrol edilmeli',
      chipColor: 'amber-darken-2',
      level: 'delayed',
      tone: 'rgba(245, 158, 11, 0.18)',
      description: 'Aralık aşıldı, izleme önerilir.'
    }
  }
  return {
    badge: 'Müdahale gerekli',
    filter: 'Müdahale gerekli',
    chipColor: 'red-darken-2',
    level: 'missed',
    tone: 'rgba(248, 113, 113, 0.18)',
    description: 'Uzayan gecikme nedeniyle aksiyon alınmalı.'
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
    if (sensor.freshnessFilter === 'Beklenen aralıkta') onTime += 1
    else if (sensor.freshnessFilter === 'Kontrol edilmeli') delayed += 1
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
    headerName: 'Veri aralığı',
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
  { field: 'batchLabel', headerName: 'Parti etiketi', width: 160 }
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
  page: 'Sayfa',
  more: 'Daha fazla',
  to: '-',
  of: '/',
  next: 'Sonraki',
  last: 'Son',
  first: 'İlk',
  previous: 'Önceki',
  loadingOoo: 'Yükleniyor...',
  selectAll: 'Tümünü seç',
  searchOoo: 'Ara...',
  blanks: 'Boş',
  filterOoo: 'Filtrele...',
  applyFilter: 'Uygula',
  equals: 'Eşittir',
  notEqual: 'Eşit değil',
  lessThan: 'Küçüktür',
  greaterThan: 'Büyüktür'
}

const resetFilters = () => {
  selectedStatuses.value = []
  selectedFreshness.value = []
  selectedComm.value = []
  selectedZones.value = []
  searchTerm.value = ''
}

const selectAllRows = () => {
  if (!gridRef.value) return
  gridRef.value.api.selectAll()
}

const onSelectionChanged = (event) => {
  selectedRows.value = event.api.getSelectedRows()
}

const sendWorkOrder = () => {
  if (!selectedRows.value.length) return
  workOrderPanel.value = true
}

const confirmSendWorkOrder = () => {
  workOrderPanel.value = false
  selectedWorkOrderType.value = null
  workOrderPayload.value = { description: '', calibrationCode: '', firmwareVersion: '', resetReason: '' }
}

const updateMapMarkers = (mapInstance) => {
  sensors.value.forEach((sensor) => {
    const freshness = resolveFreshness(sensor.freshnessMinutes)
    const marker = L.circleMarker([sensor.lat, sensor.lng], {
      radius: 10,
      color: '#0f172a',
      weight: 1,
      fillOpacity: 0.85,
      fillColor:
        freshness.level === 'on-time'
          ? 'rgba(16, 185, 129, 0.9)'
          : freshness.level === 'delayed'
            ? 'rgba(245, 158, 11, 0.9)'
            : 'rgba(248, 113, 113, 0.9)'
    })
    marker.bindPopup(
      `<strong>${sensor.sensorId}</strong><br/>${sensor.zone}<br/>Son veri: ${formatTime(new Date(sensor.lastPacketAt))}<br/>${freshness.badge}`
    )
    marker.addTo(mapInstance)
  })
}

let mapInstance = null

onMounted(() => {
  mapInstance = L.map('sensor-map').setView([39.9334, 32.8597], 9)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap'
  }).addTo(mapInstance)
  updateMapMarkers(mapInstance)
})

watch([sensors, averageIntervalMinutes], () => {
  if (mapInstance) {
    mapInstance.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        mapInstance.removeLayer(layer)
      }
    })
    updateMapMarkers(mapInstance)
  }
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
  gap: 28px;
  align-items: flex-start;
  justify-content: space-between;
}

.sensor-heading {
  flex: 1 1 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sensor-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(14, 165, 233, 0.16);
  padding: 6px 12px;
  border-radius: 999px;
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

.update-card {
  padding: 20px;
  border-radius: 20px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.update-card h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--heading-color);
}

.update-card p {
  margin: 0;
  font-size: 13px;
  color: var(--muted-text);
}

.update-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.update-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.04);
}

.update-time {
  font-weight: 600;
  color: var(--heading-color);
}

.update-meta {
  font-size: 13px;
  color: var(--muted-text);
}

.update-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--muted-text);
}

.list-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.list-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  border-radius: 22px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
}

.list-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.toolbar-search {
  flex: 1 1 280px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-toggle {
  border-radius: 999px;
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
  min-height: 480px;
}

.sensor-grid {
  width: 100%;
  height: 480px;
  border-radius: 18px;
}

.card-grid {
  padding-top: 6px;
}

.sensor-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.sensor-card.on-time {
  border-color: rgba(16, 185, 129, 0.4);
}

.sensor-card.delayed {
  border-color: rgba(245, 158, 11, 0.4);
}

.sensor-card.missed {
  border-color: rgba(248, 113, 113, 0.4);
}

.sensor-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

.sensor-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.sensor-id {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--heading-color);
}

.sensor-zone {
  font-size: 13px;
  color: var(--muted-text);
}

.sensor-card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;
  color: var(--muted-text);
}

.sensor-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.sensor-label {
  font-weight: 600;
  color: var(--heading-color);
}

.sensor-value {
  text-align: right;
}

.map-card {
  padding: 24px;
  border-radius: 22px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.map-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--heading-color);
}

.map-subtitle {
  font-size: 13px;
  color: var(--muted-text);
}

.map-container {
  width: 100%;
  height: 380px;
  border-radius: 18px;
  overflow: hidden;
}

.map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
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
}

.legend-dot.on-time {
  background: rgba(16, 185, 129, 0.9);
}

.legend-dot.delayed {
  background: rgba(245, 158, 11, 0.9);
}

.legend-dot.missed {
  background: rgba(248, 113, 113, 0.9);
}

.log-row {
  gap: 20px;
}

.log-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px;
  border-radius: 20px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.log-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--heading-color);
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
  .list-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    justify-content: space-between;
  }

  .map-container {
    height: 320px;
  }
}
</style>
