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
                  <ag-grid-vue
                    class="ag-theme-alpine grid-full"
                    :columnDefs="columnDefs"
                    :rowData="displayRows"
                    :quickFilterText="quickFilterText"
                    :animateRows="true"
                    rowSelection="multiple"
                    :rowClassRules="rowClassRules"
                    :localeText="localeText"
                    :defaultColDef="defaultColDef"
                    pagination
                    :paginationPageSize="6"
                    domLayout="normal"
                    @grid-ready="onGridReady"
                    @selection-changed="onSelectionChanged"
                  />
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

          <ag-grid-vue
            class="ag-theme-alpine"
            style="height: 600px; width: 100%"
            :columnDefs="workOrderColumnDefs"
            :rowData="workOrderData"
            :quickFilterText="workOrderFilter"
            animateRows="true"
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
            prepend-inner-icon="notifications_active"
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
            :columnDefs="alertColumnDefs"
            :rowData="alertData"
            :quickFilterText="alertFilter"
            animateRows="true"
            :localeText="localeText"
            :defaultColDef="defaultColDef"
            pagination
            :paginationPageSize="8"
          />
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ---- Reaktif değişkenler ----
const activeTab = ref('products')
const quickFilterText = ref('')
const gridApi = ref(null)
const selectedRows = ref([])
const workOrderFilter = ref('')
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

// ---- Kolon tanımları ----
const columnDefs = ref([
  {
    field: 'name',
    headerName: 'Sayaç No',
    filter: 'agTextColumnFilter',
    checkboxSelection: (params) => !params.data?.isGroup,
    headerCheckboxSelection: true,
    cellRenderer: (params) => {
      if (params.data?.isGroup) {
        return `
          <div class="group-cell">
            <strong>${params.data.groupLabel}</strong>
            <span>${params.data.count} sayaç</span>
            <small>Aktif: ${params.data.activeCount} · Pasif: ${params.data.inactiveCount}</small>
          </div>
        `
      }
      return params.value
    },
  },
  {
    field: 'model',
    headerName: 'Sayaç Modeli',
    filter: 'agTextColumnFilter',
    valueGetter: (params) => (params.data?.isGroup ? '' : (params.data?.model ?? '')),
  },
  {
    field: 'type',
    headerName: 'İletişim Tipi',
    valueGetter: (params) => (params.data?.isGroup ? '' : (params.data?.type ?? '')),
  },
  {
    field: 'consumption',
    headerName: 'Tüketim',
    filter: true,
    valueGetter: (params) => (params.data?.isGroup ? '' : (params.data?.consumption ?? '')),
  },
  {
    field: 'commandIndex',
    headerName: 'Versiyon',
    filter: 'agNumberColumnFilter',
    valueGetter: (params) => (params.data?.isGroup ? '' : (params.data?.commandIndex ?? '')),
  },
  {
    field: 'status',
    headerName: 'Durum',
    valueGetter: (params) => (params.data?.isGroup ? '' : (params.data?.status ?? '')),
    cellRenderer: (params) => {
      if (params.data?.isGroup) return ''
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
  suppressMenuHide: false,
}

// ---- Sayaç verileri ----
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
    return true
  })
})

function formatGroupLabel(key) {
  if (groupBy.value === 'status') {
    return `Durum: ${key}`
  }
  if (groupBy.value === 'type') {
    return `İletişim: ${key}`
  }
  if (groupBy.value === 'model') {
    return `Model: ${key}`
  }
  return key
}

const displayRows = computed(() => {
  if (groupBy.value === 'none') return filteredTools.value

  const groups = new Map()
  filteredTools.value.forEach((tool) => {
    const key = tool[groupBy.value] ?? 'Diğer'
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key).push(tool)
  })

  const sortFn = (a, b) => collator.compare(a, b)
  const result = []

  Array.from(groups.entries())
    .sort((a, b) => sortFn(a[0], b[0]))
    .forEach(([key, items]) => {
      const activeCount = items.filter((item) => item.status === 'Aktif').length
      const inactiveCount = items.length - activeCount
      result.push({
        isGroup: true,
        groupLabel: formatGroupLabel(key),
        rawGroupKey: key,
        count: items.length,
        activeCount,
        inactiveCount,
        name: formatGroupLabel(key),
      })
      const sortedItems = [...items].sort((a, b) => collator.compare(a.name, b.name))
      result.push(...sortedItems)
    })

  return result
})

const filteredStats = computed(() => {
  const stats = { total: filteredTools.value.length, active: 0, inactive: 0 }
  filteredTools.value.forEach((tool) => {
    if (tool.status === 'Aktif') stats.active += 1
    if (tool.status === 'Pasif') stats.inactive += 1
  })
  return stats
})

const rowClassRules = {
  'group-row': (params) => params.data?.isGroup,
}

function resetFilters() {
  selectedStatuses.value = []
  selectedComm.value = []
  selectedModels.value = []
  selectedConsumption.value = []
  groupBy.value = 'status'
  quickFilterText.value = ''
  gridApi.value?.setQuickFilter('')
}

// ---- İş Emri Geçmişi ----
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
    status: 'Bekliyor',
    createdDate: '2025-10-22 11:00',
    sentDate: '-',
    responseDate: '-',
  },
  {
    name: '10003',
    workOrderId: '01020304',
    type: 'Röle Aç',
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
    type: 'Röle Kapat',
    data: '090807FFFEFD',
    status: 'Gönderildi',
    createdDate: '2025-10-21 15:00',
    sentDate: '2025-10-21 15:01',
    responseDate: '-',
  },
  {
    name: '10006',
    workOrderId: '01020304',
    type: 'Röle Aç',
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

const workOrderColumnDefs = ref([
  { field: 'name', headerName: 'Sayaç No', filter: 'agTextColumnFilter' },
  {
    field: 'type',
    headerName: 'İş Emri Tipi',
    filter: 'agTextColumnFilter',
  },
  { field: 'workOrderId', headerName: 'İş Emri Datası', cellStyle: { fontFamily: 'monospace' } },
  { field: 'data', headerName: 'Data', cellStyle: { fontFamily: 'monospace' } },
  {
    field: 'status',
    headerName: 'Durum',
    cellRenderer: (params) => {
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
function onSelectionChanged(event) {
  selectedRows.value = event.api.getSelectedRows().filter((row) => !row.isGroup)
}
function selectAllRows() {
  if (!gridApi.value) return
  gridApi.value.forEachNode((node) => {
    if (node.data?.isGroup) {
      node.setSelected(false)
    } else {
      node.setSelected(true)
    }
  })
  selectedRows.value = gridApi.value.getSelectedRows().filter((row) => !row.isGroup)
}
function onGridReady(params) {
  gridApi.value = params.api
  params.api.sizeColumnsToFit() // sadece kolonları boyutlandır
}

watch(filteredTools, () => {
  if (gridApi.value) {
    const selectedIds = new Set(selectedRows.value.map((row) => row.name))
    nextTick(() => {
      gridApi.value.forEachNode((node) => {
        if (!node.data || node.data.isGroup) return
        node.setSelected(selectedIds.has(node.data.name))
      })
      selectedRows.value = gridApi.value.getSelectedRows().filter((row) => !row.isGroup)
    })
  }

  if (activeTab.value === 'map') {
    setTimeout(initMap, 150)
  }
})

watch(groupBy, () => {
  if (!gridApi.value) return
  const selectedIds = new Set(selectedRows.value.map((row) => row.name))
  nextTick(() => {
    gridApi.value.forEachNode((node) => {
      if (!node.data || node.data.isGroup) return
      node.setSelected(selectedIds.has(node.data.name))
    })
    selectedRows.value = gridApi.value.getSelectedRows().filter((row) => !row.isGroup)
  })
})

// ---- Harita Başlatma ----
let mapInstance = null

function initMap() {
  const mapContainer = document.getElementById('map')
  if (!mapContainer) return

  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }

  mapContainer.innerHTML = ''

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

// ---- Harita Tabı Aktif Olunca Başlat ----
watch(activeTab, (val) => {
  if (val === 'map') setTimeout(initMap, 150)
})

const workOrderNotification = ref({ visible: false, message: '' })
let workOrderTimer = null

function showRandomWorkOrderResponse() {
  const pool = filteredTools.value.length ? filteredTools.value : tools.value
  const randomTool = pool[Math.floor(Math.random() * pool.length)]
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
  const pool = filteredTools.value.length ? filteredTools.value : tools.value
  const randomTool = pool[Math.floor(Math.random() * pool.length)]
  if (!randomTool) return

  const randomType = ['Üst Kapak Uyarısı', 'Müdahele', 'Düşük Akım'][Math.floor(Math.random() * 3)]

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

onUnmounted(() => {
  clearTimeout(alarmTimer)
  clearTimeout(workOrderTimer)
  gridApi.value = null
  columnApi.value = null
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})

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
/* AG Grid genel tema */
.ag-theme-alpine {
  --ag-font-size: 14px;
  border-radius: 10px;
}

/* Yerleşim */
.products-layout {
  display: flex !important;
  align-items: stretch !important;
  gap: 18px;
}

/* Update the products-layout styles */
.products-layout {
  display: flex !important;
  align-items: stretch !important;
  gap: 18px;
}

/* Update responsive styles */
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
}

.grid-full {
  height: 100%;
  width: 100%;
}

/* Grup satırları (AG Grid) */
:deep(.ag-row.group-row) {
  background: rgba(59, 130, 246, 0.08) !important;
}

:deep(.ag-row.group-row .ag-cell) {
  font-weight: 600;
  color: #f8fafc;
}

:deep(.group-cell) {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:deep(.group-cell span) {
  font-size: 12px;
  color: #cbd5f5;
}

:deep(.group-cell small) {
  font-size: 11px;
  color: #94a3b8;
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

/* Tema uyumu */
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
