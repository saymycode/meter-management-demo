<template>
  <div>
    <!-- Global Quick Filter -->
    <v-text-field
      v-model="quickFilterText"
      label="Genel Arama"
      variant="outlined"
      hide-details
      density="comfortable"
      class="mb-2"
      clearable
    />

    <!-- AG Grid -->
    <ag-grid-vue
      class="ag-theme-alpine"
      style="height: 600px; width: 100%"
      :columnDefs="columnDefs"
      :rowData="tools"
      :quickFilterText="quickFilterText"
      :groupDisplayType="'groupRows'"
      :autoGroupColumnDef="autoGroupColumnDef"
      rowGroupPanelShow="always"
      animateRows="true"
      groupSelectsChildren="true"
      rowSelection="multiple"
      :localeText="localeText"
      :defaultColDef="defaultColDef"
      pagination
      :paginationPageSize="5"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

// AG Grid modüllerini kaydet
ModuleRegistry.registerModules([AllCommunityModule])

// Quick filter metni
const quickFilterText = ref('')

// Kolonlar
const columnDefs = ref([
  { field: 'type', headerName: 'Tip', rowGroup: true, hide: true },
  { field: 'name', headerName: 'Ürün Kodu', filter: true },
  { field: 'Consumption', headerName: 'Tüketim (m³)', filter: 'agNumberColumnFilter' },
  { field: 'commandIndex', headerName: 'Komut İndeksi', filter: 'agNumberColumnFilter' },
  { field: 'status', headerName: 'Durum', filter: true },
])

// Default kolon ayarları
const defaultColDef = {
  filter: true,
  sortable: true,
  flex: 1,
}

// Gruplama kolonu
const autoGroupColumnDef = ref({
  headerName: 'Cihaz Tipi',
  field: 'type',
  cellRenderer: 'agGroupCellRenderer',
  cellRendererParams: { checkbox: true },
})

// Veri
const tools = ref([
  { name: '20001', Consumption: 0.5, commandIndex: 30, status: 'Aktif', type: 'LoRa' },
  { name: '20002', Consumption: 0.2, commandIndex: 20, status: 'Pasif', type: 'GPRS' },
  { name: '20003', Consumption: 1.5, commandIndex: 25, status: 'Aktif', type: 'NBIOT' },
  { name: '20004', Consumption: 0.7, commandIndex: 50, status: 'Pasif', type: 'LoRa' },
  { name: '20005', Consumption: 0.3, commandIndex: 10, status: 'Aktif', type: 'GPRS' },
  { name: '20006', Consumption: 0.4, commandIndex: 60, status: 'Pasif', type: 'NBIOT' },
  { name: '20007', Consumption: 0.6, commandIndex: 25, status: 'Aktif', type: 'LoRa' },
  { name: '20008', Consumption: 0.3, commandIndex: 15, status: 'Pasif', type: 'GPRS' },
  { name: '20009', Consumption: 2.0, commandIndex: 30, status: 'Aktif', type: 'NBIOT' },
  { name: '20010', Consumption: 0.5, commandIndex: 15, status: 'Pasif', type: 'LoRa' },
])

// Türkçe locale metinleri
const localeText = {
  // Genel
  loadingOoo: 'Yükleniyor...',
  noRowsToShow: 'Gösterilecek kayıt yok',

  // Filtre metinleri
  contains: 'İçerir',
  notContains: 'İçermez',
  equals: 'Eşittir',
  notEqual: 'Eşit değildir',
  startsWith: 'İle başlar',
  endsWith: 'İle biter',
  lessThan: 'Küçüktür',
  greaterThan: 'Büyüktür',
  lessThanOrEqual: 'Küçük veya eşittir',
  greaterThanOrEqual: 'Büyük veya eşittir',
  inRange: 'Arasında',
  blank: 'Boş',
  notBlank: 'Boş değil',
  applyFilter: 'Uygula',
  resetFilter: 'Sıfırla',
  clearFilter: 'Temizle',

  // Sayfalama metinleri
  page: 'Sayfa',
  more: 'Daha fazla',
  to: '→',
  of: '/',
  next: 'Sonraki',
  last: 'Son',
  first: 'İlk',
  previous: 'Önceki',
  loading: 'Yükleniyor...',

  // Diğer
  selectAll: 'Tümünü Seç',
  searchOoo: 'Ara...',
  group: 'Grupla',
  ungroup: 'Grubu kaldır',
}
</script>

<style scoped>
.ag-theme-alpine {
  --ag-font-size: 14px;
  --ag-header-foreground-color: #444;
}
</style>
