<script setup>
import { computed, ref } from 'vue'

const now = new Date()
const selectedTab = ref('consumption')

const reportTabs = [
  { value: 'consumption', label: 'Tüketim Analizi', icon: 'analytics' },
  { value: 'efficiency', label: 'Verimlilik', icon: 'energy_program_saving' },
  { value: 'alerts', label: 'Anormallikler', icon: 'warning' },
  { value: 'sustainability', label: 'Sürdürülebilirlik', icon: 'forest' },
]

const summaryMetrics = computed(() => [
  {
    label: 'Su tüketimi (bugün)',
    value: '4.920 m³',
    trend: '+%6,2',
    tone: 'positive',
  },
  {
    label: 'Elektrik tüketimi (bugün)',
    value: '312 MWh',
    trend: '-%2,4',
    tone: 'neutral',
  },
  {
    label: 'Anomali raporları',
    value: '18 aktif',
    trend: '+4 yeni',
    tone: 'alert',
  },
  {
    label: 'Karbon emisyonu',
    value: '128 tCO₂e',
    trend: '-%8,1',
    tone: 'positive',
  },
])

const consumptionReports = [
  {
    id: 'water-trend',
    title: 'Su Kullanımı Trend Analizi',
    subtitle: 'Şebeke bölgeleri bazında 24 saatlik ortalama',
    dataset: [68, 74, 79, 83, 80, 77, 71],
    labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    highlight: 'Endüstriyel bölgede %12 artış gözlemlendi, ters osmoz hattı kontrol edilmelidir.',
    badges: ['Su', 'Trend', 'Bölge Bazlı'],
  },
  {
    id: 'electricity-peak',
    title: 'Elektrik Pik Analizi',
    subtitle: 'Gün içi 15 dakikalık ortalama yük profili',
    dataset: [42, 49, 61, 74, 88, 95, 86, 72],
    labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    highlight:
      '14:00-16:00 bandında ani yükseliş. Otomasyon tarafında klima zaman çizelgeleri yeniden değerlendirilmeli.',
    badges: ['Elektrik', 'Peak Shaving'],
  },
  {
    id: 'pressure-balance',
    title: 'Basınç Dengesi Raporu',
    subtitle: 'Ana arter ve kritik hatların hat sonu değerleri',
    dataset: [96, 92, 88, 84, 90, 93],
    labels: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'],
    highlight: 'B4 hattında %12 basınç kaybı ölçüldü. Saha ekibine bakım talebi oluşturuldu.',
    badges: ['Su', 'Altyapı', 'Basınç'],
  },
]

const efficiencyReports = [
  {
    title: 'Pompa Optimizasyonu',
    description:
      'Gece yükünün %38\'i boşta çalışan pompalar nedeniyle gerçekleşiyor. Vardiya planlaması revize edilmeli.',
    score: 68,
    improvements: ['Düşük pik saatlerde değişken frekanslı sürücü kullanımı', 'Pompa izolasyon kontrol listesi'],
  },
  {
    title: 'Trafo Kaybı Analizi',
    description:
      'Kampüs içi trafo merkezlerinde yersiz reaktif güç tüketimi %7 seviyesinde. Kompanzasyon panosu yeniden ayarlanmalı.',
    score: 74,
    improvements: ['Yeni kapasitör grubu devreye alma', 'SCADA alarm eşiklerinin yeniden belirlenmesi'],
  },
  {
    title: 'Soğutma Kulesi Karşılaştırması',
    description:
      'Yeni kule ile eski kule arasındaki performans farkı %14. Ekipman bakım planı güncellenmeli.',
    score: 82,
    improvements: ['Isı eşanjörü temizlik sıklığını aylığa çekme', 'Fan hız kontrolü için otomasyon entegrasyonu'],
  },
]

const alertReports = [
  {
    title: 'Akustik kaçak tespiti',
    severity: 'kritik',
    location: 'Organize Sanayi, Kuzey Hattı',
    description:
      'Sensör 21B, 05:32 itibarıyla 18 dB üzerinde akustik kaçak sinyali yakaladı. Bölge vanası kapatıldı.',
    actions: ['Kaçak ekip gönderildi', '6 saatlik trend takibi başlatıldı'],
  },
  {
    title: 'Sayaç senkronizasyon sapması',
    severity: 'orta',
    location: 'Şehir Şebekesi, Hat 5',
    description:
      'Üç fazlı ölçümlerde 1,8% faz sapması bulundu. Ölçü kontrol ekibi doğrulama ziyareti planlıyor.',
    actions: ['Uzaktan reset denemesi yapıldı', 'Perşembe için fiziki ziyaret açıldı'],
  },
  {
    title: 'Ani debi değişimi',
    severity: 'düşük',
    location: 'Sulama Ağı, Bölge 2',
    description:
      'Akşam saatlerinde %22 debi düşüşü gözlemlendi. Tarla vanaları otomatik kapandı.',
    actions: ['Zamanlanmış sulama senaryosu teyit edildi'],
  },
]

const sustainabilityReports = [
  {
    title: 'Su geri kazanım oranı',
    progress: 62,
    target: '2025 hedefi %75',
    details:
      'Gri su toplama hattına yeni depo eklenmesiyle aylık 1.200 m³ tasarruf sağlandı. Filtrasyon ünitesinin devreye alınması bekleniyor.',
  },
  {
    title: 'Elektrik yenilenebilir payı',
    progress: 48,
    target: 'Yıl sonu hedefi %55',
    details:
      'Çatı GES üretimi bu ay %12 arttı. Fazla üretim için batarya depolama fizibilitesi tamamlandı.',
  },
  {
    title: 'Karbon emisyon azaltımı',
    progress: 71,
    target: '2030 yol haritası %35 azaltım',
    details:
      'Araç filosu dönüşümü ile 8 tCO₂e düşüş sağlandı. Isı pompaları için pilot proje başlatıldı.',
  },
]

const aiReports = [
  {
    title: 'Sayaç Anomalisi AI Radarı',
    confidence: '%97 güven skoru',
    narrative:
      'Generatif model, 1,4 milyon telemetri satırını 6 dakikada tarayarak fazlar arası kaymayı insan ekipten 18 saat önce yakaladı.',
    highlights: [
      'Basınç dalgalanması 36 saat önceden kestirildi, kritik vana otomatik modda kalibre edildi.',
      'Ses analizi ile kaçak lokasyonu 12 metre hassasiyetle tespit edildi.',
      'AI asistanı bakım ekibine WhatsApp botu üzerinden aksiyon listesi paylaştı.',
    ],
    action: 'Öneri: Dijital ikiz senaryolarını AI tahminleriyle eşleştirerek kalıcı alarm gürültüsünü %42 azaltın.',
  },
  {
    title: 'Enerji Tahmin Stüdyosu',
    confidence: '%94 isabet oranı',
    narrative:
      'Transformer tabanlı zaman serisi modeli, iki hafta sonraki pik tüketimi +-1,8 MW hata ile öngörüp yük kaydırma planını otomatik başlattı.',
    highlights: [
      'Gündüz vardiyasında ihtiyaç fazlası 3,2 MWh enerji depoya yönlendirildi.',
      'AI, HVAC senaryolarından 7 tanesini "yüksek risk" olarak işaretleyerek manuel müdahale ihtiyacını sıfırladı.',
      'Talep yanıtı sözleşmesinden 48.000₺ ek gelir potansiyeli çıkarıldı.',
    ],
    action: 'Öneri: AI tahminlerini SCADA planına bağlayıp mikrogrid optimizasyonunu dakikalık döngüye çekin.',
  },
  {
    title: 'Su Kalitesi Dijital Dedektifi',
    confidence: '%91 açıklanabilirlik skoru',
    narrative:
      'LLM destekli açıklama motoru, bulanıklık sensörlerinden gelen anomalileri açıklayıp hangi sondaj kuyusunun sistemi kirlettiğini hikayeleştirdi.',
    highlights: [
      'Kimyasal dozaj grafiğinde AI tarafından bulunan gizli korelasyon saha ekibi tarafından doğrulandı.',
      'Önleyici filtre değişimi önerisiyle 9 saatlik kesinti tamamen önlendi.',
      "İçilebilir su standardı KPI'ı AI raporlarının devreye alınmasından sonra %7 yükseldi.",
    ],
    action: 'Öneri: AI tarafından açıklanan kök sebepleri eğitim modülüne ekleyip personel onboarding süresini kısaltın.',
  },
]

const aiRecoverySummary = [
  {
    meter: 'AK311-10077',
    filledRows: 5,
    explanation:
      'Son 45 günlük gece tüketim profili referans alınarak eksik LoRa paketleri AI tarafından tahmin edilip tabloya "AI doldurma" etiketiyle işlendi.',
  },
  {
    meter: 'BYT11-22064',
    filledRows: 3,
    explanation:
      'Elektrik sayaç patern modeli 15 dakikalık pencereyi kullanıp pik saatlerde kaybolan veriyi yeniden kurdu; raporda satırlar AI imzasıyla işaretlendi.',
  },
  {
    meter: 'BYT11-22214',
    filledRows: 4,
    explanation:
      'Geçmiş 60 günlük OSB yük eğrisiyle korele edilerek iki saatlik boşluklar tamamlandı, manuel ekip doğrulaması gereksiz hale geldi.',
  },
]

const aiForecastInsights = [
  {
    title: 'Önümüzdeki günlerde tüketim artışı',
    detail:
      'Transformer tabanlı tahmin motoru Ostim OSB hattında 72 saat içinde %11 tüketim artışı öngörüyor; yük kaydırma senaryosu devreye alınmalı.',
  },
  {
    title: 'Su hattı tüketimi normalin altında',
    detail:
      'AK311-10103 sayacının günlük ortalaması beklenen bandın %18 altında, AI bunu geçmiş kış periyotlarına göre anomali olarak işaretledi.',
  },
  {
    title: 'AI veri tamamlama raporu',
    detail:
      'Son 24 saatte 3 sayaçta toplam 12 satır eksik veri AI tarafından dolduruldu; rapor özetinde her satır "AI ile tamamlandı" notuyla gösteriliyor.',
  },
]
</script>

<template>
  <v-container fluid class="reports-page" tag="section">
    <header class="reports-header">
      <div class="header-intro">
        <div class="header-chip">Raporlar • Güncel durum</div>
        <h1>Altyapı raporlama merkezi</h1>
        <p>
          Su, elektrik ve sensör verileri tek bir rapor ekranında toplanır. Kullanıcılar farklı başlıklara
          geçerek enerji yönetiminden kaçak takibine kadar detaylı analizleri görüntüler.
        </p>
        <div class="header-meta">
          <span class="meta-label">Son güncelleme</span>
          <span class="meta-value">{{ now.toLocaleString('tr-TR') }}</span>
        </div>
      </div>
      <div class="header-metrics">
        <v-row dense>
          <v-col v-for="metric in summaryMetrics" :key="metric.label" cols="12" md="6">
            <v-card class="metric-card" elevation="0">
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-value">{{ metric.value }}</div>
              <div class="metric-trend" :class="`trend-${metric.tone}`">{{ metric.trend }}</div>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </header>

    <v-card class="reports-tabs" elevation="0">
      <v-tabs v-model="selectedTab" class="tab-bar" color="primary" grow>
        <v-tab v-for="tab in reportTabs" :key="tab.value" :value="tab.value">
          <v-icon size="18" class="mr-2">{{ tab.icon }}</v-icon>
          {{ tab.label }}
        </v-tab>
      </v-tabs>
      <v-divider />
      <v-window v-model="selectedTab" class="tab-content">
        <v-window-item value="consumption">
          <v-row>
            <v-col v-for="report in consumptionReports" :key="report.id" cols="12" md="4">
              <v-card class="report-card" elevation="0">
                <div class="report-card__head">
                  <div class="report-card__title">{{ report.title }}</div>
                  <div class="report-card__subtitle">{{ report.subtitle }}</div>
                  <div class="report-card__badges">
                    <v-chip v-for="badge in report.badges" :key="badge" size="small" variant="tonal">
                      {{ badge }}
                    </v-chip>
                  </div>
                </div>
                <v-sparkline
                  :key="report.id"
                  :labels="report.labels"
                  :model-value="report.dataset"
                  color="primary"
                  :gradient="['#0891b2', '#06b6d4']"
                  gradient-direction="top"
                  line-width="3"
                  padding="16"
                  smooth
                />
                <div class="report-card__highlight">{{ report.highlight }}</div>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item value="efficiency">
          <v-row>
            <v-col v-for="(item, index) in efficiencyReports" :key="item.title" cols="12" md="4">
              <v-card class="efficiency-card" elevation="0">
                <div class="efficiency-card__score">
                  <span class="score-label">Verimlilik puanı</span>
                  <span class="score-value">{{ item.score }} / 100</span>
                  <v-progress-linear :model-value="item.score" color="teal" height="8" rounded />
                </div>
                <div class="efficiency-card__body">
                  <div class="card-title">{{ item.title }}</div>
                  <p>{{ item.description }}</p>
                  <ul>
                    <li v-for="improvement in item.improvements" :key="improvement">{{ improvement }}</li>
                  </ul>
                </div>
                <div class="efficiency-card__badge">Rapor #{{ index + 1 }}</div>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item value="alerts">
          <v-row>
            <v-col cols="12" md="6">
              <v-card class="alerts-card" elevation="0">
                <div class="alerts-title">Anomali özeti</div>
                <v-list density="compact">
                  <v-list-item v-for="alert in alertReports" :key="alert.title" class="alerts-item">
                    <template #prepend>
                      <v-avatar size="36" class="severity-avatar" :class="`severity-${alert.severity}`">
                        <v-icon size="20">report</v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-title>{{ alert.title }}</v-list-item-title>
                    <v-list-item-subtitle>
                      <span class="alerts-location">{{ alert.location }}</span>
                      <span>— {{ alert.description }}</span>
                    </v-list-item-subtitle>
                    <template #append>
                      <v-chip size="small" variant="outlined" :class="`severity-${alert.severity}`">
                        {{ alert.severity }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card class="action-card" elevation="0">
                <div class="action-title">Eylem Planı</div>
                <v-timeline side="end" density="compact">
                  <v-timeline-item
                    v-for="alert in alertReports"
                    :key="`${alert.title}-timeline`"
                    dot-color="primary"
                    size="small"
                  >
                    <div class="timeline-heading">{{ alert.title }}</div>
                    <ul>
                      <li v-for="action in alert.actions" :key="action">{{ action }}</li>
                    </ul>
                  </v-timeline-item>
                </v-timeline>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item value="sustainability">
          <v-row>
            <v-col v-for="item in sustainabilityReports" :key="item.title" cols="12" md="4">
              <v-card class="sustain-card" elevation="0">
                <div class="card-title">{{ item.title }}</div>
                <p>{{ item.details }}</p>
                <div class="sustain-target">{{ item.target }}</div>
                <v-progress-circular
                  :model-value="item.progress"
                  color="green"
                  size="110"
                  width="12"
                  rotate="-90"
                >
                  <strong>{{ item.progress }}%</strong>
                </v-progress-circular>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </v-card>

    <section class="ai-section">
      <div class="ai-section__intro">
        <div class="ai-chip">AI destekli raporlar</div>
        <h2>Yapay zekâ kürasyonu ile sahada şov yapan öngörüler</h2>
        <p>
          Büyük dil modelleri 3,2 milyar satırlık sensör telemetrisi üzerinde gece gündüz tarama yaparak insan
          uzmanların radarına bile takılmadan geçen senaryoları aydınlatıyor. AI, sadece anormallikleri bulmakla
          kalmıyor; hikâyeleştirip hangi ekip ne zaman sahaya çıkmalı sorusuna dakik cevap veriyor.
        </p>
      </div>
      <v-row>
        <v-col v-for="report in aiReports" :key="report.title" cols="12" md="4">
          <v-card class="ai-card" elevation="0">
            <div class="ai-card__header">
              <v-avatar size="40" color="primary" variant="tonal">
                <v-icon size="22">auto_awesome</v-icon>
              </v-avatar>
              <div>
                <div class="ai-card__title">{{ report.title }}</div>
                <div class="ai-card__confidence">{{ report.confidence }}</div>
              </div>
            </div>
            <p class="ai-card__narrative">{{ report.narrative }}</p>
            <ul class="ai-card__list">
              <li v-for="item in report.highlights" :key="item">{{ item }}</li>
            </ul>
            <div class="ai-card__action">{{ report.action }}</div>
          </v-card>
        </v-col>
      </v-row>
      <div class="ai-data-grid">
        <v-card class="ai-data-card" elevation="0">
          <div class="ai-data-card__header">
            <div class="ai-data-chip">AI veri tamamlama özeti</div>
            <p>
              Eksik paketler geçmiş tüketim desenleriyle yeniden hesaplandı. Tablo satırlarında "AI doldurma"
              etiketi gösterilerek manuel ve tahmini veriler ayrıştırıldı.
            </p>
          </div>
          <v-table class="ai-data-table" density="comfortable">
            <thead>
              <tr>
                <th>Sayaç</th>
                <th>Doldurulan satır</th>
                <th>Açıklama</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in aiRecoverySummary" :key="item.meter">
                <td>
                  <div class="ai-meter-id">{{ item.meter }}</div>
                  <v-chip size="x-small" color="primary" variant="tonal">AI doldurma</v-chip>
                </td>
                <td class="ai-filled-rows">{{ item.filledRows }} satır</td>
                <td>{{ item.explanation }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
        <v-card class="ai-forecast-card" elevation="0">
          <div class="ai-forecast-card__header">
            <div class="ai-data-chip ai-data-chip--forecast">AI tahminleri</div>
            <p>
              Model çıktılarına göre saha ekipleri için ileriye dönük aksiyon maddeleri belirlendi. Her içgörü geçmiş
              veri ile karşılaştırılarak güven puanı hesaplandı.
            </p>
          </div>
          <v-list class="ai-forecast-list" density="comfortable">
            <v-list-item v-for="insight in aiForecastInsights" :key="insight.title">
              <template #prepend>
                <v-avatar size="32" color="secondary" variant="tonal">
                  <v-icon size="18">insights</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ insight.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ insight.detail }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </div>
    </section>

    <section class="reports-bottom">
      <v-card class="matrix-card" elevation="0">
        <div class="matrix-header">
          <div>
            <h2>Kesişen rapor matrisi</h2>
            <p>
              Tesis yöneticileri, tek ekran üzerinden hem tüketim trendlerini hem de sürdürülebilirlik hedeflerini
              kıyaslayabilir.
            </p>
          </div>
          <v-btn color="primary" prepend-icon="file_download" variant="flat">PDF indir</v-btn>
        </div>
        <v-table class="matrix-table" density="comfortable">
          <thead>
            <tr>
              <th>Rapor</th>
              <th>Öne çıkan metrik</th>
              <th>Son durum</th>
              <th>Sorumlu ekip</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Su kullanım trendi</td>
              <td>Son 7 gün ort. 4.920 m³</td>
              <td class="status-positive">Artış kontrol altında</td>
              <td>Şebeke Operasyon</td>
            </tr>
            <tr>
              <td>Elektrik pik yönetimi</td>
              <td>16:00 zirvesi 95 MW</td>
              <td class="status-warning">Talep yanıtı devrede</td>
              <td>Enerji Odası</td>
            </tr>
            <tr>
              <td>Kaçak tespiti</td>
              <td>18 aktif vaka</td>
              <td class="status-alert">4 saha ziyareti beklemede</td>
              <td>Saha Bakım</td>
            </tr>
            <tr>
              <td>Karbon azaltımı</td>
              <td>Yıllık %8,1 düşüş</td>
              <td class="status-positive">Hedefe uygun</td>
              <td>Sürdürülebilirlik Ofisi</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </section>
  </v-container>
</template>

<style scoped>
.reports-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  color: var(--text-color);
}

.reports-header {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  align-items: stretch;
}

.header-intro {
  background: var(--surface-card);
  border-radius: 20px;
  padding: 28px;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-chip {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-weight: 700;
  color: var(--muted-text);
}

.header-intro h1 {
  margin: 0;
  font-size: 26px;
  color: var(--heading-color);
}

.header-intro p {
  margin: 0;
  color: var(--muted-text);
  line-height: 1.5;
}

.header-meta {
  display: flex;
  gap: 12px;
  font-size: 14px;
  color: var(--muted-text);
  align-items: baseline;
}

.header-meta .meta-value {
  font-weight: 600;
  color: var(--accent-color);
}

.header-metrics {
  background: var(--surface-card);
  border-radius: 20px;
  padding: 22px 24px;
  box-shadow: var(--card-shadow);
}

.metric-card {
  background: var(--surface-elevated);
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid var(--border-soft);
}

.metric-label {
  font-size: 13px;
  color: var(--muted-text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--heading-color);
}

.metric-trend {
  font-size: 13px;
  font-weight: 600;
}

.trend-positive {
  color: #047857;
}

.trend-neutral {
  color: var(--muted-text);
}

.trend-alert {
  color: #b91c1c;
}

.reports-tabs {
  border-radius: 20px;
  overflow: hidden;
  background: var(--surface-card);
  box-shadow: var(--card-shadow);
}

.tab-bar {
  padding: 8px 16px;
}

.tab-content {
  padding: 24px;
}

.report-card,
.efficiency-card,
.alerts-card,
.action-card,
.sustain-card {
  background: var(--surface-elevated);
  border-radius: 16px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--border-soft);
}

.report-card__head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.report-card__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--heading-color);
}

.report-card__subtitle {
  font-size: 13px;
  color: var(--muted-text);
}

.report-card__badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.report-card__highlight {
  background: var(--note-surface);
  border-radius: 12px;
  padding: 14px;
  font-size: 13px;
  color: var(--text-color);
  line-height: 1.4;
}

.efficiency-card__score {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.score-label {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--muted-text);
}

.score-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--heading-color);
}

.efficiency-card__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--text-color);
}

.efficiency-card__body p {
  margin: 0;
  color: var(--muted-text);
}

.efficiency-card__body ul {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.efficiency-card__badge {
  align-self: flex-end;
  font-size: 11px;
  text-transform: uppercase;
  color: var(--muted-text);
  letter-spacing: 0.6px;
}

.alerts-card {
  gap: 12px;
}

.alerts-title,
.action-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--heading-color);
}

.alerts-item {
  border-radius: 12px;
}

.alerts-item + .alerts-item {
  margin-top: 4px;
}

.alerts-location {
  color: var(--accent-color);
  font-weight: 600;
}

.severity-avatar {
  background: var(--accent-surface);
  color: var(--accent-color);
}

.severity-kritik {
  background: rgba(239, 68, 68, 0.16) !important;
  color: #b91c1c !important;
}

.severity-orta {
  background: rgba(251, 191, 36, 0.2) !important;
  color: #b45309 !important;
}

.severity-düşük {
  background: rgba(59, 130, 246, 0.18) !important;
  color: #1d4ed8 !important;
}

.action-card {
  gap: 12px;
}

.timeline-heading {
  font-weight: 600;
  color: var(--heading-color);
  margin-bottom: 4px;
}

.sustain-card {
  align-items: flex-start;
}

.sustain-card .card-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--heading-color);
}

.sustain-card p {
  margin: 0;
  color: var(--muted-text);
  line-height: 1.45;
}

.sustain-target {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--muted-text);
}

.ai-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.ai-section__intro {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.16), rgba(14, 116, 144, 0.08));
  border: 1px solid rgba(8, 145, 178, 0.2);
  border-radius: 20px;
  padding: 28px;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-chip {
  align-self: flex-start;
  background: rgba(8, 145, 178, 0.12);
  color: #036672;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 6px 12px;
  border-radius: 999px;
}

.ai-section__intro h2 {
  margin: 0;
  font-size: 24px;
  color: var(--heading-color);
}

.ai-section__intro p {
  margin: 0;
  color: var(--muted-text);
  line-height: 1.6;
}

.ai-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: var(--surface-card);
  border-radius: 18px;
  border: 1px solid rgba(8, 145, 178, 0.15);
  box-shadow: var(--card-shadow);
}

.ai-card__header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ai-card__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--heading-color);
}

.ai-card__confidence {
  font-size: 13px;
  color: #0891b2;
  font-weight: 600;
}

.ai-card__narrative {
  margin: 0;
  color: var(--text-color);
  line-height: 1.6;
}

.ai-card__list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--muted-text);
}

.ai-card__action {
  margin-top: auto;
  font-weight: 600;
  color: #0f766e;
  background: rgba(15, 118, 110, 0.08);
  border-radius: 12px;
  padding: 12px 16px;
  line-height: 1.5;
}


.ai-data-grid {
  margin-top: 8px;
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  align-items: stretch;
}

.ai-data-card,
.ai-forecast-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: var(--surface-card);
  border-radius: 18px;
  border: 1px solid rgba(8, 145, 178, 0.15);
  box-shadow: var(--card-shadow);
}

.ai-data-card__header,
.ai-forecast-card__header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-data-card__header p,
.ai-forecast-card__header p {
  margin: 0;
  color: var(--muted-text);
  line-height: 1.5;
}

.ai-data-chip {
  align-self: flex-start;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  background: rgba(8, 145, 178, 0.12);
  color: #036672;
}

.ai-data-chip--forecast {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}

.ai-data-table thead th {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted-text);
}

.ai-data-table tbody td {
  vertical-align: top;
  padding-top: 16px;
  padding-bottom: 16px;
  color: var(--text-color);
}

.ai-meter-id {
  font-weight: 600;
  color: var(--heading-color);
  margin-bottom: 6px;
}

.ai-filled-rows {
  font-weight: 600;
  color: #0f766e;
}

.ai-forecast-list {
  background: transparent;
  padding: 0;
}

.ai-forecast-list .v-list-item {
  padding-left: 12px;
  padding-right: 12px;
}

.ai-forecast-list .v-list-item-title {
  font-weight: 600;
  color: var(--heading-color);
}

.ai-forecast-list .v-list-item-subtitle {
  white-space: normal;
  line-height: 1.5;
  color: var(--muted-text);
}

.reports-bottom {
  display: flex;
}

.matrix-card {
  width: 100%;
  background: var(--surface-card);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.matrix-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.matrix-header h2 {
  margin: 0;
  font-size: 22px;
  color: var(--heading-color);
}

.matrix-header p {
  margin: 6px 0 0;
  color: var(--muted-text);
  max-width: 520px;
}

.matrix-table {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-soft);
}

.matrix-table thead {
  background: var(--surface-elevated);
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.6px;
  color: var(--muted-text);
}

.matrix-table th,
.matrix-table td {
  padding: 14px 18px;
}

.matrix-table tbody tr:nth-child(even) {
  background: var(--surface-elevated);
}

.status-positive {
  color: #047857;
  font-weight: 600;
}

.status-warning {
  color: #b45309;
  font-weight: 600;
}

.status-alert {
  color: #b91c1c;
  font-weight: 600;
}

@media (max-width: 960px) {
  .matrix-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
