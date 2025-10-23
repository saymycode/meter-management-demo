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
            ref="gridRef"
            class="ag-theme-alpine"
            style="height: 600px; width: 100%"
            :columnDefs="columnDefs"
            :rowData="waterMeters"
            :quickFilterText="quickFilterText"
            :autoGroupColumnDef="autoGroupColumnDef"
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
        <div id="water-map" style="height: 600px; width: 100%; border-radius: 10px"></div>
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
            ref="workOrderGridRef"
            class="ag-theme-alpine"
            style="height: 600px; width: 100%"
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
            ref="alertGridRef"
            class="ag-theme-alpine"
            style="height: 600px; width: 100%"
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
        <v-icon size="28" color="white">mdi-water-check</v-icon>
      </div>
      <div class="toast-text">
        💧 <strong>{{ workOrderNotification.message }}</strong>
      </div>
    </div>
  </transition>

  <transition name="slide-fade">
    <div v-if="alarmNotification.visible" class="alarm-toast">
      <div class="toast-icon">
        <v-icon size="28" color="white">mdi-water-alert</v-icon>
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

const activeTab = ref('products')
const quickFilterText = ref('')
const workOrderFilter = ref('')
const alertFilter = ref('')

const gridRef = ref(null)
const workOrderGridRef = ref(null)
const alertGridRef = ref(null)
const selectedRows = ref([])
const workOrderPanel = ref(false)

const columnDefs = ref([
  { field: 'type', headerName: 'Tip', rowGroup: true, hide: true },
  {
    field: 'name',
    headerName: 'Sayaç Kodu',
    filter: true,
    checkboxSelection: true,
    headerCheckboxSelection: true,
  },
  { field: 'Consumption', headerName: 'Tüketim (m³)', filter: 'agNumberColumnFilter' },
  { field: 'commandIndex', headerName: 'Komut İndeksi', filter: 'agNumberColumnFilter' },
  {
    field: 'status',
    headerName: 'Durum',
    filter: true,
    cellRenderer: (params) => {
      const color = params.value === 'Aktif' ? '#1E88E5' : '#78909C'
      return `
        <span style="
          background-color:${color};
          color:white;
          padding:3px 8px;
          border-radius:8px;
          font-size:12px;">
          ${params.value}
        </span>`
    },
  },
])

const defaultColDef = {
  filter: true,
  sortable: true,
  resizable: true,
  flex: 1,
  minWidth: 120,
  floatingFilter: true,
  enableValue: true,
  enableRowGroup: true,
}

const autoGroupColumnDef = ref({
  headerName: 'Cihaz Tipi',
  field: 'type',
  cellRenderer: 'agGroupCellRenderer',
  cellRendererParams: { checkbox: true },
})

const waterMeters = ref([
  {
    name: '20001',
    Consumption: 0.5,
    commandIndex: 30,
    status: 'Aktif',
    type: 'LoRa',
    lat: 39.9208,
    lng: 32.8541,
  },
  {
    name: '20002',
    Consumption: 0.2,
    commandIndex: 20,
    status: 'Pasif',
    type: 'GPRS',
    lat: 39.9224,
    lng: 32.8602,
  },
  {
    name: '20003',
    Consumption: 1.5,
    commandIndex: 25,
    status: 'Aktif',
    type: 'NB-IoT',
    lat: 39.9186,
    lng: 32.8489,
  },
  {
    name: '20004',
    Consumption: 0.7,
    commandIndex: 50,
    status: 'Pasif',
    type: 'LoRa',
    lat: 39.9241,
    lng: 32.8522,
  },
  {
    name: '20005',
    Consumption: 0.3,
    commandIndex: 10,
    status: 'Aktif',
    type: 'GPRS',
    lat: 39.9175,
    lng: 32.8576,
  },
  {
    name: '20006',
    Consumption: 0.4,
    commandIndex: 60,
    status: 'Pasif',
    type: 'NB-IoT',
    lat: 39.9211,
    lng: 32.8463,
  },
  {
    name: '20007',
    Consumption: 0.6,
    commandIndex: 25,
    status: 'Aktif',
    type: 'LoRa',
    lat: 39.926,
    lng: 32.8588,
  },
  {
    name: '20008',
    Consumption: 0.3,
    commandIndex: 15,
    status: 'Pasif',
    type: 'GPRS',
    lat: 39.9233,
    lng: 32.8447,
  },
  {
    name: '20009',
    Consumption: 2.0,
    commandIndex: 30,
    status: 'Aktif',
    type: 'NB-IoT',
    lat: 39.9199,
    lng: 32.8625,
  },
  {
    name: '20010',
    Consumption: 0.5,
    commandIndex: 15,
    status: 'Pasif',
    type: 'LoRa',
    lat: 39.9157,
    lng: 32.8509,
  },
])

const workOrderColumnDefs = ref([
  { field: 'meterId', headerName: 'Sayaç No', enableRowGroup: true },
  { field: 'workOrderId', headerName: 'İş Emri Payload' },
  { field: 'type', headerName: 'İş Emri Tipi', enableRowGroup: true },
  { field: 'payload', headerName: 'Payload' },
  {
    field: 'status',
    headerName: 'Durum',
    cellRenderer: (params) => {
      const colors = {
        Bekliyor: '#FB8C00',
        Gönderildi: '#42A5F5',
        Tamamlandı: '#43A047',
        Başarısız: '#E53935',
      }
      const color = colors[params.value] || '#90A4AE'
      return `<span style="background-color:${color};color:white;padding:3px 8px;border-radius:8px;font-size:12px;">${params.value}</span>`
    },
  },
  { field: 'createdDate', headerName: 'Oluşturulma' },
  { field: 'sentDate', headerName: 'Gönderilme' },
  { field: 'responseDate', headerName: 'Cevap' },
])

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

const alertColumnDefs = ref([
  { field: 'meterId', headerName: 'Sayaç No', enableRowGroup: true },
  { field: 'alertId', headerName: 'Uyarı ID' },
  { field: 'type', headerName: 'Uyarı Tipi', enableRowGroup: true },
  {
    field: 'severity',
    headerName: 'Önem Derecesi',
    cellRenderer: (params) => {
      const colors = {
        Düşük: '#4FC3F7',
        Orta: '#29B6F6',
        Yüksek: '#0288D1',
        Kritik: '#01579B',
      }
      const color = colors[params.value] || '#90A4AE'
      return `<span style="background-color:${color};color:white;padding:3px 8px;border-radius:8px;font-size:12px;">${params.value}</span>`
    },
  },
  { field: 'createdDate', headerName: 'Oluşturulma' },
  {
    field: 'status',
    headerName: 'Durum',
    cellRenderer: (params) => {
      const colors = {
        Açık: '#E53935',
        İzlemede: '#FB8C00',
        Kapalı: '#43A047',
      }
      const color = colors[params.value] || '#90A4AE'
      return `<span style="background-color:${color};color:white;padding:3px 8px;border-radius:8px;font-size:12px;">${params.value}</span>`
    },
  },
])

const alertData = ref([
  {
    alertId: 'AL-20001-01',
    meterId: '20001',
    type: 'Kaçak Tespiti',
    severity: 'Kritik',
    createdDate: '2025-10-23 09:45',
    status: 'Açık',
  },
  {
    alertId: 'AL-20005-02',
    meterId: '20005',
    type: 'Basınç Düşüklüğü',
    severity: 'Yüksek',
    createdDate: '2025-10-23 08:30',
    status: 'İzlemede',
  },
  {
    alertId: 'AL-20008-04',
    meterId: '20008',
    type: 'Ters Akış',
    severity: 'Orta',
    createdDate: '2025-10-22 18:15',
    status: 'Kapalı',
  },
  {
    alertId: 'AL-20009-01',
    meterId: '20009',
    type: 'Ani Debi Artışı',
    severity: 'Düşük',
    createdDate: '2025-10-21 21:05',
    status: 'Kapalı',
  },
])

const workOrderTypes = [
  'Sayaç Okuma',
  'Debi Ayarla',
  'Basınç Kontrolü',
  'Vanayı Aç',
  'Vanayı Kapat',
]
const selectedWorkOrderType = ref(null)
const workOrderPayload = ref({
  description: '',
  readCommand: '',
  flowRate: '',
  pressureThreshold: '',
})

function sendWorkOrder() {
  if (!selectedRows.value.length) {
    alert('Herhangi bir sayaç seçilmedi.')
    return
  }
  workOrderPanel.value = true
}

function confirmSendWorkOrder() {
  if (!selectedRows.value.length) {
    alert('Lütfen en az bir sayaç seçiniz.')
    return
  }

  if (!selectedWorkOrderType.value) {
    alert('Lütfen bir iş emri tipi seçiniz.')
    return
  }

  console.log('İş emri tipi:', selectedWorkOrderType.value)
  console.log('Seçili sayaçlar:', selectedRows.value)
  console.log('Girilen veriler:', workOrderPayload.value)

  alert(
    `${selectedRows.value.length} sayaç için '${selectedWorkOrderType.value}' iş emri hazırlandı (simülasyon).`,
  )

  workOrderPanel.value = false
  selectedWorkOrderType.value = null
  workOrderPayload.value = { description: '', readCommand: '', flowRate: '', pressureThreshold: '' }
}

function onSelectionChanged() {
  if (!gridRef.value) return
  selectedRows.value = gridRef.value.api.getSelectedRows()
}

function selectAllRows() {
  if (!gridRef.value) return
  gridRef.value.api.selectAll()
  selectedRows.value = gridRef.value.api.getSelectedRows()
}

let mapInstance = null
function initMap() {
  const mapContainer = document.getElementById('water-map')
  if (!mapContainer) return

  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }

  const defaultCenter = waterMeters.value.length
    ? [waterMeters.value[0].lat, waterMeters.value[0].lng]
    : [39.9208, 32.8541]

  mapInstance = L.map(mapContainer).setView(defaultCenter, 14)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(mapInstance)

  waterMeters.value.forEach((meter) => {
    const color = meter.status === 'Aktif' ? '#0288D1' : '#90A4AE'
    L.circleMarker([meter.lat, meter.lng], {
      color,
      radius: 8,
      fillColor: color,
      fillOpacity: 0.9,
      weight: 1.5,
    })
      .bindPopup(
        `<b>${meter.name}</b><br>${meter.type} - <span style="color:${color};font-weight:bold;">${meter.status}</span><br>Tüketim: ${meter.Consumption} m³`,
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
  const randomMeter = waterMeters.value[Math.floor(Math.random() * waterMeters.value.length)]
  if (!randomMeter) return

  workOrderNotification.value.message = `${randomMeter.name} su sayacından iş emri cevabı alındı!`
  workOrderNotification.value.visible = true

  setTimeout(() => (workOrderNotification.value.visible = false), 4000)
}

const alarmNotification = ref({ visible: false, message: '' })
let alarmTimer = null

function showRandomAlarm() {
  const randomMeter = waterMeters.value[Math.floor(Math.random() * waterMeters.value.length)]
  if (!randomMeter) return

  const randomType = ['Kaçak tespiti', 'Basınç düşüklüğü', 'Ters akış uyarısı'][
    Math.floor(Math.random() * 3)
  ]

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
  loop()

  const alarmLoop = () => {
    const delay = 18000 + Math.random() * 22000
    alarmTimer = setTimeout(() => {
      showRandomAlarm()
      alarmLoop()
    }, delay)
  }
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
  applyFilterButton: 'Uygula',
  clearFilterButton: 'Temizle',
  resetFilterButton: 'Sıfırla',
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
  --ag-header-background-color: #f4f8fb;
  --ag-header-foreground-color: #2d3e50;
  --ag-row-hover-color: #e1f5fe;
  border-radius: 10px;
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
  transform: translateY(-30px);
}

.fancy-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #0288d1, #26c6da);
  color: white;
  padding: 16px 22px;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.3px;
  animation: glowPulse 2.5s ease-in-out infinite;
}

@keyframes glowPulse {
  0%,
  100% {
    box-shadow:
      0 0 8px rgba(38, 198, 218, 0.7),
      0 0 20px rgba(2, 136, 209, 0.6);
  }
  50% {
    box-shadow:
      0 0 15px rgba(38, 198, 218, 0.9),
      0 0 35px rgba(2, 136, 209, 0.8);
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
  top: 90px;
  right: 20px;
  background: linear-gradient(135deg, #c62828, #ef5350);
  color: white;
  padding: 16px 22px;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9998;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  animation: redPulse 2s ease-in-out infinite;
}

@keyframes redPulse {
  0%,
  100% {
    box-shadow:
      0 0 8px rgba(239, 83, 80, 0.6),
      0 0 20px rgba(198, 40, 40, 0.6);
  }
  50% {
    box-shadow:
      0 0 15px rgba(239, 83, 80, 0.9),
      0 0 35px rgba(198, 40, 40, 0.8);
  }
}
</style>
