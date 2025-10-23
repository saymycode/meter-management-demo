<template>
  <v-container fluid class="dashboard-shell" tag="section">
    <v-row class="g-4" no-gutters>
      <v-col cols="12">
        <v-card class="dashboard-hero" elevation="0">
          <div class="hero-left">
            <div class="hero-badge">Baylan Enerji Yönetimi</div>
            <h1 class="hero-title">Saha genelinde anlık enerji görünümü</h1>
            <p class="hero-subtitle">
              Şebekedeki sayaçlarınızın durumu, tüketim trendleri ve kritik alarm özetleri tek bakışta burada. Daha fazla detaya ihtiyacınız olduğunda ilgili ekranlara geçebilirsiniz.
            </p>
            <div class="hero-meta">
              <div class="meta-block">
                <span class="meta-label">Bugün</span>
                <span class="meta-value">{{ formattedDate }}</span>
              </div>
              <v-divider vertical class="mx-4" />
              <div class="meta-block">
                <span class="meta-label">Toplam izlenen sayaç</span>
                <span class="meta-value">{{ totalMeters }}</span>
              </div>
            </div>
          </div>
          <div class="hero-right">
            <div class="hero-highlight">
              <span class="highlight-label">Anlık Talep</span>
              <span class="highlight-value">8.1 MW</span>
              <span class="highlight-change positive">+1.4% • son 15 dk</span>
            </div>
            <div class="hero-spark">
              <v-sparkline
                :model-value="heroTrend"
                :line-width="3"
                :smooth="16"
                auto-draw
                auto-line-width
                class="hero-sparkline"
              />
              <div class="hero-caption">Tepki süresi stabil • Limitin %62'si kullanılıyor</div>
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
            <div class="metric-trend" :class="metric.trendPositive ? 'positive' : 'negative'">
              <v-icon size="18">{{ metric.trendPositive ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
              <span>{{ metric.trend }}</span>
              <span class="trend-label">{{ metric.trendLabel }}</span>
            </div>
            <v-sparkline
              :model-value="metric.sparkline"
              :smooth="12"
              :line-width="3"
              :gradient="metric.gradient"
              auto-draw
              auto-line-width
              class="metric-sparkline"
            />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="7">
        <v-card class="panel-card" elevation="0">
          <div class="panel-header">
            <div>
              <h2>Tüketim eğilimleri</h2>
              <span class="panel-hint">Son 7 güne ait toplam tüketim (MWh)</span>
            </div>
            <v-chip prepend-icon="mdi-calendar-range" class="panel-chip" variant="flat">7 gün</v-chip>
          </div>
          <div class="panel-body">
            <v-sparkline
              :model-value="consumptionTrend"
              :smooth="10"
              :line-width="4"
              auto-draw
              auto-line-width
              class="trend-chart"
            />
            <div class="panel-legend">
              <div class="legend-item">
                <span class="dot primary"></span>
                <span>Planlanan</span>
              </div>
              <div class="legend-item">
                <span class="dot secondary"></span>
                <span>Gerçekleşen</span>
              </div>
            </div>
            <v-row class="panel-summary" dense>
              <v-col cols="12" sm="4">
                <div class="summary-item">
                  <span class="summary-label">Haftalık toplam</span>
                  <span class="summary-value">84.6 MWh</span>
                </div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="summary-item">
                  <span class="summary-label">Günlük ortalama</span>
                  <span class="summary-value">12.1 MWh</span>
                </div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="summary-item">
                  <span class="summary-label">Tahmin edilen</span>
                  <span class="summary-value positive">+4.8% ↑</span>
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
              <h2>Durum özetleri</h2>
              <span class="panel-hint">Altyapı bileşenlerine ait anlık durum</span>
            </div>
          </div>
          <div class="status-grid">
            <div
              v-for="status in statusCards"
              :key="status.title"
              class="status-card"
            >
              <div class="status-header">
                <v-avatar size="36" class="status-icon" :style="{ background: status.accent }">
                  <v-icon size="20">{{ status.icon }}</v-icon>
                </v-avatar>
                <v-chip :color="status.badgeColor" class="status-chip" size="small" variant="tonal">
                  {{ status.badge }}
                </v-chip>
              </div>
              <div class="status-body">
                <span class="status-title">{{ status.title }}</span>
                <span class="status-value">{{ status.value }}</span>
                <span class="status-desc">{{ status.description }}</span>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="panel-card compact" elevation="0">
          <div class="panel-header">
            <div>
              <h2>Alarm özeti</h2>
              <span class="panel-hint">Şu anki kritik durumlar</span>
            </div>
            <v-chip prepend-icon="mdi-bell-alert" class="panel-chip warning" variant="flat">{{ alerts.length }}</v-chip>
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
              <h2>En yüksek tüketen bölgeler</h2>
              <span class="panel-hint">İlk 5 bölge • Son 24 saat</span>
            </div>
            <v-chip prepend-icon="mdi-map-marker" class="panel-chip" variant="flat">Saha görünümü</v-chip>
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
                  <span class="region-trend" :class="region.trendPositive ? 'positive' : 'negative'">
                    {{ region.trend }}
                  </span>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue'

const totalMeters = '1.284'

const heroTrend = ref([62, 66, 68, 64, 70, 74, 72, 78, 82, 80, 86])

const overviewMetrics = [
  {
    title: 'Bugünkü tüketim',
    value: '12.4 MWh',
    trend: '+6.3%',
    trendLabel: 'dünkü aynı saate göre',
    trendPositive: true,
    icon: 'mdi-flash-outline',
    accent: 'linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(56, 189, 248, 0.35))',
    gradient: ['rgba(14, 165, 233, 0)', 'rgba(14, 165, 233, 0.35)', 'rgba(59, 130, 246, 0.45)'],
    sparkline: [9.4, 10.2, 11.1, 11.5, 12.4, 12.1, 12.4]
  },
  {
    title: 'Aktif sayaç',
    value: '1.168',
    trend: '+3.2%',
    trendLabel: 'son 24 saat',
    trendPositive: true,
    icon: 'mdi-countertop',
    accent: 'linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(16, 185, 129, 0.35))',
    gradient: ['rgba(16, 185, 129, 0)', 'rgba(16, 185, 129, 0.3)', 'rgba(5, 150, 105, 0.45)'],
    sparkline: [960, 1012, 1044, 1088, 1112, 1126, 1168]
  },
  {
    title: 'Tahmini pik saat',
    value: '18:00',
    trend: '−12 dk',
    trendLabel: 'dünkü saate göre',
    trendPositive: true,
    icon: 'mdi-clock-outline',
    accent: 'linear-gradient(135deg, rgba(249, 115, 22, 0.18), rgba(234, 88, 12, 0.35))',
    gradient: ['rgba(234, 88, 12, 0)', 'rgba(249, 115, 22, 0.3)', 'rgba(251, 146, 60, 0.45)'],
    sparkline: [20.5, 20.1, 19.6, 19.2, 18.8, 18.5, 18]
  },
  {
    title: 'Tasarruf potansiyeli',
    value: '₺ 42.600',
    trend: '+9.5%',
    trendLabel: 'optimizasyon önerileri',
    trendPositive: true,
    icon: 'mdi-leaf-circle-outline',
    accent: 'linear-gradient(135deg, rgba(56, 189, 248, 0.18), rgba(45, 212, 191, 0.35))',
    gradient: ['rgba(59, 130, 246, 0)', 'rgba(59, 130, 246, 0.22)', 'rgba(45, 212, 191, 0.4)'],
    sparkline: [27, 28, 30, 33, 36, 38, 42.6]
  }
]

const consumptionTrend = ref([11.6, 12.4, 11.8, 13.2, 12.9, 11.4, 11.9])

const statusCards = [
  {
    title: 'Şebeke dengesi',
    value: 'Stabil',
    description: 'Frekans 50.01 Hz seviyesinde seyrediyor.',
    icon: 'mdi-pulse',
    badge: 'Stabil',
    badgeColor: 'success',
    accent: 'rgba(45, 212, 191, 0.18)'
  },
  {
    title: 'Gerilim seviyesi',
    value: '222 V',
    description: 'Şehir şebekesi referans aralıkta.',
    icon: 'mdi-transmission-tower',
    badge: 'Normal',
    badgeColor: 'primary',
    accent: 'rgba(59, 130, 246, 0.18)'
  },
  {
    title: 'Reaktif oranı',
    value: '9.4 %',
    description: 'Yasal limitlerin altında.',
    icon: 'mdi-axis-arrow',
    badge: 'İyi',
    badgeColor: 'teal',
    accent: 'rgba(16, 185, 129, 0.18)'
  },
  {
    title: 'Kayıp-kaçak',
    value: '1.8 %',
    description: 'Dünya ortalamasının altında.',
    icon: 'mdi-shield-check-outline',
    badge: 'Kontrol altında',
    badgeColor: 'indigo',
    accent: 'rgba(79, 70, 229, 0.18)'
  }
]

const alerts = [
  {
    title: 'Trafo 12A soğutma alarmı',
    subtitle: 'Isı 74°C seviyesine çıktı',
    count: '3 dk',
    icon: 'mdi-thermometer-alert',
    color: 'red-darken-1'
  },
  {
    title: 'Sayaç 34-982 bağlantı kesildi',
    subtitle: 'Bağlantı 08:42 itibarıyla kapandı',
    count: 'Yeni',
    icon: 'mdi-flash-alert',
    color: 'orange-darken-2'
  },
  {
    title: 'Talep limiti yaklaşımı',
    subtitle: 'Organize Sanayi - Bölüm C',
    count: '12%',
    icon: 'mdi-chart-timeline-variant',
    color: 'amber-darken-2'
  }
]

const topRegions = [
  {
    rank: '1',
    name: 'Organize Sanayi Bölgesi',
    subtitle: '342 aktif sayaç',
    value: '18.2 MWh',
    trend: '+4.1%',
    trendPositive: true
  },
  {
    rank: '2',
    name: 'Merkez - Ticari Hat',
    subtitle: '198 aktif sayaç',
    value: '14.6 MWh',
    trend: '+2.9%',
    trendPositive: true
  },
  {
    rank: '3',
    name: 'Kuzey Konut Hattı',
    subtitle: '412 aktif sayaç',
    value: '10.7 MWh',
    trend: '−1.6%',
    trendPositive: false
  },
  {
    rank: '4',
    name: 'Liman Tesisi',
    subtitle: '76 aktif sayaç',
    value: '9.8 MWh',
    trend: '+0.8%',
    trendPositive: true
  },
  {
    rank: '5',
    name: 'Güney Kırsal Hat',
    subtitle: '158 aktif sayaç',
    value: '7.4 MWh',
    trend: '+0.2%',
    trendPositive: true
  }
]

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
})
</script>

<style scoped>
.dashboard-shell {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-shell :deep(.v-row.g-4) {
  row-gap: 24px;
}

.dashboard-hero {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: stretch;
  gap: 32px;
  padding: 32px 36px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(45, 212, 191, 0.12));
  border-radius: 26px;
  border: 1px solid var(--border-soft);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.hero-left {
  flex: 1 1 360px;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero-badge {
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: rgba(14, 165, 233, 0.15);
  color: var(--accent-color);
}

.hero-title {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  color: var(--heading-color);
  line-height: 1.15;
}

.hero-subtitle {
  margin: 0;
  color: var(--muted-text);
  font-size: 16px;
  line-height: 1.55;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 14px;
  color: var(--muted-text);
}

.meta-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-weight: 600;
  color: var(--muted-text);
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
}

.meta-value {
  font-weight: 700;
  color: var(--heading-color);
}

.hero-right {
  flex: 1 1 280px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  min-width: 280px;
}

.hero-highlight {
  background: var(--surface-card);
  border-radius: 20px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid var(--border-soft);
}

.highlight-label {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--muted-text);
  letter-spacing: 0.5px;
  font-weight: 600;
}

.highlight-value {
  font-size: 36px;
  font-weight: 800;
  color: var(--heading-color);
}

.highlight-change {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted-text);
}

.highlight-change.positive {
  color: #059669;
}

.hero-spark {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--surface-card);
  border-radius: 20px;
  padding: 22px;
  border: 1px solid var(--border-soft);
}

.hero-sparkline {
  height: 120px;
  --v-theme-surface-variant: rgba(14, 165, 233, 0.16);
  color: #0ea5e9;
}

.hero-caption {
  font-size: 13px;
  color: var(--muted-text);
}

.metric-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px;
  background: var(--surface-card);
  border-radius: 24px;
  border: 1px solid var(--border-soft);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.metric-icon {
  color: var(--accent-color);
  box-shadow: var(--accent-shadow);
}

.metric-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--muted-text);
  font-weight: 600;
}

.metric-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--heading-color);
}

.metric-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.metric-trend {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 13px;
  color: var(--muted-text);
}

.metric-trend.positive {
  color: #059669;
}

.metric-trend.negative {
  color: #dc2626;
}

.metric-trend .trend-label {
  font-weight: 500;
  color: var(--muted-text);
}

.metric-sparkline {
  height: 70px;
}

.panel-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px 26px;
  background: var(--surface-card);
  border-radius: 26px;
  border: 1px solid var(--border-soft);
}

.panel-card.compact {
  gap: 16px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.panel-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--heading-color);
}

.panel-hint {
  display: block;
  font-size: 13px;
  color: var(--muted-text);
  margin-top: 4px;
}

.panel-chip {
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.16);
  color: var(--accent-color);
  font-weight: 600;
}

.panel-chip.warning {
  background: rgba(248, 113, 113, 0.16);
  color: #dc2626;
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.trend-chart {
  height: 160px;
  color: #0ea5e9;
}

.panel-legend {
  display: flex;
  gap: 18px;
  font-size: 13px;
  color: var(--muted-text);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.dot.primary {
  background: #38bdf8;
}

.dot.secondary {
  background: #2dd4bf;
}

.panel-summary {
  margin-top: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--muted-text);
  font-weight: 600;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--heading-color);
}

.summary-value.positive {
  color: #059669;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
}

.status-card {
  background: var(--surface-card);
  border-radius: 20px;
  padding: 18px;
  border: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-icon {
  color: var(--accent-color);
}

.status-chip {
  font-weight: 600;
  text-transform: none;
}

.status-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-title {
  font-size: 14px;
  color: var(--muted-text);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
}

.status-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--heading-color);
}

.status-desc {
  font-size: 13px;
  color: var(--muted-text);
}

.alert-list {
  padding: 0;
  margin: 0;
}

.alert-item {
  border-radius: 16px;
  margin-bottom: 8px;
  padding: 12px;
  background: rgba(148, 163, 184, 0.08);
}

.alert-item:last-child {
  margin-bottom: 0;
}

.region-list {
  padding: 0;
}

.region-item {
  border-radius: 16px;
  margin-bottom: 10px;
  padding: 12px 16px;
  background: rgba(148, 163, 184, 0.08);
}

.region-item:last-child {
  margin-bottom: 0;
}

.region-rank {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  background: rgba(14, 165, 233, 0.14);
  color: var(--accent-color);
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
  font-weight: 700;
  color: var(--heading-color);
}

.region-trend {
  font-size: 12px;
  font-weight: 600;
}

.region-trend.positive {
  color: #059669;
}

.region-trend.negative {
  color: #dc2626;
}

@media (max-width: 1280px) {
  .dashboard-shell {
    padding: 22px;
  }

  .hero-title {
    font-size: 28px;
  }
}

@media (max-width: 960px) {
  .dashboard-hero {
    padding: 26px;
  }

  .hero-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (max-width: 600px) {
  .dashboard-shell {
    padding: 18px 16px 60px;
  }

  .dashboard-hero {
    padding: 22px;
  }

  .hero-title {
    font-size: 24px;
  }

  .metric-card {
    padding: 20px;
  }

  .panel-card {
    padding: 22px;
  }
}
</style>
