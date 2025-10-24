<template>
  <v-container fluid class="home-shell" tag="section">
    <v-row class="g-6" no-gutters>
      <v-col cols="12">
        <v-card class="intro-card" elevation="0">
            <div class="intro-left">
              <div class="intro-top">
                <div class="org-chip">{{ organizationName }}</div>
                <v-btn-toggle
                  v-model="selectedDomain"
                  class="domain-toggle"
                  density="comfortable"
                  mandatory
                  rounded="xl"
                >
                  <v-btn
                    v-for="option in domainOptions"
                    :key="option.value"
                    :value="option.value"
                    class="domain-toggle-btn"
                    size="small"
                    variant="text"
                    :class="{ 'is-active': selectedDomain === option.value }"
                  >
                    <v-icon size="18">{{ option.icon }}</v-icon>
                    <span>{{ option.label }}</span>
                  </v-btn>
                </v-btn-toggle>
              </div>
              <h1 class="intro-title">{{ introTitle }}</h1>
              <p class="intro-subtitle">
                {{ introLead }}
                <span class="intro-subtitle-break">{{ introBody }}</span>
              </p>
            <div class="intro-meta">
              <div class="meta-block">
                <span class="meta-label">Son veri alımı</span>
                <span class="meta-value">{{ lastUpdateLabel }}</span>
                <v-chip :color="freshnessChip.color" class="meta-chip" size="small" variant="tonal">
                  {{ freshnessChip.label }}
                </v-chip>
                <span class="meta-hint">{{ freshnessChip.helper }}</span>
              </div>
              <v-divider vertical class="mx-5 d-none d-md-flex" />
              <div class="meta-block">
                <span class="meta-label">Bir sonraki pencere</span>
                <span class="meta-value">{{ nextWindowLabel }}</span>
                <span class="meta-hint">{{ nextWindowCountdown }}</span>
              </div>
              <v-divider vertical class="mx-5 d-none d-md-flex" />
              <div class="meta-block">
                <span class="meta-label">Kapsam</span>
                <span class="meta-value">{{ formatNumber(totalMeters) }} sayaç</span>
                <span class="meta-hint">{{ activeMeterRatio }}</span>
              </div>
            </div>
            <div class="intro-actions">
              <v-btn
                color="primary"
                prepend-icon="mdi-format-list-bulleted"
                variant="flat"
                :to="{ name: 'sensor' }"
              >
                Sensör listesine git
              </v-btn>
              <v-btn color="primary" prepend-icon="mdi-file-download" variant="text">Günlük özet indir</v-btn>
            </div>
          </div>
          <div class="intro-right">
            <div class="cadence-card">
              <div class="cadence-header">
                <div>
                  <h2 class="cadence-title">Günlük iletim pencereleri</h2>
                  <span class="cadence-subtitle">{{ cadenceSubtitle }}</span>
                </div>
                <v-chip class="cadence-chip" prepend-icon="mdi-calendar-clock" size="small" variant="flat">
                  Sıradaki: {{ nextWindowLabel }}
                </v-chip>
              </div>
              <v-table class="cadence-table" density="compact">
                <thead>
                  <tr>
                    <th>Saat</th>
                    <th>Durum</th>
                    <th>Not</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="window in scheduleTimeline" :key="window.key">
                    <td class="cadence-time">{{ window.time }}</td>
                    <td class="cadence-status">
                      <v-chip :color="scheduleStatusColor(window.status)" size="small" variant="tonal">
                        {{ window.statusLabel }}
                      </v-chip>
                    </td>
                    <td class="cadence-note">{{ window.note }}</td>
                  </tr>
                </tbody>
              </v-table>
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
              <span class="panel-hint">Son dokuz iletim penceresine ait tüketim toplamı (m³)</span>
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
              <span class="panel-hint">Kritik uyarılar parti bazında değerlendirilir</span>
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
              <span class="panel-hint">Son iki toplu gönderim ortalaması</span>
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
              <span class="panel-hint">Parti gecikmesi yaşayan sayaçlar için önerilen aksiyonlar</span>
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

const formatAgo = (date, reference) => {
  const raw = formatRelative(date, reference)
  return raw.replace('sonra', 'önce')
}

const getFreshnessChip = (lastBatch, now) => {
  const diffMinutes = Math.max(0, (now.getTime() - lastBatch.getTime()) / 60000)
  if (diffMinutes <= 180) {
    return {
      label: 'Takvimde',
      color: 'success',
      helper: `Son parti ${formatAgo(lastBatch, now)} alındı`
    }
  }
  if (diffMinutes <= 360) {
    return {
      label: '1 çevrim gecikti',
      color: 'amber-darken-2',
      helper: `Son parti ${formatAgo(lastBatch, now)} alındı`
    }
  }
  return {
    label: '2+ çevrim gecikti',
    color: 'red-darken-2',
    helper: `Son parti ${formatAgo(lastBatch, now)} alındı`
  }
}

const getWindowDate = (base, hour) => {
  const result = new Date(base)
  if (hour === 24) {
    result.setDate(result.getDate() + 1)
    result.setHours(0, 0, 0, 0)
  } else {
    result.setHours(hour, 0, 0, 0)
  }
  return result
}

const domainOptions = [
  { value: 'water', label: 'Su', icon: 'mdi-water' },
  { value: 'electric', label: 'Elektrik', icon: 'mdi-flash' }
]

const domainProfiles = {
  water: {
    organizationName: 'ASKİ Su Operasyon Merkezi',
    organizationRegion: 'Ankara hizmet bölgesi',
    introTitle: 'Su sayaçları operasyon merkezi',
    introLead: '{region} için LoRa ve GPRS sayaçlarından gelen toplu ölçümleri takip ediyoruz.',
    introBody: 'Sistem günde üç defa veri alır; son çekilen parti üzerinden tüm göstergeler güncellenir.',
    lastBatchDelayMinutes: 165,
    scheduleWindows: [8, 12, 24],
    cadenceSubtitle: '08:00, 12:00 ve 24:00 partileri; durum çipleri gecikmeleri net biçimde gösterir.',
    totalMeters: 16842,
    activeMeters: 15620,
    trendGradient: ['rgba(14,165,233,0.18)', 'rgba(14,165,233,0.05)'],
    overviewMetrics: [
      {
        title: 'Aktif sayaç',
        value: formatNumber(15620),
        caption: 'Son parti içinde veri gönderen sayaç',
        trend: '+124 sayaç',
        trendLabel: 'Önceki pencereye göre',
        trendPositive: true,
        icon: 'mdi-water',
        accent: 'linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(56, 189, 248, 0.32))'
      },
      {
        title: 'Geciken sayaç',
        value: formatNumber(482),
        caption: '1 çevrim ve üzeri gecikme yaşayan sayaç',
        trend: '58 kritik',
        trendLabel: 'Saha kontrolü gerekli',
        trendPositive: false,
        icon: 'mdi-timer-sand',
        accent: 'linear-gradient(135deg, rgba(249, 115, 22, 0.18), rgba(234, 88, 12, 0.32))'
      },
      {
        title: 'İletim başarısı',
        value: '93%',
        caption: 'Bugünkü pencerelerde alınan paket oranı',
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
        trend: 'Son parti: 3 yeni',
        trendLabel: '12:00 verisine göre',
        trendPositive: false,
        icon: 'mdi-bell-alert',
        accent: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(96, 165, 250, 0.32))'
      }
    ],
    consumptionTrend: [18.6, 19.4, 19.1, 20.2, 21.5, 21.2, 22.4, 21.9, 22.6],
    trendSummaries: [
      { label: 'Son parti', value: '22.6 bin m³', hint: '12:00 verisi', highlight: true },
      { label: 'Bugün toplam', value: '44.5 bin m³', hint: '08:00 + 12:00' },
      { label: 'Dün', value: '43.8 bin m³', hint: '%1.6 artış' },
      { label: 'Haftalık', value: '302 bin m³', hint: '3 parti gecikmeli' }
    ],
    freshnessBreakdown: [
      {
        label: 'Takvimde',
        value: formatNumber(15138),
        hint: 'Son 12 saatte veri gönderdi',
        percentage: '%89',
        color: 'rgba(34, 197, 94, 0.35)',
        chipColor: 'success'
      },
      {
        label: '1 çevrim gecikmeli',
        value: formatNumber(964),
        hint: 'Son pencere kaçırıldı',
        percentage: '%6',
        color: 'rgba(245, 158, 11, 0.35)',
        chipColor: 'amber-darken-2'
      },
      {
        label: '2+ çevrim gecikmeli',
        value: formatNumber(296),
        hint: '24 saati aştı',
        percentage: '%5',
        color: 'rgba(248, 113, 113, 0.35)',
        chipColor: 'red-darken-2'
      }
    ],
    criticalAlerts: 4,
    alerts: [
      {
        title: 'DMA-3 basınç düşüşü',
        subtitle: 'Son veri 12:00 paketinde geldi',
        count: 'Acil',
        icon: 'mdi-alert-decagram-outline',
        color: 'red-darken-1'
      },
      {
        title: 'Kapalı vana uyarısı',
        subtitle: 'Çankaya vana-12 • 2 pencere gecikmeli',
        count: '2',
        icon: 'mdi-valve',
        color: 'orange-darken-2'
      },
      {
        title: 'Gateway bağlantısı koptu',
        subtitle: 'Keçiören 5G-02 • 6 saattir offline',
        count: '6 sa',
        icon: 'mdi-access-point-network-off',
        color: 'amber-darken-2'
      },
      {
        title: 'Klor seviyesi yükseldi',
        subtitle: 'Mamak kalite istasyonu • 08:00 partisi',
        count: '1',
        icon: 'mdi-flask-alert',
        color: 'blue-darken-1'
      }
    ],
    topRegions: [
      {
        rank: '1',
        name: 'Çankaya - Merkez DMA',
        subtitle: '1.842 aktif sayaç • 86 gateway',
        value: '28.4 bin m³',
        trend: '+5.2%',
        trendPositive: true,
        hint: 'Son parti 12:00'
      },
      {
        rank: '2',
        name: 'Keçiören - Kuzey hattı',
        subtitle: '1.264 aktif sayaç • 54 gateway',
        value: '24.1 bin m³',
        trend: '+3.4%',
        trendPositive: true,
        hint: 'Son parti 12:00'
      },
      {
        rank: '3',
        name: 'Yenimahalle sanayi bölgesi',
        subtitle: '932 aktif sayaç • 31 gateway',
        value: '19.7 bin m³',
        trend: '−1.1%',
        trendPositive: false,
        hint: 'Son parti 08:00'
      },
      {
        rank: '4',
        name: 'Mamak konut hattı',
        subtitle: '1.506 aktif sayaç • 47 gateway',
        value: '17.9 bin m³',
        trend: '+0.9%',
        trendPositive: true,
        hint: 'Son parti 12:00'
      },
      {
        rank: '5',
        name: 'Sincan endüstriyel bölge',
        subtitle: '684 aktif sayaç • 22 gateway',
        value: '15.8 bin m³',
        trend: '+0.4%',
        trendPositive: true,
        hint: 'Son parti 08:00'
      }
    ],
    operationNotes: [
      {
        title: 'Gateway kontrol listesi',
        description: '6 saati aşan gecikmeli sayaçlar için saha devresi taraması planlandı.',
        icon: 'mdi-router-network',
        badge: 'Saha ziyareti',
        badgeColor: 'primary',
        accent: 'rgba(59, 130, 246, 0.18)'
      },
      {
        title: 'Bakım planı',
        description: 'Batarya seviyesi düşük sayaçlar 12:00 partisinde tekrar doğrulanacak.',
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
  },
  electric: {
    organizationName: 'YEPAŞ Enerji Kontrol Merkezi',
    organizationRegion: 'Orta Anadolu dağıtım bölgesi',
    introTitle: 'Elektrik sayaçları operasyon merkezi',
    introLead: '{region} için akıllı sayaç ve RTU verilerini gerilim seviyesine göre topluyoruz.',
    introBody: 'SCADA entegrasyonu dört pencere ile veri yeniler; yük eğrileri kritik sapmalarda uyarır.',
    lastBatchDelayMinutes: 95,
    scheduleWindows: [3, 9, 15, 21],
    cadenceSubtitle: '03:00, 09:00, 15:00 ve 21:00 pencereleri; kesinti riskleri proaktif olarak raporlanır.',
    totalMeters: 20458,
    activeMeters: 19812,
    trendGradient: ['rgba(168,85,247,0.22)', 'rgba(59,130,246,0.18)'],
    overviewMetrics: [
      {
        title: 'Aktif sayaç',
        value: formatNumber(19812),
        caption: 'Son pencere içinde veri gönderen sayaç',
        trend: '+186 sayaç',
        trendLabel: 'Dünkü 21:00 penceresine göre',
        trendPositive: true,
        icon: 'mdi-flash',
        accent: 'linear-gradient(135deg, rgba(168, 85, 247, 0.24), rgba(129, 140, 248, 0.36))'
      },
      {
        title: 'Kesinti uyarısı',
        value: '28',
        caption: 'Bölgesel ve noktasal kesinti riski',
        trend: '6 kritik',
        trendLabel: 'SCADA ile eşleşti',
        trendPositive: false,
        icon: 'mdi-transmission-tower-off',
        accent: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(249, 115, 22, 0.28))'
      },
      {
        title: 'Sayaç sağlığı',
        value: '97%',
        caption: 'Ping yanıtı veren sayaç oranı',
        trend: '+1.2 puan',
        trendLabel: 'Haftalık ortalama',
        trendPositive: true,
        icon: 'mdi-heart-pulse',
        accent: 'linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(16, 185, 129, 0.28))'
      },
      {
        title: 'Yük yönetimi',
        value: '5.2 MW',
        caption: 'Talep yanıtında aktif yük',
        trend: '−0.4 MW',
        trendLabel: 'Önceki gün aynı saat',
        trendPositive: false,
        icon: 'mdi-lightning-bolt',
        accent: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(56, 189, 248, 0.32))'
      }
    ],
    consumptionTrend: [4.2, 4.6, 4.9, 5.3, 5.7, 6.1, 6.4, 6.2, 6.5],
    trendSummaries: [
      { label: 'Son pencere', value: '6.5 MWh', hint: '21:00 verisi', highlight: true },
      { label: 'Bugün toplam', value: '12.8 MWh', hint: '03:00 + 09:00' },
      { label: 'Dün', value: '12.1 MWh', hint: '%5.8 artış' },
      { label: 'Haftalık', value: '84.6 MWh', hint: '1 pencere gecikmeli' }
    ],
    freshnessBreakdown: [
      {
        label: 'Takvimde',
        value: formatNumber(21908),
        hint: 'Son 6 saatte veri gönderdi',
        percentage: '%92',
        color: 'rgba(59, 130, 246, 0.32)',
        chipColor: 'info'
      },
      {
        label: '1 çevrim gecikmeli',
        value: formatNumber(1298),
        hint: '21:00 penceresi kaçırıldı',
        percentage: '%5',
        color: 'rgba(250, 204, 21, 0.28)',
        chipColor: 'amber-darken-2'
      },
      {
        label: '2+ çevrim gecikmeli',
        value: formatNumber(812),
        hint: '12 saati aştı',
        percentage: '%3',
        color: 'rgba(248, 113, 113, 0.32)',
        chipColor: 'red-darken-2'
      }
    ],
    criticalAlerts: 6,
    alerts: [
      {
        title: 'Trafo çıkışında harmonik artışı',
        subtitle: 'Ostim TM • %18 THD',
        count: '3',
        icon: 'mdi-sine-wave',
        color: 'deep-purple-darken-2'
      },
      {
        title: 'Planlanmayan kesinti',
        subtitle: 'Polatlı fider-4 • 42 müşteri',
        count: 'Acil',
        icon: 'mdi-power-plug-off',
        color: 'red-darken-1'
      },
      {
        title: 'Sayaç kesme komutu beklemede',
        subtitle: 'Altındağ konut hattı • 2 çevrim',
        count: '5',
        icon: 'mdi-flash-alert',
        color: 'amber-darken-2'
      },
      {
        title: 'Endüstriyel yük sınırı aşıldı',
        subtitle: 'Sincan OSB • 3.6 MW talep',
        count: 'Yeni',
        icon: 'mdi-factory',
        color: 'blue-darken-2'
      }
    ],
    topRegions: [
      {
        rank: '1',
        name: 'Ostim OSB',
        subtitle: '1.120 aktif sayaç • 28 trafo',
        value: '6.5 MWh',
        trend: '+6.2%',
        trendPositive: true,
        hint: 'Son pencere 21:00'
      },
      {
        rank: '2',
        name: 'Sincan trafo merkezi',
        subtitle: '948 aktif sayaç • 19 trafo',
        value: '5.9 MWh',
        trend: '+2.4%',
        trendPositive: true,
        hint: 'Son pencere 21:00'
      },
      {
        rank: '3',
        name: 'Yenimahalle hattı',
        subtitle: '1.406 aktif sayaç • 34 trafo',
        value: '5.1 MWh',
        trend: '−1.8%',
        trendPositive: false,
        hint: 'Son pencere 15:00'
      },
      {
        rank: '4',
        name: 'Polatlı kırsal',
        subtitle: '782 aktif sayaç • 14 trafo',
        value: '4.4 MWh',
        trend: '+0.7%',
        trendPositive: true,
        hint: 'Son pencere 15:00'
      },
      {
        rank: '5',
        name: 'Keçiören merkezi',
        subtitle: '1.264 aktif sayaç • 22 trafo',
        value: '4.0 MWh',
        trend: '−0.9%',
        trendPositive: false,
        hint: 'Son pencere 21:00'
      }
    ],
    operationNotes: [
      {
        title: 'Trafo bakım planı',
        description: 'Yüksek harmonik gözlenen trafolar için saha ölçümü planlandı.',
        icon: 'mdi-transmission-tower',
        badge: 'Saha ziyareti',
        badgeColor: 'primary',
        accent: 'rgba(168, 85, 247, 0.24)'
      },
      {
        title: 'Uzaktan kesme listesi',
        description: 'Faturalandırma sonrası otomatik kesme komutları sıraya alındı.',
        icon: 'mdi-power-plug',
        badge: 'Hazır',
        badgeColor: 'amber-darken-2',
        accent: 'rgba(250, 204, 21, 0.24)'
      },
      {
        title: 'Talep yanıt senaryosu',
        description: 'Gündüz yük dengelemesi için 3 endüstriyel abone ile iletişimdeyiz.',
        icon: 'mdi-lightning-bolt-circle',
        badge: 'Aktif',
        badgeColor: 'success',
        accent: 'rgba(56, 189, 248, 0.24)'
      }
    ]
  }
}

const selectedDomain = ref('water')
const freshBatchNow = ref(new Date())

const currentProfile = computed(() => domainProfiles[selectedDomain.value])

const organizationName = computed(() => currentProfile.value.organizationName)
const organizationRegion = computed(() => currentProfile.value.organizationRegion)
const introTitle = computed(() => currentProfile.value.introTitle)
const introLead = computed(() =>
  currentProfile.value.introLead.replace('{region}', currentProfile.value.organizationRegion)
)
const introBody = computed(() => currentProfile.value.introBody)
const cadenceSubtitle = computed(() => currentProfile.value.cadenceSubtitle)

const totalMeters = computed(() => currentProfile.value.totalMeters)
const activeMeters = computed(() => currentProfile.value.activeMeters)
const scheduleWindows = computed(() => currentProfile.value.scheduleWindows)
const trendGradient = computed(() => currentProfile.value.trendGradient)

const lastBatchReceived = computed(() => {
  const minutes = currentProfile.value.lastBatchDelayMinutes ?? 0
  const result = new Date(freshBatchNow.value)
  result.setMinutes(result.getMinutes() - minutes)
  return result
})

const scheduleTimeline = computed(() => {
  return scheduleWindows.value.map((hour) => {
    const now = freshBatchNow.value
    const windowDate = getWindowDate(now, hour)
    const lastBatch = lastBatchReceived.value
    let status = 'upcoming'
    let statusLabel = 'Bekleniyor'
    let note = `${formatTime(windowDate)} hedef`

    if (lastBatch.getTime() >= windowDate.getTime()) {
      status = 'completed'
      statusLabel = 'Tamamlandı'
      note = `${formatAgo(windowDate, lastBatch)} içerisinde alındı`
    } else if (now.getTime() >= windowDate.getTime()) {
      status = 'delayed'
      statusLabel = 'Gecikti'
      note = 'Son parti bekleniyor'
    }

    return {
      key: `${hour}-${status}`,
      time: hour === 24 ? '24:00' : `${hour.toString().padStart(2, '0')}:00`,
      status,
      statusLabel,
      note
    }
  })
})

const scheduleStatusColor = (status) => {
  if (status === 'completed') return 'success'
  if (status === 'delayed') return 'amber-darken-2'
  return 'primary'
}

const nextWindow = computed(() => {
  const now = freshBatchNow.value
  for (const hour of scheduleWindows.value) {
    const candidate = getWindowDate(now, hour)
    if (candidate.getTime() > now.getTime()) {
      return candidate
    }
  }
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  tomorrow.setHours(scheduleWindows.value[0], 0, 0, 0)
  return tomorrow
})

const nextWindowLabel = computed(() => `${formatTime(nextWindow.value)}`)
const nextWindowCountdown = computed(() => formatRelative(freshBatchNow.value, nextWindow.value))
const lastUpdateLabel = computed(() => formatTime(lastBatchReceived.value))
const freshnessChip = computed(() => getFreshnessChip(lastBatchReceived.value, freshBatchNow.value))

const activeMeterRatio = computed(() => {
  const ratio = (activeMeters.value / totalMeters.value) * 100
  return `${formatNumber(activeMeters.value)} aktif • %${ratio.toFixed(1)}`
})

const overviewMetrics = computed(() => currentProfile.value.overviewMetrics)
const consumptionTrend = computed(() => currentProfile.value.consumptionTrend)
const trendSummaries = computed(() => currentProfile.value.trendSummaries)
const cadenceDescription = computed(() => {
  const diff = Math.abs(Math.round((freshBatchNow.value - lastBatchReceived.value) / 60000))
  return diff <= 180 ? 'Takvimde' : diff <= 360 ? '1 çevrim gecikmeli' : '2+ çevrim gecikmeli'
})
const freshnessBreakdown = computed(() => currentProfile.value.freshnessBreakdown)
const criticalAlerts = computed(() => currentProfile.value.criticalAlerts)
const alerts = computed(() => currentProfile.value.alerts)
const topRegions = computed(() => currentProfile.value.topRegions)
const operationNotes = computed(() => currentProfile.value.operationNotes)
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

.intro-card {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: space-between;
  padding: 32px 36px;
  background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent-color) 18%, transparent),
      color-mix(in srgb, var(--accent-highlight) 16%, transparent)
    );
  border-radius: 26px;
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
}

.intro-left {
  flex: 1 1 360px;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.intro-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.domain-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  border: 1px solid var(--border-soft);
  background: color-mix(in srgb, var(--surface-card) 85%, transparent);
  box-shadow: var(--card-shadow);
}

.domain-toggle-btn {
  border-radius: 999px !important;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: var(--muted-text) !important;
  min-height: 34px;
  padding: 0 14px;
}

.domain-toggle-btn .v-btn__content {
  gap: 6px;
}

.domain-toggle-btn.is-active {
  background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent-color) 70%, transparent),
      color-mix(in srgb, var(--accent-highlight) 70%, transparent)
    ) !important;
  color: #022c22 !important;
  box-shadow: var(--accent-shadow);
}

.org-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--accent-surface);
  box-shadow: var(--accent-shadow);
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 600;
  color: var(--accent-color);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.intro-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--heading-color);
  margin: 0;
}

.intro-subtitle {
  font-size: 16px;
  color: var(--muted-text);
  margin: 0;
  line-height: 1.6;
}

.intro-subtitle-break {
  display: block;
  margin-top: 6px;
}

.intro-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 18px 32px;
  align-items: center;
  padding: 18px 20px;
  background: var(--surface-glass);
  border-radius: 20px;
  border: 1px solid var(--border-soft);
  backdrop-filter: blur(18px);
  box-shadow: var(--card-shadow);
}

.meta-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted-text);
  font-weight: 600;
}

.meta-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--heading-color);
}

.meta-chip {
  margin-top: 2px;
  align-self: flex-start;
}

.meta-hint {
  font-size: 13px;
  color: var(--muted-text);
}

.intro-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.intro-right {
  flex: 0 1 360px;
  display: flex;
  justify-content: center;
}

.cadence-card {
  width: 100%;
  max-width: 360px;
  background: var(--surface-card);
  border-radius: 22px;
  border: 1px solid var(--border-soft);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--card-shadow);
}

.cadence-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cadence-chip {
  align-self: flex-start;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.cadence-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--heading-color);
}

.cadence-subtitle {
  font-size: 13px;
  color: var(--muted-text);
  line-height: 1.5;
}

.cadence-table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

.cadence-table th,
.cadence-table td {
  padding: 8px 0;
  font-size: 13px;
  color: var(--muted-text);
  border-bottom: 1px solid var(--border-soft);
}

.cadence-table th {
  text-align: left;
  font-weight: 600;
  color: var(--heading-color);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.cadence-table tr:last-child th,
.cadence-table tr:last-child td {
  border-bottom: none;
}

.cadence-time {
  font-weight: 700;
  color: var(--heading-color);
}

.cadence-status {
  width: 120px;
}

.cadence-note {
  color: var(--muted-text);
}

@media (min-width: 520px) {
  .cadence-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.metric-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px;
  border-radius: 22px;
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.metric-icon {
  color: var(--heading-color);
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
  gap: 12px;
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
  background: var(--positive-pill-bg);
  color: var(--positive-pill-color);
}

.metric-trend.negative {
  background: var(--negative-pill-bg);
  color: var(--negative-pill-color);
}

.metric-trend .trend-label {
  font-weight: 500;
  color: var(--muted-text);
}

.panel-card {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 26px;
  background: var(--surface-card);
  border-radius: 24px;
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
}

.panel-card.compact {
  gap: 18px;
  padding: 24px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
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
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.panel-chip.warning {
  background: var(--warning-soft-bg);
  color: var(--warning-soft-color);
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
  flex-wrap: wrap;
  font-size: 13px;
  color: var(--muted-text);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-item .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-item .dot.primary {
  background: var(--accent-highlight);
}

.legend-item .dot.secondary {
  background: color-mix(in srgb, var(--accent-highlight) 35%, transparent);
}

.panel-summary {
  margin-top: 6px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--muted-text);
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--heading-color);
}

.summary-value.positive {
  color: var(--positive-pill-color);
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
  gap: 16px;
}

.freshness-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.freshness-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.freshness-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.freshness-label {
  font-size: 14px;
  font-weight: 600;
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
}

.freshness-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--heading-color);
}

.freshness-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--muted-text);
  padding-top: 8px;
  border-top: 1px dashed var(--border-soft);
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
  gap: 8px;
}

.region-item {
  border-radius: 16px;
}

.region-rank {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  background: var(--region-rank-bg);
  color: var(--region-rank-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.region-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.region-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--heading-color);
}

.region-trend.positive {
  color: var(--positive-pill-color);
  font-weight: 600;
}

.region-trend.negative {
  color: var(--negative-pill-color);
  font-weight: 600;
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
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: color-mix(in srgb, var(--surface-card) 88%, var(--note-surface));
  border-radius: 18px;
  border: 1px solid var(--border-soft);
  box-shadow: var(--card-shadow);
  min-height: 132px;
}

.note-icon {
  color: var(--accent-color);
}

.note-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.note-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--heading-color);
}

.note-desc {
  font-size: 13px;
  color: var(--muted-text);
  line-height: 1.5;
}

.notes-footer {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--muted-text);
}

@media (max-width: 600px) {
  .domain-toggle {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
}

@media (max-width: 960px) {
  .intro-card {
    flex-direction: column;
  }

  .intro-right {
    width: 100%;
  }

  .cadence-card {
    max-width: 100%;
  }
}
</style>
