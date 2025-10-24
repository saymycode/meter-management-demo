<template>
  <v-container fluid class="home-dashboard" tag="section">
    <section class="dashboard-hero">
      <div class="hero-copy">
        <div class="hero-chip">{{ organization.scope }} • {{ organization.region }}</div>
        <h1>{{ organization.name }}</h1>
        <p>{{ organization.description }}</p>
        <div class="hero-metrics">
          <div v-for="metric in heroMetrics" :key="metric.label" class="hero-metric">
            <span class="metric-label">{{ metric.label }}</span>
            <span class="metric-value">{{ metric.value }}</span>
            <span class="metric-hint">{{ metric.hint }}</span>
          </div>
        </div>
      </div>
      <div class="hero-side">
        <DataFreshnessIndicator
          :last-update="lastPacket"
          :now="now"
          :pending-threshold-hours="24"
          :inactive-threshold-hours="48"
          window-hint="Sayaçlar gün içinde rastgele saatlerde paket gönderir; 24 saatlik pencere taranır."
        />
        <div class="hero-window">
          <div>
            <span class="window-label">Son alınan paket</span>
            <span class="window-value">{{ lastPacketLabel }}</span>
          </div>
          <div>
            <span class="window-label">Yaklaşan pencere</span>
            <span class="window-value">{{ nextWindowLabel }}</span>
            <span class="window-hint">{{ nextWindowHint }}</span>
          </div>
        </div>
      </div>
    </section>

    <v-row class="dashboard-grid" no-gutters>
      <v-col cols="12" lg="7">
        <v-card class="dashboard-card" elevation="0">
          <div class="card-header">
            <div>
              <h2>Metre durum dağılımı</h2>
              <span class="card-subtitle">24 saatlik pencere üzerinden hesaplanan aktiflik durumları</span>
            </div>
          </div>
          <div class="donut-group">
            <DonutSummary
              title="Durum dağılımı"
              subtitle="Aktif • Beklemede • Pasif"
              :labels="statusLabels"
              :values="statusValues"
              :colors="statusColors"
            />
            <DonutSummary
              title="İletişim türü"
              subtitle="LoRa ve GPRS paket oranı"
              :labels="communicationLabels"
              :values="communicationValues"
              :colors="communicationColors"
            />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card class="dashboard-card" elevation="0">
          <div class="card-header">
            <div>
              <h2>Tüketim özeti</h2>
              <span class="card-subtitle">Kurum kapsamındaki sayaçlardan toplanan son 24 saat</span>
            </div>
          </div>
          <div class="consumption-list">
            <div v-for="item in consumptionSummary" :key="item.type" class="consumption-item">
              <div class="consumption-icon" :style="{ background: item.accent }">
                <v-icon :icon="item.icon" />
              </div>
              <div class="consumption-body">
                <span class="consumption-label">{{ item.label }}</span>
                <span class="consumption-value">{{ item.value }}</span>
                <div class="consumption-trend" :class="item.positive ? 'positive' : 'negative'">
                  <v-icon :icon="item.positive ? 'mdi-arrow-trending-up' : 'mdi-arrow-trending-down'" size="16" />
                  <span>{{ item.change }}</span>
                  <span class="consumption-hint">{{ item.hint }}</span>
                </div>
              </div>
              <v-sparkline
                :model-value="item.sparkline"
                :smooth="8"
                :line-width="3"
                color="rgba(56,189,248,0.5)"
                gradient="rgba(56,189,248,0.15)"
                class="consumption-sparkline"
                auto-draw
              />
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="7">
        <v-card class="dashboard-card" elevation="0">
          <div class="card-header">
            <div>
              <h2>İletişim aktivitesi</h2>
              <span class="card-subtitle">Son 24 saat içerisinde saatlik alınan paket adedi</span>
            </div>
            <v-chip prepend-icon="mdi-clock-time-four-outline" size="small" variant="flat">
              Son paket: {{ lastPacketClock }}
            </v-chip>
          </div>
          <HourlyActivityChart
            title="Saatlik dağılım"
            subtitle="Her saat içinde gelen sayaç sayısı"
            :labels="activityLabels"
            :values="activityValues"
            color="rgba(56,189,248,0.65)"
          />
          <div class="chart-hint">
            <v-icon icon="mdi-information-outline" size="18" />
            <span>Grafik gerçek zamanlı değildir; rastgele paketler ilgili saate yazılır.</span>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card class="dashboard-card alerts" elevation="0">
          <div class="card-header">
            <div>
              <h2>Geciken sayaç uyarıları</h2>
              <span class="card-subtitle">48 saati aşan sayaçlar kırmızı ile vurgulanır</span>
            </div>
            <v-chip color="red-darken-2" prepend-icon="mdi-alert-decagram" size="small" variant="flat">
              {{ alerts.length }} kritik
            </v-chip>
          </div>
          <v-list class="alert-list" density="compact">
            <v-list-item v-for="alert in alerts" :key="alert.id" class="alert-item" @click="goToSensors(alert.filter)">
              <template #prepend>
                <v-avatar :color="alert.badgeColor" size="36" variant="tonal">
                  <v-icon :icon="alert.icon" />
                </v-avatar>
              </template>
              <v-list-item-title>{{ alert.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ alert.subtitle }}</v-list-item-subtitle>
              <template #append>
                <v-chip color="red-darken-2" size="small" variant="outlined">{{ alert.delay }}</v-chip>
              </template>
            </v-list-item>
            <v-list-item v-if="alerts.length === 0">
              <v-list-item-title>Tüm sayaçlar 48 saatlik pencere içinde.</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card class="dashboard-card" elevation="0">
          <div class="card-header">
            <div>
              <h2>Öne çıkan tüketimler</h2>
              <span class="card-subtitle">Son 24 saat içinde en yüksek tüketim yapan sayaçlar</span>
            </div>
          </div>
          <div class="consumer-list">
            <div v-for="meter in topConsumers" :key="meter.id" class="consumer-item">
              <div class="consumer-icon" :class="meter.type">
                <v-icon :icon="meter.icon" />
              </div>
              <div class="consumer-body">
                <span class="consumer-id">{{ meter.id }}</span>
                <span class="consumer-location">{{ meter.location }}</span>
              </div>
              <div class="consumer-value">
                <span>{{ meter.value }}</span>
                <span class="consumer-hint">{{ meter.hint }}</span>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card class="dashboard-card" elevation="0">
          <div class="card-header">
            <div>
              <h2>Organizasyon kapsamı</h2>
              <span class="card-subtitle">ASKİ hesabına bağlı tüm sayaçlar bu panelde gruplanır</span>
            </div>
          </div>
          <div class="scope-panel">
            <div class="scope-item">
              <span class="scope-label">Toplam sayaç</span>
              <span class="scope-value">{{ totalMeters.toLocaleString('tr-TR') }}</span>
            </div>
            <div class="scope-item">
              <span class="scope-label">LoRa</span>
              <span class="scope-value">{{ communicationCounts.LoRa.toLocaleString('tr-TR') }}</span>
            </div>
            <div class="scope-item">
              <span class="scope-label">GPRS</span>
              <span class="scope-value">{{ communicationCounts.GPRS.toLocaleString('tr-TR') }}</span>
            </div>
            <div class="scope-note">
              <v-icon icon="mdi-shield-lock-outline" size="18" />
              <span>Bu dashboard yalnızca {{ organization.scope }} organizasyonundan gelen veriyle çalışır.</span>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DataFreshnessIndicator from '@/components/common/DataFreshnessIndicator.vue'
import DonutSummary from '@/components/dashboard/DonutSummary.vue'
import HourlyActivityChart from '@/components/dashboard/HourlyActivityChart.vue'
import { hourlyActivity, meterSnapshots, organizationProfile, referenceNow } from '@/data/mockMeters'
import { formatAbsolute, formatClock, formatRelativeAgo, hoursBetween, toDate } from '@/utils/time'

const router = useRouter()

const now = ref(new Date(referenceNow))
const meters = ref(meterSnapshots)

const organization = organizationProfile

const classifyStatus = (meter) => {
  const diff = hoursBetween(meter.lastCommunication, now.value)
  if (diff <= 24) return 'active'
  if (diff <= 48) return 'pending'
  return 'inactive'
}

const meterWithStatus = computed(() =>
  meters.value.map((meter) => ({
    ...meter,
    status: classifyStatus(meter)
  }))
)

const statusOrder = ['active', 'pending', 'inactive']
const statusLabels = ['Aktif', 'Beklemede', 'Pasif']
const statusColors = ['rgba(34,197,94,0.75)', 'rgba(251,191,36,0.75)', 'rgba(248,113,113,0.75)']

const statusCounts = computed(() => {
  return meterWithStatus.value.reduce(
    (acc, meter) => {
      acc[meter.status] += 1
      return acc
    },
    { active: 0, pending: 0, inactive: 0 }
  )
})

const statusValues = computed(() => statusOrder.map((key) => statusCounts.value[key]))

const communicationCounts = computed(() => {
  return meterWithStatus.value.reduce(
    (acc, meter) => {
      acc[meter.communication] = (acc[meter.communication] ?? 0) + 1
      return acc
    },
    { LoRa: 0, GPRS: 0 }
  )
})

const communicationLabels = ['LoRa', 'GPRS']
const communicationColors = ['rgba(16, 185, 129, 0.75)', 'rgba(59, 130, 246, 0.75)']
const communicationValues = computed(() => communicationLabels.map((label) => communicationCounts.value[label] ?? 0))

const totalMeters = computed(() => meterWithStatus.value.length)

const heroMetrics = computed(() => [
  {
    label: 'Aktif sayaç',
    value: statusCounts.value.active.toLocaleString('tr-TR'),
    hint: `%${((statusCounts.value.active / totalMeters.value) * 100).toFixed(1)}`
  },
  {
    label: 'Beklemede',
    value: statusCounts.value.pending.toLocaleString('tr-TR'),
    hint: '%24-48 saat'
  },
  {
    label: '48+ saat',
    value: statusCounts.value.inactive.toLocaleString('tr-TR'),
    hint: 'Gecikmeli sayaç'
  }
])

const aggregateConsumption = (type, key) =>
  meterWithStatus.value
    .filter((meter) => meter.type === type)
    .reduce((acc, meter) => acc + (meter.consumption?.[key] ?? 0), 0)

const consumptionSummary = computed(() => {
  const waterTotal = aggregateConsumption('water', 'last24h')
  const waterPrev = aggregateConsumption('water', 'previous24h')
  const electricityTotal = aggregateConsumption('electric', 'last24h')
  const electricityPrev = aggregateConsumption('electric', 'previous24h')

  const formatChange = (current, previous) => {
    if (previous === 0) return { text: 'Yeni veri', positive: true }
    const change = ((current - previous) / previous) * 100
    return {
      text: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      positive: change >= 0
    }
  }

  const buildSparkline = (type) => {
    const samples = meterWithStatus.value
      .filter((meter) => meter.type === type)
      .flatMap((meter) => meter.consumption?.history ?? [])
    if (samples.length === 0) return []
    const chunkSize = Math.ceil(samples.length / 5)
    const buckets = []
    for (let i = 0; i < samples.length; i += chunkSize) {
      const slice = samples.slice(i, i + chunkSize)
      const avg = slice.reduce((acc, value) => acc + value, 0) / slice.length
      buckets.push(Number(avg.toFixed(1)))
    }
    return buckets
  }

  const waterChange = formatChange(waterTotal, waterPrev)
  const electricityChange = formatChange(electricityTotal, electricityPrev)

  return [
    {
      type: 'water',
      label: 'Su tüketimi (24s)',
      value: `${waterTotal.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} m³`,
      change: waterChange.text,
      positive: waterChange.positive,
      hint: 'Son 24 saat',
      icon: 'mdi-water',
      accent: 'linear-gradient(135deg, rgba(45,212,191,0.18), rgba(56,189,248,0.22))',
      sparkline: buildSparkline('water')
    },
    {
      type: 'electric',
      label: 'Elektrik tüketimi (24s)',
      value: `${electricityTotal.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} kWh`,
      change: electricityChange.text,
      positive: electricityChange.positive,
      hint: 'Son 24 saat',
      icon: 'mdi-flash-triangle-outline',
      accent: 'linear-gradient(135deg, rgba(129,140,248,0.22), rgba(96,165,250,0.25))',
      sparkline: buildSparkline('electric')
    }
  ]
})

const topConsumers = computed(() => {
  return [...meterWithStatus.value]
    .sort((a, b) => (b.consumption?.last24h ?? 0) - (a.consumption?.last24h ?? 0))
    .slice(0, 5)
    .map((meter) => ({
      id: meter.id,
      type: meter.type,
      icon: meter.type === 'water' ? 'mdi-water' : 'mdi-flash',
      location: meter.location,
      value: `${(meter.consumption?.last24h ?? 0).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} ${
        meter.type === 'water' ? 'm³' : 'kWh'
      }`,
      hint: `Son paket ${formatRelativeAgo(meter.lastCommunication, now.value)}`
    }))
})

const activityLabels = hourlyActivity.map((item) => `${item.hour}:00`)
const activityValues = hourlyActivity.map((item) => item.count)

const lastPacket = computed(() => {
  return meterWithStatus.value.reduce((latest, meter) => {
    const time = toDate(meter.lastCommunication)
    return time > latest ? time : latest
  }, new Date(0))
})

const lastPacketLabel = computed(() => formatAbsolute(lastPacket.value))
const lastPacketClock = computed(() => formatClock(lastPacket.value))

const nextWindowLabel = computed(() => {
  const hintDate = new Date(lastPacket.value)
  hintDate.setHours(hintDate.getHours() + 24)
  return formatAbsolute(hintDate)
})

const nextWindowHint = computed(() => {
  const diff = formatRelativeAgo(lastPacket.value, now.value).replace('önce', 'önce yakalandı')
  return `${diff}; yeni paket rastgele saatlerde bekleniyor.`
})

const alerts = computed(() =>
  meterWithStatus.value
    .filter((meter) => meter.status === 'inactive')
    .sort((a, b) => toDate(a.lastCommunication) - toDate(b.lastCommunication))
    .map((meter) => ({
      id: meter.id,
      title: `${meter.id} • ${meter.location}`,
      subtitle: `Son iletişim ${formatRelativeAgo(meter.lastCommunication, now.value)}`,
      delay: `${Math.floor(hoursBetween(meter.lastCommunication, now.value))} saat`,
      icon: meter.type === 'water' ? 'mdi-water-alert' : 'mdi-flash-alert',
      badgeColor: 'red-darken-4',
      filter: { status: 'Pasif', sensorId: meter.id }
    }))
)

const goToSensors = (filter) => {
  router.push({ name: 'sensor', query: filter })
}
</script>

<style scoped>
.home-dashboard {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.75) 100%);
}

.dashboard-hero {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  padding: 32px;
  border-radius: 28px;
  background: radial-gradient(circle at top right, rgba(56, 189, 248, 0.16), transparent 45%),
    rgba(13, 21, 38, 0.86);
  border: 1px solid rgba(45, 212, 191, 0.18);
  box-shadow: 0 28px 60px rgba(2, 12, 24, 0.55);
}

.hero-copy {
  flex: 1 1 380px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero-chip {
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(45, 212, 191, 0.16);
  color: rgba(226, 232, 240, 0.9);
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.hero-copy h1 {
  font-size: clamp(28px, 4vw, 38px);
  margin: 0;
  color: rgba(248, 250, 252, 0.98);
}

.hero-copy p {
  margin: 0;
  color: rgba(148, 163, 184, 0.88);
  font-size: 15px;
  line-height: 1.6;
  max-width: 620px;
}

.hero-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

.hero-metric {
  min-width: 160px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.18);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-label {
  font-size: 13px;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.75);
  letter-spacing: 0.4px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: rgba(248, 250, 252, 0.95);
}

.metric-hint {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.8);
}

.hero-side {
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-window {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(59, 130, 246, 0.25);
  background: rgba(15, 23, 42, 0.65);
}

.window-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: rgba(148, 163, 184, 0.75);
}

.window-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: rgba(248, 250, 252, 0.95);
}

.window-hint {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.8);
}

.dashboard-grid {
  row-gap: 28px !important;
}

.dashboard-card {
  padding: 26px;
  background: rgba(15, 23, 42, 0.72);
  border-radius: 26px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 24px 44px rgba(2, 12, 24, 0.45);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  color: rgba(248, 250, 252, 0.96);
}

.card-subtitle {
  display: block;
  font-size: 14px;
  color: rgba(148, 163, 184, 0.78);
  margin-top: 4px;
}

.donut-group {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.consumption-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.consumption-item {
  display: grid;
  grid-template-columns: auto 1fr 120px;
  gap: 16px;
  align-items: center;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(10, 16, 28, 0.68);
  border: 1px solid rgba(45, 212, 191, 0.12);
}

.consumption-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: rgba(248, 250, 252, 0.9);
}

.consumption-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.consumption-label {
  font-size: 14px;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.78);
}

.consumption-value {
  font-size: 22px;
  font-weight: 700;
  color: rgba(248, 250, 252, 0.95);
}

.consumption-trend {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  color: rgba(248, 250, 252, 0.88);
}

.consumption-trend.positive {
  border: 1px solid rgba(45, 212, 191, 0.4);
}

.consumption-trend.negative {
  border: 1px solid rgba(248, 113, 113, 0.45);
}

.consumption-hint {
  color: rgba(148, 163, 184, 0.75);
}

.consumption-sparkline {
  width: 100%;
  height: 48px;
}

.chart-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(148, 163, 184, 0.78);
}

.alerts {
  border: 1px solid rgba(248, 113, 113, 0.28);
  background: rgba(30, 10, 16, 0.72);
}

.alert-list {
  padding: 0;
}

.alert-item {
  border-radius: 16px;
  margin-bottom: 10px;
  transition: background 0.3s ease;
}

.alert-item:hover {
  background: rgba(248, 113, 113, 0.1);
}

.consumer-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.consumer-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.18);
  background: rgba(10, 18, 32, 0.68);
}

.consumer-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: rgba(248, 250, 252, 0.92);
}

.consumer-icon.water {
  background: rgba(45, 212, 191, 0.22);
}

.consumer-icon.electric {
  background: rgba(250, 204, 21, 0.25);
}

.consumer-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.consumer-id {
  font-weight: 600;
  color: rgba(248, 250, 252, 0.92);
}

.consumer-location {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.78);
}

.consumer-value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-weight: 600;
  color: rgba(248, 250, 252, 0.95);
}

.consumer-hint {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.75);
}

.scope-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 18px;
}

.scope-item {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(45, 212, 191, 0.18);
  background: rgba(10, 18, 32, 0.68);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scope-label {
  font-size: 13px;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.75);
}

.scope-value {
  font-size: 22px;
  font-weight: 700;
  color: rgba(248, 250, 252, 0.96);
}

.scope-note {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(45, 212, 191, 0.12);
  color: rgba(226, 232, 240, 0.9);
}

@media (max-width: 1280px) {
  .consumption-item {
    grid-template-columns: auto 1fr;
  }

  .consumption-sparkline {
    grid-column: 1 / -1;
  }
}

@media (max-width: 960px) {
  .home-dashboard {
    padding: 18px;
  }

  .dashboard-card {
    padding: 22px;
  }
}
</style>
