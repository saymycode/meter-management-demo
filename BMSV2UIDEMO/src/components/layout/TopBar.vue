<template>
  <v-app-bar flat height="72" class="topbar-shell">
    <div class="topbar-context">
      <div>
        <div class="topbar-label">BAYLAN</div>
        <h2 class="topbar-title">BMS V2</h2>
      </div>
      <!-- <v-chip color="primary" class="topbar-chip" prepend-icon="bolt">
        Grid Optimizer 2.0
      </v-chip> -->
    </div>

    <!-- <v-text-field
      v-model="search"
      prepend-inner-icon="search"
      append-inner-icon="tune"
      placeholder="Sayaç, kullanıcı veya adres ara..."
      hide-details
      variant="outlined"
      density="comfortable"
      class="topbar-search"
    /> -->

    <div class="topbar-actions">
      <v-menu transition="fade-transition" location="bottom end" offset="12">
        <template #activator="{ props }">
          <div class="notification-activator">
            <v-badge
              v-if="unreadCount > 0"
              :content="unreadCount"
              color="error"
              floating
              offset-x="4"
              offset-y="4"
            >
              <v-btn v-bind="props" class="icon-btn notification-btn" variant="text">
                <v-icon size="22">notifications</v-icon>
              </v-btn>
            </v-badge>
            <v-btn
              v-else
              v-bind="props"
              class="icon-btn notification-btn"
              variant="text"
            >
              <v-icon size="22">notifications</v-icon>
            </v-btn>
          </div>
        </template>

        <v-card class="notification-menu" elevation="12">
          <div class="notification-header">
            <div>
              <p class="notification-eyebrow">Canlı bildirim akışı</p>
              <h3>Telemetri merkezi</h3>
            </div>
            <v-btn
              size="small"
              variant="tonal"
              :disabled="notifications.length === 0"
              @click="markAllRead"
            >
              Hepsini okundu işaretle
            </v-btn>
          </div>
          <v-divider class="my-3" />
          <v-list class="notification-list" lines="two" density="comfortable">
            <template v-if="notifications.length">
              <v-list-item
                v-for="notification in notifications"
                :key="notification.id"
                class="notification-item"
                @click="openNotification(notification)"
              >
                <template #prepend>
                  <div class="notification-icon" :class="severityClass(notification.tone)">
                    <v-icon size="20">{{ severityIcon(notification.tone) }}</v-icon>
                  </div>
                </template>
                <v-list-item-title>
                  <span class="notification-title">{{ notification.message }}</span>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span>{{ notification.meterLabel }} • {{ notification.zone }}</span>
                  <span class="notification-time">{{ formatRelative(notification.timestamp) }}</span>
                </v-list-item-subtitle>
                <template #append>
                  <div v-if="!notification.read" class="notification-unread" />
                </template>
              </v-list-item>
            </template>
            <div v-else class="notification-empty">
              <v-icon size="32">satellite_alt</v-icon>
              <p>Tüm sayaçlar sakin. Yeni paket gelince burada göreceksiniz.</p>
            </div>
          </v-list>
        </v-card>
      </v-menu>

      <v-btn
        class="icon-btn theme-toggle"
        variant="text"
        :aria-label="isDark ? 'Açık temaya geç' : 'Koyu temaya geç'"
        @click="toggleTheme"
      >
        <v-icon size="22">{{ themeIcon }}</v-icon>
      </v-btn>

      <v-btn class="ghost-btn" prepend-icon="event" variant="text"> </v-btn>

      <v-divider vertical class="mx-4" />

      <v-menu transition="fade-transition" location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" class="profile-btn" variant="text">
            <v-avatar size="40" class="profile-avatar">
              <v-icon size="22">manage_accounts</v-icon>
            </v-avatar>
            <div class="profile-meta">
              <span class="profile-name">Berk.Ulusoy</span>
              <span class="profile-role">Baylan.Admin</span>
            </div>
            <v-icon size="18">expand_more</v-icon>
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
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { useTelemetryStore } from '../../store/telemetry'

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)
const themeIcon = computed(() => (isDark.value ? 'sunny' : 'dark_mode'))
const telemetryStore = useTelemetryStore()
const notifications = computed(() => telemetryStore.notifications)
const unreadCount = computed(() => telemetryStore.unreadCount)

const relativeTimeFormatter = new Intl.RelativeTimeFormat('tr', { numeric: 'auto' })

const formatRelative = (timestamp) => {
  const now = Date.now()
  const target = new Date(timestamp).getTime()
  const diff = target - now
  const minutes = Math.round(diff / 60000)
  if (Math.abs(minutes) < 60) {
    return relativeTimeFormatter.format(minutes, 'minute')
  }
  const hours = Math.round(diff / 3600000)
  if (Math.abs(hours) < 24) {
    return relativeTimeFormatter.format(hours, 'hour')
  }
  const days = Math.round(diff / 86400000)
  return relativeTimeFormatter.format(days, 'day')
}

const severityIcon = (tone) =>
  (
    {
      info: 'sensors',
      warning: 'warning',
      alarm: 'priority_high',
    }[tone] || 'sensors'
  )

const severityClass = (tone) => `tone-${tone}`

function logout() {
  alert('Çıkış yapıldı (mock).')
}

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

const markAllRead = () => {
  telemetryStore.markAllNotificationsRead()
}

const openNotification = (notification) => {
  telemetryStore.markNotificationRead(notification.id)
  telemetryStore.setActiveMeter(notification.meterId)
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

.notification-activator {
  display: flex;
}

.notification-btn {
  position: relative;
}

.notification-menu {
  width: min(420px, 80vw);
  padding: 20px 18px;
  background: var(--surface-elevated);
  color: var(--text-color);
  border-radius: 18px;
  box-shadow: var(--accent-shadow);
  border: 1px solid var(--border-soft);
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.notification-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-size: 12px;
  color: var(--muted-text);
  margin: 0 0 4px;
}

.notification-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--heading-color);
}

.notification-list {
  max-height: 420px;
  overflow-y: auto;
  padding: 0;
}

.notification-item {
  border-radius: 14px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.notification-item:hover {
  background: var(--accent-surface);
}

.notification-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--accent-surface);
}

.notification-title {
  font-weight: 600;
  color: var(--heading-color);
}

.notification-time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 6px;
  color: var(--muted-text);
}

.notification-unread {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent-color);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.25);
}

.notification-empty {
  display: grid;
  place-items: center;
  text-align: center;
  padding: 40px 16px;
  color: var(--muted-text);
  gap: 12px;
}

.tone-info {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(37, 99, 235, 0.26));
  color: #2563eb;
}

.tone-warning {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.28), rgba(245, 158, 11, 0.35));
  color: #b45309;
}

.tone-alarm {
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.28), rgba(251, 146, 60, 0.35));
  color: #b91c1c;
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
