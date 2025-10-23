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
  { title: 'Dashboard', icon: 'space_dashboard', to: '/homeview' },
  { title: 'Elektrik', icon: 'bolt', to: '/electricity' },
  { title: 'Su', icon: 'water_drop', to: '/water' },
  { title: 'Sensör', icon: 'sensors', to: '/sensor' },
  { title: 'Ayarlar', icon: 'settings', to: '/settings' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@400;600&display=swap');

.sidebar-shell {
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  padding: 20px 12px;
  border-right: 1px solid var(--sidebar-border);
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
  background: linear-gradient(135deg, var(--accent-color), var(--accent-highlight));
  color: white;
  box-shadow: var(--accent-shadow);
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
  color: var(--sidebar-text);
}

.brand-subtitle {
  font-size: 11px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--sidebar-muted);
}

.sidebar-divider {
  margin: 14px 0 10px;
  border-color: var(--sidebar-border) !important;
}

.section-label {
  font-size: 11px;
  color: var(--sidebar-muted);
  letter-spacing: 0.6px;
  font-weight: 600;
  margin-bottom: 10px;
}

.sidebar-item {
  margin-bottom: 6px;
  color: var(--sidebar-link);
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: all 0.3s ease;
  justify-content: flex-start;
}

.sidebar-item:hover {
  background: var(--sidebar-hover-bg);
  color: var(--sidebar-link-hover);
  transform: translateX(4px);
}

.active-item {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
  box-shadow: var(--sidebar-active-shadow);
}

.sidebar-icon {
  font-family: 'Material Symbols Outlined';
  font-size: 24px;
  color: var(--sidebar-icon);
  transition:
    color 0.3s ease,
    transform 0.3s ease;
}

.sidebar-item:hover .sidebar-icon {
  color: var(--sidebar-icon-hover);
  transform: translateX(2px);
}

.active-icon {
  color: var(--sidebar-active-text) !important;
}

.sidebar-chip {
  background: var(--sidebar-chip-bg);
  color: var(--sidebar-active-text);
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
