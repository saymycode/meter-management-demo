<template>
  <v-container fluid>
    <v-tabs v-model="activeTab" bg-color="primary" dark>
      <v-tab value="sensors">Sensörler</v-tab>
      <v-tab value="map">Harita</v-tab>
      <v-tab value="workorders">İş Emri Geçmişi</v-tab>
      <v-tab value="alerts">Uyarılar & Alarmlar</v-tab>
    </v-tabs>

    <v-window v-model="activeTab" class="mt-4">
      <v-window-item value="sensors">
        <div>
          <div class="d-flex align-center mb-2" style="gap: 10px">
            <v-btn color="primary" variant="outlined" @click="selectAllRows">Tümünü Seç</v-btn>
            <v-btn
              color="success"
              variant="flat"
              :disabled="selectedRows.length === 0"
              @click="sendWorkOrder"
            >
              İş Emri Gönder
            </v-btn>

            <v-text-field
              v-model="quickFilterText"
              label="Genel Arama"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              density="comfortable"
              clearable
            />
          </div>

          <ag-grid-vue
            class="ag-theme-alpine"
            style="height: 600px; width: 100%"
            ref="gridRef"
            :columnDefs="columnDefs"
            :rowData="sensors"
            :quickFilterText="quickFilterText"
            rowGroupPanelShow="always"
            animateRows="true"
            groupSelectsChildren="true"
            rowSelection="multiple"
            :localeText="localeText"
            :defaultColDef="defaultColDef"
            pagination
            :paginationPageSize="6"
            @selection-changed="onSelectionChanged"
          />
        </div>
      </v-window-item>

      <v-window-item value="map">
        <div id="sensor-map" style="height: 600px; width: 100%; border-radius: 10px"></div>
      </v-window-item>

      <v-window-item value="workorders">
        <div>
          <v-text-field
            v-model="workOrderFilter"
            label="Genel Arama"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            density="comfortable"
            clearable
            class="mb-3"
            style="max-width: 950px"
          />

          <ag-grid-vue
            class="ag-theme-alpine"
            style="height: 600px; width: 100%"
            ref="workOrderGridRef"
            :columnDefs="workOrderColumnDefs"
            :rowData="workOrderData"
            :quickFilterText="workOrderFilter"
            rowGroupPanelShow="always"
            animateRows="true"
            groupSelectsChildren="true"
            :localeText="localeText"
            :defaultColDef="defaultColDef"
            pagination
            :paginationPageSize="8"
          />
        </div>
      </v-window-item>

      <v-window-item value="alerts">
        <div>
          <v-text-field
            v-model="alertFilter"
            label="Genel Arama"
            prepend-inner-icon="mdi-bell-alert"
            variant="outlined"
            hide-details
            density="comfortable"
            clearable
            class="mb-3"
            style="max-width: 950px"
          />

          <ag-grid-vue
            class="ag-theme-alpine"
            style="height: 600px; width: 100%"
            ref="alertGridRef"
            :columnDefs="alertColumnDefs"
            :rowData="alertData"
            :quickFilterText="alertFilter"
            rowGroupPanelShow="always"
            animateRows="true"
            groupSelectsChildren="true"
            :localeText="localeText"
            :defaultColDef="defaultColDef"
            pagination
            :paginationPageSize="8"
          />
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
        <v-btn icon="mdi-close" variant="text" @click="workOrderPanel = false" />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <div class="text-subtitle-2 mb-3 text-grey-darken-1">
          Seçili Sensörler: <strong>{{ selectedRows.length }}</strong>
        </div>

        <v-select
          v-model="selectedWorkOrderType"
          :items="workOrderTypes"
          label="İş Emri Tipi"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />

        <template v-if="selectedWorkOrderType === 'Kalibrasyon'">
          <v-text-field
            v-model="workOrderPayload.calibrationCode"
            label="Kalibrasyon Kodu"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
        </template>

        <template v-else-if="selectedWorkOrderType === 'Firmware Güncelleme'">
          <v-text-field
            v-model="workOrderPayload.firmwareVersion"
            label="Hedef Firmware Sürümü"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
        </template>

        <template v-else-if="selectedWorkOrderType === 'Sensör Sıfırlama'">
          <v-text-field
            v-model="workOrderPayload.resetReason"
            label="Sıfırlama Nedeni"
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
        <v-icon size="28" color="white">mdi-access-point</v-icon>
      </div>
      <div class="toast-text">
        📡 <strong>{{ workOrderNotification.message }}</strong>
      </div>
    </div>
  </transition>

  <transition name="slide-fade">
    <div v-if="alarmNotification.visible" class="alarm-toast">
      <div class="toast-icon">
        <v-icon size="28" color="white">mdi-alert-decagram</v-icon>
      </div>
      <div class="toast-text">
        <strong>{{ alarmNotification.message }}</strong>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-enterprise'
import { ModuleRegistry } from 'ag-grid-community'
import { AllEnterpriseModule } from 'ag-grid-enterprise'
ModuleRegistry.registerModules([AllEnterpriseModule])
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const activeTab = ref('sensors')
const quickFilterText = ref('')
const gridRef = ref(null)
const selectedRows = ref([])
const workOrderFilter = ref('')
const workOrderGridRef = ref(null)
const alertFilter = ref('')
const alertGridRef = ref(null)
const workOrderPanel = ref(false)
const selectedWorkOrderType = ref(null)
const workOrderTypes = ['Kalibrasyon', 'Firmware Güncelleme', 'Sensör Sıfırlama']
const workOrderPayload = ref({
  description: '',
  calibrationCode: '',
  firmwareVersion: '',
  resetReason: '',
})

const columnDefs = ref([
  { field: 'sensorId', headerName: 'Sensör ID', filter: 'agTextColumnFilter', checkboxSelection: true },
  { field: 'type', headerName: 'Sensör Tipi', enableRowGroup: true },
  { field: 'environment', headerName: 'Ortam', enableRowGroup: true },
  { field: 'lastReading', headerName: 'Son Okuma', filter: true },
  { field: 'battery', headerName: 'Batarya', filter: true },
  {
    field: 'status',
    headerName: 'Durum',
    enableRowGroup: true,
    cellRenderer: (params) => {
      const colors = {
        Aktif: '#4CAF50',
        Bakımda: '#FFC107',
        Kapalı: '#F44336',
      }
      const color = colors[params.value] || '#9E9E9E'
      return `<span style="background-color:${color};color:white;padding:3px 8px;border-radius:8px;font-size:12px;">${params.value}</span>`
    },
  },
])

const defaultColDef = {
  filter: true,
  sortable: true,
  resizable: true,
  flex: 1,
  minWidth: 130,
  floatingFilter: true,
  enableValue: true,
  enableRowGroup: true,
  suppressMenuHide: false,
}

const sensors = ref([
  {
    sensorId: 'SN-1001',
    type: 'Sıcaklık',
    environment: 'Üretim Hattı',
    lastReading: '24.6 °C',
    battery: '%92',
    status: 'Aktif',
    lat: 38.4843,
    lng: 27.0891,
  },
  {
    sensorId: 'SN-1002',
    type: 'Nem',
    environment: 'Depo',
    lastReading: '%58',
    battery: '%70',
    status: 'Bakımda',
    lat: 38.4872,
    lng: 27.0947,
  },
  {
    sensorId: 'SN-1003',
    type: 'Basınç',
    environment: 'Pompa Odası',
    lastReading: '5.8 bar',
    battery: '%88',
    status: 'Aktif',
    lat: 38.4826,
    lng: 27.0839,
  },
  {
    sensorId: 'SN-1004',
    type: 'Titreşim',
    environment: 'Motor Bloğu',
    lastReading: '0.42 g',
    battery: '%60',
    status: 'Kapalı',
    lat: 38.4888,
    lng: 27.0972,
  },
  {
    sensorId: 'SN-1005',
    type: 'Gaz',
    environment: 'Kimya Tesisi',
    lastReading: '30 ppm',
    battery: '%95',
    status: 'Aktif',
    lat: 38.4801,
    lng: 27.0914,
  },
  {
    sensorId: 'SN-1006',
    type: 'Sıcaklık',
    environment: 'Soğuk Hava Deposu',
    lastReading: '4.1 °C',
    battery: '%55',
    status: 'Bakımda',
    lat: 38.4864,
    lng: 27.0856,
  },
  {
    sensorId: 'SN-1007',
    type: 'Nem',
    environment: 'Sunucu Odası',
    lastReading: '%41',
    battery: '%82',
    status: 'Aktif',
    lat: 38.4835,
    lng: 27.0959,
  },
  {
    sensorId: 'SN-1008',
    type: 'Basınç',
    environment: 'Hidrolik Hat',
    lastReading: '6.2 bar',
    battery: '%68',
    status: 'Bakımda',
    lat: 38.4895,
    lng: 27.0888,
  },
  {
    sensorId: 'SN-1009',
    type: 'Titreşim',
    environment: 'Konveyör',
    lastReading: '0.35 g',
    battery: '%77',
    status: 'Aktif',
    lat: 38.4819,
    lng: 27.0984,
  },
  {
    sensorId: 'SN-1010',
    type: 'Gaz',
    environment: 'Arıtma Tesisi',
    lastReading: '12 ppm',
    battery: '%49',
    status: 'Kapalı',
    lat: 38.4849,
    lng: 27.0931,
  },
])

const workOrderColumnDefs = ref([
  { field: 'sensorId', headerName: 'Sensör ID' },
  { field: 'workOrderId', headerName: 'İş Emri ID' },
  { field: 'type', headerName: 'İş Emri Tipi', enableRowGroup: true },
  { field: 'payload', headerName: 'Payload' },
  { field: 'status', headerName: 'Durum', enableRowGroup: true },
  { field: 'createdDate', headerName: 'Oluşturulma Tarihi' },
  { field: 'sentDate', headerName: 'Gönderim Tarihi' },
  { field: 'responseDate', headerName: 'Cevap Tarihi' },
])

const workOrderData = ref([
  {
    sensorId: 'SN-1001',
    workOrderId: 'WO-9001',
    type: 'Kalibrasyon',
    payload: 'TEMP_SET=24.0',
    status: 'Tamamlandı',
    createdDate: '2025-09-12 08:45',
    sentDate: '2025-09-12 08:47',
    responseDate: '2025-09-12 08:51',
  },
  {
    sensorId: 'SN-1003',
    workOrderId: 'WO-9002',
    type: 'Firmware Güncelleme',
    payload: 'FW=v2.1.4',
    status: 'Gönderildi',
    createdDate: '2025-09-14 14:05',
    sentDate: '2025-09-14 14:06',
    responseDate: '-',
  },
  {
    sensorId: 'SN-1005',
    workOrderId: 'WO-9003',
    type: 'Sensör Sıfırlama',
    payload: 'RESET=GAS',
    status: 'Bekliyor',
    createdDate: '2025-09-15 11:18',
    sentDate: '-',
    responseDate: '-',
  },
  {
    sensorId: 'SN-1007',
    workOrderId: 'WO-9004',
    type: 'Kalibrasyon',
    payload: 'HUMI_REF=%40',
    status: 'Tamamlandı',
    createdDate: '2025-09-10 09:30',
    sentDate: '2025-09-10 09:32',
    responseDate: '2025-09-10 09:35',
  },
  {
    sensorId: 'SN-1008',
    workOrderId: 'WO-9005',
    type: 'Firmware Güncelleme',
    payload: 'FW=v3.0.0',
    status: 'Başarısız',
    createdDate: '2025-09-09 07:50',
    sentDate: '2025-09-09 07:52',
    responseDate: '2025-09-09 07:58',
  },
  {
    sensorId: 'SN-1002',
    workOrderId: 'WO-9006',
    type: 'Sensör Sıfırlama',
    payload: 'RESET=HUM',
    status: 'Tamamlandı',
    createdDate: '2025-09-11 16:20',
    sentDate: '2025-09-11 16:22',
    responseDate: '2025-09-11 16:24',
  },
  {
    sensorId: 'SN-1010',
    workOrderId: 'WO-9007',
    type: 'Firmware Güncelleme',
    payload: 'FW=v1.9.8',
    status: 'Bekliyor',
    createdDate: '2025-09-13 18:05',
    sentDate: '-',
    responseDate: '-',
  },
  {
    sensorId: 'SN-1004',
    workOrderId: 'WO-9008',
    type: 'Kalibrasyon',
    payload: 'VIB_RANGE=0.5',
    status: 'Gönderildi',
    createdDate: '2025-09-16 06:40',
    sentDate: '2025-09-16 06:42',
    responseDate: '-',
  },
])

const alertColumnDefs = ref([
  { field: 'sensorId', headerName: 'Sensör ID' },
  { field: 'alertId', headerName: 'Alarm Kodu' },
  { field: 'type', headerName: 'Alarm Tipi', enableRowGroup: true },
  {
    field: 'severity',
    headerName: 'Önem Derecesi',
    cellRenderer: (params) => {
      const colors = {
        Düşük: '#8BC34A',
        Orta: '#FFC107',
        Yüksek: '#FF5722',
        Kritik: '#F44336',
      }
      const color = colors[params.value] || '#9E9E9E'
      return `<span style="background-color:${color};color:white;padding:3px 8px;border-radius:8px;font-size:12px;">${params.value}</span>`
    },
  },
  { field: 'createdDate', headerName: 'Oluşturulma Tarihi' },
  { field: 'status', headerName: 'Durum' },
])

const alertData = ref([
  {
    alertId: 'AL-501',
    sensorId: 'SN-1005',
    type: 'Gaz Seviyesi Kritik',
    severity: 'Kritik',
    createdDate: '2025-09-15 03:20',
    status: 'Açık',
  },
  {
    alertId: 'AL-502',
    sensorId: 'SN-1002',
    type: 'Nem Sensörü İletişim Hatası',
    severity: 'Yüksek',
    createdDate: '2025-09-14 19:05',
    status: 'İzlemede',
  },
  {
    alertId: 'AL-503',
    sensorId: 'SN-1007',
    type: 'Sıcaklık Eşiği Aşıldı',
    severity: 'Orta',
    createdDate: '2025-09-13 12:45',
    status: 'Kapalı',
  },
  {
    alertId: 'AL-504',
    sensorId: 'SN-1009',
    type: 'Titreşim Artışı',
    severity: 'Yüksek',
    createdDate: '2025-09-16 05:32',
    status: 'Açık',
  },
])

function sendWorkOrder() {
  if (!selectedRows.value.length) {
    alert('Herhangi bir sensör seçilmedi.')
    return
  }
  workOrderPanel.value = true
}

function confirmSendWorkOrder() {
  if (!selectedWorkOrderType.value) {
    alert('Lütfen bir iş emri tipi seçiniz.')
    return
  }

  console.log('İş emri tipi:', selectedWorkOrderType.value)
  console.log('Seçili sensörler:', selectedRows.value)
  console.log('Girilen veriler:', workOrderPayload.value)

  alert(`${selectedRows.value.length} sensör için '${selectedWorkOrderType.value}' iş emri hazırlandı (örnek simülasyon).`)

  workOrderPanel.value = false
  selectedWorkOrderType.value = null
  workOrderPayload.value = { description: '', calibrationCode: '', firmwareVersion: '', resetReason: '' }
}

function onSelectionChanged() {
  selectedRows.value = gridRef.value?.api?.getSelectedRows() || []
}

function selectAllRows() {
  if (gridRef.value?.api) {
    gridRef.value.api.selectAll()
    selectedRows.value = gridRef.value.api.getSelectedRows()
  }
}

let mapInstance = null

function initMap() {
  const mapContainer = document.getElementById('sensor-map')
  if (!mapContainer) return

  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }

  mapInstance = L.map(mapContainer).setView([38.4849, 27.0891], 15)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(mapInstance)

  sensors.value.forEach((sensor) => {
    const color = sensor.status === 'Aktif' ? '#4CAF50' : sensor.status === 'Bakımda' ? '#FFC107' : '#F44336'
    L.circleMarker([sensor.lat, sensor.lng], {
      color,
      radius: 8,
      fillColor: color,
      fillOpacity: 0.9,
      weight: 1.5,
    })
      .bindPopup(
        `<b>${sensor.sensorId}</b><br>${sensor.type} - <span style="color:${color};font-weight:bold;">${sensor.status}</span>`
      )
      .addTo(mapInstance)
  })
}

watch(activeTab, (val) => {
  if (val === 'map') setTimeout(initMap, 150)
})

const workOrderNotification = ref({ visible: false, message: '' })
let workOrderTimer = null

function showRandomWorkOrderResponse() {
  const randomSensor = sensors.value[Math.floor(Math.random() * sensors.value.length)]
  if (!randomSensor) return

  workOrderNotification.value.message = `${randomSensor.sensorId} sensöründen iş emri cevabı geldi!`
  workOrderNotification.value.visible = true

  setTimeout(() => (workOrderNotification.value.visible = false), 4000)
}

onMounted(() => {
  const loop = () => {
    const delay = 5000 + Math.random() * 10000
    workOrderTimer = setTimeout(() => {
      showRandomWorkOrderResponse()
      loop()
    }, delay)
  }
  loop()
})

const alarmNotification = ref({ visible: false, message: '' })
let alarmTimer = null

function showRandomAlarm() {
  const randomSensor = sensors.value[Math.floor(Math.random() * sensors.value.length)]
  if (!randomSensor) return

  const randomType = ['Sıcaklık Artışı', 'Pil Seviyesi Düşük', 'İletişim Hatası']
  const type = randomType[Math.floor(Math.random() * randomType.length)]

  alarmNotification.value.message = `🚨 ${randomSensor.sensorId} sensöründe ${type}!`
  alarmNotification.value.visible = true

  setTimeout(() => (alarmNotification.value.visible = false), 4000)
}

onMounted(() => {
  const alarmLoop = () => {
    const delay = 15000 + Math.random() * 20000
    alarmTimer = setTimeout(() => {
      showRandomAlarm()
      alarmLoop()
    }, delay)
  }
  alarmLoop()
})

onUnmounted(() => {
  clearTimeout(workOrderTimer)
  clearTimeout(alarmTimer)
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})

const localeText = {
  loadingOoo: 'Yükleniyor...',
  noRowsToShow: 'Gösterilecek kayıt yok',
  page: 'Sayfa',
  of: '/',
  to: '→',
  next: 'Sonraki',
  last: 'Son',
  first: 'İlk',
  previous: 'Önceki',
  applyFilter: 'Filtreyi Uygula',
  clearFilter: 'Filtreyi Temizle',
  resetFilter: 'Filtreyi Sıfırla',
  selectAll: 'Tümünü Seç',
  searchOoo: 'Ara...',
  blanks: '(Boş)',
  filterOoo: 'Filtrele...',
  equals: 'Eşittir',
  notEqual: 'Eşit Değil',
  empty: 'Boş',
  lessThan: 'Küçüktür',
  greaterThan: 'Büyüktür',
  lessThanOrEqual: 'Küçük veya Eşit',
  greaterThanOrEqual: 'Büyük veya Eşit',
  inRange: 'Arasında',
  contains: 'İçerir',
  notContains: 'İçermez',
  startsWith: 'İle Başlar',
  endsWith: 'İle Biter',
  menuFilter: 'Filtre',
  menuSortAscending: 'Artan Sırala',
  menuSortDescending: 'Azalan Sırala',
  menuGroup: 'Grupla',
  menuUngroup: 'Grubu Kaldır',
  paginationPageSize: 'Sayfa boyutu',
  more: 'Daha fazla',
  totalRows: 'Toplam Satır',
  andCondition: 'VE',
  orCondition: 'VEYA',
  notBlank: 'Boş Değil',
}
</script>

<style scoped>
.ag-theme-alpine {
  --ag-font-size: 14px;
  border-radius: 10px;
}

:global(.theme-light) .ag-theme-alpine {
  --ag-background-color: #ffffff;
  --ag-foreground-color: #1f2937;
  --ag-header-background-color: #f4f6f8;
  --ag-header-foreground-color: #1f2937;
  --ag-row-hover-color: rgba(14, 165, 233, 0.12);
  --ag-border-color: #e2e8f0;
  --ag-odd-row-background-color: #f8fafc;
}

:global(.theme-dark) .ag-theme-alpine {
  --ag-background-color: #101a2c;
  --ag-foreground-color: #e2e8f0;
  --ag-header-background-color: #1e293b;
  --ag-header-foreground-color: #e2e8f0;
  --ag-row-hover-color: rgba(45, 212, 191, 0.18);
  --ag-border-color: #1f2937;
  --ag-odd-row-background-color: rgba(148, 163, 184, 0.08);
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
  background: var(--toast-info-bg);
  color: var(--toast-info-text);
  padding: 16px 22px;
  border-radius: 14px;
  box-shadow: var(--toast-info-shadow);
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
    box-shadow: var(--toast-info-shadow);
    transform: translateY(0);
  }
  50% {
    box-shadow: var(--toast-info-shadow);
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
