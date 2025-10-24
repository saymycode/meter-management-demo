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
        <v-container fluid class="product-tab" style="padding: 0">
          <v-row class="products-layout" no-gutters align="stretch">
            <!-- Sol: Filtre + Gruplama -->
            <v-col cols="12" md="2" class="side-column">
              <div class="side-wrapper">
                <v-card class="filter-card" elevation="0">
                  <div class="filter-header">
                    <h2>Filtreler</h2>
                    <v-btn density="comfortable" variant="text" @click="resetFilters"
                      >Temizle</v-btn
                    >
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
                        variant="tonal"
                        filter
                      >
                        {{ status }}
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
                        color="teal"
                        variant="tonal"
                        filter
                      >
                        {{ comm }}
                      </v-chip>
                    </v-chip-group>
                  </div>

                  <div class="filter-group">
                    <span class="filter-title">Sayaç modeli</span>
                    <v-chip-group v-model="selectedModels" column multiple>
                      <v-chip
                        v-for="model in modelOptions"
                        :key="model"
                        :value="model"
                        class="filter-chip"
                        color="purple"
                        variant="tonal"
                        filter
                      >
                        {{ model }}
                      </v-chip>
                    </v-chip-group>
                  </div>

                  <div class="filter-group">
                    <span class="filter-title">Tüketim aralığı</span>
                    <v-chip-group v-model="selectedConsumption" column multiple>
                      <v-chip
                        v-for="range in consumptionOptions"
                        :key="range.value"
                        :value="range.value"
                        class="filter-chip"
                        color="amber"
                        variant="tonal"
                        filter
                      >
                        {{ range.label }}
                      </v-chip>
                    </v-chip-group>
                  </div>
                </v-card>

                <v-card class="group-card" elevation="0">
                  <div class="group-header">
                    <h2>Gruplama</h2>
                    <p>Tabloyu bir alana göre gruplayarak kümelenmiş görünümü inceleyin.</p>
                  </div>
                  <v-chip-group v-model="groupBy" column>
                    <v-chip
                      v-for="option in groupOptions"
                      :key="option.value"
                      :value="option.value"
                      class="filter-chip"
                      color="deep-purple"
                      variant="tonal"
                    >
                      {{ option.label }}
                    </v-chip>
                  </v-chip-group>
                </v-card>
              </div>
            </v-col>

            <!-- Orta: Tablo -->
            <v-col cols="12" md="8" class="grid-column">
              <v-card class="grid-card" elevation="0">
                <div class="grid-toolbar">
                  <div class="grid-summary">
                    <v-chip class="summary-chip" color="primary" variant="tonal">
                      Toplam: {{ filteredStats.total }}
                    </v-chip>
                    <v-chip class="summary-chip" color="success" variant="tonal">
                      Aktif: {{ filteredStats.active }}
                    </v-chip>
                    <v-chip class="summary-chip" color="error" variant="tonal">
                      Pasif: {{ filteredStats.inactive }}
                    </v-chip>
                  </div>

                  <div class="toolbar-actions">
                    <v-btn variant="text" @click="selectAllRows">Tümünü Seç</v-btn>
                    <v-btn
                      color="primary"
                      variant="flat"
                      prepend-icon="assignment"
                      :disabled="selectedRows.length === 0"
                      @click="sendWorkOrder"
                    >
                      İş Emri Gönder
                    </v-btn>
                  </div>
                </div>

                <v-text-field
                  v-model="quickFilterText"
                  class="mb-4"
                  density="comfortable"
                  hide-details
                  label="Sayaç, model veya tip ara"
                  prepend-inner-icon="search"
                  variant="outlined"
                  clearable
                />

                <div class="grid-wrapper">
                  <v-data-table
                    v-model:selected="selectedRows"
                    :headers="tableHeaders"
                    :items="tableItems"
                    :group-by="tableGroupBy"
                    :sort-by="tableSortBy"
                    :items-per-page="6"
                    class="grid-table"
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
                    <template #item.consumption="{ item }">
                      <span class="mono">{{ item.consumption }}</span>
                    </template>
                    <template #item.commandIndex="{ item }">
                      <span class="mono">{{ item.commandIndex }}</span>
                    </template>
                    <template #no-data>
                      <div class="no-data">Filtrelere uyan sayaç bulunamadı.</div>
                    </template>
                  </v-data-table>
                </div>
              </v-card>
            </v-col>

            <!-- Sağ: Filtre + Gruplama -->
            <v-col cols="12" md="2" class="side-column"> </v-col>
          </v-row>
        </v-container>
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
            <template #item.data="{ item }">
              <span class="mono">{{ item.data }}</span>
            </template>
            <template #item.workOrderId="{ item }">
              <span class="mono">{{ item.workOrderId }}</span>
            </template>
            <template #no-data>
              <div class="no-data">Kayıt bulunamadı.</div>
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
            <template #no-data>
              <div class="no-data">Aktif alarm bulunamadı.</div>
            </template>
          </v-data-table>
        </div>
      </v-window-item>
    </v-window>
  </v-container>

  <!-- İş Emri Gönderim Modali -->
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
            label="Yeni Limit (kWh)"
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
        <v-icon size="28" color="white">bolt</v-icon>
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
        <v-icon size="28" color="white">new_releases</v-icon>
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
const selectedRows = ref([])
const workOrderFilter = ref('')
const alertFilter = ref('')
const selectedStatuses = ref([])
const selectedComm = ref([])
const selectedModels = ref([])
const selectedConsumption = ref([])
const groupBy = ref('none')

const statusOptions = ['Aktif', 'Pasif']
const consumptionOptions = [
  { label: '0-20 kWh', value: '0-20', min: 0, max: 20 },
  { label: '21-30 kWh', value: '21-30', min: 21, max: 30 },
  { label: '31+ kWh', value: '31+', min: 31, max: Infinity },
]

const groupOptions = [
  { label: 'Duruma göre', value: 'status' },
  { label: 'İletişim tipine göre', value: 'type' },
  { label: 'Modele göre', value: 'model' },
  { label: 'Gruplama yok', value: 'none' },
]

const collator = new Intl.Collator('tr-TR')

const tableHeaders = [
  { title: 'Sayaç No', key: 'name', sortable: true },
  { title: 'Model', key: 'model', sortable: true },
  { title: 'İletişim', key: 'type', sortable: true },
  { title: 'Tüketim', key: 'consumption', sortable: true },
  { title: 'Versiyon', key: 'commandIndex', sortable: true },
  { title: 'Durum', key: 'status', sortable: true },
]

const tableSortBy = ref([{ key: 'name', order: 'asc' }])
const tableGroupBy = computed(() => (groupBy.value === 'none' ? [] : [{ key: groupBy.value }]))

const tools = ref([
  {
    name: '10001',
    model: 'BT-13',
    status: 'Aktif',
    commandIndex: 44,
    consumption: '15 (kWh)',
    type: 'LoRa',
    lat: 38.4843,
    lng: 27.0891,
  },
  {
    name: '10002',
    model: 'BM-13',
    status: 'Pasif',
    commandIndex: 45,
    consumption: '20 (kWh)',
    type: 'GPRS',
    lat: 38.4872,
    lng: 27.0947,
  },
  {
    name: '10003',
    model: 'BTK-13',
    status: 'Aktif',
    commandIndex: 34,
    consumption: '25 (kWh)',
    type: 'NBIOT',
    lat: 38.4826,
    lng: 27.0839,
  },
  {
    name: '10004',
    model: 'BT-13',
    status: 'Pasif',
    commandIndex: 29,
    consumption: '30 (kWh)',
    type: 'LoRa',
    lat: 38.4888,
    lng: 27.0972,
  },
  {
    name: '10005',
    model: 'BM-13',
    status: 'Aktif',
    commandIndex: 44,
    consumption: '15 (kWh)',
    type: 'GPRS',
    lat: 38.4801,
    lng: 27.0914,
  },
  {
    name: '10006',
    model: 'BTK-13',
    status: 'Pasif',
    commandIndex: 39,
    consumption: '18 (kWh)',
    type: 'NBIOT',
    lat: 38.4864,
    lng: 27.0856,
  },
  {
    name: '10007',
    model: 'BT-13',
    status: 'Aktif',
    commandIndex: 44,
    consumption: '22 (kWh)',
    type: 'LoRa',
    lat: 38.4835,
    lng: 27.0959,
  },
  {
    name: '10008',
    model: 'BM-13',
    status: 'Pasif',
    commandIndex: 39,
    consumption: '28 (kWh)',
    type: 'GPRS',
    lat: 38.4895,
    lng: 27.0888,
  },
  {
    name: '10009',
    model: 'BTK-13',
    status: 'Aktif',
    commandIndex: 29,
    consumption: '35 (kWh)',
    type: 'NBIOT',
    lat: 38.4819,
    lng: 27.0984,
  },
  {
    name: '10010',
    model: 'BT-13',
    status: 'Pasif',
    commandIndex: 34,
    consumption: '40 (kWh)',
    type: 'LoRa',
    lat: 38.4849,
    lng: 27.0931,
  },
])

const communicationOptions = computed(() =>
  Array.from(new Set(tools.value.map((tool) => tool.type))).sort((a, b) => collator.compare(a, b)),
)

const modelOptions = computed(() =>
  Array.from(new Set(tools.value.map((tool) => tool.model))).sort((a, b) => collator.compare(a, b)),
)

const parseConsumption = (value) => {
  const match = value?.toString().match(/\d+/)
  return match ? Number(match[0]) : 0
}

const filteredTools = computed(() => {
  const term = quickFilterText.value.trim().toLowerCase()
  return tools.value.filter((tool) => {
    if (selectedStatuses.value.length && !selectedStatuses.value.includes(tool.status)) return false
    if (selectedComm.value.length && !selectedComm.value.includes(tool.type)) return false
    if (selectedModels.value.length && !selectedModels.value.includes(tool.model)) return false
    if (selectedConsumption.value.length) {
      const numericConsumption = parseConsumption(tool.consumption)
      const matchesRange = selectedConsumption.value.some((rangeValue) => {
        const range = consumptionOptions.find((option) => option.value === rangeValue)
        if (!range) return false
        return numericConsumption >= range.min && numericConsumption <= range.max
      })
      if (!matchesRange) return false
    }
    if (!term) return true
    const haystack = `${tool.name} ${tool.model} ${tool.type} ${tool.status}`.toLowerCase()
    return haystack.includes(term)
  })
})

const filteredStats = computed(() => {
  const stats = { total: filteredTools.value.length, active: 0, inactive: 0 }
  filteredTools.value.forEach((tool) => {
    if (tool.status === 'Aktif') stats.active += 1
    if (tool.status === 'Pasif') stats.inactive += 1
  })
  return stats
})

const statusChipColor = (status) => (status === 'Aktif' ? 'success' : 'error')

const tableItems = filteredTools

const resetFilters = () => {
  selectedStatuses.value = []
  selectedComm.value = []
  selectedModels.value = []
  selectedConsumption.value = []
  groupBy.value = 'status'
  quickFilterText.value = ''
}

const selectAllRows = () => {
  selectedRows.value = [...tableItems.value]
}

watch(filteredTools, () => {
  const allowed = new Set(tableItems.value.map((tool) => tool.name))
  selectedRows.value = selectedRows.value.filter((row) => allowed.has(row.name))
  if (activeTab.value === 'map') {
    setTimeout(initMap, 150)
  }
})

watch(activeTab, (val) => {
  if (val === 'map') setTimeout(initMap, 150)
})

let mapInstance = null

function initMap() {
  const mapContainer = document.getElementById('map')
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

  const markerSource = filteredTools.value.length ? filteredTools.value : tools.value
  markerSource.forEach((tool) => {
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
      .addTo(mapInstance)
  })
}

const workOrderHeaders = [
  { title: 'Sayaç No', key: 'name', sortable: true },
  { title: 'İş Emri Tipi', key: 'type', sortable: true },
  { title: 'İş Emri Datası', key: 'workOrderId', sortable: true },
  { title: 'Data', key: 'data', sortable: true },
  { title: 'Durum', key: 'status', sortable: true },
  { title: 'Oluşturulma', key: 'createdDate', sortable: true },
  { title: 'Gönderim', key: 'sentDate', sortable: true },
  { title: 'Cevap', key: 'responseDate', sortable: true },
]

const workOrderData = ref([
  {
    name: '10001',
    workOrderId: '01020304',
    type: 'Röle Aç',
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
    type: 'Röle Kapat',
    data: '01020304AAABAC',
    status: 'Gönderildi',
    createdDate: '2025-10-22 08:40',
    sentDate: '2025-10-22 08:41',
    responseDate: '2025-10-22 08:45',
  },
  {
    name: '10003',
    workOrderId: '01020304',
    type: 'Tüketim Oku',
    data: '090807FFFEFD',
    status: 'Bekliyor',
    createdDate: '2025-10-23 14:30',
    sentDate: '-',
    responseDate: '-',
  },
  {
    name: '10004',
    workOrderId: '01020304',
    type: 'Röle Aç',
    data: '01020304AAABAC',
    status: 'Başarısız',
    createdDate: '2025-10-21 16:45',
    sentDate: '2025-10-21 16:46',
    responseDate: '2025-10-21 16:50',
  },
  {
    name: '10005',
    workOrderId: '01020304',
    type: 'Limit Güncelle',
    data: '090807FFFEFD',
    status: 'Tamamlandı',
    createdDate: '2025-10-22 11:00',
    sentDate: '2025-10-22 11:02',
    responseDate: '2025-10-22 11:10',
  },
  {
    name: '10006',
    workOrderId: '01020304',
    type: 'Röle Kapat',
    data: '01020304AAABAC',
    status: 'Tamamlandı',
    createdDate: '2025-10-21 13:15',
    sentDate: '2025-10-21 13:17',
    responseDate: '2025-10-21 13:21',
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
    type: 'Röle Kapat',
    data: '01020304AAABAC',
    status: 'Gönderildi',
    createdDate: '2025-10-23 10:10',
    sentDate: '2025-10-23 10:11',
    responseDate: '-',
  },
  {
    name: '10009',
    workOrderId: '01020304',
    type: 'Röle Aç',
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

const filteredWorkOrders = computed(() => {
  const term = workOrderFilter.value.trim().toLowerCase()
  if (!term) return workOrderData.value
  return workOrderData.value.filter((item) =>
    `${item.name} ${item.type} ${item.workOrderId} ${item.data} ${item.status}`.toLowerCase().includes(term),
  )
})

const workOrderStatusColor = (status) => {
  const colors = {
    Gönderildi: 'info',
    Tamamlandı: 'success',
    Başarısız: 'error',
    Bekliyor: 'warning',
  }
  return colors[status] || 'secondary'
}

const workOrderPanel = ref(false)
const selectedWorkOrderType = ref(null)
const workOrderPayload = ref({ description: '', readCommand: '', limit: '', resetCode: '' })
const workOrderTypes = ['Sayaç Okuma', 'Limit Güncelleme', 'Resetleme']

const sendWorkOrder = () => {
  if (!selectedRows.value.length) {
    alert('Herhangi bir cihaz seçilmedi.')
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

  alert(`${selectedRows.value.length} cihaz için '${type}' iş emri hazırlandı (örnek simülasyon).`)

  workOrderPanel.value = false
  selectedWorkOrderType.value = null
  workOrderPayload.value = { description: '', readCommand: '', limit: '', resetCode: '' }
}

const alertHeaders = [
  { title: 'Sayaç No', key: 'deviceName', sortable: true },
  { title: 'Payload', key: 'alertId', sortable: true },
  { title: 'Uyarı Tipi', key: 'type', sortable: true },
  { title: 'Önem', key: 'severity', sortable: true },
  { title: 'Tarih', key: 'createdDate', sortable: true },
  { title: 'Durum', key: 'status', sortable: true },
]

const alertData = ref([
  {
    alertId: 'AABBCCDDEEFC',
    deviceName: '10001',
    type: 'Üst Kapak Açıldı',
    severity: 'Kritik',
    createdDate: '2025-10-23 09:45',
    status: 'Açık',
  },
  {
    alertId: 'AABBCCDDEEFF',
    deviceName: '10005',
    type: 'Düşük Voltaj',
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

const filteredAlerts = computed(() => {
  const term = alertFilter.value.trim().toLowerCase()
  if (!term) return alertData.value
  return alertData.value.filter((item) =>
    `${item.deviceName} ${item.type} ${item.severity} ${item.status}`.toLowerCase().includes(term),
  )
})

const alertSeverityColor = (severity) => {
  const colors = {
    Düşük: 'success',
    Orta: 'warning',
    Yüksek: 'orange-darken-2',
    Kritik: 'error',
  }
  return colors[severity] || 'secondary'
}

const workOrderNotification = ref({ visible: false, message: '' })
const alarmNotification = ref({ visible: false, message: '' })
let workOrderTimer = null
let alarmTimer = null

const showRandomWorkOrderResponse = () => {
  const pool = filteredTools.value.length ? filteredTools.value : tools.value
  const randomTool = pool[Math.floor(Math.random() * pool.length)]
  if (!randomTool) return

  workOrderNotification.value.message = `${randomTool.name} sayacından iş emri cevabı geldi! ⚙️`
  workOrderNotification.value.visible = true
  setTimeout(() => (workOrderNotification.value.visible = false), 4000)
}

const showRandomAlarm = () => {
  const pool = filteredTools.value.length ? filteredTools.value : tools.value
  const randomTool = pool[Math.floor(Math.random() * pool.length)]
  if (!randomTool) return

  const randomType = ['Üst Kapak Uyarısı', 'Müdahele', 'Düşük Akım'][Math.floor(Math.random() * 3)]
  alarmNotification.value.message = `🚨 ${randomTool.name} sayacında ${randomType}!`
  alarmNotification.value.visible = true
  setTimeout(() => (alarmNotification.value.visible = false), 4000)
}

onMounted(() => {
  const loopWorkOrder = () => {
    const delay = 5000 + Math.random() * 10000
    workOrderTimer = setTimeout(() => {
      showRandomWorkOrderResponse()
      loopWorkOrder()
    }, delay)
  }

  const loopAlarm = () => {
    const delay = 15000 + Math.random() * 20000
    alarmTimer = setTimeout(() => {
      showRandomAlarm()
      loopAlarm()
    }, delay)
  }

  loopWorkOrder()
  loopAlarm()
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
/* Yerleşim */
.products-layout {
  display: flex !important;
  align-items: stretch !important;
  gap: 18px;
}

@media (max-width: 1280px) {
  .products-layout {
    gap: 12px;
    flex-wrap: wrap;
  }
  .side-column {
    flex: 1;
    min-width: 300px;
  }
  .grid-column {
    width: 100%;
    order: -1;
  }
}

.side-column,
.grid-column {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.side-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Kart stilleri */
.filter-card,
.group-card,
.grid-card {
  background: rgba(15, 23, 42, 0.95);
  border-radius: 18px;
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: #e2e8f0;
}

.group-card {
  margin-top: 18px;
  padding-bottom: 12px;
  flex-grow: 1;
}

/* Başlıklar */
.group-header h2,
.filter-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #f8fafc;
}

.group-header p {
  margin: 6px 0 12px;
  font-size: 13px;
  color: #cbd5f5;
  line-height: 1.4;
}

/* Filtre alanı */
.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.filter-group {
  margin-bottom: 18px;
}

.filter-group:last-of-type {
  margin-bottom: 0;
}

.filter-title {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.4px;
  color: #a5b4fc;
}

.filter-chip {
  margin-bottom: 8px;
}

/* Tablo alanı */
.grid-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  backdrop-filter: blur(10px);
}

.grid-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.grid-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.summary-chip {
  font-weight: 600;
  letter-spacing: 0.3px;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.grid-wrapper {
  flex: 1;
  min-height: 600px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.28);
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.grid-table,
.secondary-table {
  background: transparent;
}

.grid-table :deep(table),
.secondary-table :deep(table) {
  background: transparent;
}

.grid-table :deep(thead tr),
.secondary-table :deep(thead tr) {
  background: rgba(15, 23, 42, 0.85);
}

.grid-table :deep(th),
.secondary-table :deep(th) {
  color: rgba(226, 232, 240, 0.85);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.grid-table :deep(td),
.secondary-table :deep(td) {
  color: rgba(241, 245, 249, 0.92);
  font-size: 14px;
}

.grid-table :deep(tbody tr:hover),
.secondary-table :deep(tbody tr:hover) {
  background: rgba(59, 130, 246, 0.08);
}

.secondary-table {
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.25);
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

/* Bildirim animasyonları */
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

/* Bildirim kutuları */
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

@keyframes toastPulse {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

@keyframes alarmPulse {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

/* Responsive */
@media (max-width: 1280px) {
  .products-layout {
    gap: 12px;
    flex-wrap: wrap;
  }
  .side-column {
    flex: 1;
    min-width: 300px;
  }
  .grid-column {
    width: 100%;
    order: -1;
  }
}

@media (max-width: 960px) {
  .grid-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
  .toolbar-actions {
    width: 100%;
    justify-content: flex-start;
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
