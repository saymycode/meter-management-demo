<template>
  <v-app-bar flat height="72" class="topbar-shell">
    <div class="topbar-context">
      <div>
        <div class="topbar-label">BAYLAN</div>
        <h2 class="topbar-title">BMS V2</h2>
      </div>
      <!-- <v-chip color="primary" class="topbar-chip" prepend-icon="mdi-lightning-bolt">
        Grid Optimizer 2.0
      </v-chip> -->
    </div>

    <!-- <v-text-field
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      append-inner-icon="mdi-tune"
      placeholder="Sayaç, kullanıcı veya adres ara..."
      hide-details
      variant="outlined"
      density="comfortable"
      class="topbar-search"
    /> -->

    <div class="topbar-actions">
      <v-btn
        class="icon-btn theme-toggle"
        :icon="themeIcon"
        variant="text"
        :aria-label="isDark ? 'Açık temaya geç' : 'Koyu temaya geç'"
        @click="toggleTheme"
      />

      <v-btn class="ghost-btn" prepend-icon="mdi-calendar-clock" variant="text"> </v-btn>

      <v-divider vertical class="mx-4" />

      <v-menu transition="fade-transition" location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" class="profile-btn" variant="text">
            <v-avatar size="40" class="profile-avatar">
              <v-icon size="22">mdi-account-cog-outline</v-icon>
            </v-avatar>
            <div class="profile-meta">
              <span class="profile-name">Berk.Ulusoy</span>
              <span class="profile-role">Baylan.Admin</span>
            </div>
            <v-icon size="18">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item>
            <v-list-item-title>Profil</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Yardım</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="logout">
            <v-list-item-title class="text-red">Çıkış Yap</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useTheme } from 'vuetify'

const search = ref('')
const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)
const themeIcon = computed(() => (isDark.value ? 'mdi-weather-sunny' : 'mdi-weather-night'))

function logout() {
  alert('Çıkış yapıldı (mock).')
}

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}
</script>

<style scoped>
.topbar-shell {
  background: var(--topbar-bg);
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
  padding: 0 28px;
  box-shadow: var(--topbar-shadow);
  display: flex;
  align-items: center;
  gap: 24px;
  color: var(--topbar-text);
  transition:
    background var(--transition-speed) ease,
    color var(--transition-speed) ease,
    box-shadow var(--transition-speed) ease;
}

.topbar-context {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 220px;
}

.topbar-label {
  font-size: 12px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--muted-text);
  font-weight: 600;
}

.topbar-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--heading-color);
  margin: 0;
}

.topbar-chip {
  align-self: flex-start;
  margin-top: 2px;
  background: linear-gradient(135deg, #00c853, #1de9b6);
  color: white;
  font-weight: 600;
}

.topbar-search {
  max-width: 360px;
  flex: 0 0 360px;
  background: transparent;
}

.topbar-search :deep(.v-field) {
  border-radius: 16px;
  border: 1px solid var(--input-border);
  background: var(--surface-elevated);
  box-shadow: inset 0 2px 6px rgba(15, 23, 42, 0.08);
  transition:
    border-color var(--transition-speed) ease,
    background var(--transition-speed) ease;
}

.topbar-search :deep(.v-field__input) {
  font-size: 14px;
  color: var(--text-color);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.ghost-btn {
  color: var(--accent-color);
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.2px;
}

.icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--accent-surface);
  color: var(--accent-color);
  box-shadow: var(--accent-shadow);
  transition:
    background var(--transition-speed) ease,
    color var(--transition-speed) ease,
    box-shadow var(--transition-speed) ease;
}

.cta-btn {
  border-radius: 18px;
  padding: 0 22px;
  background: linear-gradient(135deg, #00c853, #1de9b6);
  color: white;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0.4px;
  box-shadow: 0 12px 24px rgba(0, 200, 83, 0.35);
  display: flex;
  align-items: center;
  gap: 12px;
}

.cta-chip {
  font-weight: 700;
  background: white;
  color: #028f63 !important;
  box-shadow: none;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border-radius: 20px;
  text-transform: none;
  color: var(--topbar-text);
  font-weight: 600;
  transition: color var(--transition-speed) ease;
}

.profile-avatar {
  background: linear-gradient(135deg, var(--accent-color), var(--accent-highlight));
  color: white;
  box-shadow: var(--accent-shadow);
}

.profile-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
}

.profile-name {
  font-size: 14px;
  font-weight: 700;
}

.profile-role {
  font-size: 12px;
  color: var(--muted-text);
}

.theme-toggle :deep(.v-icon) {
  transition: transform 0.3s ease;
}

.theme-toggle:hover :deep(.v-icon) {
  transform: rotate(-20deg);
}

@media (max-width: 1260px) {
  .topbar-shell {
    flex-wrap: wrap;
    padding: 16px 18px;
    gap: 16px;
  }

  .topbar-search {
    flex: 1 1 100%;
    max-width: 100%;
  }

  .topbar-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
