<template>
  <v-container fluid class="home-shell" tag="section">
    <v-row class="g-6" no-gutters>
      <v-col cols="12">
        <v-card class="hero-card" elevation="0">
          <div class="hero-main">
            <div class="org-chip">{{ organizationName }}</div>
            <h1 class="hero-title">Sayaç operasyon özeti</h1>
            <p class="hero-text">
              {{ organizationRegion }} için LoRa ve GPRS sayaçlarından gelen toplu veriler burada özetlenir.
              Veriler gün içinde yalnızca birkaç kez toplu halde gelir; tüm göstergeler son alınan partiye göre güncellenir.
            </p>
            <div class="hero-meta">
              <div class="meta-block">
                <span class="meta-label">Son veri alımı</span>
                <span class="meta-value">{{ lastUpdateLabel }}</span>
                <span class="meta-hint">{{ lastUpdateAgo }}</span>
              </div>
              <div class="meta-block">
                <span class="meta-label">Son 24 saatte parti</span>
                <span class="meta-value">{{ batchesInLastDay }}</span>
                <span class="meta-hint">Ortalama {{ averageIntervalLabel }} aralık</span>
              </div>
              <div class="meta-block">
                <span class="meta-label">Veri durumu</span>
                <v-chip :color="freshnessChip.color" class="meta-chip" size="small" variant="tonal">
                  {{ freshnessChip.label }}
                </v-chip>
                <span class="meta-hint">{{ freshnessChip.helper }}</span>
              </div>
              <div class="meta-block">
                <span class="meta-label">Kapsam</span>
                <span class="meta-value">{{ formatNumber(totalMeters) }} sayaç</span>
                <span class="meta-hint">{{ activeMeterRatio }}</span>
              </div>
            </div>
            <div class="hero-actions">
              <v-btn color="primary" prepend-icon="mdi-format-list-bulleted" variant="flat">Sensör listesine git</v-btn>
              <v-btn color="primary" prepend-icon="mdi-file-download" variant="text">Günlük özet indir</v-btn>
            </div>
          </div>
          <div class="hero-side">
            <div class="batch-card">
              <h2 class="batch-title">Son gelen partiler</h2>
              <span class="batch-subtitle">Gerçekleşen iletim saatleri ve kapsama bilgileri</span>
              <ul class="batch-list">
                <li v-for="batch in recentBatches" :key="batch.id" class="batch-item">
                  <div class="batch-time">{{ batch.timeLabel }}</div>
                  <div class="batch-meta">
                    <span class="batch-ago">{{ batch.agoLabel }}</span>
                    <span class="batch-coverage">{{ batch.coverageLabel }}</span>
                  </div>
                </li>
              </ul>
              <div class="batch-footer">
                <v-icon size="18" color="primary">mdi-timer-sand</v-icon>
                <span>{{ cadenceSummary }}</span>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col v-for="metric in overviewMetrics" :key="metric.title" cols="12" md="6" lg="3">
        <v-card class="metric-card" elevation="0">
          <div class="metric-header">
            <v-avatar size="44" class="metric-icon" :style="{ background: metric.accent }">
              <v-icon>{{ metric.icon }}</v-icon>
            </v-avatar>
            <div class="metric-text">
              <span class="metric-label">{{ metric.title }}</span>
              <span class="metric-value">{{ metric.value }}</span>
            </div>
          </div>
          <div class="metric-body">
            <span class="metric-caption">{{ metric.caption }}</span>
            <div class="metric-trend" :class="metric.trendPositive ? 'positive' : 'negative'">
              <v-icon size="18">{{ metric.trendPositive ? 'mdi-check-circle' : 'mdi-alert' }}</v-icon>
              <span>{{ metric.trend }}</span>
              <span class="trend-label">{{ metric.trendLabel }}</span>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="7">
        <v-card class="panel-card" elevation="0">
          <div class="panel-header">
            <div>
              <h2>Parti bazlı tüketim eğrisi</h2>
              <span class="panel-hint">Son dokuz toplu iletim için tüketim toplamı (m³)</span>
            </div>
            <v-chip prepend-icon="mdi-calendar-clock" class="panel-chip" size="small" variant="flat">
              {{ cadenceDescription }}
            </v-chip>
          </div>
          <div class="panel-body">
            <v-sparkline
              :line-width="4"
              :model-value="consumptionTrend"
              :smooth="12"
              :gradient="trendGradient"
              auto-draw
              auto-line-width
              class="trend-chart"
              fill
            />
            <div class="panel-legend">
              <div class="legend-item">
                <span class="dot primary"></span>
                <span>Gerçekleşen tüketim</span>
              </div>
              <div class="legend-item">
                <span class="dot secondary"></span>
                <span>Planlanan hedef</span>
              </div>
            </div>
            <v-row class="panel-summary" dense>
              <v-col v-for="summary in trendSummaries" :key="summary.label" cols="12" sm="6" md="3">
                <div class="summary-item">
                  <span class="summary-label">{{ summary.label }}</span>
                  <span class="summary-value" :class="summary.highlight ? 'positive' : ''">{{ summary.value }}</span>
                  <span class="summary-hint">{{ summary.hint }}</span>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card class="panel-card compact" elevation="0">
          <div class="panel-header">
            <div>
              <h2>Veri tazeliği izleme</h2>
              <span class="panel-hint">Son iki gün için sayaçların parti katılım durumları</span>
            </div>
          </div>
          <div class="freshness-stats">
            <div v-for="freshness in freshnessBreakdown" :key="freshness.label" class="freshness-row">
              <div class="freshness-left">
                <div class="freshness-dot" :style="{ background: freshness.color }" />
                <div class="freshness-text">
                  <span class="freshness-label">{{ freshness.label }}</span>
                  <span class="freshness-hint">{{ freshness.hint }}</span>
                </div>
              </div>
              <div class="freshness-values">
                <span class="freshness-value">{{ freshness.value }}</span>
                <v-chip :color="freshness.chipColor" size="small" variant="tonal">{{ freshness.percentage }}</v-chip>
              </div>
            </div>
          </div>
          <div class="freshness-footer">
            <v-icon size="18" color="primary">mdi-information-outline</v-icon>
            <span>Geciken sayaçlar otomatik olarak iş emri listesine aktarılır.</span>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="panel-card compact" elevation="0">
          <div class="panel-header">
            <div>
              <h2>Alarm özeti</h2>
              <span class="panel-hint">Kritik uyarılar parti bazlı değerlendirildi</span>
            </div>
            <v-chip prepend-icon="mdi-bell-alert" class="panel-chip warning" size="small" variant="flat">
              {{ criticalAlerts }} kritik
            </v-chip>
          </div>
          <v-list class="alert-list" density="compact">
            <v-list-item v-for="alert in alerts" :key="alert.title" class="alert-item">
              <template #prepend>
                <v-avatar :color="alert.color" size="36" variant="tonal">
                  <v-icon>{{ alert.icon }}</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ alert.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ alert.subtitle }}</v-list-item-subtitle>
              <template #append>
                <v-chip size="small" :color="alert.color" variant="tonal">{{ alert.count }}</v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" lg="8">
        <v-card class="panel-card compact" elevation="0">
          <div class="panel-header">
            <div>
              <h2>En fazla tüketen bölgeler</h2>
              <span class="panel-hint">Son iki parti ortalaması</span>
            </div>
            <v-chip prepend-icon="mdi-map-marker-path" class="panel-chip" size="small" variant="flat">DMA görünümü</v-chip>
          </div>
          <v-list class="region-list" density="compact">
            <v-list-item v-for="region in topRegions" :key="region.name" class="region-item">
              <template #prepend>
                <div class="region-rank">{{ region.rank }}</div>
              </template>
              <v-list-item-title>{{ region.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ region.subtitle }}</v-list-item-subtitle>
              <template #append>
                <div class="region-meta">
                  <span class="region-value">{{ region.value }}</span>
                  <span class="region-trend" :class="region.trendPositive ? 'positive' : 'negative'">{{ region.trend }}</span>
                  <span class="region-hint">{{ region.hint }}</span>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card class="panel-card compact" elevation="0">
          <div class="panel-header">
            <div>
              <h2>Operasyon notları</h2>
              <span class="panel-hint">Geciken partiler ve saha aksiyonları için önerilen adımlar</span>
            </div>
          </div>
          <v-row class="notes-grid" dense>
            <v-col v-for="note in operationNotes" :key="note.title" cols="12" md="4">
              <div class="note-card">
                <v-avatar size="36" class="note-icon" :style="{ background: note.accent }">
                  <v-icon size="20">{{ note.icon }}</v-icon>
                </v-avatar>
                <div class="note-body">
                  <span class="note-title">{{ note.title }}</span>
                  <span class="note-desc">{{ note.description }}</span>
                </div>
                <v-chip size="small" :color="note.badgeColor" variant="tonal">{{ note.badge }}</v-chip>
              </div>
            </v-col>
          </v-row>
          <div class="notes-footer">
            <v-icon size="18" color="primary">mdi-book-information-variant</v-icon>
            <span>Veri paylaşımı kurum bazında yapılır; farklı kurumların sayaçları bu ekranda görünmez.</span>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue'

const organizationName = 'ASKİ Su Operasyon Merkezi'
const organizationRegion = 'Ankara hizmet bölgesi'
const totalMeters = 16842
const activeMeters = 15620
const freshBatchNow = ref(new Date())

const formatNumber = (value) => value.toLocaleString('tr-TR')

const formatTime = (date) =>
  new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'long'
  }).format(date)

const formatRelative = (from, to) => {
  const diffMinutes = Math.round((to.getTime() - from.getTime()) / 60000)
  const absMinutes = Math.abs(diffMinutes)
  const hours = Math.floor(absMinutes / 60)
  const minutes = absMinutes % 60
  const buildText = () => {
    if (hours === 0) {
      return `${minutes} dk`
    }
    if (minutes === 0) {
      return `${hours} saat`
    }
    return `${hours} saat ${minutes} dk`
  }
  return diffMinutes >= 0 ? `${buildText()} sonra` : `${buildText()} önce`
}

const formatAgo = (date, reference) => formatRelative(date, reference).replace('sonra', 'önce')

const formatDuration = (minutes) => {
  if (!minutes || Number.isNaN(minutes)) {
    return '-'
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (hours === 0) {
    return `${mins} dk`
  }
  if (mins === 0) {
    return `${hours} saat`
  }
  return `${hours} saat ${mins} dk`
}

const minutesAgo = (minutes) => new Date(freshBatchNow.value.getTime() - minutes * 60000)

const batchHistory = ref([
  { id: 'batch-0', receivedAt: minutesAgo(75), meterCount: 15428, coverage: 0.92 },
  { id: 'batch-1', receivedAt: minutesAgo(320), meterCount: 15206, coverage: 0.9 },
  { id: 'batch-2', receivedAt: minutesAgo(645), meterCount: 15102, coverage: 0.88 },
  { id: 'batch-3', receivedAt: minutesAgo(980), meterCount: 15688, coverage: 0.94 },
  { id: 'batch-4', receivedAt: minutesAgo(1320), meterCount: 14974, coverage: 0.87 }
])

const lastBatchReceived = computed(() => batchHistory.value[0]?.receivedAt ?? freshBatchNow.value)

const batchIntervals = computed(() => {
  const items = batchHistory.value
  const result = []
  for (let index = 0; index < items.length - 1; index += 1) {
    const current = items[index]
    const next = items[index + 1]
    if (current && next) {
      result.push(Math.abs((current.receivedAt.getTime() - next.receivedAt.getTime()) / 60000))
    }
  }
  return result
})

const averageIntervalMinutes = computed(() => {
  const intervals = batchIntervals.value
  if (!intervals.length) {
    return 0
  }
  const total = intervals.reduce((sum, value) => sum + value, 0)
  return total / intervals.length
})

const batchesInLastDay = computed(
  () => batchHistory.value.filter((batch) => freshBatchNow.value.getTime() - batch.receivedAt.getTime() <= 24 * 60 * 60000).length
)

const averageIntervalLabel = computed(() => formatDuration(averageIntervalMinutes.value))

const cadenceSummary = computed(() => {
  if (!batchHistory.value.length) {
    return 'Henüz parti alınmadı.'
  }
  return `Son 24 saatte ${batchesInLastDay.value} parti • Ortalama aralık ${averageIntervalLabel.value}`
})

const lastUpdateLabel = computed(() => formatTime(lastBatchReceived.value))
const lastUpdateAgo = computed(() => formatAgo(lastBatchReceived.value, freshBatchNow.value))

const freshnessChip = computed(() => {
  const lastBatch = lastBatchReceived.value
  const now = freshBatchNow.value
  const diffMinutes = Math.max(0, (now.getTime() - lastBatch.getTime()) / 60000)
  const baseline = averageIntervalMinutes.value || 240
  const watchThreshold = baseline * 1.5
  const actionThreshold = baseline * 2.4

  if (diffMinutes <= watchThreshold) {
    return {
      label: 'Beklenen aralıkta',
      color: 'success',
      helper: `Son parti ${formatAgo(lastBatch, now)} alındı`
    }
  }
  if (diffMinutes <= actionThreshold) {
    return {
      label: 'Kontrol edilmeli',
      color: 'amber-darken-2',
      helper: `Son parti ${formatAgo(lastBatch, now)} alındı`
    }
  }
  return {
    label: 'Müdahale gerekli',
    color: 'red-darken-2',
    helper: `Son parti ${formatAgo(lastBatch, now)} alındı`
  }
})

const recentBatches = computed(() =>
  batchHistory.value.slice(0, 4).map((batch, index) => ({
    id: batch.id,
    timeLabel: formatTime(batch.receivedAt),
    agoLabel: formatAgo(batch.receivedAt, freshBatchNow.value),
    coverageLabel: `${formatNumber(batch.meterCount)} sayaç • %${Math.round(batch.coverage * 100)}`,
    isLatest: index === 0
  }))
)

const activeMeterRatio = computed(() => {
  const ratio = (activeMeters / totalMeters) * 100
  return `${formatNumber(activeMeters)} aktif • %${ratio.toFixed(1)}`
})

const overviewMetrics = [
  {
    title: 'Aktif sayaç',
    value: formatNumber(activeMeters),
    caption: 'Son parti içinde veri gönderen sayaç',
    trend: '+124 sayaç',
    trendLabel: 'Önceki partiye göre',
    trendPositive: true,
    icon: 'mdi-water',
    accent: 'linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(56, 189, 248, 0.32))'
  },
  {
    title: 'Kontrol gerektiren',
    value: formatNumber(482),
    caption: 'Ortalama aralığı aşan sayaç',
    trend: '58 kritik',
    trendLabel: 'Saha kontrolü gerekli',
    trendPositive: false,
    icon: 'mdi-timer-sand',
    accent: 'linear-gradient(135deg, rgba(249, 115, 22, 0.18), rgba(234, 88, 12, 0.32))'
  },
  {
    title: 'İletim başarısı',
    value: '93%',
    caption: 'Son partide paket iletim oranı',
    trend: '+2 puan',
    trendLabel: 'Haftalık ortalama',
    trendPositive: true,
    icon: 'mdi-swap-vertical',
    accent: 'linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(16, 185, 129, 0.28))'
  },
  {
    title: 'Açık alarm',
    value: '12',
    caption: '4 kritik, 8 takipte',
    trend: 'Son partide 3 yeni',
    trendLabel: 'Geciken sayaçlardan',
    trendPositive: false,
    icon: 'mdi-bell-alert',
    accent: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(96, 165, 250, 0.32))'
  }
]

const consumptionTrend = ref([18.6, 19.4, 19.1, 20.2, 21.5, 21.2, 22.4, 21.9, 22.6])

const trendSummaries = [
  { label: 'Son parti', value: '22.6 bin m³', hint: 'Güncel toplu veri', highlight: true },
  { label: 'Son 24 saat', value: '44.5 bin m³', hint: 'Gelen üç partinin toplamı' },
  { label: 'Dün', value: '43.8 bin m³', hint: '%1.6 artış' },
  { label: 'Haftalık', value: '302 bin m³', hint: 'Son 7 gün ortalaması' }
]

const cadenceDescription = computed(() => {
  if (!batchHistory.value.length) {
    return 'Veri bekleniyor'
  }
  const diff = Math.abs(Math.round((freshBatchNow.value - lastBatchReceived.value) / 60000))
  const baseline = averageIntervalMinutes.value || 240
  if (diff <= baseline * 1.5) {
    return 'Beklenen aralıkta'
  }
  if (diff <= baseline * 2.4) {
    return 'Kontrol edilmeli'
  }
  return 'Müdahale gerekli'
})

const freshnessBreakdown = [
  {
    label: 'Beklenen aralıkta',
    value: formatNumber(15138),
    hint: 'Ortalama aralık içinde güncellendi',
    percentage: '%89',
    color: 'rgba(34, 197, 94, 0.35)',
    chipColor: 'success'
  },
  {
    label: 'Kontrol edilmeli',
    value: formatNumber(964),
    hint: 'Ortalama aralığı aştı',
    percentage: '%6',
    color: 'rgba(245, 158, 11, 0.28)',
    chipColor: 'amber-darken-2'
  },
  {
    label: 'Müdahale gerekli',
    value: formatNumber(740),
    hint: 'Uzayan gecikme nedeniyle alarmda',
    percentage: '%5',
    color: 'rgba(248, 113, 113, 0.28)',
    chipColor: 'red-darken-2'
  }
]

const criticalAlerts = 4

const alerts = [
  {
    title: 'Basınç düşüşü',
    subtitle: 'İvedik terfi hattında veri 5 saattir gelmedi',
    icon: 'mdi-gauge-low',
    color: 'red-darken-2',
    count: 2
  },
  {
    title: 'İletişim kaybı',
    subtitle: 'Altındağ bölgesinde 3 sayaç cevap vermiyor',
    icon: 'mdi-access-point-network-off',
    color: 'amber-darken-2',
    count: 3
  },
  {
    title: 'Kaçak ihtimali',
    subtitle: 'Polatlı hattında tüketim ortalaması yükseldi',
    icon: 'mdi-water-alert',
    color: 'primary',
    count: 7
  }
]

const topRegions = [
  {
    rank: '1',
    name: 'Çankaya DMA-3',
    subtitle: '1.204 aktif sayaç • 42 gateway',
    value: '22.6 bin m³',
    trend: '+2.4%',
    trendPositive: true,
    hint: 'Son parti referansı'
  },
  {
    rank: '2',
    name: 'Yenimahalle sanayi',
    subtitle: '884 aktif sayaç • 31 gateway',
    value: '19.7 bin m³',
    trend: '-0.8%',
    trendPositive: false,
    hint: 'Kontrol bekleyen 4 sayaç'
  },
  {
    rank: '3',
    name: 'Keçiören konut hattı',
    subtitle: '1.342 aktif sayaç • 54 gateway',
    value: '18.4 bin m³',
    trend: '+1.2%',
    trendPositive: true,
    hint: 'Son parti tamlandı'
  },
  {
    rank: '4',
    name: 'Mamak konut hattı',
    subtitle: '1.506 aktif sayaç • 47 gateway',
    value: '17.9 bin m³',
    trend: '+0.9%',
    trendPositive: true,
    hint: 'Son parti 75 dk önce'
  },
  {
    rank: '5',
    name: 'Sincan endüstriyel bölge',
    subtitle: '684 aktif sayaç • 22 gateway',
    value: '15.8 bin m³',
    trend: '+0.4%',
    trendPositive: true,
    hint: 'Müdahale gerekli 2 sayaç'
  }
]

const operationNotes = [
  {
    title: 'Gateway kontrol listesi',
    description: '5 saatten uzun süredir veri göndermeyen sayaçlar için saha taraması planlandı.',
    icon: 'mdi-router-network',
    badge: 'Saha ziyareti',
    badgeColor: 'primary',
    accent: 'rgba(59, 130, 246, 0.18)'
  },
  {
    title: 'Bakım planı',
    description: 'Batarya seviyesi düşük sayaçlar bir sonraki partide tekrar doğrulanacak.',
    icon: 'mdi-battery-alert',
    badge: 'Yenilendi',
    badgeColor: 'teal',
    accent: 'rgba(45, 212, 191, 0.18)'
  },
  {
    title: 'Veri kalite kontrolü',
    description: 'İletim başarısı %90 altına düşen bölgeler için doğrulama kuralı eklendi.',
    icon: 'mdi-clipboard-check',
    badge: 'Aktif',
    badgeColor: 'success',
    accent: 'rgba(34, 197, 94, 0.18)'
  }
]
</script>

<style scoped>
.home-shell {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.home-shell :deep(.v-row.g-6) {
  row-gap: 28px;
}

.hero-card {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: space-between;
  padding: 32px 36px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(45, 212, 191, 0.12));
  border-radius: 26px;
  border: 1px solid var(--border-soft);
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.08);
}

.hero-main {
  flex: 1 1 360px;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.org-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(15, 118, 110, 0.12);
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 600;
  color: #0f766e;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hero-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--heading-color);
  margin: 0;
}

.hero-text {
  font-size: 16px;
  color: var(--muted-text);
  margin: 0;
  line-height: 1.6;
}

.hero-meta {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.65);
  border-radius: 20px;
  border: 1px solid var(--border-soft);
}

.meta-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted-text);
}

.meta-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--heading-color);
}

.meta-hint {
  font-size: 13px;
  color: var(--muted-text);
}

.meta-chip {
  align-self: flex-start;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-side {
  flex: 1 1 280px;
  max-width: 360px;
  display: flex;
  align-items: stretch;
}

.batch-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 26px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid var(--border-soft);
}

.batch-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--heading-color);
}

.batch-subtitle {
  font-size: 13px;
  color: var(--muted-text);
}

.batch-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.batch-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.04);
}

.batch-time {
  font-weight: 600;
  color: var(--heading-color);
}

.batch-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  color: var(--muted-text);
}

.batch-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--muted-text);
}

.metric-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px;
  border-radius: 22px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.metric-icon {
  color: #0f172a;
}

.metric-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--muted-text);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.metric-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--heading-color);
}

.metric-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric-caption {
  font-size: 14px;
  color: var(--muted-text);
}

.metric-trend {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 999px;
}

.metric-trend.positive {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.metric-trend.negative {
  background: rgba(248, 113, 113, 0.12);
  color: #b91c1c;
}

.trend-label {
  font-weight: 600;
}

.panel-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 26px;
  border-radius: 24px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
}

.panel-card.compact {
  gap: 16px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--heading-color);
}

.panel-hint {
  font-size: 13px;
  color: var(--muted-text);
}

.panel-chip {
  align-self: flex-start;
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.trend-chart {
  height: 160px;
}

.panel-legend {
  display: flex;
  gap: 18px;
  font-size: 13px;
  color: var(--muted-text);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.primary {
  background: rgba(14, 165, 233, 0.8);
}

.dot.secondary {
  background: rgba(99, 102, 241, 0.65);
}

.panel-summary {
  margin-top: 6px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.03);
}

.summary-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted-text);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--heading-color);
}

.summary-value.positive {
  color: #047857;
}

.summary-hint {
  font-size: 12px;
  color: var(--muted-text);
}

.freshness-stats {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.freshness-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.freshness-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.freshness-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.freshness-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.freshness-label {
  font-size: 15px;
  font-weight: 700;
  color: var(--heading-color);
}

.freshness-hint {
  font-size: 13px;
  color: var(--muted-text);
}

.freshness-values {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.freshness-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--muted-text);
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.alert-item {
  border-radius: 16px;
}

.region-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.region-item {
  border-radius: 16px;
}

.region-rank {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.05);
  font-weight: 700;
  color: var(--heading-color);
}

.region-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.region-value {
  font-weight: 700;
  color: var(--heading-color);
}

.region-trend {
  font-size: 13px;
  font-weight: 600;
}

.region-trend.positive {
  color: #047857;
}

.region-trend.negative {
  color: #b91c1c;
}

.region-hint {
  font-size: 12px;
  color: var(--muted-text);
}

.notes-grid {
  margin-top: 4px;
}

.note-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.03);
}

.note-icon {
  color: #0f172a;
}

.note-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.note-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--heading-color);
}

.note-desc {
  font-size: 13px;
  color: var(--muted-text);
}

.notes-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--muted-text);
  margin-top: 12px;
}

@media (max-width: 960px) {
  .hero-card {
    padding: 28px;
  }

  .hero-side {
    max-width: 100%;
  }
}
</style>
