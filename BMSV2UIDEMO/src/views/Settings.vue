<template>
  <section class="settings-view">
    <div class="settings-hero">
      <div class="hero-info">
        <h1>{{ mainServer.name }} Parametreleri</h1>
        <p>
          Ana sunucu üzerinden ASKİ, İSKİ ve TEDAŞ organizasyonlarının ChirpStack ve saha yönetim ayarlarını
          yapılandırın. Ortak altyapı tanımları ile kurum bazlı operasyon gereksinimlerini tek ekrandan
          kontrol edin.
        </p>

        <div class="hero-badges">
          <v-chip color="primary" prepend-icon="hub" variant="flat">{{ mainServer.location }}</v-chip>
          <v-chip color="secondary" prepend-icon="cloud_sync" variant="flat">Cluster: {{ mainServer.cluster }}</v-chip>
          <v-chip color="info" prepend-icon="alarm" variant="flat">Yedekleme: {{ mainServer.backupWindow }}</v-chip>
        </div>
      </div>

      <v-card class="hero-card" elevation="0" variant="tonal">
        <v-card-text class="hero-card-content">
          <div class="hero-metric">
            <span class="label">Uptime</span>
            <strong>{{ mainServer.uptime }}</strong>
          </div>
          <v-divider vertical class="mx-4" />
          <div class="hero-metric">
            <span class="label">Bağlı Organizasyon</span>
            <strong>{{ organizations.length }}</strong>
          </div>
          <v-divider vertical class="mx-4" />
          <div class="hero-metric load">
            <span class="label">Aktif Yük</span>
            <div class="load-stat">
              <v-progress-circular :model-value="mainServer.load" color="primary" size="58" width="6">
                <small>{{ mainServer.load }}%</small>
              </v-progress-circular>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-row class="settings-content" dense>
      <v-col cols="12" md="4">
        <v-card class="panel-card">
          <v-card-title class="card-title">
            Organizasyon Seçimi
            <v-chip class="ms-2" color="primary" size="small" variant="tonal">Merkezi ChirpStack</v-chip>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-text-field
              v-model="search"
              append-inner-icon="search"
              class="mb-4"
              density="compact"
              hide-details
              label="Organizasyon ara"
              variant="solo"
            />

            <v-list density="compact" nav>
              <v-list-item
                v-for="org in filteredOrganizations"
                :key="org.code"
                :active="currentOrg && currentOrg.code === org.code"
                :value="org.code"
                class="org-item"
                color="primary"
                rounded="lg"
                @click="selectedOrgCode = org.code"
              >
                <template #prepend>
                  <v-avatar :color="org.avatarColor" class="org-avatar" size="46">
                    <v-icon :icon="org.icon" size="24" />
                  </v-avatar>
                </template>

                <v-list-item-title>{{ org.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ org.description }}</v-list-item-subtitle>

                <template #append>
                  <v-chip :color="statusColor[org.status]" class="org-status" size="small" variant="tonal">
                    {{ statusLabel[org.status] }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <v-card v-if="currentOrg" class="panel-card mt-4" variant="outlined">
          <v-card-title class="card-title">İletişim ve Görev</v-card-title>
          <v-divider />
          <v-card-text class="contact-grid">
            <div>
              <span class="label">Saha Yöneticisi</span>
              <p>{{ currentOrg.contact.manager }}</p>
            </div>
            <div>
              <span class="label">E-posta</span>
              <p>{{ currentOrg.contact.email }}</p>
            </div>
            <div>
              <span class="label">Telefon</span>
              <p>{{ currentOrg.contact.phone }}</p>
            </div>
            <div>
              <span class="label">Nöbetçi Ekibi</span>
              <p>{{ currentOrg.operations.onCallTeam }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-alert
          v-if="currentOrg"
          :color="statusColor[currentOrg.status]"
          class="mb-4"
          density="comfortable"
          icon="insights"
          variant="tonal"
        >
          {{ currentOrg.summary }}
        </v-alert>

        <v-card v-if="currentOrg" class="panel-card">
          <v-card-title class="card-title">
            {{ currentOrg.name }}
            <v-chip class="ms-2" color="secondary" size="small" variant="flat">{{ currentOrg.region }}</v-chip>
            <v-chip
              v-for="tag in currentOrg.tags"
              :key="tag"
              class="ms-2"
              color="info"
              size="small"
              variant="tonal"
            >
              {{ tag }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <div class="org-metrics">
              <div class="org-metric">
                <span class="label">Aktif sayaç</span>
                <strong>{{ currentOrg.metrics.devices }}</strong>
              </div>
              <div class="org-metric">
                <span class="label">Saha gateway</span>
                <strong>{{ currentOrg.metrics.gateways }}</strong>
              </div>
              <div class="org-metric">
                <span class="label">Günlük downlink</span>
                <strong>{{ currentOrg.metrics.downlinkPerDay }}</strong>
              </div>
              <div class="org-metric">
                <span class="label">Hızlı müdahale SLA</span>
                <strong>{{ currentOrg.operations.responseSla }}</strong>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card v-if="currentOrg" class="panel-card mt-4">
          <v-card-title class="card-title">ChirpStack ve Ağ Tanımları</v-card-title>
          <v-divider />
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentOrg.chirpstack.networkServer"
                  label="Network Server URL"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentOrg.chirpstack.frequencyPlan"
                  :items="frequencyPlans"
                  density="comfortable"
                  label="Frekans Planı"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="currentOrg.chirpstack.tenantId" label="Tenant ID" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentOrg.chirpstack.applicationId"
                  label="Application ID"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentOrg.chirpstack.integrations"
                  :items="integrationOptions"
                  chips
                  clearable
                  density="comfortable"
                  hide-selected
                  label="Aktif Entegrasyonlar"
                  multiple
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentOrg.chirpstack.qos"
                  :items="qosOptions"
                  density="comfortable"
                  label="MQTT QoS"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="currentOrg.chirpstack.dutyCycleMonitor"
                  color="primary"
                  density="comfortable"
                  inset
                  label="Duty-cycle ihlali bildirimi gönder"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="currentOrg.chirpstack.geolocation"
                  color="primary"
                  density="comfortable"
                  inset
                  label="GNSS/LBS hibrit konumlandırma"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="currentOrg.chirpstack.downlinkPolicy"
                  auto-grow
                  label="Downlink Politikası"
                  rows="2"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card v-if="currentOrg" class="panel-card mt-4">
          <v-card-title class="card-title">Sensör ve Alarm Ayarları</v-card-title>
          <v-divider />
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentOrg.alerts.rainEmail"
                  label="Yağmur sensörü uyarı e-postası"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentOrg.alerts.rainEscalation"
                  :items="escalationLevels"
                  density="comfortable"
                  label="Yağmur alarm eskalasyonu"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentOrg.alerts.energyThreshold"
                  label="Enerji tüketim sınırı (kWh)"
                  density="comfortable"
                  type="number"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentOrg.alerts.pressureThreshold"
                  label="Basınç düşüş sınırı (bar)"
                  density="comfortable"
                  type="number"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentOrg.alerts.deliveryWindow"
                  :items="alertWindows"
                  density="comfortable"
                  label="Alarm gönderim aralığı"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="currentOrg.alerts.createTicket"
                  color="primary"
                  density="comfortable"
                  inset
                  label="Alarmda otomatik iş emri oluştur"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="currentOrg.alerts.notes"
                  auto-grow
                  label="Alarm notları"
                  rows="2"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card v-if="currentOrg" class="panel-card mt-4">
          <v-card-title class="card-title">Saha Operasyonları</v-card-title>
          <v-divider />
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentOrg.operations.syncInterval"
                  :items="syncIntervals"
                  density="comfortable"
                  label="Saha cihaz senkron aralığı"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentOrg.operations.fallbackChannel"
                  :items="fallbackChannels"
                  density="comfortable"
                  label="Kesinti yedek hattı"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentOrg.operations.timezone"
                  :items="timezones"
                  density="comfortable"
                  label="Zaman Dilimi"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentOrg.operations.shift"
                  :items="shiftOptions"
                  density="comfortable"
                  label="Aktif vardiya"
                />
              </v-col>
              <v-col cols="12">
                <div class="maintenance-grid">
                  <v-select
                    v-model="currentOrg.operations.maintenanceWindow.day"
                    :items="weekDays"
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
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="currentOrg.operations.autoFirmware"
                  color="primary"
                  density="comfortable"
                  inset
                  label="Gece firmware dağıtımı"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="currentOrg.operations.assetTracking"
                  color="primary"
                  density="comfortable"
                  inset
                  label="Saha ekipman GPS takibi"
                />
              </v-col>
              <v-col cols="12">
                <v-checkbox-group
                  v-model="currentOrg.operations.notificationChannels"
                  :multiple="true"
                  class="notification-group"
                  density="compact"
                  hide-details
                  inline
                  label="Bildirim kanalları"
                >
                  <v-checkbox
                    v-for="channel in notificationChannels"
                    :key="channel.value"
                    :label="channel.label"
                    :value="channel.value"
                    color="primary"
                    density="compact"
                    hide-details
                  />
                </v-checkbox-group>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <div class="actions">
          <v-btn color="secondary" prepend-icon="refresh" variant="text">Varsayılanları Yükle</v-btn>
          <v-btn color="primary" prepend-icon="save" size="large" variant="flat">Değişiklikleri Kaydet</v-btn>
        </div>
      </v-col>
    </v-row>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const mainServer = reactive({
  name: 'Merkezi BMS Sunucusu',
  location: 'Ankara Veri Merkezi',
  cluster: 'Core-Cluster 01',
  backupWindow: '02:00 - 03:00',
  uptime: '42 gün 18 saat',
  load: 62,
})

const organizations = ref([
  {
    code: 'ASKI',
    name: 'ASKİ Su İdaresi',
    description: 'Ankara şehir su sayaç ağı',
    avatarColor: 'primary',
    icon: 'water_drop',
    region: 'Ankara',
    tags: ['LoRaWAN', 'Enerji İzleme'],
    status: 'online',
    summary: 'Su kayıp-kaçak analitiği aktif, ChirpStack ile günlük eşleşme tamamlandı.',
    metrics: {
      devices: '18.420',
      gateways: '34',
      downlinkPerDay: '1.240',
    },
    contact: {
      manager: 'Selin Karaca',
      email: 'selin.karaca@aski.gov',
      phone: '+90 312 444 00 31',
    },
    chirpstack: {
      networkServer: 'https://chirpstack.core.local',
      frequencyPlan: 'EU868',
      tenantId: 'shared-water-energy',
      applicationId: 'aski-metering',
      integrations: ['MQTT', 'InfluxDB'],
      qos: '1',
      dutyCycleMonitor: true,
      geolocation: true,
      downlinkPolicy: 'Sayaç reset paketleri sadece gece 01:00-05:00 arası gönderilecek.',
    },
    alerts: {
      rainEmail: 'meteoroloji@aski.gov',
      rainEscalation: 'Operasyon Merkezi',
      energyThreshold: 1200,
      pressureThreshold: 1.5,
      deliveryWindow: '15 dakikada bir',
      createTicket: true,
      notes: 'Kritik pompaj istasyonları için SMS bildirimleri zorunludur.',
    },
    operations: {
      syncInterval: '30 dk',
      fallbackChannel: '4.5G LTE',
      timezone: 'Europe/Istanbul',
      shift: '06:00 - 14:00',
      maintenanceWindow: {
        day: 'Salı',
        start: '01:30',
        end: '03:00',
      },
      autoFirmware: true,
      assetTracking: true,
      notificationChannels: ['email', 'sms'],
      onCallTeam: 'ASKİ Teknik 1. Ekip',
      responseSla: '45 dk',
    },
  },
  {
    code: 'ISKI',
    name: 'İSKİ Akıllı Su Yönetimi',
    description: 'İstanbul su sayaç ve vana ağı',
    avatarColor: 'info',
    icon: 'waves',
    region: 'İstanbul',
    tags: ['NB-IoT', 'SCADA'],
    status: 'monitor',
    summary: 'Yağış sonrası vana basınçlarında dalgalanma gözlemleniyor, takip modu aktif.',
    metrics: {
      devices: '24.980',
      gateways: '28',
      downlinkPerDay: '860',
    },
    contact: {
      manager: 'Kerem Uğur',
      email: 'kerem.ugur@iski.gov',
      phone: '+90 212 588 00 44',
    },
    chirpstack: {
      networkServer: 'https://chirpstack.iski.local',
      frequencyPlan: 'EU868',
      tenantId: 'iski-otonom',
      applicationId: 'iski-vanas-01',
      integrations: ['HTTP', 'Kafka'],
      qos: '0',
      dutyCycleMonitor: false,
      geolocation: false,
      downlinkPolicy: 'Vana komutları gündüz 09:00-18:00 saatleri arasında gönderilir.',
    },
    alerts: {
      rainEmail: 'afet@iski.gov',
      rainEscalation: 'Afet Koordinasyon',
      energyThreshold: 980,
      pressureThreshold: 1.2,
      deliveryWindow: '30 dakikada bir',
      createTicket: false,
      notes: 'Vana pozisyon sensörleri için webhook bildirimi açık tutulmalı.',
    },
    operations: {
      syncInterval: '1 saat',
      fallbackChannel: 'Fiber SCADA',
      timezone: 'Europe/Istanbul',
      shift: '14:00 - 22:00',
      maintenanceWindow: {
        day: 'Perşembe',
        start: '23:00',
        end: '01:00',
      },
      autoFirmware: false,
      assetTracking: true,
      notificationChannels: ['email', 'webhook'],
      onCallTeam: 'İSKİ Atölye 2. Ekip',
      responseSla: '60 dk',
    },
  },
  {
    code: 'TEDAS',
    name: 'TEDAŞ Enerji Operasyonları',
    description: 'Ulusal elektrik sayaç yönetimi',
    avatarColor: 'secondary',
    icon: 'bolt',
    region: 'Türkiye Geneli',
    tags: ['AMI', 'Enerji İzleme'],
    status: 'online',
    summary: 'Elektrik kesinti analizleri tamamlandı, enerji kalitesi raporlanıyor.',
    metrics: {
      devices: '54.120',
      gateways: '62',
      downlinkPerDay: '3.420',
    },
    contact: {
      manager: 'Ebru Demir',
      email: 'ebru.demir@tedas.gov',
      phone: '+90 312 444 00 19',
    },
    chirpstack: {
      networkServer: 'https://chirpstack.core.local',
      frequencyPlan: '868-ISM',
      tenantId: 'shared-water-energy',
      applicationId: 'tedas-ami',
      integrations: ['MQTT', 'Grafana', 'InfluxDB'],
      qos: '2',
      dutyCycleMonitor: true,
      geolocation: true,
      downlinkPolicy: 'Kesinti sonrası sayaç uyanma paketleri 5 dakikada bir gönderilir.',
    },
    alerts: {
      rainEmail: 'meteoroloji@tedas.gov',
      rainEscalation: 'Ulusal Kontrol',
      energyThreshold: 2200,
      pressureThreshold: 0.8,
      deliveryWindow: 'Gerçek zamanlı',
      createTicket: true,
      notes: 'Enerji kalitesi olaylarında saha ekipleri otomatik atanacak.',
    },
    operations: {
      syncInterval: '15 dk',
      fallbackChannel: 'VSAT',
      timezone: 'Europe/Istanbul',
      shift: '00:00 - 08:00',
      maintenanceWindow: {
        day: 'Pazar',
        start: '02:00',
        end: '04:30',
      },
      autoFirmware: true,
      assetTracking: false,
      notificationChannels: ['email', 'sms', 'webhook'],
      onCallTeam: 'TEDAŞ Ulusal Kontrol',
      responseSla: '30 dk',
    },
  },
])

const frequencyPlans = ['EU863-870', 'EU868', '868-ISM', 'US902-928']
const integrationOptions = ['MQTT', 'HTTP', 'InfluxDB', 'Grafana', 'Kafka']
const qosOptions = ['0', '1', '2']
const syncIntervals = ['15 dk', '30 dk', '1 saat', '4 saat']
const fallbackChannels = ['4.5G LTE', 'Fiber SCADA', 'VSAT', 'GPRS']
const escalationLevels = ['Operasyon Merkezi', 'Afet Koordinasyon', 'Ulusal Kontrol', 'Yerel Şube']
const alertWindows = ['Gerçek zamanlı', '15 dakikada bir', '30 dakikada bir', 'Saatlik']
const timezones = ['Europe/Istanbul', 'Asia/Baghdad', 'UTC']
const shiftOptions = ['00:00 - 08:00', '06:00 - 14:00', '14:00 - 22:00', '22:00 - 06:00']
const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
const notificationChannels = [
  { label: 'E-posta', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Webhook', value: 'webhook' },
  { label: 'SCADA Alarm', value: 'scada' },
]

const statusLabel = {
  online: 'Aktif',
  monitor: 'İzleme',
  incident: 'Alarm',
}

const statusColor = {
  online: 'success',
  monitor: 'warning',
  incident: 'error',
}

const search = ref('')
const selectedOrgCode = ref(organizations.value[0]?.code ?? null)

const filteredOrganizations = computed(() => {
  if (!search.value) {
    return organizations.value
  }
  return organizations.value.filter((org) =>
    [org.name, org.code, org.description].some((field) =>
      field.toLowerCase().includes(search.value.toLowerCase()),
    ),
  )
})

const currentOrg = computed(() =>
  organizations.value.find((org) => org.code === selectedOrgCode.value) ?? null,
)
</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

.settings-hero {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: stretch;
}

.hero-info {
  flex: 1 1 320px;
}

.hero-info h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
}

.hero-info p {
  margin: 0 0 16px;
  color: rgba(var(--v-theme-on-surface), 0.72);
  line-height: 1.5;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-card {
  flex: 0 0 320px;
}

.hero-card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.hero-metric strong {
  font-size: 20px;
}

.hero-metric .label {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-metric.load {
  align-items: center;
}

.load-stat {
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-content {
  gap: 24px;
}

.panel-card {
  border-radius: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  gap: 8px;
}

.org-item {
  margin-bottom: 12px;
}

.org-avatar {
  color: rgba(var(--v-theme-on-primary), 1);
}

.org-status {
  font-weight: 600;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.contact-grid .label {
  font-size: 12px;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-transform: uppercase;
  display: block;
  margin-bottom: 6px;
}

.org-metrics {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.org-metric {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.org-metric strong {
  font-size: 18px;
}

.label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.maintenance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.notification-group {
  border-radius: 12px;
  padding: 12px 8px;
  background: rgba(var(--v-theme-primary), 0.04);
}

.actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 960px) {
  .hero-card-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .hero-card {
    width: 100%;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
