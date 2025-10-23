<template>
  <v-navigation-drawer app :permanent="true" :width="isExpanded ? 250 : 80" class="sidebar-shell">
    <div class="sidebar-brand" @click="toggleSidebar">
      <!-- LOGO -->
      <v-avatar size="42" class="sidebar-logo">
        <span class="brand-b">B</span>
      </v-avatar>

      <transition name="fade">
        <div v-if="isExpanded" class="brand-text">
          <div class="brand-title">BMS V2</div>
          <div class="brand-subtitle">ORGANİZASYON</div>
        </div>
      </transition>
    </div>

    <v-divider class="sidebar-divider" />

    <v-list density="compact" nav>
      <v-list-subheader v-if="isExpanded" class="section-label">MODÜLLER</v-list-subheader>

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
          <span
            class="material-symbols-outlined sidebar-icon"
            :class="{ 'active-icon': route.path === item.to }"
          >
            {{ item.icon }}
          </span>
        </template>

        <transition name="fade">
          <v-list-item-title v-if="isExpanded">{{ item.title }}</v-list-item-title>
        </transition>

        <template v-if="item.badge && isExpanded" #append>
          <v-chip size="small" class="sidebar-chip">{{ item.badge }}</v-chip>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isExpanded = ref(false)
const toggleSidebar = () => (isExpanded.value = !isExpanded.value)

const menuItems = [
  { title: 'Dashboard', icon: 'space_dashboard', to: '/' },
  { title: 'Elektrik', icon: 'bolt', to: '/electricity' },
  { title: 'Su', icon: 'water_drop', to: '/water' },
  { title: 'Sensör', icon: 'sensors', to: '/sensor' },
  { title: 'Ayarlar', icon: 'settings', to: '/settings' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@400;600&display=swap');

.sidebar-shell {
  background: linear-gradient(180deg, #0f172a 0%, #15243b 100%);
  color: rgba(226, 232, 240, 0.92);
  padding: 20px 12px;
  border-right: 1px solid rgba(148, 163, 184, 0.08);
  transition: width 0.3s ease;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  margin-bottom: 18px;
  user-select: none;
}

.sidebar-logo {
  background: linear-gradient(135deg, #00c853, #1de9b6);
  color: white;
  box-shadow: 0 8px 20px rgba(0, 200, 83, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
}

.brand-b {
  font-size: 22px;
  font-weight: 800;
  color: white;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
  color: #e2e8f0;
}

.brand-subtitle {
  font-size: 11px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.55);
}

.sidebar-divider {
  margin: 14px 0 10px;
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
  transition: all 0.3s ease;
  justify-content: flex-start;
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
  font-family: 'Material Symbols Outlined';
  font-size: 24px;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
