<script setup>
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { useTheme } from 'vuetify'
import Sidebar from './components/layout/Sidebar.vue'
import TopBar from './components/layout/TopBar.vue'

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)
</script>

<template>
  <v-app :class="['app-shell', isDark ? 'theme-dark' : 'theme-light']">
    <Sidebar />
    <v-main class="app-main">
      <TopBar />
      <v-container fluid class="app-content">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
.app-shell {
  --transition-speed: 0.3s;
  background: var(--app-background);
  color: var(--text-color);
  transition: background var(--transition-speed) ease, color var(--transition-speed) ease;
}

.app-main {
  background: var(--app-background);
  transition: background var(--transition-speed) ease;
}

.app-content {
  background: var(--content-background);
  color: var(--text-color);
  min-height: calc(100vh - 72px);
  transition: background var(--transition-speed) ease, color var(--transition-speed) ease;
}

.app-shell.theme-light {
  --app-background: #f4f6fb;
  --content-background: #f8fafc;
  --text-color: #0f172a;
  --muted-text: #64748b;
  --heading-color: #0f172a;
  --accent-color: #0f766e;
  --accent-highlight: #14b8a6;
  --accent-surface: rgba(15, 118, 110, 0.1);
  --accent-shadow: 0 6px 16px rgba(15, 118, 110, 0.15);
  --border-soft: rgba(15, 23, 42, 0.08);
  --border-strong: rgba(15, 23, 42, 0.14);
  --surface-card: #ffffff;
  --surface-elevated: rgba(255, 255, 255, 0.92);
  --surface-glass: rgba(255, 255, 255, 0.78);
  --card-shadow: 0 18px 38px rgba(15, 23, 42, 0.08);
  --positive-pill-bg: rgba(16, 185, 129, 0.12);
  --positive-pill-color: #047857;
  --negative-pill-bg: rgba(248, 113, 113, 0.12);
  --negative-pill-color: #b91c1c;
  --warning-soft-bg: rgba(248, 113, 113, 0.14);
  --warning-soft-color: #b91c1c;
  --region-rank-bg: rgba(14, 165, 233, 0.12);
  --region-rank-color: #0f172a;
  --note-surface: rgba(15, 23, 42, 0.04);
  --input-border: rgba(15, 118, 110, 0.18);
  --topbar-bg: #ffffff;
  --topbar-text: #0f172a;
  --topbar-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
  --sidebar-bg: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  --sidebar-text: #0f172a;
  --sidebar-muted: rgba(100, 116, 139, 0.85);
  --sidebar-link: rgba(15, 23, 42, 0.75);
  --sidebar-link-hover: #0284c7;
  --sidebar-hover-bg: rgba(14, 165, 233, 0.12);
  --sidebar-active-bg: linear-gradient(135deg, rgba(14, 165, 233, 0.95), rgba(14, 165, 233, 0.8));
  --sidebar-active-text: #ffffff;
  --sidebar-active-shadow: 0 12px 22px rgba(14, 165, 233, 0.28);
  --sidebar-border: rgba(15, 23, 42, 0.1);
  --sidebar-icon: rgba(15, 23, 42, 0.6);
  --sidebar-icon-hover: #0284c7;
  --sidebar-chip-bg: rgba(14, 165, 233, 0.12);
  --toast-positive-bg: linear-gradient(135deg, #00c853, #1de9b6);
  --toast-positive-text: #f8fafc;
  --toast-positive-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  --toast-info-bg: linear-gradient(135deg, #1976d2, #00b0ff);
  --toast-info-text: #f8fafc;
  --toast-info-shadow: 0 8px 24px rgba(15, 23, 42, 0.3);
  --toast-alarm-bg: linear-gradient(135deg, #d32f2f, #ff5252);
  --toast-alarm-text: #ffffff;
  --toast-alarm-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.app-shell.theme-dark {
  --app-background: #0b1220;
  --content-background: #0f192e;
  --text-color: #e2e8f0;
  --muted-text: #94a3b8;
  --heading-color: #f8fafc;
  --accent-color: #2dd4bf;
  --accent-highlight: #38bdf8;
  --accent-surface: rgba(45, 212, 191, 0.16);
  --accent-shadow: 0 10px 18px rgba(34, 211, 238, 0.2);
  --border-soft: rgba(148, 163, 184, 0.18);
  --border-strong: rgba(148, 163, 184, 0.28);
  --surface-card: rgba(15, 23, 42, 0.85);
  --surface-elevated: rgba(15, 23, 42, 0.65);
  --surface-glass: rgba(15, 23, 42, 0.45);
  --card-shadow: 0 24px 44px rgba(2, 12, 24, 0.55);
  --positive-pill-bg: rgba(45, 212, 191, 0.18);
  --positive-pill-color: #5eead4;
  --negative-pill-bg: rgba(248, 113, 113, 0.2);
  --negative-pill-color: #fca5a5;
  --warning-soft-bg: rgba(248, 113, 113, 0.18);
  --warning-soft-color: #fecaca;
  --region-rank-bg: rgba(56, 189, 248, 0.18);
  --region-rank-color: #f8fafc;
  --note-surface: rgba(15, 23, 42, 0.42);
  --input-border: rgba(45, 212, 191, 0.35);
  --topbar-bg: rgba(15, 23, 42, 0.92);
  --topbar-text: #e2e8f0;
  --topbar-shadow: 0 18px 36px rgba(2, 12, 24, 0.6);
  --sidebar-bg: linear-gradient(180deg, #0f172a 0%, #15243b 100%);
  --sidebar-text: rgba(226, 232, 240, 0.92);
  --sidebar-muted: rgba(148, 163, 184, 0.7);
  --sidebar-link: rgba(226, 232, 240, 0.78);
  --sidebar-link-hover: #5eead4;
  --sidebar-hover-bg: rgba(45, 212, 191, 0.18);
  --sidebar-active-bg: linear-gradient(135deg, rgba(34, 211, 238, 0.8), rgba(45, 212, 191, 0.85));
  --sidebar-active-text: #0b1220;
  --sidebar-active-shadow: 0 16px 26px rgba(34, 211, 238, 0.32);
  --sidebar-border: rgba(148, 163, 184, 0.12);
  --sidebar-icon: rgba(226, 232, 240, 0.7);
  --sidebar-icon-hover: #5eead4;
  --sidebar-chip-bg: rgba(15, 23, 42, 0.2);
  --toast-positive-bg: linear-gradient(135deg, #0ea5e9, #22d3ee);
  --toast-positive-text: #0b1220;
  --toast-positive-shadow: 0 12px 30px rgba(14, 165, 233, 0.35);
  --toast-info-bg: linear-gradient(135deg, #2563eb, #38bdf8);
  --toast-info-text: #e2e8f0;
  --toast-info-shadow: 0 12px 30px rgba(37, 99, 235, 0.35);
  --toast-alarm-bg: linear-gradient(135deg, #ef4444, #f87171);
  --toast-alarm-text: #fff7ed;
  --toast-alarm-shadow: 0 12px 30px rgba(248, 113, 113, 0.4);
}

body {
  background: var(--app-background);
  color: var(--text-color);
  transition: background var(--transition-speed) ease, color var(--transition-speed) ease;
}
</style>
