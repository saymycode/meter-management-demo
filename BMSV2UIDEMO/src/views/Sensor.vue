<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-container fluid class="sensor-dashboard" tag="section">
    <section class="sensor-header">
      <div class="header-left">
        <div class="header-chip">{{ organization.scope }} • Sensör listesi</div>
        <h1>Kurumsal sayaç yönetimi</h1>
        <p>
          ASKİ'ye bağlı su ve elektrik sayaçları gün içinde rastgele saatlerde paket gönderir. Bu ekran
          yalnızca kurumunuza ait LoRa ve GPRS sayaçlarını gösterir; farklı organizasyonların verileri
          görünmez.
        </p>
        <div class="header-meta">
          <DataFreshnessIndicator
            :last-update="lastPacket"
            :now="now"
            :pending-threshold-hours="24"
            :inactive-threshold-hours="48"
            title="Son veri"
          />
          <div class="meta-grid">
            <div class="meta-item" v-for="meta in headerMetrics" :key="meta.label">
              <span class="meta-label">{{ meta.label }}</span>
              <span class="meta-value">{{ meta.value }}</span>
              <span class="meta-hint">{{ meta.hint }}</span>
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
          <v-icon icon="bolt" size="18" />
          <span>Veriler canlı değil; her sayaç 24 saatlik pencere içinde rastgele saatlerde görünür.</span>
        </div>
      </div>
    </section>

    <v-row class="sensor-content" no-gutters>
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
            <span class="filter-title">Sayaç tipi</span>
            <v-chip-group v-model="selectedTypes" column multiple>
              <v-chip
                v-for="type in typeOptions"
                :key="type"
                :value="type"
                class="filter-chip"
                color="purple"
                filter
                variant="tonal"
              >
                {{ type }}
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
                color="amber"
                filter
                variant="tonal"
              >
                {{ zone }}
              </v-chip>
            </v-chip-group>
          </div>
          <div class="filter-group">
            <span class="filter-title">Gruplama</span>
            <v-chip-group v-model="selectedGroupBy" column multiple>
              <v-chip
                v-for="option in groupByOptions"
                :key="option.value"
                :value="option.value"
                class="filter-chip"
                color="indigo"
                filter
                variant="tonal"
              >
                {{ option.title }}
              </v-chip>
            </v-chip-group>
          </div>
        </v-card>

        <v-card class="plan-card" elevation="0">
          <div class="plan-header">
            <h2>Arayüz tutarlılık planı</h2>
            <span>Sensor ekranı için görsel prensipler</span>
          </div>
          <v-list density="compact" class="plan-list">
            <v-list-item>
              <v-list-item-title>• Koyu kartlar, neon aksanlar ve yuvarlatılmış köşeler HomeView ile aynıdır.</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>• Veri tazeliği çip renkleri hem grid hem kart görünümünde tekrar eder.</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>• Tipografi hiyerarşisi: başlıklar 20px, etiketler 13px üst-alt boşluklu.</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>• Kart geçişlerinde hafif gölge ve hover ışımaları kullanılır; animasyonlar 160ms.</v-list-item-title>
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
              prepend-inner-icon="search"
              variant="outlined"
              clearable
            />
            <div class="toolbar-actions">
              <v-btn variant="text" @click="selectAllRows">Tümünü seç</v-btn>
              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="assignment"
                :disabled="selectedRows.length === 0"
                @click="openWorkOrder"
              >
                İş emri planla
              </v-btn>
              <v-btn-toggle
                v-model="viewMode"
                class="view-toggle"
                density="comfortable"
                mandatory
                :disabled="activeMainTab !== 'meters'"
              >
                <v-btn value="table" icon="table" />
                <v-btn value="cards" icon="grid_view" />
              </v-btn-toggle>
            </div>
          </div>

          <v-tabs v-model="activeMainTab" class="content-tabs" density="comfortable" grow>
            <v-tab value="alerts" prepend-icon="warning">Uyarılar</v-tab>
            <v-tab value="meters" prepend-icon="widgets">Sayaçlar</v-tab>
            <v-tab value="workOrders" prepend-icon="assignment_turned_in">İş Emirleri</v-tab>
            <v-tab value="locations" prepend-icon="map">Konumlar</v-tab>
          </v-tabs>

          <v-window v-model="activeMainTab" class="tab-content">
            <v-window-item value="alerts">
              <v-data-table
                :headers="alertHeaders"
                :items="globalAlerts"
                :items-per-page="8"
                class="alerts-table"
                density="comfortable"
                hover
              >
                <template #item.severity="{ item }">
                  <v-chip :color="severityColor(item.severity)" size="small" variant="tonal">
                    {{ item.severity }}
                  </v-chip>
                </template>
                <template #item.timestamp="{ item }">
                  <div class="cell-secondary">
                    <span>{{ item.timestamp }}</span>
                    <small>{{ item.relative }}</small>
                  </div>
                </template>
                <template #item.actions="{ item }">
                  <v-btn variant="text" size="small" @click="focusSensor(item.sensorId)">Detay</v-btn>
                </template>
                <template #no-data>
                  <div class="no-data">Bu filtrelerle eşleşen uyarı bulunmuyor.</div>
                </template>
              </v-data-table>
            </v-window-item>

            <v-window-item value="meters">
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
                  @click:row="handleRowClick"
                >
                  <template #item.sensorId="{ item }">
                    <div class="cell-primary">
                      <span class="cell-id">{{ item.sensorId }}</span>
                      <span class="cell-zone">{{ item.zone }}</span>
                    </div>
                  </template>
                  <template #item.typeLabel="{ item }">
                    <div class="chip-inline">
                      <v-chip
                        :color="item.typeLabel === 'Su' ? 'cyan' : 'yellow-darken-2'"
                        size="small"
                        variant="tonal"
                      >
                        {{ item.typeLabel }}
                      </v-chip>
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
                  <template #no-data>
                    <div class="no-data">Filtrelere uyan sayaç bulunamadı.</div>
                  </template>
                </v-data-table>
              </div>

              <div v-else class="card-grid">
                <v-row dense>
                  <v-col v-for="sensor in filteredSensors" :key="sensor.sensorId" cols="12" sm="6">
                    <div class="sensor-card" :class="sensor.freshnessLevel" @click="openSensorDetail(sensor)">
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
                          <span class="sensor-label">Tip</span>
                          <span class="sensor-value">{{ sensor.typeLabel }} • {{ sensor.commMethod }}</span>
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
                          <span class="sensor-label">Okuma</span>
                          <span class="sensor-value">{{ sensor.lastReading }}</span>
                        </div>
                        <div class="sensor-row">
                          <span class="sensor-label">Batarya / Sinyal</span>
                          <span class="sensor-value">{{ sensor.battery }} • {{ sensor.signal }}</span>
                        </div>
                      </div>
                      <v-sparkline
                        :model-value="sensor.sparkline"
                        :smooth="12"
                        :line-width="3"
                        auto-draw
                        class="sensor-sparkline"
                        color="rgba(59,130,246,0.6)"
                      />
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>

            <v-window-item value="workOrders">
              <v-data-table
                :headers="workOrderHeaders"
                :items="globalWorkOrders"
                :items-per-page="8"
                class="workorder-table"
                density="comfortable"
                hover
              >
                <template #item.payload="{ item }">
                  <code class="payload-chip">{{ item.payload }}</code>
                </template>
                <template #item.response="{ item }">
                  <span class="response-text">{{ item.response }}</span>
                </template>
                <template #item.status="{ item }">
                  <v-chip :color="workOrderStatusColor(item.status)" size="small" variant="tonal">
                    {{ item.status }}
                  </v-chip>
                </template>
                <template #item.dispatchedAt="{ item }">
                  <div class="cell-secondary">
                    <span>{{ item.dispatchedLabel }}</span>
                    <small>{{ item.statusDetail }}</small>
                  </div>
                </template>
                <template #item.actions="{ item }">
                  <v-btn variant="text" size="small" @click="focusSensor(item.sensorId)">Sayaç</v-btn>
                </template>
                <template #no-data>
                  <div class="no-data">Bu filtrelerle eşleşen iş emri bulunmuyor.</div>
                </template>
              </v-data-table>
            </v-window-item>

            <v-window-item value="locations">
              <div class="map-card">
                <div class="map-header">
                  <div>
                    <h2>Konum görünümü</h2>
                    <span class="map-subtitle">Son paket: {{ lastPacketLabel }} • {{ lastPacketAgo }}</span>
                  </div>
                  <v-chip prepend-icon="my_location" size="small" variant="tonal">Kurum kapsamı</v-chip>
                </div>
                <div id="sensor-map" class="map-container" />
                <div class="map-legend">
                  <div class="legend-item"><span class="legend-dot active" /> Aktif</div>
                  <div class="legend-item"><span class="legend-dot pending" /> Beklemede</div>
                  <div class="legend-item"><span class="legend-dot inactive" /> Pasif</div>
                </div>
              </div>
            </v-window-item>
          </v-window>
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
        <v-btn icon="close" variant="text" @click="workOrderPanel = false" />
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
        <v-select
          v-model="selectedWorkOrderChannel"
          :items="workOrderChannels"
          label="İletişim kanalı"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />
        <v-text-field
          v-model="workOrderPayload.payload"
          label="Gönderilecek payload"
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

  <v-navigation-drawer
    v-model="detailPanel"
    location="right"
    width="460"
    temporary
    scrim="false"
    elevation="12"
  >
    <v-card v-if="detailSensor" flat class="detail-card">
      <v-card-title class="detail-title">
        <div class="detail-heading">
          <span class="detail-id">{{ detailSensor.sensorId }}</span>
          <span class="detail-zone">{{ detailSensor.zone }}</span>
        </div>
        <v-btn icon="close" variant="text" @click="detailPanel = false" />
      </v-card-title>
      <v-divider />
      <v-card-text class="detail-body">
        <div class="detail-chip-row">
          <v-chip :color="statusChipColor(detailSensor.status)" size="small" variant="tonal">
            {{ detailSensor.status }}
          </v-chip>
          <v-chip :color="detailSensor.freshnessChip" size="small" variant="tonal">
            {{ detailSensor.freshnessBucket }}
          </v-chip>
          <v-chip size="small" variant="tonal">{{ detailSensor.typeLabel }}</v-chip>
        </div>
        <div class="detail-meta">
          <div class="detail-meta-item">
            <span class="meta-label">Son veri</span>
            <span class="meta-value">{{ detailSensor.lastPacketDisplay }}</span>
            <span class="meta-hint">{{ detailSensor.lastPacketLabel }}</span>
          </div>
          <div class="detail-meta-item">
            <span class="meta-label">İletişim</span>
            <span class="meta-value">{{ detailSensor.commMethod }}</span>
            <span class="meta-hint">{{ detailSensor.window }}</span>
          </div>
          <div class="detail-meta-item">
            <span class="meta-label">Okuma</span>
            <span class="meta-value">{{ detailSensor.lastReading }}</span>
            <span class="meta-hint">Batarya: {{ detailSensor.battery }} • Sinyal: {{ detailSensor.signal }}</span>
          </div>
        </div>
        <v-tabs v-model="detailTab" class="detail-tabs" density="compact" grow>
          <v-tab value="overview">Genel</v-tab>
          <v-tab value="alerts">Uyarılar</v-tab>
          <v-tab value="workOrders">İş Emirleri</v-tab>
          <v-tab value="location">Konum</v-tab>
        </v-tabs>
        <v-window v-model="detailTab" class="detail-window">
          <v-window-item value="overview">
            <v-list density="compact" class="detail-list">
              <v-list-item>
                <v-list-item-title>Adres</v-list-item-title>
                <v-list-item-subtitle>{{ detailSensor.location }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Veri tazeliği</v-list-item-title>
                <v-list-item-subtitle>{{ detailSensor.freshnessBadge }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Son okuma</v-list-item-title>
                <v-list-item-subtitle>{{ detailSensor.lastReading }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-window-item>
          <v-window-item value="alerts">
            <div v-if="detailSensor.alerts.length" class="detail-stack">
              <div v-for="alert in detailSensor.alerts" :key="alert.id" class="detail-alert">
                <div class="detail-alert-header">
                  <v-chip :color="severityColor(alert.severity)" size="small" variant="tonal">
                    {{ alert.severity }}
                  </v-chip>
                  <span class="detail-alert-time">{{ alert.relative }}</span>
                </div>
                <h3>{{ alert.title }}</h3>
                <p>{{ alert.message }}</p>
              </div>
            </div>
            <div v-else class="no-data">Bu sayaca ait açık uyarı yok.</div>
          </v-window-item>
          <v-window-item value="workOrders">
            <div v-if="detailSensor.workOrders.length" class="detail-stack">
              <div v-for="order in detailSensor.workOrders" :key="order.id" class="detail-alert">
                <div class="detail-alert-header">
                  <v-chip :color="workOrderStatusColor(order.status)" size="small" variant="tonal">
                    {{ order.status }}
                  </v-chip>
                  <span class="detail-alert-time">{{ order.dispatchedRelative }}</span>
                </div>
                <h3>{{ order.title }}</h3>
                <p>{{ order.note }}</p>
                <div class="detail-order-meta">
                  <div><strong>İletişim:</strong> {{ order.channel }}</div>
                  <div><strong>Payload:</strong> {{ order.payload }}</div>
                  <div><strong>Yanıt:</strong> {{ order.response }}</div>
                </div>
                <small>{{ order.statusDetail }}</small>
              </div>
            </div>
            <div v-else class="no-data">Bu sayaca ait planlı iş emri yok.</div>
          </v-window-item>
          <v-window-item value="location">
            <div class="detail-map">
              <v-icon icon="place" size="20" />
              <div>
                <strong>{{ detailSensor.location }}</strong>
                <div class="detail-coords">{{ detailSensor.lat.toFixed(4) }}, {{ detailSensor.lng.toFixed(4) }}</div>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import DataFreshnessIndicator from '@/components/common/DataFreshnessIndicator.vue'
import { meterSnapshots, organizationProfile, referenceNow } from '@/data/mockMeters'
import { formatAbsolute, formatClock, formatRelativeAgo, hoursBetween, toDate } from '@/utils/time'

const organization = organizationProfile
const now = ref(new Date(referenceNow))
const route = useRoute()

const activeMainTab = ref('meters')
const detailPanel = ref(false)
const detailSensor = ref(null)
const detailTab = ref('overview')

const statusOptions = ['Aktif', 'Beklemede', 'Pasif']
const freshnessOptions = ['< 24 saat', '24-48 saat', '48+ saat']
const communicationOptions = ['LoRa', 'GPRS']
const typeOptions = ['Su', 'Elektrik']

const selectedStatuses = ref([])
const selectedFreshness = ref([])
const selectedComm = ref([])
const selectedTypes = ref([])
const selectedZones = ref([])
const selectedGroupBy = ref([])
const searchTerm = ref('')
const selectedRows = ref([])
const viewMode = ref('table')

const workOrderPanel = ref(false)
const workOrderTypes = ['Tüketim geçmişi getir', 'Vana komutu gönder', 'Enerji kes']
const workOrderChannels = ['LoRa', 'GPRS']
const selectedWorkOrderType = ref(workOrderTypes[0])
const selectedWorkOrderChannel = ref(workOrderChannels[0])
const workOrderPayload = ref({ payload: '00AA11BB', description: '' })

const rawSensors = ref(meterSnapshots)

const groupByOptions = [
  { title: 'Bölgeler', value: 'zone' },
  { title: 'Durum', value: 'status' },
  { title: 'İletişim', value: 'commMethod' },
  { title: 'Sayaç tipi', value: 'typeLabel' },
]

const zoneOptions = computed(() =>
  Array.from(new Set(rawSensors.value.map((meter) => meter.zone))).sort(),
)

const tableHeaders = [
  { title: 'Sayaç', key: 'sensorId', sortable: true },
  { title: 'Tip', key: 'typeLabel', sortable: true },
  { title: 'İletişim', key: 'commMethod', sortable: true },
  { title: 'Durum', key: 'status', sortable: true },
  { title: 'Veri tazeliği', key: 'freshnessBucket', sortable: true },
  { title: 'Son veri', key: 'lastPacketDisplay', sortable: false },
  { title: 'Okuma', key: 'lastReading', sortable: true },
  { title: 'Batarya', key: 'battery', sortable: true },
  { title: 'Sinyal', key: 'signal', sortable: true },
]

const alertHeaders = [
  { title: 'Sayaç', key: 'sensorId', sortable: true },
  { title: 'Tip', key: 'typeLabel', sortable: true },
  { title: 'Başlık', key: 'title', sortable: false },
  { title: 'Özet', key: 'message', sortable: false },
  { title: 'Öncelik', key: 'severity', sortable: true },
  { title: 'Zaman', key: 'timestamp', sortable: true },
  { title: '', key: 'actions', sortable: false, width: 80 },
]

const workOrderHeaders = [
  { title: 'Sayaç', key: 'sensorId', sortable: true },
  { title: 'Tip', key: 'typeLabel', sortable: true },
  { title: 'İletişim', key: 'channel', sortable: true },
  { title: 'Komut', key: 'title', sortable: false },
  { title: 'Payload', key: 'payload', sortable: false },
  { title: 'Durum', key: 'status', sortable: true },
  { title: 'Yanıt', key: 'response', sortable: false },
  { title: 'Gönderim', key: 'dispatchedAt', sortable: true },
  { title: '', key: 'actions', sortable: false, width: 80 },
]

const tableSortBy = ref([{ key: 'sensorId', order: 'asc' }])

const tableGroupBy = computed(() => selectedGroupBy.value.map((value) => ({ key: value })))

const statusChipColor = (status) => {
  if (status === 'Aktif') return 'success'
  if (status === 'Beklemede') return 'amber-darken-2'
  return 'red-darken-2'
}

const severityColor = (severity) => {
  if (severity === 'Kritik') return 'red-darken-2'
  if (severity === 'Yüksek') return 'amber-darken-2'
  if (severity === 'Orta') return 'primary'
  return 'blue-darken-2'
}

const workOrderStatusColor = (status) => {
  if (status === 'Tamamlandı') return 'success'
  if (status === 'Gönderildi') return 'primary'
  if (status === 'Bekliyor') return 'amber-darken-2'
  return 'grey-darken-1'
}

const statusRank = { Bekliyor: 0, Gönderildi: 1, Tamamlandı: 2 }

const minutesAgo = (minutes) => new Date(now.value.getTime() - minutes * 60 * 1000)

const formatDispatchLabel = (date) => `${formatClock(date)} • ${formatRelativeAgo(date, now.value)}`

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

const parsePercent = (value) => {
  if (!value || value === '—') return null
  const match = /(-?\d+(?:[.,]\d+)?)/.exec(value)
  return match ? Number(match[1].replace(',', '.')) : null
}

const freshnessMap = {
  '< 24 saat': { badge: 'Takvimde', chip: 'success', level: 'on-time' },
  '24-48 saat': { badge: 'Beklemede', chip: 'amber-darken-2', level: 'delayed' },
  '48+ saat': { badge: 'Pasif', chip: 'red-darken-2', level: 'missed' },
}

const buildAlertsForSensor = (sensor) => {
  const alerts = []
  if (sensor.status !== 'Aktif') {
    alerts.push({
      id: `${sensor.sensorId}-delay`,
      title: 'Veri gecikmesi',
      severity: sensor.status === 'Pasif' ? 'Kritik' : 'Yüksek',
      message: `${sensor.lastPacketAgo} süredir paket alınmadı`,
      timestamp: sensor.lastPacketLabel,
      relative: sensor.lastPacketAgo,
    })
  }
  const battery = parsePercent(sensor.battery)
  if (battery != null && battery < 55) {
    alerts.push({
      id: `${sensor.sensorId}-battery`,
      title: 'Düşük batarya',
      severity: battery < 30 ? 'Kritik' : 'Orta',
      message: `${sensor.sensorId} bataryası ${sensor.battery}`,
      timestamp: sensor.lastPacketLabel,
      relative: 'Bakım planı önerildi',
    })
  }
  return alerts
}

const buildWorkOrdersForSensor = (sensor) => {
  const buildOrder = (suffix, config) => {
    const dispatchedAt = minutesAgo(config.minutesAgo)
    return {
      id: `${sensor.sensorId}-${suffix}`,
      title: config.title,
      typeLabel: sensor.typeLabel,
      channel: config.channel ?? sensor.commMethod,
      status: config.status,
      payload: config.payload,
      response: config.response ?? (config.status === 'Tamamlandı' ? 'FF99EE88' : 'Yanıt bekleniyor'),
      note: config.note,
      statusDetail: config.statusDetail,
      dispatchedAt,
      dispatchedLabel: formatDispatchLabel(dispatchedAt),
      dispatchedRelative: formatRelativeAgo(dispatchedAt, now.value),
    }
  }

  const workOrders = []

  workOrders.push(
    buildOrder('history', {
      title: 'Tüketim geçmişi getir',
      status: 'Tamamlandı',
      payload: '00AA11BB',
      response: 'FF99EE88',
      minutesAgo: 75,
      note:
        sensor.typeLabel === 'Su'
          ? 'Son 7 günlük debi raporu indirildi.'
          : 'Son 7 günlük enerji raporu paylaşıldı.',
      statusDetail: 'FF99EE88 yanıtı ile komut tamamlandı.',
    }),
  )

  if (sensor.typeLabel === 'Su') {
    if (sensor.status !== 'Aktif') {
      workOrders.push(
        buildOrder('valve-close', {
          title: 'Vana kapat',
          status: 'Gönderildi',
          payload: '11CC22DD',
          response: 'Yanıt bekleniyor',
          minutesAgo: 20,
          note: 'Kaçak şüphesi nedeniyle vana kapatma komutu iletildi.',
          statusDetail: `${sensor.commMethod} kuyruğunda teyit bekleniyor.`,
        }),
      )
    } else {
      workOrders.push(
        buildOrder('valve-open', {
          title: 'Vana aç',
          status: 'Bekliyor',
          payload: '22DD33EE',
          response: '—',
          minutesAgo: 6,
          note: 'Gece basınç testi için vana açma programlandı.',
          statusDetail: 'Planlanan saatte otomatik tetiklenecek.',
        }),
      )
    }
  } else {
    if (sensor.status !== 'Aktif') {
      workOrders.push(
        buildOrder('disconnect', {
          title: 'Enerji kes',
          status: 'Gönderildi',
          payload: '33EE44FF',
          response: 'Yanıt bekleniyor',
          minutesAgo: 28,
          note: 'Kaçak kullanım şüphesi nedeniyle enerji kesme komutu gönderildi.',
          statusDetail: `${sensor.commMethod} üzerinden iletim teyidi bekleniyor.`,
        }),
      )
    } else {
      workOrders.push(
        buildOrder('power-factor', {
          title: 'Reaktif dengeleme',
          status: 'Bekliyor',
          payload: '44FF55GG',
          response: '—',
          minutesAgo: 10,
          note: 'Reaktif güç optimizasyonu için uzaktan komut sırada.',
          statusDetail: 'Saat başında otomatik uygulanacak.',
        }),
      )
    }
  }

  return workOrders
}

const sensorRecords = computed(() =>
  rawSensors.value.map((meter) => {
    const lastPacket = toDate(meter.lastCommunication)
    const status = classifyStatus(lastPacket)
    const freshness = classifyFreshness(lastPacket)
    const mapping = freshnessMap[freshness]
    const typeLabel = meter.type === 'water' ? 'Su' : 'Elektrik'

    const record = {
      sensorId: meter.id,
      zone: meter.zone,
      location: meter.location,
      commMethod: meter.communication,
      type: meter.type,
      typeLabel,
      lastReading: meter.lastReading ?? '-',
      battery: meter.battery ?? '—',
      signal: meter.signal ?? '—',
      window: meter.window ?? 'Dinamik 24s',
      status,
      freshnessBucket: freshness,
      freshnessBadge: mapping.badge,
      freshnessChip: mapping.chip,
      freshnessLevel: mapping.level,
      lastPacketAt: lastPacket,
      lastPacketLabel: formatAbsolute(lastPacket),
      lastPacketAgo: formatRelativeAgo(lastPacket, now.value),
      lastPacketDisplay: `${formatClock(lastPacket)} • ${formatRelativeAgo(lastPacket, now.value)}`,
      sparkline: meter.consumption?.history ?? [],
      lat: meter.lat,
      lng: meter.lng,
    }

    record.alerts = buildAlertsForSensor(record)
    record.workOrders = buildWorkOrdersForSensor(record)

    return record
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
  const total = totalSensors.value || 1
  const active = sensorRecords.value.filter((sensor) => sensor.status === 'Aktif').length
  const pending = sensorRecords.value.filter((sensor) => sensor.status === 'Beklemede').length
  const inactive = sensorRecords.value.filter((sensor) => sensor.status === 'Pasif').length
  const lowBattery = sensorRecords.value.filter((sensor) => {
    const value = parsePercent(sensor.battery)
    return value != null && value < 55
  }).length

  return [
    {
      label: 'Aktif sayaç',
      value: active.toLocaleString('tr-TR'),
      hint: `${Math.round((active / total) * 100)}% çevrimiçi`,
    },
    {
      label: 'Beklemede',
      value: pending.toLocaleString('tr-TR'),
      hint: '24-48 saat arası gecikme',
    },
    {
      label: 'Pasif sayaç',
      value: inactive.toLocaleString('tr-TR'),
      hint: '48+ saat veri yok',
    },
    {
      label: 'Düşük batarya',
      value: lowBattery.toLocaleString('tr-TR'),
      hint: 'Bakım planlaması önerilir',
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

const filteredSensors = computed(() => {
  const search = searchTerm.value.trim().toLowerCase()
  return sensorRecords.value.filter((sensor) => {
    const matchesStatus =
      !selectedStatuses.value.length || selectedStatuses.value.includes(sensor.status)
    const matchesFreshness =
      !selectedFreshness.value.length || selectedFreshness.value.includes(sensor.freshnessBucket)
    const matchesComm =
      !selectedComm.value.length || selectedComm.value.includes(sensor.commMethod)
    const matchesType =
      !selectedTypes.value.length || selectedTypes.value.includes(sensor.typeLabel)
    const matchesZone =
      !selectedZones.value.length || selectedZones.value.includes(sensor.zone)
    const matchesSearch =
      !search ||
      [sensor.sensorId, sensor.zone, sensor.location, sensor.commMethod, sensor.status]
        .join(' ')
        .toLowerCase()
        .includes(search)

    return (
      matchesStatus && matchesFreshness && matchesComm && matchesType && matchesZone && matchesSearch
    )
  })
})

const filteredStats = computed(() => ({
  total: filteredSensors.value.length,
  active: filteredSensors.value.filter((sensor) => sensor.status === 'Aktif').length,
  pending: filteredSensors.value.filter((sensor) => sensor.status === 'Beklemede').length,
  inactive: filteredSensors.value.filter((sensor) => sensor.status === 'Pasif').length,
}))

const severityRank = { Kritik: 0, Yüksek: 1, Orta: 2, Bilgi: 3 }

const globalAlerts = computed(() =>
  filteredSensors.value
    .flatMap((sensor) =>
      sensor.alerts.map((alert) => ({
        ...alert,
        sensorId: sensor.sensorId,
        typeLabel: sensor.typeLabel,
      })),
    )
    .sort((a, b) => {
      const rankDiff = (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9)
      if (rankDiff !== 0) return rankDiff
      return a.sensorId.localeCompare(b.sensorId)
    }),
)

const globalWorkOrders = computed(() =>
  filteredSensors.value
    .flatMap((sensor) =>
      sensor.workOrders.map((order) => ({
        ...order,
        sensorId: sensor.sensorId,
        typeLabel: sensor.typeLabel,
      })),
    )
    .sort((a, b) => {
      const statusDiff = (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9)
      if (statusDiff !== 0) return statusDiff
      return b.dispatchedAt.getTime() - a.dispatchedAt.getTime()
    }),
)

const resetFilters = () => {
  selectedStatuses.value = []
  selectedFreshness.value = []
  selectedComm.value = []
  selectedTypes.value = []
  selectedZones.value = []
  selectedGroupBy.value = []
}

const selectAllRows = () => {
  if (activeMainTab.value !== 'meters') return
  selectedRows.value = [...filteredSensors.value]
}

const openWorkOrder = () => {
  if (!selectedRows.value.length) return
  workOrderPanel.value = true
}

const confirmWorkOrder = () => {
  workOrderPanel.value = false
  selectedRows.value = []
  workOrderPayload.value = { payload: '00AA11BB', description: '' }
  selectedWorkOrderChannel.value = workOrderChannels[0]
  selectedWorkOrderType.value = workOrderTypes[0]
}

const handleRowClick = (_event, { item }) => {
  openSensorDetail(item)
}

const openSensorDetail = (sensor) => {
  detailSensor.value = sensor
  detailTab.value = 'overview'
  detailPanel.value = true
}

const focusSensor = (sensorId) => {
  const target = filteredSensors.value.find((sensor) => sensor.sensorId === sensorId)
  if (target) {
    openSensorDetail(target)
    activeMainTab.value = 'meters'
  }
}

const applyRoutePrefill = () => {
  const { status, communication, zone, type } = route.query
  if (status && statusOptions.includes(status)) selectedStatuses.value = [status]
  if (communication && communicationOptions.includes(communication)) selectedComm.value = [communication]
  if (zone) selectedZones.value = [zone]
  if (type && typeOptions.includes(type)) selectedTypes.value = [type]
}

const mapState = {
  instance: null,
  markers: [],
}

const ensureMap = async () => {
  await nextTick()
  const container = document.getElementById('sensor-map')
  if (!container) return

  if (!mapState.instance) {
    mapState.instance = L.map(container, {
      zoomControl: false,
      attributionControl: false,
    }).setView([39.9334, 32.8597], 10)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(mapState.instance)
  } else {
    mapState.instance.invalidateSize()
  }

  updateMarkers()
}

const updateMarkers = () => {
  if (!mapState.instance) return
  mapState.markers.forEach((marker) => marker.remove())
  mapState.markers = filteredSensors.value.map((sensor) => {
    const marker = L.circleMarker([sensor.lat, sensor.lng], {
      radius: 9,
      color: 'rgba(148,163,184,0.4)',
      weight: 1,
      fillColor:
        sensor.status === 'Aktif'
          ? 'rgba(34,197,94,0.65)'
          : sensor.status === 'Beklemede'
            ? 'rgba(251,191,36,0.7)'
            : 'rgba(248,113,113,0.75)',
      fillOpacity: 0.85,
    }).addTo(mapState.instance)
    marker.bindPopup(
      `<strong>${sensor.sensorId}</strong><br/>${sensor.location}<br/>${sensor.lastPacketDisplay}`,
    )
    return marker
  })
}

watch(filteredSensors, () => {
  if (activeMainTab.value === 'locations') {
    updateMarkers()
  }
  const availableIds = new Set(filteredSensors.value.map((sensor) => sensor.sensorId))
  selectedRows.value = selectedRows.value.filter((row) => availableIds.has(row.sensorId))
})

watch(activeMainTab, async (tab) => {
  if (tab === 'locations') {
    await ensureMap()
  }
})

onMounted(async () => {
  applyRoutePrefill()
  if (activeMainTab.value === 'locations') {
    await ensureMap()
  }
})

onBeforeUnmount(() => {
  if (mapState.instance) {
    mapState.instance.remove()
    mapState.instance = null
  }
})
</script>

<style scoped>
.sensor-dashboard {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  background: var(--content-background);
  transition: background var(--transition-speed) ease;
}

.sensor-header {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  padding: 28px 32px;
  border-radius: 26px;
  background: var(--surface-elevated);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

.sensor-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(56, 189, 248, 0.18), transparent 55%);
  pointer-events: none;
  z-index: 0;
}

.header-left {
  position: relative;
  z-index: 1;
  flex: 1 1 420px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.header-chip {
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--accent-surface);
  color: var(--accent-highlight);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.header-left h1 {
  margin: 0;
  font-size: clamp(26px, 4vw, 34px);
  color: var(--heading-color);
}

.header-left p {
  margin: 0;
  font-size: 15px;
  color: var(--muted-text);
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
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--muted-text);
}

.meta-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--heading-color);
}

.meta-hint {
  font-size: 13px;
  color: var(--muted-text);
}

.header-right {
  position: relative;
  z-index: 1;
  flex: 1 1 220px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  border-radius: 22px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
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
  color: var(--muted-text);
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--heading-color);
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
  color: var(--muted-text);
}

.sensor-content {
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
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
  transition:
    background var(--transition-speed) ease,
    border-color var(--transition-speed) ease;
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
  color: var(--heading-color);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-soft);
}

.filter-group:last-of-type {
  border-bottom: none;
}

.filter-title {
  font-size: 13px;
  text-transform: uppercase;
  color: var(--muted-text);
  letter-spacing: 0.3px;
}

.filter-chip {
  margin-bottom: 6px;
}

.plan-header span {
  font-size: 13px;
  color: var(--muted-text);
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

.list-card {
  padding: 24px;
  border-radius: 24px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition:
    background var(--transition-speed) ease,
    border-color var(--transition-speed) ease;
}

.list-toolbar {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.toolbar-search {
  flex: 1 1 260px;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.content-tabs {
  border-radius: 18px;
  background: var(--surface-subtle);
  border: 1px solid var(--border-soft);
}

.tab-content {
  border-radius: 20px;
  background: var(--surface-muted);
  border: 1px solid var(--border-soft);
  padding: 16px;
}

.list-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.meta-chip {
  font-weight: 600;
}

.sensor-data-table {
  border-radius: 18px;
  overflow: hidden;
}

.grid-wrapper {
  border-radius: 18px;
  overflow: hidden;
}

.card-grid {
  margin-top: 12px;
}

.sensor-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border-radius: 20px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color var(--transition-speed) ease;
}

.sensor-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-strong);
}

.sensor-card.on-time {
  border-color: rgba(34, 197, 94, 0.45);
}

.sensor-card.delayed {
  border-color: rgba(251, 191, 36, 0.45);
}

.sensor-card.missed {
  border-color: rgba(248, 113, 113, 0.45);
}

.sensor-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.sensor-id {
  display: block;
  font-weight: 700;
  font-size: 16px;
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
  gap: 8px;
}

.sensor-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.sensor-label {
  font-size: 13px;
  color: var(--muted-text);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.sensor-value {
  font-size: 14px;
  color: var(--heading-color);
  text-align: right;
}

.sensor-sparkline {
  height: 46px;
}

.alerts-table,
.workorder-table {
  border-radius: 18px;
  overflow: hidden;
}

.payload-chip {
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  background-color: rgba(59, 130, 246, 0.14);
  color: var(--heading-color);
  padding: 2px 8px;
  border-radius: 8px;
  display: inline-block;
}

.response-text {
  font-size: 13px;
  color: var(--heading-color);
}

.detail-order-meta {
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: var(--muted-text);
}

.detail-order-meta strong {
  color: var(--heading-color);
  margin-right: 4px;
}

.map-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.map-header h2 {
  margin: 0;
  font-size: 18px;
  color: var(--heading-color);
}

.map-subtitle {
  display: block;
  font-size: 13px;
  color: var(--muted-text);
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
  display: inline-block;
}

.legend-dot.active {
  background: rgba(34, 197, 94, 0.75);
}

.legend-dot.pending {
  background: rgba(251, 191, 36, 0.75);
}

.legend-dot.inactive {
  background: rgba(248, 113, 113, 0.75);
}

.drawer-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-summary {
  font-size: 14px;
  color: var(--muted-text);
  margin-bottom: 16px;
}

.detail-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-heading {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-id {
  font-size: 18px;
  font-weight: 700;
  color: var(--heading-color);
}

.detail-zone {
  font-size: 13px;
  color: var(--muted-text);
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-chip-row {
  display: flex;
  gap: 8px;
}

.detail-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-meta-item {
  padding: 12px;
  border-radius: 16px;
  background: var(--surface-muted);
  border: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-tabs {
  border-radius: 14px;
  background: var(--surface-subtle);
  border: 1px solid var(--border-soft);
}

.detail-window {
  background: var(--surface-muted);
  border: 1px solid var(--border-soft);
  border-radius: 16px;
  padding: 12px;
}

.detail-list {
  padding: 0;
}

.detail-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-alert {
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-alert h3 {
  margin: 0;
  font-size: 15px;
  color: var(--heading-color);
}

.detail-alert p {
  margin: 0;
  font-size: 13px;
  color: var(--muted-text);
}

.detail-alert-time {
  font-size: 12px;
  color: var(--muted-text);
}

.detail-map {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 14px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
}

.detail-coords {
  font-size: 12px;
  color: var(--muted-text);
}

.chip-inline {
  display: flex;
  justify-content: flex-start;
}

.cell-primary {
  display: flex;
  flex-direction: column;
}

.cell-id {
  font-weight: 600;
  color: var(--heading-color);
}

.cell-zone {
  font-size: 13px;
  color: var(--muted-text);
}

.cell-secondary {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cell-secondary span {
  font-weight: 500;
  color: var(--heading-color);
}

.cell-secondary small {
  font-size: 12px;
  color: var(--muted-text);
}

@media (max-width: 1280px) {
  .sensor-dashboard {
    padding: 20px;
  }

  .list-card {
    padding: 18px;
  }

  .tab-content {
    padding: 12px;
  }
}
</style>
