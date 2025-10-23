<template>
  <v-navigation-drawer app permanent width="250" class="sidebar-shell">
    <div class="sidebar-brand">
      <v-avatar size="44" class="sidebar-logo">
        <v-icon size="26">mdi-flash</v-icon>
      </v-avatar>
      <div>
        <div class="brand-title">Sayaç Yönetimi</div>
        <div class="brand-subtitle">Enerji &amp; Altyapı</div>
      </div>
    </div>

    <v-divider class="sidebar-divider" />

    <v-list density="compact" nav>
      <v-list-subheader class="section-label">GENEL MODÜLLER</v-list-subheader>
      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :to="item.to"
        link
        rounded="lg"
        class="sidebar-item"
        :class="{ 'active-item': route.path === item.to }"
      >
        <template #prepend>
          <v-icon :class="['sidebar-icon', { 'active-icon': route.path === item.to }]">
            {{ item.icon }}
          </v-icon>
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
        <template v-if="item.badge" #append>
          <v-chip size="small" class="sidebar-chip">{{ item.badge }}</v-chip>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
  { title: 'Elektrik', icon: 'mdi-flash', to: '/electricity', badge: 'Canlı' },
  { title: 'Su', icon: 'mdi-water', to: '/water' },
  { title: 'Sensor', icon: 'mdi-fire', to: '/sensor' },
  { title: 'Ayarlar', icon: 'mdi-cog', to: '/settings' },
]
</script>

<style scoped>
.sidebar-shell {
  background: linear-gradient(180deg, #0f172a 0%, #15243b 100%);
  color: rgba(226, 232, 240, 0.92);
  padding: 28px 18px;
  border-right: 1px solid rgba(148, 163, 184, 0.08);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.sidebar-logo {
  background: linear-gradient(135deg, #00c853, #1de9b6);
  color: white;
  box-shadow: 0 10px 26px rgba(0, 200, 83, 0.35);
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
  color: #e2e8f0;
}

.brand-subtitle {
  font-size: 12px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.6);
}

.sidebar-divider {
  margin: 18px 0 12px;
  border-color: rgba(148, 163, 184, 0.14) !important;
}

.section-label {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.7);
  letter-spacing: 0.6px;
  font-weight: 600;
  margin-bottom: 10px;
}

.sidebar-item {
  margin-bottom: 6px;
  color: rgba(226, 232, 240, 0.78);
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: background 0.3s ease, color 0.3s ease, transform 0.3s ease;
}

.sidebar-item:hover {
  background: rgba(20, 184, 166, 0.18);
  color: #e2e8f0;
  transform: translateX(4px);
}

.active-item {
  background: linear-gradient(135deg, rgba(0, 200, 83, 0.85), rgba(29, 233, 182, 0.85));
  color: white;
  box-shadow: 0 12px 22px rgba(0, 200, 83, 0.32);
}

.sidebar-icon {
  color: rgba(226, 232, 240, 0.7);
  transition: color 0.3s ease;
}

.sidebar-item:hover .sidebar-icon {
  color: #a7f3d0;
}

.active-icon {
  color: white !important;
}

.sidebar-chip {
  background: rgba(15, 23, 42, 0.2);
  color: white;
  font-weight: 700;
  letter-spacing: 0.4px;
}
</style>
