<template>
  <v-container fluid>
    <!-- Sekmeler -->
    <v-tabs v-model="activeTab" bg-color="primary" dark>
      <v-tab value="products">Ürünler</v-tab>
      <v-tab value="map">Harita</v-tab>
      <v-tab value="workorders">İş Emri Geçmişi</v-tab>
      <v-tab value="alerts">Uyarılar & Alarmlar</v-tab>
    </v-tabs>

    <v-window v-model="activeTab" class="mt-4">
      <!-- ÜRÜNLER TABI -->
      <v-window-item value="products">
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
            :rowData="tools"
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

      <!-- HARİTA TABI -->
      <v-window-item value="map">
        <div id="map" style="height: 600px; width: 100%; border-radius: 10px"></div>
      </v-window-item>

      <!-- İŞ EMRİ GEÇMİŞİ TABI -->
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
    </v-window> </v-container
  ><!-- İş Emri Gönderim Modali -->
  <!-- İş Emri Paneli -->
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

        <!-- Dinamik Alanlar -->
        <template v-if="selectedWorkOrderType === 'Sayaç Okuma'">
          <v-text-field
            v-model="workOrderPayload.readCommand"
            label="Okuma Komutu"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
        </template>

        <template v-else-if="selectedWorkOrderType === 'Limit Güncelleme'">
          <v-text-field
            v-model="workOrderPayload.limit"
            label="Yeni Limit (m³)"
            type="number"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
        </template>

        <template v-else-if="selectedWorkOrderType === 'Resetleme'">
          <v-text-field
            v-model="workOrderPayload.resetCode"
            label="Reset Kodu"
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
  <!-- İş Emri Bildirim Toast -->
  <!-- 🔔 İş Emri Cevap Bildirimi -->
  <transition name="slide-fade">
    <div v-if="workOrderNotification.visible" class="fancy-toast">
      <div class="toast-icon">
        <v-icon size="28" color="white">mdi-bolt</v-icon>
      </div>
      <div class="toast-text">
        ⚡ <strong>{{ workOrderNotification.message }}</strong>
      </div>
    </div>
  </transition>
  <!-- 🔥 Kırmızı Alarm Bildirimi -->
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
import { ref, watch } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-enterprise'
import { ModuleRegistry } from 'ag-grid-community'
import { AllEnterpriseModule } from 'ag-grid-enterprise'
ModuleRegistry.registerModules([AllEnterpriseModule])
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ---- Reaktif değişkenler ----
const activeTab = ref('products')
const quickFilterText = ref('')
const gridRef = ref(null)
const selectedRows = ref([])
const workOrderFilter = ref('')
const workOrderGridRef = ref(null)

// ---- Kolon tanımları ----
const columnDefs = ref([
  {
    field: 'name',
    headerName: 'Ürün Kodu',
    filter: 'agNumberColumnFilter',
    checkboxSelection: true,
  },
  { field: 'type', headerName: 'Cihaz Tipi', enableRowGroup: true },
  { field: 'consumption', headerName: 'Tüketim', filter: true },
  { field: 'commandIndex', headerName: 'Versiyon', filter: 'agNumberColumnFilter' },
  {
    field: 'status',
    headerName: 'Durum',
    enableRowGroup: true,
    cellRenderer: (params) => {
      const color = params.value === 'Aktif' ? '#4CAF50' : '#F44336'
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
const alertFilter = ref('')
const alertGridRef = ref(null)

const alertData = ref([
  {
    alertId: 'AABBCCDDEEFC',
    deviceName: '10001',
    type: 'Basınç Düşüklüğü',
    severity: 'Kritik',
    createdDate: '2025-10-23 09:45',
    status: 'Açık',
  },
  {
    alertId: 'AABBCCDDEEFF',
    deviceName: '10005',
    type: 'Batarya Seviyesi Düşük',
    severity: 'Orta',
    createdDate: '2025-10-23 11:20',
    status: 'İzlemede',
  },
  {
    alertId: 'AABBCCDDEEFD',
    deviceName: '10007',
    type: 'İletişim Hatası',
    severity: 'Yüksek',
    createdDate: '2025-10-23 12:00',
    status: 'Kapalı',
  },
])

const alertColumnDefs = ref([
  { field: 'deviceName', headerName: 'Sayaç No' },
  { field: 'alertId', headerName: 'Payload' },
  { field: 'type', headerName: 'Uyarı Tipi' },
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
  { field: 'createdDate', headerName: 'Tarih' },
  {
    field: 'status',
    headerName: 'Durum',
    cellRenderer: (params) => {
      const colors = {
        Açık: '#E53935',
        İzlemede: '#FFC107',
        Kapalı: '#4CAF50',
      }
      const color = colors[params.value] || '#9E9E9E'
      return `<span style="background-color:${color};color:white;padding:3px 8px;border-radius:8px;font-size:12px;">${params.value}</span>`
    },
  },
])

// ---- Varsayılan kolon ayarları ----
const defaultColDef = {
  filter: true,
  sortable: true,
  resizable: true,
  flex: 1,
  minWidth: 120,
  floatingFilter: true,
  enableValue: true,
  enableRowGroup: true,
  suppressMenuHide: false,
}

// ---- Sayaç verileri ----
const tools = ref([
  {
    name: '10001',
    status: 'Aktif',
    commandIndex: 44,
    consumption: '15 m³',
    type: 'LoRa',
    lat: 38.4843,
    lng: 27.0891,
  },
  {
    name: '10002',
    status: 'Pasif',
    commandIndex: 45,
    consumption: '20 m³',
    type: 'GPRS',
    lat: 38.4872,
    lng: 27.0947,
  },
  {
    name: '10003',
    status: 'Aktif',
    commandIndex: 34,
    consumption: '25 m³',
    type: 'NBIOT',
    lat: 38.4826,
    lng: 27.0839,
  },
  {
    name: '10004',
    status: 'Pasif',
    commandIndex: 29,
    consumption: '30 m³',
    type: 'LoRa',
    lat: 38.4888,
    lng: 27.0972,
  },
  {
    name: '10005',
    status: 'Aktif',
    commandIndex: 44,
    consumption: '15 m³',
    type: 'GPRS',
    lat: 38.4801,
    lng: 27.0914,
  },
  {
    name: '10006',
    status: 'Pasif',
    commandIndex: 39,
    consumption: '18 m³',
    type: 'NBIOT',
    lat: 38.4864,
    lng: 27.0856,
  },
  {
    name: '10007',
    status: 'Aktif',
    commandIndex: 44,
    consumption: '22 m³',
    type: 'LoRa',
    lat: 38.4835,
    lng: 27.0959,
  },
  {
    name: '10008',
    status: 'Pasif',
    commandIndex: 39,
    consumption: '28 m³',
    type: 'GPRS',
    lat: 38.4895,
    lng: 27.0888,
  },
  {
    name: '10009',
    status: 'Aktif',
    commandIndex: 29,
    consumption: '35 m³',
    type: 'NBIOT',
    lat: 38.4819,
    lng: 27.0984,
  },
  {
    name: '10010',
    status: 'Pasif',
    commandIndex: 34,
    consumption: '40 m³',
    type: 'LoRa',
    lat: 38.4849,
    lng: 27.0931,
  },
])

// ---- İş Emri Geçmişi ----
const workOrderData = ref([
  {
    name: '10001',
    workOrderId: '01020304',
    type: 'Vana Aç',
    data: '01020304AAABAC',
    status: 'Gönderildi',
    createdDate: '2025-10-21 09:10',
    sentDate: '2025-10-21 09:12',
    responseDate: '2025-10-21 09:15',
  },
  {
    name: '10001',
    workOrderId: '01020304',
    type: 'Tüketim Oku',
    data: '090807FFFEFD',
    status: 'Tamamlandı',
    createdDate: '2025-10-22 10:25',
    sentDate: '2025-10-22 10:26',
    responseDate: '2025-10-22 10:30',
  },
  {
    name: '10002',
    workOrderId: '01020304',
    type: 'Vana Kapat',
    data: '01020304AAABAC',
    status: 'Bekliyor',
    createdDate: '2025-10-22 11:00',
    sentDate: '-',
    responseDate: '-',
  },
  {
    name: '10003',
    workOrderId: '01020304',
    type: 'Vana Aç',
    data: '090807FFFEFD',
    status: 'Başarısız',
    createdDate: '2025-10-20 08:10',
    sentDate: '2025-10-20 08:12',
    responseDate: '2025-10-20 08:15',
  },
  {
    name: '10004',
    workOrderId: '01020304',
    type: 'Tüketim Oku',
    data: '01020304AAABAC',
    status: 'Tamamlandı',
    createdDate: '2025-10-22 14:40',
    sentDate: '2025-10-22 14:42',
    responseDate: '2025-10-22 14:50',
  },
  {
    name: '10005',
    workOrderId: '01020304',
    type: 'Vana Kapat',
    data: '090807FFFEFD',
    status: 'Gönderildi',
    createdDate: '2025-10-21 15:00',
    sentDate: '2025-10-21 15:01',
    responseDate: '-',
  },
  {
    name: '10006',
    workOrderId: '01020304',
    type: 'Vana Aç',
    data: '01020304AAABAC',
    status: 'Tamamlandı',
    createdDate: '2025-10-20 09:25',
    sentDate: '2025-10-20 09:27',
    responseDate: '2025-10-20 09:30',
  },
  {
    name: '10007',
    workOrderId: '01020304',
    type: 'Tüketim Oku',
    data: '090807FFFEFD',
    status: 'Bekliyor',
    createdDate: '2025-10-23 10:00',
    sentDate: '-',
    responseDate: '-',
  },
  {
    name: '10008',
    workOrderId: '01020304',
    type: 'Vana Kapat',
    data: '01020304AAABAC',
    status: 'Gönderildi',
    createdDate: '2025-10-23 10:10',
    sentDate: '2025-10-23 10:11',
    responseDate: '-',
  },
  {
    name: '10009',
    workOrderId: '01020304',
    type: 'Vana Aç',
    data: '090807FFFEFD',
    status: 'Tamamlandı',
    createdDate: '2025-10-21 12:10',
    sentDate: '2025-10-21 12:12',
    responseDate: '2025-10-21 12:20',
  },
  {
    name: '10010',
    workOrderId: '01020304',
    type: 'Tüketim Oku',
    data: '01020304AAABAC',
    status: 'Başarısız',
    createdDate: '2025-10-20 18:10',
    sentDate: '2025-10-20 18:12',
    responseDate: '2025-10-20 18:13',
  },
])

const workOrderColumnDefs = ref([
  { field: 'name', headerName: 'Sayaç No', enableRowGroup: true, filter: 'agNumberColumnFilter' },
  {
    field: 'type',
    headerName: 'İş Emri Tipi',
    enableRowGroup: true,
    filter: 'agNumberColumnFilter',
  },
  { field: 'workOrderId', headerName: 'İş Emri Datası', cellStyle: { fontFamily: 'monospace' } },
  { field: 'data', headerName: 'Data', cellStyle: { fontFamily: 'monospace' } },
  {
    field: 'status',
    headerName: 'Durum',
    enableRowGroup: true,
    cellRenderer: (params) => {
      if (params.node.group) return '' // Grup satırında hücre boş olsun
      const colors = {
        Gönderildi: '#1976D2',
        Tamamlandı: '#4CAF50',
        Başarısız: '#F44336',
        Bekliyor: '#FFC107',
      }
      const color = colors[params.value] || '#9E9E9E'
      return `<span style="background-color:${color};color:white;padding:3px 8px;border-radius:8px;font-size:12px;">${params.value}</span>`
    },
  },
  { field: 'createdDate', headerName: 'Oluşturulma Tarihi' },
  { field: 'sentDate', headerName: 'Gönderilme Tarihi' },
  { field: 'responseDate', headerName: 'Cevap Tarihi' },
])
// Sağdan kayan panel kontrolü
const workOrderPanel = ref(false)
const selectedWorkOrderType = ref(null)
const workOrderPayload = ref({ description: '', readCommand: '', limit: '', resetCode: '' })

const workOrderTypes = ['Sayaç Okuma', 'Limit Güncelleme', 'Resetleme']

// “İş Emri Gönder” butonuna tıklanınca açılacak
function sendWorkOrder() {
  if (!selectedRows.value.length) {
    alert('Herhangi bir cihaz seçilmedi.')
    return
  }
  workOrderPanel.value = true
}

// Panelde “Gönder” butonuna tıklanınca
function confirmSendWorkOrder() {
  const selected = selectedRows.value
  const type = selectedWorkOrderType.value

  if (!type) {
    alert('Lütfen bir iş emri tipi seçiniz.')
    return
  }

  console.log('İş emri tipi:', type)
  console.log('Seçili sayaçlar:', selected)
  console.log('Girilen veriler:', workOrderPayload.value)

  alert(`${selected.length} cihaz için '${type}' iş emri hazırlandı (örnek simülasyon).`)

  // Reset
  workOrderPanel.value = false
  selectedWorkOrderType.value = null
  workOrderPayload.value = { description: '', readCommand: '', limit: '', resetCode: '' }
}

// ---- Grid Eventleri ----
function onSelectionChanged() {
  selectedRows.value = gridRef.value.api.getSelectedRows()
}
function selectAllRows() {
  gridRef.value.api.selectAll()
  selectedRows.value = gridRef.value.api.getSelectedRows()
}

// ---- Harita Başlatma ----
function initMap() {
  const mapContainer = document.getElementById('map')
  if (!mapContainer) return

  const map = L.map(mapContainer).setView([38.4849, 27.0891], 15)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)

  tools.value.forEach((tool) => {
    const color = tool.status === 'Aktif' ? '#4CAF50' : '#F44336'
    L.circleMarker([tool.lat, tool.lng], {
      color,
      radius: 8,
      fillColor: color,
      fillOpacity: 0.9,
      weight: 1.5,
    })
      .bindPopup(
        `<b>${tool.name}</b><br>${tool.type} - <span style="color:${color};font-weight:bold;">${tool.status}</span>`,
      )
      .addTo(map)
  })
}

// ---- Harita Tabı Aktif Olunca Başlat ----
watch(activeTab, (val) => {
  if (val === 'map') setTimeout(initMap, 150)
})

import { onMounted, onUnmounted } from 'vue'

const workOrderNotification = ref({ visible: false, message: '' })
let workOrderTimer = null

function showRandomWorkOrderResponse() {
  const randomTool = tools.value[Math.floor(Math.random() * tools.value.length)]
  if (!randomTool) return

  workOrderNotification.value.message = `${randomTool.name} sayacından iş emri cevabı geldi! ⚙️`
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
  const randomTool = tools.value[Math.floor(Math.random() * tools.value.length)]
  if (!randomTool) return

  const randomType = ['Basınç Düşüklüğü', 'Batarya Düşüklüğü', 'İletişim Hatası'][
    Math.floor(Math.random() * 3)
  ]

  alarmNotification.value.message = `🚨 ${randomTool.name} sayacında ${randomType}!`
  alarmNotification.value.visible = true

  setTimeout(() => (alarmNotification.value.visible = false), 4000)
}

onMounted(() => {
  const alarmLoop = () => {
    const delay = 15000 + Math.random() * 20000 // 15–35 saniyede bir uyarı
    alarmTimer = setTimeout(() => {
      showRandomAlarm()
      alarmLoop()
    }, delay)
  }
  alarmLoop()
})

onUnmounted(() => clearTimeout(alarmTimer))

onUnmounted(() => clearTimeout(workOrderTimer))

const localeText = {
  // Genel
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

  // Filtre menüsü
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

  // Menü
  menuFilter: 'Filtre',
  menuSortAscending: 'Artan Sırala',
  menuSortDescending: 'Azalan Sırala',
  menuGroup: 'Grupla',
  menuUngroup: 'Grubu Kaldır',

  // Filtre tuşları
  applyFilterButton: 'Uygula',
  clearFilterButton: 'Temizle',
  resetFilterButton: 'Sıfırla',

  // Sayfalandırma
  paginationPageSize: 'Sayfa boyutu',
  more: 'Daha fazla',

  // Durum çubuğu
  totalRows: 'Toplam Satır',

  // Diğer
  andCondition: 'VE',
  orCondition: 'VEYA',
  notBlank: 'Boş Değil',
}
</script>

<style scoped>
.ag-theme-alpine {
  --ag-font-size: 14px;
  --ag-header-background-color: #f4f6f8;
  --ag-header-foreground-color: #333;
  --ag-row-hover-color: #eaf3ff;
  border-radius: 10px;
}
/* Animasyon */
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

/* Bildirim kutusu */
.fancy-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #00c853, #1de9b6);
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

/* Parlama efekti */
@keyframes glowPulse {
  0%,
  100% {
    box-shadow:
      0 0 8px rgba(29, 233, 182, 0.7),
      0 0 20px rgba(0, 200, 83, 0.6);
  }
  50% {
    box-shadow:
      0 0 15px rgba(29, 233, 182, 0.9),
      0 0 35px rgba(0, 200, 83, 0.8);
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
  background: linear-gradient(135deg, #d32f2f, #ff5252);
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
      0 0 8px rgba(255, 82, 82, 0.6),
      0 0 20px rgba(211, 47, 47, 0.6);
  }
  50% {
    box-shadow:
      0 0 15px rgba(255, 82, 82, 0.9),
      0 0 35px rgba(211, 47, 47, 0.8);
  }
}
</style>
