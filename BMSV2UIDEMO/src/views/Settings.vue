<template>
  <section class="settings-view">
    <div class="settings-header">
      <div>
        <h1>Organizasyon Ayarları</h1>
        <p class="lead">
          Farklı organizasyonlar için haberleşme katmanlarını, ChirpStack entegrasyonunu ve saha operasyon
          parametrelerini yönetin.
        </p>
      </div>
      <v-btn class="save-btn" color="primary" prepend-icon="save" size="large" variant="flat">
        Değişiklikleri Kaydet
      </v-btn>
    </div>

    <v-row class="settings-body" align="stretch" no-gutters>
      <v-col cols="12" md="3" class="pe-md-4">
        <v-card class="panel-card">
          <v-card-title class="card-title">Organizasyonlar</v-card-title>
          <v-divider class="mb-2" />
          <v-list class="org-list" density="compact">
            <v-list-item
              v-for="org in organizations"
              :key="org.code"
              :active="currentOrg && currentOrg.code === org.code"
              :value="org.code"
              class="org-item"
              color="primary"
              @click="selectedOrgCode = org.code"
            >
              <template #prepend>
                <v-avatar size="40" class="org-avatar" :color="org.avatarColor">
                  <span>{{ org.code }}</span>
                </v-avatar>
              </template>

              <v-list-item-title>{{ org.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ org.description }}</v-list-item-subtitle>

              <template #append>
                <v-progress-circular
                  :model-value="org.health.score"
                  color="primary"
                  size="34"
                  width="4"
                  class="org-health"
                >
                  <small>{{ org.health.score }}%</small>
                </v-progress-circular>
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card v-if="currentOrg" class="panel-card mt-4">
          <v-card-title class="card-title">İletişim Notları</v-card-title>
          <v-divider class="mb-2" />
          <div class="contact-block">
            <div class="contact-row">
              <v-icon icon="business_center" size="18" />
              <div>
                <span class="label">Saha Yöneticisi</span>
                <p>{{ currentOrg.contact.manager }}</p>
              </div>
            </div>
            <div class="contact-row">
              <v-icon icon="mail" size="18" />
              <div>
                <span class="label">E-posta</span>
                <p>{{ currentOrg.contact.email }}</p>
              </div>
            </div>
            <div class="contact-row">
              <v-icon icon="phone_callback" size="18" />
              <div>
                <span class="label">Telefon</span>
                <p>{{ currentOrg.contact.phone }}</p>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-card v-if="currentOrg" class="panel-card">
          <v-card-title class="card-title">
            {{ currentOrg.name }}
            <v-chip class="ms-3" color="primary" size="small" variant="flat">{{ currentOrg.region }}</v-chip>
            <v-chip
              v-for="tag in currentOrg.tags"
              :key="tag"
              class="ms-2"
              color="secondary"
              size="small"
              variant="tonal"
            >
              {{ tag }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <div class="org-summary">
              <div class="summary-stat">
                <span class="muted">Son güncelleme</span>
                <p>{{ currentOrg.health.lastUpdate }}</p>
              </div>
              <div class="summary-stat">
                <span class="muted">Aktif saha ekibi</span>
                <p>{{ currentOrg.dashboards.fieldTeams }}</p>
              </div>
              <div class="summary-stat">
                <span class="muted">Aktif alarm</span>
                <p>{{ currentOrg.dashboards.activeAlerts }}</p>
              </div>
              <div class="summary-stat">
                <span class="muted">Harita katmanı</span>
                <p>{{ currentOrg.dashboards.mapLayers }}</p>
              </div>
            </div>

            <v-alert
              v-if="currentOrg.health.summary"
              class="mt-4"
              :color="currentOrg.health.statusColor"
              density="comfortable"
              icon="monitor_heart"
              variant="tonal"
            >
              {{ currentOrg.health.summary }}
            </v-alert>
          </v-card-text>
        </v-card>

        <v-card v-if="currentOrg" class="panel-card mt-4">
          <v-card-title class="card-title">Haberleşme Katmanları</v-card-title>
          <v-divider />
          <v-table class="comm-table" density="comfortable">
            <thead>
              <tr>
                <th>Teknoloji</th>
                <th>Katman</th>
                <th>Durum</th>
                <th>Uç Nokta</th>
                <th>Son Senkron</th>
                <th>Gecikme</th>
                <th>Not</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="comm in currentOrg.communications" :key="comm.id">
                <td>
                  <div class="comm-tech">
                    <v-icon :icon="comm.icon" size="20" class="me-2" />
                    <strong>{{ comm.tech }}</strong>
                  </div>
                </td>
                <td>{{ comm.layer }}</td>
                <td>
                  <v-chip :color="statusColor[comm.status]" size="small" variant="tonal">
                    {{ statusLabel[comm.status] }}
                  </v-chip>
                </td>
                <td class="endpoint">{{ comm.endpoint }}</td>
                <td>{{ comm.lastSync }}</td>
                <td>
                  <div class="latency">{{ comm.latency }} ms</div>
                  <v-progress-linear :model-value="comm.latencyScore" color="primary" height="5" rounded></v-progress-linear>
                </td>
                <td>{{ comm.notes }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <v-row v-if="currentOrg" class="mt-4" dense>
          <v-col cols="12" md="6">
            <v-card class="panel-card">
              <v-card-title class="card-title">ChirpStack Ayarları</v-card-title>
              <v-divider />
              <v-card-text>
                <v-text-field v-model="currentOrg.chirpstack.networkServer" label="Network Server" density="comfortable" />
                <v-text-field v-model="currentOrg.chirpstack.tenantId" label="Tenant ID" density="comfortable" />
                <v-text-field v-model="currentOrg.chirpstack.applicationId" label="Application ID" density="comfortable" />
                <v-select
                  v-model="currentOrg.chirpstack.integrations"
                  :items="integrationOptions"
                  chips
                  clearable
                  label="Aktif Entegrasyonlar"
                  multiple
                />
                <v-select v-model="currentOrg.chirpstack.qos" :items="qosOptions" label="MQTT QoS" density="comfortable" />
                <v-switch
                  v-model="currentOrg.chirpstack.geolocation"
                  color="primary"
                  inset
                  label="GNSS/LBS hibrit konumlandırmayı etkinleştir"
                />
                <v-textarea
                  v-model="currentOrg.chirpstack.downlink"
                  auto-grow
                  label="Downlink Politikası"
                  rows="2"
                />
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="panel-card">
              <v-card-title class="card-title">Operasyon Parametreleri</v-card-title>
              <v-divider />
              <v-card-text>
                <v-switch
                  v-model="currentOrg.operations.firmwareAutomation"
                  color="primary"
                  density="comfortable"
                  inset
                  label="Gece firmware dağıtımlarını otomatikleştir"
                />
                <v-switch
                  v-model="currentOrg.operations.anomalyDetection"
                  color="primary"
                  density="comfortable"
                  inset
                  label="Telsiz spektrum anomalilerini izle"
                />
                <v-select
                  v-model="currentOrg.operations.fallbackChannel"
                  :items="fallbackChannels"
                  label="Kesinti durumunda yedek kanal"
                  density="comfortable"
                />
                <v-select
                  v-model="currentOrg.operations.syncInterval"
                  :items="syncIntervals"
                  label="Cihaz senkronizasyon aralığı"
                  density="comfortable"
                />
                <div class="maintenance-grid">
                  <v-select
                    v-model="currentOrg.operations.maintenanceWindow.day"
                    :items="maintenanceDays"
                    class="w-50"
                    density="comfortable"
                    label="Bakım günü"
                  />
                  <v-text-field
                    v-model="currentOrg.operations.maintenanceWindow.start"
                    density="comfortable"
                    label="Başlangıç"
                  />
                  <v-text-field
                    v-model="currentOrg.operations.maintenanceWindow.end"
                    density="comfortable"
                    label="Bitiş"
                  />
                </div>

                <div class="notification-grid">
                  <span class="muted">Bildirim kanalları</span>
                  <v-checkbox
                    v-model="currentOrg.operations.notifications.email"
                    color="primary"
                    density="compact"
                    hide-details
                    label="E-posta"
                  />
                  <v-checkbox
                    v-model="currentOrg.operations.notifications.sms"
                    color="primary"
                    density="compact"
                    hide-details
                    label="SMS"
                  />
                  <v-checkbox
                    v-model="currentOrg.operations.notifications.webhook"
                    color="primary"
                    density="compact"
                    hide-details
                    label="Webhook"
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-if="currentOrg" class="mt-4" dense>
          <v-col cols="12" md="6">
            <v-card class="panel-card">
              <v-card-title class="card-title">Alarm Eşikleri</v-card-title>
              <v-divider />
              <v-card-text class="thresholds">
                <div class="threshold-item">
                  <span class="label">Batarya kritik sınırı</span>
                  <strong>%{{ currentOrg.thresholds.battery }}</strong>
                </div>
                <v-slider
                  v-model="currentOrg.thresholds.battery"
                  :max="40"
                  :min="5"
                  :step="1"
                  color="primary"
                  thumb-label
                />
                <div class="threshold-item">
                  <span class="label">RSSI alarm eşiği</span>
                  <strong>{{ currentOrg.thresholds.signal }} dBm</strong>
                </div>
                <v-slider
                  v-model="currentOrg.thresholds.signal"
                  :max="-80"
                  :min="-130"
                  :step="1"
                  color="primary"
                  thumb-label
                />
                <div class="threshold-item">
                  <span class="label">Offline alarmı (dk)</span>
                  <strong>{{ currentOrg.thresholds.offline }}</strong>
                </div>
                <v-slider
                  v-model="currentOrg.thresholds.offline"
                  :max="60"
                  :min="5"
                  :step="5"
                  color="primary"
                  thumb-label
                />
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="panel-card">
              <v-card-title class="card-title">Saha Günlüğü</v-card-title>
              <v-divider />
              <v-card-text>
                <v-timeline density="compact" side="end">
                  <v-timeline-item
                    v-for="event in currentOrg.auditTrail"
                    :key="event.title + event.time"
                    :dot-color="timelineColor[event.type]"
                    size="small"
                  >
                    <div class="timeline-item">
                      <div class="timeline-header">
                        <strong>{{ event.title }}</strong>
                        <span class="muted">{{ event.time }}</span>
                      </div>
                      <p class="timeline-desc">{{ event.description }}</p>
                      <span class="timeline-user">{{ event.user }}</span>
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const organizations = ref([
  {
    code: 'A',
    name: 'Organizasyon A',
    description: 'İzmir bölgesi LoRaWAN sayaç ağı',
    avatarColor: 'primary',
    region: 'Ege Operasyon Merkezi',
    tags: ['LoRaWAN', 'NB-IoT Yedek'],
    health: {
      score: 94,
      summary: 'ChirpStack ile senkronizasyon sorunsuz, LoRa ağında 2 düşük sinyal tespit edildi.',
      lastUpdate: '12 dk önce',
      statusColor: 'success',
    },
    dashboards: {
      mapLayers: 6,
      activeAlerts: 2,
      fieldTeams: 3,
    },
    contact: {
      manager: 'Elif Korkmaz',
      email: 'elif.korkmaz@orga.example',
      phone: '+90 232 555 01 00',
    },
    communications: [
      {
        id: 'chirpstack',
        tech: 'ChirpStack',
        layer: 'Ağ Sunucusu',
        status: 'active',
        icon: 'router',
        endpoint: 'https://chirpstack-a.example/api',
        lastSync: '12 dk önce',
        latency: 112,
        latencyScore: 68,
        notes: 'Tenant: orga-tenant / ADR aktif',
      },
      {
        id: 'lora',
        tech: 'LoRa Gateway',
        layer: 'RF Backhaul',
        status: 'active',
        icon: 'wifi',
        endpoint: 'GW-BOR-12',
        lastSync: '3 dk önce',
        latency: 54,
        latencyScore: 82,
        notes: '8 saha gateway çevrimiçi',
      },
      {
        id: 'nbiot',
        tech: 'NB-IoT Core',
        layer: 'Operatör',
        status: 'maintenance',
        icon: 'nfc',
        endpoint: 'tr-nbiot-01',
        lastSync: '43 dk önce',
        latency: 220,
        latencyScore: 42,
        notes: 'APN: baylan.nbiot / degrade seviye',
      },
      {
        id: 'gprs',
        tech: 'GPRS APN',
        layer: 'Yedek Kanal',
        status: 'active',
        icon: 'signal_cellular_alt',
        endpoint: 'apn.baylan.com',
        lastSync: '26 dk önce',
        latency: 180,
        latencyScore: 50,
        notes: 'SIM havuzu: 120 / 12 uyarı',
      },
    ],
    chirpstack: {
      networkServer: 'https://chirpstack-a.example',
      tenantId: 'orga-tenant',
      applicationId: 'field-meters',
      integrations: ['MQTT', 'HTTP Callback'],
      qos: '2',
      geolocation: true,
      downlink: 'Gelişmiş ADR ile 15 dakikada bir durum paketi gönder.',
    },
    operations: {
      firmwareAutomation: true,
      anomalyDetection: true,
      fallbackChannel: 'GPRS',
      syncInterval: '15 dk',
      maintenanceWindow: {
        day: 'Cumartesi',
        start: '01:00',
        end: '04:00',
      },
      notifications: {
        email: true,
        sms: true,
        webhook: false,
      },
    },
    thresholds: {
      battery: 20,
      signal: -108,
      offline: 15,
    },
    auditTrail: [
      {
        title: 'Gateway firmware dağıtımı tamamlandı',
        time: '1 saat önce',
        user: 'Elif Korkmaz',
        description: 'Bornova sahasındaki 12 gateway firmware 3.4.1 sürümüne yükseltildi.',
        type: 'maintenance',
      },
      {
        title: 'NB-IoT core gecikmesi tespit edildi',
        time: '3 saat önce',
        user: 'NOC Botu',
        description: 'Operatör bağlantısında gecikme artışı. Yedek kanal hazır bekletiliyor.',
        type: 'alert',
      },
      {
        title: 'ChirpStack API anahtarı güncellendi',
        time: 'Dün',
        user: 'Sistem',
        description: 'Yeni API anahtarı dağıtıldı ve tüm servislerde yenilendi.',
        type: 'info',
      },
    ],
  },
  {
    code: 'B',
    name: 'Organizasyon B',
    description: 'Ankara akıllı sulama ağı',
    avatarColor: 'secondary',
    region: 'İç Anadolu',
    tags: ['GPRS', 'ChirpStack'],
    health: {
      score: 88,
      summary: 'GPRS yedek kanalı devrede, ChirpStack MQTT kuyruğu dengede.',
      lastUpdate: '25 dk önce',
      statusColor: 'warning',
    },
    dashboards: {
      mapLayers: 4,
      activeAlerts: 1,
      fieldTeams: 2,
    },
    contact: {
      manager: 'Orhan Yıldız',
      email: 'orhan.yildiz@orga.example',
      phone: '+90 312 444 03 45',
    },
    communications: [
      {
        id: 'chirpstack-b',
        tech: 'ChirpStack',
        layer: 'Ağ Sunucusu',
        status: 'active',
        icon: 'router',
        endpoint: 'https://chirpstack-b.example/api',
        lastSync: '25 dk önce',
        latency: 140,
        latencyScore: 58,
        notes: 'Kuyruk boyutu: 12 / QoS1',
      },
      {
        id: 'lora-b',
        tech: 'LoRa Gateway',
        layer: 'RF Backhaul',
        status: 'active',
        icon: 'wifi',
        endpoint: 'GW-KCS-04',
        lastSync: '11 dk önce',
        latency: 72,
        latencyScore: 74,
        notes: '4 bölge kapsama',
      },
      {
        id: 'nbiot-b',
        tech: 'NB-IoT Core',
        layer: 'Operatör',
        status: 'degraded',
        icon: 'nfc',
        endpoint: 'tr-nbiot-06',
        lastSync: '2 saat önce',
        latency: 320,
        latencyScore: 22,
        notes: 'Operatör kesintisi bildirildi',
      },
      {
        id: 'gprs-b',
        tech: 'GPRS APN',
        layer: 'Yedek Kanal',
        status: 'active',
        icon: 'signal_cellular_alt',
        endpoint: 'apn-irig.example',
        lastSync: '9 dk önce',
        latency: 190,
        latencyScore: 48,
        notes: 'APN fallback etkin',
      },
    ],
    chirpstack: {
      networkServer: 'https://chirpstack-b.example',
      tenantId: 'irrigation-hub',
      applicationId: 'valve-control',
      integrations: ['MQTT', 'InfluxDB'],
      qos: '1',
      geolocation: false,
      downlink: 'Sulama valflerine 30 dk’da bir durum komutu gönder.',
    },
    operations: {
      firmwareAutomation: false,
      anomalyDetection: true,
      fallbackChannel: 'GPRS',
      syncInterval: '30 dk',
      maintenanceWindow: {
        day: 'Çarşamba',
        start: '22:00',
        end: '23:30',
      },
      notifications: {
        email: true,
        sms: false,
        webhook: true,
      },
    },
    thresholds: {
      battery: 25,
      signal: -110,
      offline: 20,
    },
    auditTrail: [
      {
        title: 'Sulama profili güncellendi',
        time: '45 dk önce',
        user: 'Orhan Yıldız',
        description: 'Yeni sezon programı ChirpStack uygulamasına yüklendi.',
        type: 'info',
      },
      {
        title: 'NB-IoT core bağlantısı kesildi',
        time: '2 saat önce',
        user: 'Sistem',
        description: 'Operatör taraflı kesinti bildirimi alındı. Fallback devrede.',
        type: 'alert',
      },
    ],
  },
  {
    code: 'C',
    name: 'Organizasyon C',
    description: 'İstanbul akıllı aydınlatma',
    avatarColor: 'info',
    region: 'Marmara',
    tags: ['NB-IoT', 'LoRaWAN'],
    health: {
      score: 91,
      summary: 'Enerji tüketimi hedef içinde, ChirpStack veri yoğunluğu stabil.',
      lastUpdate: '5 dk önce',
      statusColor: 'success',
    },
    dashboards: {
      mapLayers: 8,
      activeAlerts: 3,
      fieldTeams: 5,
    },
    contact: {
      manager: 'Meral Şahin',
      email: 'meral.sahin@orga.example',
      phone: '+90 212 555 09 09',
    },
    communications: [
      {
        id: 'chirpstack-c',
        tech: 'ChirpStack',
        layer: 'Ağ Sunucusu',
        status: 'active',
        icon: 'router',
        endpoint: 'https://chirpstack-c.example/api',
        lastSync: '5 dk önce',
        latency: 96,
        latencyScore: 72,
        notes: 'Dashboard push servisi aktif',
      },
      {
        id: 'lora-c',
        tech: 'LoRa Gateway',
        layer: 'RF Backhaul',
        status: 'active',
        icon: 'wifi',
        endpoint: 'GW-BES-21',
        lastSync: '1 dk önce',
        latency: 40,
        latencyScore: 90,
        notes: '24/7 izleme',
      },
      {
        id: 'nbiot-c',
        tech: 'NB-IoT Core',
        layer: 'Operatör',
        status: 'active',
        icon: 'nfc',
        endpoint: 'tr-nbiot-11',
        lastSync: '8 dk önce',
        latency: 150,
        latencyScore: 56,
        notes: 'APN: city.light',
      },
      {
        id: 'gprs-c',
        tech: 'GPRS APN',
        layer: 'Yedek Kanal',
        status: 'maintenance',
        icon: 'signal_cellular_alt',
        endpoint: 'apn-light-backup',
        lastSync: '1 gün önce',
        latency: 260,
        latencyScore: 30,
        notes: 'SIM havuzu güncelleniyor',
      },
    ],
    chirpstack: {
      networkServer: 'https://chirpstack-c.example',
      tenantId: 'lighting-tenant',
      applicationId: 'luminaire-control',
      integrations: ['MQTT', 'Grafana', 'HTTP Callback'],
      qos: '2',
      geolocation: true,
      downlink: 'Dimming komutlarını cadde bazında 5 dakikada bir senkronla.',
    },
    operations: {
      firmwareAutomation: true,
      anomalyDetection: true,
      fallbackChannel: 'NB-IoT',
      syncInterval: '10 dk',
      maintenanceWindow: {
        day: 'Pazar',
        start: '02:30',
        end: '04:30',
      },
      notifications: {
        email: true,
        sms: true,
        webhook: true,
      },
    },
    thresholds: {
      battery: 18,
      signal: -105,
      offline: 10,
    },
    auditTrail: [
      {
        title: 'LoRa gateway ekibi sahaya çıktı',
        time: '30 dk önce',
        user: 'Meral Şahin',
        description: 'Beşiktaş hattında sinyal güçlendirmesi için bakım planlandı.',
        type: 'maintenance',
      },
      {
        title: 'ChirpStack QoS arttırıldı',
        time: 'Dün',
        user: 'Sistem',
        description: 'MQTT QoS seviyesi 1’den 2’ye yükseltildi.',
        type: 'info',
      },
    ],
  },
  {
    code: 'D',
    name: 'Organizasyon D',
    description: 'Adana tarımsal izleme',
    avatarColor: 'success',
    region: 'Akdeniz',
    tags: ['LoRa', 'GPRS'],
    health: {
      score: 79,
      summary: 'Saha gateway’lerinde paket kaybı var, NB-IoT yedeği devrede tutulmalı.',
      lastUpdate: '55 dk önce',
      statusColor: 'warning',
    },
    dashboards: {
      mapLayers: 3,
      activeAlerts: 4,
      fieldTeams: 1,
    },
    contact: {
      manager: 'Selim Çetin',
      email: 'selim.cetin@orga.example',
      phone: '+90 322 322 08 08',
    },
    communications: [
      {
        id: 'chirpstack-d',
        tech: 'ChirpStack',
        layer: 'Ağ Sunucusu',
        status: 'active',
        icon: 'router',
        endpoint: 'https://chirpstack-d.example/api',
        lastSync: '55 dk önce',
        latency: 160,
        latencyScore: 52,
        notes: 'Tenant: agriflow',
      },
      {
        id: 'lora-d',
        tech: 'LoRa Gateway',
        layer: 'RF Backhaul',
        status: 'degraded',
        icon: 'wifi',
        endpoint: 'GW-ADA-07',
        lastSync: '1 saat önce',
        latency: 280,
        latencyScore: 20,
        notes: 'Paket kaybı %12',
      },
      {
        id: 'nbiot-d',
        tech: 'NB-IoT Core',
        layer: 'Operatör',
        status: 'active',
        icon: 'nfc',
        endpoint: 'tr-nbiot-04',
        lastSync: '28 dk önce',
        latency: 210,
        latencyScore: 40,
        notes: 'Sezonluk hat yoğunluğu',
      },
      {
        id: 'gprs-d',
        tech: 'GPRS APN',
        layer: 'Yedek Kanal',
        status: 'active',
        icon: 'signal_cellular_alt',
        endpoint: 'apn-agri.example',
        lastSync: '31 dk önce',
        latency: 205,
        latencyScore: 38,
        notes: 'APN 2 saatlik denetimde',
      },
    ],
    chirpstack: {
      networkServer: 'https://chirpstack-d.example',
      tenantId: 'agri-monitor',
      applicationId: 'soil-moisture',
      integrations: ['MQTT'],
      qos: '0',
      geolocation: false,
      downlink: 'Toprak nem sensörlerine sadece kritik alarm durumunda komut gönder.',
    },
    operations: {
      firmwareAutomation: false,
      anomalyDetection: false,
      fallbackChannel: 'NB-IoT',
      syncInterval: '60 dk',
      maintenanceWindow: {
        day: 'Salı',
        start: '23:00',
        end: '01:00',
      },
      notifications: {
        email: true,
        sms: true,
        webhook: false,
      },
    },
    thresholds: {
      battery: 28,
      signal: -115,
      offline: 25,
    },
    auditTrail: [
      {
        title: 'LoRa gateway paket kaybı',
        time: '45 dk önce',
        user: 'Selim Çetin',
        description: 'Saha ekiplerine anten kontrolü için görev atandı.',
        type: 'alert',
      },
      {
        title: 'GPRS yedek test edildi',
        time: 'Dün',
        user: 'Sistem',
        description: 'Fallback kanalına test ping gönderildi, yanıt süresi 205ms.',
        type: 'info',
      },
    ],
  },
  {
    code: 'E',
    name: 'Organizasyon E',
    description: 'Trabzon su sayaç ağı',
    avatarColor: 'purple',
    region: 'Karadeniz',
    tags: ['NB-IoT', 'GPRS'],
    health: {
      score: 97,
      summary: 'Su sayaçları %99,2 çevrimiçi. ChirpStack HTTP callback sorunsuz.',
      lastUpdate: '3 dk önce',
      statusColor: 'success',
    },
    dashboards: {
      mapLayers: 5,
      activeAlerts: 0,
      fieldTeams: 2,
    },
    contact: {
      manager: 'Hakan Sezgin',
      email: 'hakan.sezgin@orga.example',
      phone: '+90 462 462 07 07',
    },
    communications: [
      {
        id: 'chirpstack-e',
        tech: 'ChirpStack',
        layer: 'Ağ Sunucusu',
        status: 'active',
        icon: 'router',
        endpoint: 'https://chirpstack-e.example/api',
        lastSync: '3 dk önce',
        latency: 88,
        latencyScore: 76,
        notes: 'QoS2 + HTTP callback',
      },
      {
        id: 'lora-e',
        tech: 'LoRa Gateway',
        layer: 'RF Backhaul',
        status: 'active',
        icon: 'wifi',
        endpoint: 'GW-TRB-02',
        lastSync: '7 dk önce',
        latency: 66,
        latencyScore: 80,
        notes: 'Kıyı hattı çift yönlü',
      },
      {
        id: 'nbiot-e',
        tech: 'NB-IoT Core',
        layer: 'Operatör',
        status: 'active',
        icon: 'nfc',
        endpoint: 'tr-nbiot-09',
        lastSync: '6 dk önce',
        latency: 134,
        latencyScore: 64,
        notes: 'APN: aqua.nb',
      },
      {
        id: 'gprs-e',
        tech: 'GPRS APN',
        layer: 'Yedek Kanal',
        status: 'active',
        icon: 'signal_cellular_alt',
        endpoint: 'apn-water-backup',
        lastSync: '14 dk önce',
        latency: 176,
        latencyScore: 52,
        notes: 'Yedek kanal ayda bir test ediliyor',
      },
    ],
    chirpstack: {
      networkServer: 'https://chirpstack-e.example',
      tenantId: 'aqua-tenant',
      applicationId: 'meter-collection',
      integrations: ['MQTT', 'HTTP Callback', 'Data Lake'],
      qos: '2',
      geolocation: false,
      downlink: 'Sayaç güncellemelerini günlük olarak planla, kritik alarmları anlık ilet.',
    },
    operations: {
      firmwareAutomation: true,
      anomalyDetection: true,
      fallbackChannel: 'NB-IoT',
      syncInterval: '20 dk',
      maintenanceWindow: {
        day: 'Perşembe',
        start: '00:30',
        end: '02:00',
      },
      notifications: {
        email: true,
        sms: false,
        webhook: true,
      },
    },
    thresholds: {
      battery: 17,
      signal: -103,
      offline: 12,
    },
    auditTrail: [
      {
        title: 'Veri gölü entegrasyonu devrede',
        time: 'Bugün 08:45',
        user: 'Hakan Sezgin',
        description: 'Yeni raporlama pipeline’ı test edildi ve aktif hale getirildi.',
        type: 'info',
      },
      {
        title: 'LoRa gateway konfigürasyonu yedeklendi',
        time: 'Dün',
        user: 'Sistem',
        description: 'Konfigürasyonlar git deposuna push edildi.',
        type: 'maintenance',
      },
    ],
  },
])

const selectedOrgCode = ref(organizations.value[0]?.code ?? null)

const statusColor = {
  active: 'success',
  maintenance: 'warning',
  degraded: 'error',
}

const statusLabel = {
  active: 'Aktif',
  maintenance: 'Bakımda',
  degraded: 'Riskli',
}

const timelineColor = {
  info: 'primary',
  alert: 'error',
  maintenance: 'warning',
}

const integrationOptions = ['MQTT', 'HTTP Callback', 'InfluxDB', 'Grafana', 'Data Lake']
const qosOptions = ['0', '1', '2']
const fallbackChannels = ['LoRa', 'NB-IoT', 'GPRS']
const syncIntervals = ['5 dk', '10 dk', '15 dk', '20 dk', '30 dk', '60 dk']
const maintenanceDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

const currentOrg = computed(() => organizations.value.find((org) => org.code === selectedOrgCode.value))
</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 12px 0 32px;
}

.settings-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 8px 0;
}

.lead {
  color: var(--muted-text);
  margin-top: 4px;
  max-width: 720px;
}

.save-btn {
  font-weight: 600;
  border-radius: 14px;
  box-shadow: var(--accent-shadow);
}

.settings-body {
  margin: 0;
}

.panel-card {
  border-radius: 18px !important;
  background: var(--surface-card);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-soft);
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--heading-color);
}

.org-list {
  max-height: 420px;
  overflow: auto;
}

.org-item {
  margin: 6px 8px;
  border-radius: 14px;
  transition: background 0.3s ease, transform 0.3s ease;
}

.org-item:hover {
  transform: translateY(-2px);
}

.org-avatar {
  color: white !important;
  font-weight: 700;
}

.org-health {
  font-size: 11px;
  font-weight: 600;
  background: transparent;
}

.org-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  padding: 8px 0;
}

.summary-stat p {
  margin: 6px 0 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--heading-color);
}

.muted {
  font-size: 13px;
  color: var(--muted-text);
}

.contact-block {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px 18px 18px;
}

.contact-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.contact-row .label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--muted-text);
}

.comm-table {
  border-radius: 18px;
}

.comm-table th {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted-text);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.comm-table td {
  vertical-align: middle;
  padding: 12px 16px !important;
}

.comm-tech {
  display: flex;
  align-items: center;
}

.endpoint {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
}

.latency {
  font-size: 13px;
  font-weight: 600;
}

.maintenance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.notification-grid {
  display: grid;
  gap: 6px;
  margin-top: 16px;
  align-items: center;
  grid-template-columns: repeat(auto-fit, minmax(120px, max-content));
}

.thresholds {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.threshold-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timeline-desc {
  margin: 0;
  color: var(--text-color);
  font-size: 14px;
}

.timeline-user {
  font-size: 12px;
  color: var(--muted-text);
}

@media (max-width: 960px) {
  .settings-header {
    align-items: flex-start;
  }

  .panel-card {
    margin-bottom: 16px;
  }
}
</style>
