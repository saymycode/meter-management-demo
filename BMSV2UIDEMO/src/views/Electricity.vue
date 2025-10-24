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

            <!-- Orta: Kart tabanlı pano -->
            <v-col cols="12" md="8" class="board-column">
              <v-card class="board-card" elevation="0">
                <div class="board-header">
                  <div class="board-title">
                    <h2>Filtrelenmiş sayaç panoraması</h2>
                    <span class="card-subtitle"
                      >Detaylara kart tabanlı panodan erişin, hızlı aksiyon alın.</span
                    >
                  </div>
                  <div class="board-actions">
                    <v-btn variant="text" @click="selectAllRows">Tümünü Seç</v-btn>
                    <v-btn
                      variant="text"
                      color="secondary"
                      :disabled="selectedRows.length === 0"
                      @click="clearSelection"
                    >
                      Seçimi Temizle
                    </v-btn>
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

                <div class="board-glance">
                  <div class="glance-item">
                    <span class="glance-label">Toplam</span>
                    <strong>{{ filteredStats.total }}</strong>
                  </div>
                  <div class="glance-item">
                    <span class="glance-label">Seçili</span>
                    <strong>{{ selectedRows.length }}</strong>
                  </div>
                  <div class="glance-item">
                    <span class="glance-label">Aktif</span>
                    <strong>{{ filteredStats.active }}</strong>
                  </div>
                  <div class="glance-item">
                    <span class="glance-label">Pasif</span>
                    <strong>{{ filteredStats.inactive }}</strong>
                  </div>
                  <div class="glance-item">
                    <span class="glance-label">Ortalama tüketim</span>
                    <strong>{{ boardSummary.avgConsumption }}</strong>
                  </div>
                </div>

                <v-text-field
                  v-model="quickFilterText"
                  class="mb-6"
                  density="comfortable"
                  hide-details
                  label="Sayaç, model veya tip ara"
                  prepend-inner-icon="search"
                  variant="outlined"
                  clearable
                />

                <div class="board-content">
                  <div
                    v-for="group in groupedMeters"
                    :key="group.key"
                    class="board-lane"
                  >
                    <div class="lane-header">
                      <div>
                        <span class="lane-title">{{ group.title }}</span>
                        <span class="lane-subtitle">{{ group.subtitle }}</span>
                      </div>
                      <v-chip class="lane-chip" variant="tonal" color="primary">
                        {{ group.items.length }} sayaç
                      </v-chip>
                    </div>
                    <div class="lane-body">
                      <v-card
                        v-for="meter in group.items"
                        :key="meter.name"
                        class="meter-tile"
                        rounded="lg"
                        elevation="0"
                      >
                        <div class="tile-header">
                          <div class="tile-title">
                            <span class="tile-code">{{ meter.name }}</span>
                            <span class="tile-model">{{ meter.model }}</span>
                          </div>
                          <v-chip
                            :class="['status-chip', meter.status === 'Aktif' ? 'is-active' : 'is-passive']"
                            size="small"
                            variant="flat"
                          >
                            {{ meter.status }}
                          </v-chip>
                        </div>

                        <div class="tile-meta">
                          <div class="meta-item">
                            <span class="meta-label">İletişim</span>
                            <span class="meta-value">{{ meter.type }}</span>
                          </div>
                          <div class="meta-item">
                            <span class="meta-label">Tüketim</span>
                            <span class="meta-value mono">{{ meter.consumption }}</span>
                          </div>
                          <div class="meta-item">
                            <span class="meta-label">Versiyon</span>
                            <span class="meta-value mono">{{ meter.commandIndex }}</span>
                          </div>
                        </div>

                        <div class="tile-actions">
                          <v-btn
                            :color="isMeterSelected(meter) ? 'primary' : 'secondary'"
                            :variant="isMeterSelected(meter) ? 'flat' : 'tonal'"
                            prepend-icon="
                              isMeterSelected(meter)
                                ? 'check_circle'
                                : 'radio_button_unchecked'
                            "
                            size="small"
                            @click.stop="toggleMeterSelection(meter)"
                          >
                            {{ isMeterSelected(meter) ? 'Seçili' : 'Seç' }}
                          </v-btn>
                          <v-btn
                            variant="text"
                            color="info"
                            prepend-icon="travel_explore"
                            size="small"
                            @click.stop="focusOnMap(meter)"
                          >
                            Haritada Göster
                          </v-btn>
                        </div>
                      </v-card>
                    </div>
                  </div>
                  <div v-if="!groupedMeters.length" class="no-data">Filtrelere uyan sayaç bulunamadı.</div>
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

          <div class="list-board">
            <v-card
              v-for="order in filteredWorkOrders"
              :key="order.workOrderId"
              class="info-card"
              elevation="0"
            >
              <div class="info-header">
                <div>
                  <span class="info-title">{{ order.workOrderId }}</span>
                  <span class="info-subtitle">{{ order.name }} • {{ order.type }}</span>
                </div>
                <v-chip :color="workOrderStatusColor(order.status)" size="small" variant="tonal">
                  {{ order.status }}
                </v-chip>
              </div>
              <div class="info-body">
                <div class="info-meta">
                  <span class="meta-label">Data</span>
                  <span class="meta-value mono">{{ order.data }}</span>
                </div>
                <div class="info-meta">
                  <span class="meta-label">Oluşturulma</span>
                  <span class="meta-value">{{ order.createdDate }}</span>
                </div>
                <div class="info-meta">
                  <span class="meta-label">Gönderim</span>
                  <span class="meta-value">{{ order.sentDate }}</span>
                </div>
                <div class="info-meta">
                  <span class="meta-label">Cevap</span>
                  <span class="meta-value">{{ order.responseDate }}</span>
                </div>
              </div>
            </v-card>
            <div v-if="!filteredWorkOrders.length" class="no-data">Kayıt bulunamadı.</div>
          </div>
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

          <div class="list-board">
            <v-card
              v-for="alert in filteredAlerts"
              :key="alert.alertId"
              class="info-card"
              elevation="0"
            >
              <div class="info-header">
                <div>
                  <span class="info-title">{{ alert.alertId }}</span>
                  <span class="info-subtitle">{{ alert.deviceName }} • {{ alert.type }}</span>
                </div>
                <v-chip :color="alertSeverityColor(alert.severity)" size="small" variant="tonal">
                  {{ alert.severity }}
                </v-chip>
              </div>
              <div class="info-body">
                <div class="info-meta">
                  <span class="meta-label">Durum</span>
                  <span class="meta-value">{{ alert.status }}</span>
                </div>
                <div class="info-meta">
                  <span class="meta-label">Tarih</span>
                  <span class="meta-value">{{ alert.createdDate }}</span>
                </div>
              </div>
            </v-card>
            <div v-if="!filteredAlerts.length" class="no-data">Aktif alarm bulunamadı.</div>
          </div>
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

const groupedMeters = computed(() => {
  const strategy = groupBy.value
  const groups = new Map()

  const ensureGroup = (key, meta) => {
    if (!groups.has(key)) {
      groups.set(key, { key, title: meta.title, subtitle: meta.subtitle, items: [] })
    }
  }

  const resolveMeta = (key) => {
    if (strategy === 'status') {
      const isActive = key === 'Aktif'
      return {
        title: isActive ? 'Aktif sayaçlar' : 'Pasif sayaçlar',
        subtitle: isActive ? 'Canlı veri ileten noktalar' : 'Kontrol bekleyen cihazlar',
      }
    }
    if (strategy === 'type') {
      return {
        title: `${key} iletişim`,
        subtitle: 'Teknoloji bazlı kümelenmiş görünüm',
      }
    }
    if (strategy === 'model') {
      return {
        title: `${key} modeli`,
        subtitle: 'Sahada kullanılan ürün varyantı',
      }
    }
    return {
      title: 'Tüm sayaçlar',
      subtitle: 'Filtrelenmiş sonuçların tamamı',
    }
  }

  if (!filteredTools.value.length) {
    return []
  }

  filteredTools.value.forEach((tool) => {
    const key =
      strategy === 'status'
        ? tool.status
        : strategy === 'type'
          ? tool.type
          : strategy === 'model'
            ? tool.model
            : 'all'
    const meta = resolveMeta(key)
    ensureGroup(key, meta)
    groups.get(key).items.push(tool)
  })

  return Array.from(groups.values())
    .sort((a, b) => collator.compare(a.title, b.title))
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => collator.compare(a.name, b.name)),
    }))
})

const boardSummary = computed(() => {
  const total = filteredTools.value.length
  if (!total) {
    return {
      avgConsumption: '0 kWh',
    }
  }

  const totalConsumption = filteredTools.value.reduce(
    (sum, tool) => sum + parseConsumption(tool.consumption),
    0,
  )
  const average = (totalConsumption / total).toFixed(1)

  return {
    avgConsumption: `${average} kWh`,
  }
})

const resetFilters = () => {
  selectedStatuses.value = []
  selectedComm.value = []
  selectedModels.value = []
  selectedConsumption.value = []
  groupBy.value = 'status'
  quickFilterText.value = ''
}

const selectAllRows = () => {
  selectedRows.value = [...filteredTools.value]
}

const clearSelection = () => {
  selectedRows.value = []
}

const isMeterSelected = (meter) => selectedRows.value.some((item) => item.name === meter.name)

const toggleMeterSelection = (meter) => {
  if (isMeterSelected(meter)) {
    selectedRows.value = selectedRows.value.filter((item) => item.name !== meter.name)
  } else {
    selectedRows.value = [...selectedRows.value, meter]
  }
}

const focusOnMap = (meter) => {
  activeTab.value = 'map'
  nextTick(() => {
    setTimeout(() => {
      if (!mapInstance) {
        initMap()
      }
      if (!mapInstance) return

      mapInstance.setView([meter.lat, meter.lng], 17, { animate: true })
      L.popup({ autoClose: true })
        .setLatLng([meter.lat, meter.lng])
        .setContent(
          `<strong>${meter.name}</strong><br>${meter.type} • <span style="font-weight:600;">${meter.status}</span>`,
        )
        .openOn(mapInstance)
    }, 250)
  })
}

watch(filteredTools, () => {
  const allowed = new Set(filteredTools.value.map((tool) => tool.name))
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
.products-layout {
  display: flex !important;
  align-items: stretch !important;
  gap: 18px;
}

.side-column,
.board-column {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.side-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card,
.group-card,
.board-card {
  background: var(--surface-card);
  border-radius: 18px;
  padding: 20px;
  border: 1px solid var(--border-soft);
  color: var(--text-color);
  box-shadow: none;
  transition: background var(--transition-speed) ease, color var(--transition-speed) ease,
    border-color var(--transition-speed) ease;
}

.board-card {
  padding: 28px 26px;
  gap: 24px;
  display: flex;
  flex-direction: column;
}

.group-card {
  flex: 1;
}

.filter-header,
.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.filter-header h2,
.group-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0;
}

.group-header p {
  margin: 6px 0 12px;
  font-size: 13px;
  color: var(--muted-text);
  line-height: 1.4;
}

.filter-title {
  display: block;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--muted-text);
}

.filter-group {
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--border-soft);
}

.filter-group:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.filter-chip {
  margin-bottom: 8px;
  border-radius: 999px;
  font-weight: 500;
}

.board-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.board-title h2 {
  margin: 0;
  font-size: 22px;
  color: var(--heading-color);
}

.card-subtitle {
  display: block;
  margin-top: 6px;
  font-size: 14px;
  color: var(--muted-text);
}

.board-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.board-glance {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  background: var(--note-surface);
  border: 1px solid var(--border-soft);
}

.glance-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--muted-text);
  font-size: 13px;
}

.glance-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted-text);
}

.glance-item strong {
  font-size: 20px;
  color: var(--heading-color);
  font-weight: 700;
}

.board-content {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.list-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.board-content::-webkit-scrollbar {
  height: 8px;
}

.board-content::-webkit-scrollbar-thumb {
  background: var(--border-soft);
  border-radius: 999px;
}

.board-lane {
  min-width: 260px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid var(--border-soft);
  background: var(--surface-elevated);
  box-shadow: var(--card-shadow);
  transition: background var(--transition-speed) ease, border-color var(--transition-speed) ease;
}

.lane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.lane-title {
  font-weight: 600;
  color: var(--heading-color);
}

.lane-subtitle {
  display: block;
  font-size: 12px;
  color: var(--muted-text);
  margin-top: 2px;
}

.lane-chip {
  font-weight: 600;
}

.lane-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 6px;
}

.lane-body::-webkit-scrollbar {
  width: 6px;
}

.lane-body::-webkit-scrollbar-thumb {
  background: var(--border-soft);
  border-radius: 999px;
}

.meter-tile {
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  color: var(--text-color);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: border-color var(--transition-speed) ease, transform var(--transition-speed) ease,
    box-shadow var(--transition-speed) ease;
}

.meter-tile:hover {
  border-color: var(--accent-highlight);
  transform: translateY(-2px);
  box-shadow: var(--card-shadow);
}

.info-card {
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: var(--text-color);
  transition: border-color var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
}

.info-card:hover {
  border-color: var(--accent-highlight);
  box-shadow: var(--card-shadow);
}

.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.info-title {
  font-weight: 700;
  color: var(--heading-color);
  font-size: 15px;
}

.info-subtitle {
  display: block;
  font-size: 13px;
  color: var(--muted-text);
  margin-top: 4px;
}

.info-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.info-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tile-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.tile-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tile-code {
  font-weight: 700;
  font-size: 16px;
  color: var(--heading-color);
}

.tile-model {
  font-size: 13px;
  color: var(--muted-text);
}

.status-chip {
  font-weight: 600;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.status-chip.is-active {
  background: var(--positive-pill-bg);
  color: var(--positive-pill-color);
}

.status-chip.is-passive {
  background: var(--negative-pill-bg);
  color: var(--negative-pill-color);
}

.tile-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--muted-text);
}

.meta-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--heading-color);
}

.tile-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.mono {
  font-family: 'Fira Code', 'Roboto Mono', monospace;
}

.no-data {
  padding: 28px;
  text-align: center;
  border-radius: 16px;
  background: var(--note-surface);
  color: var(--muted-text);
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

@media (max-width: 1280px) {
  .products-layout {
    gap: 12px;
    flex-wrap: wrap;
  }
  .side-column {
    flex: 1;
    min-width: 280px;
  }
  .board-column {
    order: -1;
  }
}

@media (max-width: 960px) {
  .board-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .board-actions {
    width: 100%;
  }
  .lane-body {
    max-height: none;
  }
}

@media (max-width: 600px) {
  .board-content {
    flex-direction: column;
  }
  .board-lane {
    min-width: auto;
  }
  .fancy-toast,
  .alarm-toast {
    right: 16px;
    left: 16px;
  }
  .alarm-toast {
    bottom: 170px;
  }
}
</style>

