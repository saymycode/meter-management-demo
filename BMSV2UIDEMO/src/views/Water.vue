<template>
  <v-container fluid>
    <v-tabs v-model="activeTab" bg-color="primary" dark>
      <v-tab value="products">Ürünler</v-tab>
      <v-tab value="map">Harita</v-tab>
      <v-tab value="workorders">İş Emri Geçmişi</v-tab>
      <v-tab value="alerts">Uyarılar & Alarmlar</v-tab>
    </v-tabs>

    <v-window v-model="activeTab" class="mt-4">
      <v-window-item value="products">
        <div>
          <div class="d-flex align-center mb-2" style="gap: 10px">
            <v-btn color="primary" variant="outlined" @click="selectAllRows">Tümünü Seç</v-btn>
            <v-btn
              color="info"
              variant="flat"
              :disabled="selectedRows.length === 0"
              @click="sendWorkOrder"
            >
              İş Emri Gönder
            </v-btn>

            <v-select
              v-model="groupBy"
              :items="groupOptions"
              class="group-select"
              density="comfortable"
              hide-details
              label="Grupla"
              multiple
              chips
              variant="outlined"
            />

            <v-text-field
              v-model="quickFilterText"
              label="Genel Arama"
              prepend-inner-icon="search"
              variant="outlined"
              hide-details
              density="comfortable"
              clearable
            />
          </div>

          <v-data-table
            v-model:selected="selectedRows"
            :headers="tableHeaders"
            :items="filteredMeters"
            :group-by="tableGroupBy"
            :sort-by="tableSortBy"
            :items-per-page="6"
            class="water-table"
            density="comfortable"
            item-value="name"
            return-object
            show-select
            hover
            fixed-header
          >
            <template #item.status="{ item }">
              <v-chip :color="statusChipColor(item.status)" size="small" variant="tonal">
                {{ item.status }}
              </v-chip>
            </template>
            <template #item.consumptionDisplay="{ item }">
              <span class="mono">{{ item.consumptionDisplay }}</span>
            </template>
            <template #no-data>
              <div class="no-data">Eşleşen sayaç bulunamadı.</div>
            </template>
          </v-data-table>
        </div>
      </v-window-item>

      <v-window-item value="map">
        <div id="water-map" style="height: 600px; width: 100%; border-radius: 10px"></div>
      </v-window-item>

      <v-window-item value="workorders">
        <div>
          <v-text-field
            v-model="workOrderFilter"
            label="Genel Arama"
            prepend-inner-icon="search"
            variant="outlined"
            hide-details
            density="comfortable"
            clearable
            class="mb-3"
            style="max-width: 950px"
          />

          <v-data-table
            :headers="workOrderHeaders"
            :items="filteredWorkOrders"
            class="secondary-table"
            density="comfortable"
            :items-per-page="8"
            hover
            fixed-header
          >
            <template #item.status="{ item }">
              <v-chip :color="workOrderStatusColor(item.status)" size="small" variant="tonal">
                {{ item.status }}
              </v-chip>
            </template>
            <template #item.payload="{ item }">
              <span class="mono">{{ item.payload }}</span>
            </template>
            <template #item.workOrderId="{ item }">
              <span class="mono">{{ item.workOrderId }}</span>
            </template>
            <template #no-data>
              <div class="no-data">İş emri kaydı bulunamadı.</div>
            </template>
          </v-data-table>
        </div>
      </v-window-item>

      <v-window-item value="alerts">
        <div>
          <v-text-field
            v-model="alertFilter"
            label="Genel Arama"
            prepend-inner-icon="notifications_active"
            variant="outlined"
            hide-details
            density="comfortable"
            clearable
            class="mb-3"
            style="max-width: 950px"
          />

          <v-data-table
            :headers="alertHeaders"
            :items="filteredAlerts"
            class="secondary-table"
            density="comfortable"
            :items-per-page="8"
            hover
            fixed-header
          >
            <template #item.severity="{ item }">
              <v-chip :color="alertSeverityColor(item.severity)" size="small" variant="tonal">
                {{ item.severity }}
              </v-chip>
            </template>
            <template #item.payload="{ item }">
              <span class="mono">{{ item.payload }}</span>
            </template>
            <template #item.alertId="{ item }">
              <span class="mono">{{ item.alertId }}</span>
            </template>
            <template #no-data>
              <div class="no-data">Aktif uyarı bulunamadı.</div>
            </template>
          </v-data-table>
        </div>
      </v-window-item>
    </v-window>
  </v-container>

  <v-navigation-drawer
    v-model="workOrderPanel"
    location="right"
    width="400"
    temporary
    scrim="false"
    elevation="10"
  >
    <v-card flat>
      <v-card-title class="text-h6 d-flex align-center justify-space-between">
        <span>İş Emri Gönder</span>
        <v-btn icon="close" variant="text" @click="workOrderPanel = false" />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <div class="text-subtitle-2 mb-3 text-grey-darken-1">
          Seçili Sayaçlar: <strong>{{ selectedRows.length }}</strong>
        </div>

        <v-select
          v-model="selectedWorkOrderType"
          :items="workOrderTypes"
          label="İş Emri Tipi"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />

        <template v-if="selectedWorkOrderType === 'Sayaç Okuma'">
          <v-text-field
            v-model="workOrderPayload.readCommand"
            label="Okuma Komutu"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
        </template>

        <template v-else-if="selectedWorkOrderType === 'Debi Ayarla'">
          <v-text-field
            v-model="workOrderPayload.flowRate"
            label="Yeni Debi (m³/saat)"
            type="number"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
        </template>

        <template v-else-if="selectedWorkOrderType === 'Basınç Kontrolü'">
          <v-text-field
            v-model="workOrderPayload.pressureThreshold"
            label="Basınç Eşiği (bar)"
            type="number"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
        </template>

        <v-textarea
          v-model="workOrderPayload.description"
          label="Açıklama"
          variant="outlined"
          rows="2"
          class="mt-2"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-end">
        <v-btn color="grey" variant="text" @click="workOrderPanel = false">İptal</v-btn>
        <v-btn color="primary" variant="flat" @click="confirmSendWorkOrder">Gönder</v-btn>
      </v-card-actions>
    </v-card>
  </v-navigation-drawer>

  <transition name="slide-fade">
    <div v-if="workOrderNotification.visible" class="fancy-toast">
      <div class="toast-icon">
        <v-icon size="28" color="white">water</v-icon>
      </div>
      <div class="toast-text">
        💧 <strong>{{ workOrderNotification.message }}</strong>
      </div>
    </div>
  </transition>

  <transition name="slide-fade">
    <div v-if="alarmNotification.visible" class="alarm-toast">
      <div class="toast-icon">
        <v-icon size="28" color="white">warning</v-icon>
      </div>
      <div class="toast-text">
        <strong>{{ alarmNotification.message }}</strong>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const activeTab = ref('products')
const quickFilterText = ref('')
const workOrderFilter = ref('')
const alertFilter = ref('')

const selectedRows = ref([])
const workOrderPanel = ref(false)
const groupBy = ref([])

const groupOptions = [
  { title: 'Model', value: 'model' },
  { title: 'İletişim', value: 'type' },
  { title: 'Durum', value: 'status' },
]

const tableHeaders = [
  { title: 'Sayaç Kodu', key: 'name', sortable: true },
  { title: 'Model', key: 'model', sortable: true },
  { title: 'İletişim', key: 'type', sortable: true },
  { title: 'Tüketim (m³)', key: 'consumptionDisplay', sortable: true },
  { title: 'Komut İndeksi', key: 'commandIndex', sortable: true },
  { title: 'Durum', key: 'status', sortable: true },
]

const tableSortBy = ref([{ key: 'name', order: 'asc' }])
const tableGroupBy = computed(() => groupBy.value.map((key) => ({ key })))

const waterMeters = ref([
  {
    name: '20001',
    model: 'AK-411',
    Consumption: 0.5,
    commandIndex: 30,
    status: 'Aktif',
    type: 'LoRa',
    lat: 39.9208,
    lng: 32.8541,
  },
  {
    name: '20002',
    model: 'AK-311',
    Consumption: 0.2,
    commandIndex: 20,
    status: 'Pasif',
    type: 'GPRS',
    lat: 39.9224,
    lng: 32.8602,
  },
  {
    name: '20003',
    model: 'AK-211',
    Consumption: 1.5,
    commandIndex: 25,
    status: 'Aktif',
    type: 'NB-IoT',
    lat: 39.9191,
    lng: 32.8615,
  },
  {
    name: '20004',
    model: 'AK-511',
    Consumption: 0.1,
    commandIndex: 18,
    status: 'Pasif',
    type: 'LoRa',
    lat: 39.9212,
    lng: 32.8577,
  },
  {
    name: '20005',
    model: 'AK-611',
    Consumption: 0.9,
    commandIndex: 28,
    status: 'Aktif',
    type: 'GPRS',
    lat: 39.9187,
    lng: 32.8599,
  },
  {
    name: '20006',
    model: 'AK-711',
    Consumption: 0.4,
    commandIndex: 26,
    status: 'Aktif',
    type: 'NB-IoT',
    lat: 39.9231,
    lng: 32.8554,
  },
  {
    name: '20007',
    model: 'AK-811',
    Consumption: 1.2,
    commandIndex: 29,
    status: 'Aktif',
    type: 'LoRa',
    lat: 39.9245,
    lng: 32.8568,
  },
  {
    name: '20008',
    model: 'AK-911',
    Consumption: 0.6,
    commandIndex: 24,
    status: 'Pasif',
    type: 'GPRS',
    lat: 39.9253,
    lng: 32.8582,
  },
])

const meterRecords = computed(() =>
  waterMeters.value.map((meter) => ({
    ...meter,
    consumptionValue: meter.Consumption,
    consumptionDisplay: `${meter.Consumption.toLocaleString('tr-TR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}`,
  })),
)

const filteredMeters = computed(() => {
  const term = quickFilterText.value.trim().toLowerCase()
  if (!term) return meterRecords.value
  return meterRecords.value.filter((meter) =>
    `${meter.name} ${meter.model} ${meter.type} ${meter.status}`.toLowerCase().includes(term),
  )
})

const statusChipColor = (status) => (status === 'Aktif' ? 'info' : 'blue-grey-darken-1')

const selectAllRows = () => {
  selectedRows.value = [...filteredMeters.value]
}

watch(filteredMeters, () => {
  const allowed = new Set(filteredMeters.value.map((meter) => meter.name))
  selectedRows.value = selectedRows.value.filter((meter) => allowed.has(meter.name))
  if (activeTab.value === 'map') {
    setTimeout(initMap, 150)
  }
})

watch(activeTab, (val) => {
  if (val === 'map') setTimeout(initMap, 150)
})

let mapInstance = null

function initMap() {
  const mapContainer = document.getElementById('water-map')
  if (!mapContainer) return

  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }

  mapInstance = L.map(mapContainer).setView([39.92, 32.86], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(mapInstance)

  const markerSource = filteredMeters.value.length ? filteredMeters.value : meterRecords.value
  markerSource.forEach((meter) => {
    const color = meter.status === 'Aktif' ? '#0ea5e9' : '#64748b'
    L.circleMarker([meter.lat, meter.lng], {
      color,
      radius: 8,
      fillColor: color,
      fillOpacity: 0.85,
      weight: 1.5,
    })
      .bindPopup(
        `<b>${meter.name}</b><br>${meter.model} • ${meter.type}<br><span style="color:${color};font-weight:bold;">${meter.status}</span>`,
      )
      .addTo(mapInstance)
  })
}

const workOrderHeaders = [
  { title: 'Sayaç No', key: 'meterId', sortable: true },
  { title: 'İş Emri ID', key: 'workOrderId', sortable: true },
  { title: 'İş Emri Tipi', key: 'type', sortable: true },
  { title: 'Payload', key: 'payload', sortable: true },
  { title: 'Durum', key: 'status', sortable: true },
  { title: 'Oluşturulma', key: 'createdDate', sortable: true },
  { title: 'Gönderilme', key: 'sentDate', sortable: true },
  { title: 'Cevap', key: 'responseDate', sortable: true },
]

const workOrderData = ref([
  {
    meterId: '20001',
    workOrderId: 'AABBCC01',
    type: 'Sayaç Okuma',
    payload: '00112233AA',
    status: 'Tamamlandı',
    createdDate: '2025-10-21 09:05',
    sentDate: '2025-10-21 09:06',
    responseDate: '2025-10-21 09:07',
  },
  {
    meterId: '20002',
    workOrderId: 'AABBCC02',
    type: 'Vanayı Kapat',
    payload: '00112233AB',
    status: 'Gönderildi',
    createdDate: '2025-10-21 10:40',
    sentDate: '2025-10-21 10:41',
    responseDate: '-',
  },
  {
    meterId: '20003',
    workOrderId: 'AABBCC03',
    type: 'Basınç Kontrolü',
    payload: '00112233AC',
    status: 'Bekliyor',
    createdDate: '2025-10-22 08:20',
    sentDate: '-',
    responseDate: '-',
  },
  {
    meterId: '20004',
    workOrderId: 'AABBCC04',
    type: 'Sayaç Okuma',
    payload: '00112233AD',
    status: 'Başarısız',
    createdDate: '2025-10-19 14:05',
    sentDate: '2025-10-19 14:06',
    responseDate: '2025-10-19 14:07',
  },
  {
    meterId: '20005',
    workOrderId: 'AABBCC05',
    type: 'Debi Ayarla',
    payload: '00112233AE',
    status: 'Tamamlandı',
    createdDate: '2025-10-23 11:55',
    sentDate: '2025-10-23 11:56',
    responseDate: '2025-10-23 11:58',
  },
  {
    meterId: '20006',
    workOrderId: 'AABBCC06',
    type: 'Vanayı Aç',
    payload: '00112233AF',
    status: 'Gönderildi',
    createdDate: '2025-10-22 16:10',
    sentDate: '2025-10-22 16:11',
    responseDate: '-',
  },
  {
    meterId: '20007',
    workOrderId: 'AABBCC07',
    type: 'Sayaç Okuma',
    payload: '00112233BA',
    status: 'Tamamlandı',
    createdDate: '2025-10-20 07:45',
    sentDate: '2025-10-20 07:46',
    responseDate: '2025-10-20 07:48',
  },
  {
    meterId: '20008',
    workOrderId: 'AABBCC08',
    type: 'Basınç Kontrolü',
    payload: '00112233BB',
    status: 'Tamamlandı',
    createdDate: '2025-10-18 13:25',
    sentDate: '2025-10-18 13:26',
    responseDate: '2025-10-18 13:29',
  },
])

const filteredWorkOrders = computed(() => {
  const term = workOrderFilter.value.trim().toLowerCase()
  if (!term) return workOrderData.value
  return workOrderData.value.filter((item) =>
    `${item.meterId} ${item.type} ${item.workOrderId} ${item.payload} ${item.status}`.toLowerCase().includes(term),
  )
})

const workOrderStatusColor = (status) => {
  const colors = {
    Bekliyor: 'warning',
    Gönderildi: 'info',
    Tamamlandı: 'success',
    Başarısız: 'error',
  }
  return colors[status] || 'secondary'
}

const alertHeaders = [
  { title: 'Sayaç No', key: 'meterId', sortable: true },
  { title: 'Uyarı ID', key: 'alertId', sortable: true },
  { title: 'Uyarı Tipi', key: 'type', sortable: true },
  { title: 'Önem', key: 'severity', sortable: true },
  { title: 'Tarih', key: 'createdDate', sortable: true },
  { title: 'Durum', key: 'status', sortable: true },
]

const alertData = ref([
  {
    alertId: 'AABBCC20001',
    meterId: '20001',
    type: 'Kaçak Tespiti',
    severity: 'Kritik',
    createdDate: '2025-10-23 09:45',
    status: 'Açık',
  },
  {
    alertId: 'AABBCC20005',
    meterId: '20005',
    type: 'Basınç Düşüklüğü',
    severity: 'Yüksek',
    createdDate: '2025-10-23 08:30',
    status: 'İzlemede',
  },
  {
    alertId: 'AABBCC20008',
    meterId: '20008',
    type: 'Ters Akış',
    severity: 'Orta',
    createdDate: '2025-10-22 18:15',
    status: 'Kapalı',
  },
  {
    alertId: 'AABBCC20009',
    meterId: '20009',
    type: 'Ani Debi Artışı',
    severity: 'Düşük',
    createdDate: '2025-10-21 21:05',
    status: 'Kapalı',
  },
])

const filteredAlerts = computed(() => {
  const term = alertFilter.value.trim().toLowerCase()
  if (!term) return alertData.value
  return alertData.value.filter((item) =>
    `${item.meterId} ${item.type} ${item.severity} ${item.status}`.toLowerCase().includes(term),
  )
})

const alertSeverityColor = (severity) => {
  const colors = {
    Düşük: 'light-blue-lighten-3',
    Orta: 'light-blue',
    Yüksek: 'light-blue-darken-1',
    Kritik: 'indigo-darken-4',
  }
  return colors[severity] || 'secondary'
}

const workOrderTypes = ['Sayaç Okuma', 'Debi Ayarla', 'Basınç Kontrolü', 'Vanayı Aç', 'Vanayı Kapat']
const selectedWorkOrderType = ref(null)
const workOrderPayload = ref({ description: '', readCommand: '', flowRate: '', pressureThreshold: '' })

const sendWorkOrder = () => {
  if (!selectedRows.value.length) {
    alert('Herhangi bir sayaç seçilmedi.')
    return
  }
  workOrderPanel.value = true
}

const confirmSendWorkOrder = () => {
  const type = selectedWorkOrderType.value
  if (!type) {
    alert('Lütfen bir iş emri tipi seçiniz.')
    return
  }

  console.log('İş emri tipi:', type)
  console.log('Seçili sayaçlar:', selectedRows.value)
  console.log('Girilen veriler:', workOrderPayload.value)

  alert(`${selectedRows.value.length} sayaç için '${type}' iş emri hazırlandı (örnek simülasyon).`)

  workOrderPanel.value = false
  selectedWorkOrderType.value = null
  workOrderPayload.value = { description: '', readCommand: '', flowRate: '', pressureThreshold: '' }
}

const workOrderNotification = ref({ visible: false, message: '' })
let workOrderTimer = null

const showRandomWorkOrderResponse = () => {
  const pool = filteredMeters.value.length ? filteredMeters.value : meterRecords.value
  const randomMeter = pool[Math.floor(Math.random() * pool.length)]
  if (!randomMeter) return

  workOrderNotification.value.message = `${randomMeter.name} su sayacından iş emri cevabı alındı!`
  workOrderNotification.value.visible = true
  setTimeout(() => (workOrderNotification.value.visible = false), 4000)
}

const alarmNotification = ref({ visible: false, message: '' })
let alarmTimer = null

const showRandomAlarm = () => {
  const pool = filteredMeters.value.length ? filteredMeters.value : meterRecords.value
  const randomMeter = pool[Math.floor(Math.random() * pool.length)]
  if (!randomMeter) return

  const randomType = ['Kaçak tespiti', 'Basınç düşüklüğü', 'Ters akış uyarısı'][Math.floor(Math.random() * 3)]
  alarmNotification.value.message = `🚨 ${randomMeter.name} sayacında ${randomType}!`
  alarmNotification.value.visible = true
  setTimeout(() => (alarmNotification.value.visible = false), 4000)
}

onMounted(() => {
  const loop = () => {
    const delay = 6000 + Math.random() * 9000
    workOrderTimer = setTimeout(() => {
      showRandomWorkOrderResponse()
      loop()
    }, delay)
  }

  const alarmLoop = () => {
    const delay = 18000 + Math.random() * 22000
    alarmTimer = setTimeout(() => {
      showRandomAlarm()
      alarmLoop()
    }, delay)
  }

  loop()
  alarmLoop()
})

onUnmounted(() => {
  if (workOrderTimer) clearTimeout(workOrderTimer)
  if (alarmTimer) clearTimeout(alarmTimer)
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<style scoped>
.group-select {
  min-width: 180px;
}

.water-table,
.secondary-table {
  background: transparent;
  border-radius: 16px;
}

.water-table :deep(table),
.secondary-table :deep(table) {
  background: transparent;
}

.water-table :deep(thead tr),
.secondary-table :deep(thead tr) {
  background: rgba(15, 23, 42, 0.85);
}

.water-table :deep(th),
.secondary-table :deep(th) {
  color: rgba(226, 232, 240, 0.85);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.4px;
}

.water-table :deep(td),
.secondary-table :deep(td) {
  color: rgba(241, 245, 249, 0.92);
  font-size: 14px;
}

.water-table :deep(tbody tr:hover),
.secondary-table :deep(tbody tr:hover) {
  background: rgba(14, 165, 233, 0.12);
}

.secondary-table {
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.24);
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
  background: var(--toast-positive-bg);
  color: var(--toast-positive-text);
  padding: 16px 22px;
  border-radius: 14px;
  box-shadow: var(--toast-positive-shadow);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.3px;
  animation: toastPulse 4s ease-in-out infinite;
}

@keyframes toastPulse {
  0%,
  100% {
    box-shadow: var(--toast-positive-shadow);
    transform: translateY(0);
  }
  50% {
    box-shadow: var(--toast-positive-shadow);
    transform: translateY(-2px);
  }
}

.toast-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-text {
  white-space: nowrap;
}

.alarm-toast {
  position: fixed;
  bottom: 110px;
  right: 24px;
  background: var(--toast-alarm-bg);
  color: var(--toast-alarm-text);
  padding: 16px 22px;
  border-radius: 14px;
  box-shadow: var(--toast-alarm-shadow);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9998;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  animation: alarmPulse 4s ease-in-out infinite;
}

@keyframes alarmPulse {
  0%,
  100% {
    box-shadow: var(--toast-alarm-shadow);
    transform: translateY(0);
  }
  50% {
    box-shadow: var(--toast-alarm-shadow);
    transform: translateY(-2px);
  }
}

@media (max-width: 600px) {
  .fancy-toast,
  .alarm-toast {
    right: 16px;
    left: 16px;
  }

  .alarm-toast {
    bottom: 180px;
  }
}
</style>
