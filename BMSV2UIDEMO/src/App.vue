<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import Sidebar from './components/layout/Sidebar.vue'
import TopBar from './components/layout/TopBar.vue'

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)
const route = useRoute()
const pageClass = computed(() => (route.name ? `page-${route.name}` : ''))
</script>

<template>
  <v-app :class="['app-shell', isDark ? 'theme-dark' : 'theme-light', pageClass]">
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
  --app-background: #e9eef7;
  --content-background: #f7f9fc;
  --text-color: #0f172a;
  --muted-text: #5f6b8f;
  --heading-color: #0f172a;
  --accent-color: #1d4ed8;
  --accent-highlight: #3b82f6;
  --accent-surface: rgba(37, 99, 235, 0.12);
  --accent-hover-bg: rgba(37, 99, 235, 0.16);
  --accent-gradient-start: rgba(37, 99, 235, 0.95);
  --accent-gradient-end: rgba(59, 130, 246, 0.82);
  --accent-glow: rgba(59, 130, 246, 0.2);
  --accent-shadow: 0 18px 38px rgba(37, 99, 235, 0.22);
  --border-soft: rgba(15, 23, 42, 0.08);
  --border-strong: rgba(15, 23, 42, 0.16);
  --surface-card: #ffffff;
  --surface-elevated: rgba(255, 255, 255, 0.94);
  --surface-glass: rgba(255, 255, 255, 0.82);
  --card-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  --positive-pill-bg: rgba(34, 197, 94, 0.12);
  --positive-pill-color: #047857;
  --negative-pill-bg: rgba(248, 113, 113, 0.12);
  --negative-pill-color: #b91c1c;
  --warning-soft-bg: rgba(251, 146, 60, 0.14);
  --warning-soft-color: #b45309;
  --region-rank-bg: rgba(37, 99, 235, 0.1);
  --region-rank-color: #0f172a;
  --note-surface: rgba(15, 23, 42, 0.04);
  --input-border: rgba(37, 99, 235, 0.2);
  --topbar-bg: rgba(255, 255, 255, 0.94);
  --topbar-text: #0f172a;
  --topbar-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  --sidebar-bg: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  --sidebar-text: #0f172a;
  --sidebar-muted: rgba(100, 116, 139, 0.85);
  --sidebar-link: rgba(15, 23, 42, 0.75);
  --sidebar-link-hover: var(--accent-highlight);
  --sidebar-hover-bg: var(--accent-hover-bg);
  --sidebar-active-bg: linear-gradient(135deg, var(--accent-gradient-start), var(--accent-gradient-end));
  --sidebar-active-text: #ffffff;
  --sidebar-active-shadow: var(--accent-shadow);
  --sidebar-border: rgba(15, 23, 42, 0.1);
  --sidebar-icon: rgba(15, 23, 42, 0.6);
  --sidebar-icon-hover: var(--accent-highlight);
  --sidebar-chip-bg: rgba(37, 99, 235, 0.14);
  --toast-positive-bg: linear-gradient(135deg, #16a34a, #22c55e);
  --toast-positive-text: #f8fafc;
  --toast-positive-shadow: 0 10px 24px rgba(16, 185, 129, 0.3);
  --toast-info-bg: linear-gradient(135deg, #2563eb, #3b82f6);
  --toast-info-text: #f8fafc;
  --toast-info-shadow: 0 10px 26px rgba(37, 99, 235, 0.32);
  --toast-alarm-bg: linear-gradient(135deg, #dc2626, #f97316);
  --toast-alarm-text: #ffffff;
  --toast-alarm-shadow: 0 10px 26px rgba(220, 38, 38, 0.32);
}

.app-shell.theme-dark {
  --app-background: #080f1f;
  --content-background: #101a2c;
  --text-color: #e2e8f0;
  --muted-text: #94a3b8;
  --heading-color: #f8fafc;
  --accent-color: #60a5fa;
  --accent-highlight: #93c5fd;
  --accent-surface: rgba(96, 165, 250, 0.18);
  --accent-hover-bg: rgba(96, 165, 250, 0.22);
  --accent-gradient-start: rgba(59, 130, 246, 0.9);
  --accent-gradient-end: rgba(147, 197, 253, 0.75);
  --accent-glow: rgba(96, 165, 250, 0.28);
  --accent-shadow: 0 24px 48px rgba(37, 99, 235, 0.38);
  --border-soft: rgba(148, 163, 184, 0.18);
  --border-strong: rgba(148, 163, 184, 0.28);
  --surface-card: rgba(12, 20, 34, 0.92);
  --surface-elevated: rgba(11, 19, 33, 0.68);
  --surface-glass: rgba(15, 23, 42, 0.5);
  --card-shadow: 0 28px 54px rgba(2, 8, 20, 0.65);
  --positive-pill-bg: rgba(34, 197, 94, 0.22);
  --positive-pill-color: #6ee7b7;
  --negative-pill-bg: rgba(248, 113, 113, 0.24);
  --negative-pill-color: #fecaca;
  --warning-soft-bg: rgba(249, 115, 22, 0.24);
  --warning-soft-color: #fed7aa;
  --region-rank-bg: rgba(96, 165, 250, 0.22);
  --region-rank-color: #f8fafc;
  --note-surface: rgba(15, 23, 42, 0.55);
  --input-border: rgba(96, 165, 250, 0.35);
  --topbar-bg: rgba(12, 20, 34, 0.94);
  --topbar-text: #e2e8f0;
  --topbar-shadow: 0 24px 48px rgba(2, 8, 20, 0.65);
  --sidebar-bg: linear-gradient(180deg, #0c172c 0%, #132033 100%);
  --sidebar-text: rgba(226, 232, 240, 0.92);
  --sidebar-muted: rgba(148, 163, 184, 0.72);
  --sidebar-link: rgba(226, 232, 240, 0.78);
  --sidebar-link-hover: var(--accent-highlight);
  --sidebar-hover-bg: var(--accent-hover-bg);
  --sidebar-active-bg: linear-gradient(135deg, var(--accent-gradient-start), var(--accent-gradient-end));
  --sidebar-active-text: #081021;
  --sidebar-active-shadow: var(--accent-shadow);
  --sidebar-border: rgba(148, 163, 184, 0.12);
  --sidebar-icon: rgba(226, 232, 240, 0.72);
  --sidebar-icon-hover: var(--accent-highlight);
  --sidebar-chip-bg: rgba(15, 23, 42, 0.28);
  --toast-positive-bg: linear-gradient(135deg, #0f766e, #22d3ee);
  --toast-positive-text: #0b1220;
  --toast-positive-shadow: 0 14px 32px rgba(14, 165, 233, 0.35);
  --toast-info-bg: linear-gradient(135deg, #1d4ed8, #60a5fa);
  --toast-info-text: #e2e8f0;
  --toast-info-shadow: 0 14px 32px rgba(37, 99, 235, 0.4);
  --toast-alarm-bg: linear-gradient(135deg, #f87171, #fb923c);
  --toast-alarm-text: #fff7ed;
  --toast-alarm-shadow: 0 14px 32px rgba(248, 113, 113, 0.42);
}

.app-shell.theme-light.page-electricity {
  --accent-color: #b45309;
  --accent-highlight: #f59e0b;
  --accent-surface: rgba(250, 204, 21, 0.2);
  --accent-hover-bg: rgba(250, 204, 21, 0.22);
  --accent-gradient-start: rgba(250, 204, 21, 0.92);
  --accent-gradient-end: rgba(217, 119, 6, 0.78);
  --accent-glow: rgba(250, 204, 21, 0.32);
  --accent-shadow: 0 22px 48px rgba(217, 119, 6, 0.28);
  --sidebar-chip-bg: rgba(217, 119, 6, 0.16);
  --sidebar-active-text: #1f1704;
}

.app-shell.theme-dark.page-electricity {
  --accent-color: #facc15;
  --accent-highlight: #fef08a;
  --accent-surface: rgba(234, 179, 8, 0.28);
  --accent-hover-bg: rgba(250, 204, 21, 0.3);
  --accent-gradient-start: rgba(250, 204, 21, 0.86);
  --accent-gradient-end: rgba(217, 119, 6, 0.68);
  --accent-glow: rgba(251, 191, 36, 0.36);
  --accent-shadow: 0 28px 56px rgba(217, 119, 6, 0.36);
  --sidebar-chip-bg: rgba(202, 138, 4, 0.24);
  --sidebar-active-text: #0b0a02;
}

.app-shell.theme-light.page-water {
  --accent-color: #0f4c81;
  --accent-highlight: #0ea5e9;
  --accent-surface: rgba(14, 165, 233, 0.2);
  --accent-hover-bg: rgba(14, 165, 233, 0.22);
  --accent-gradient-start: rgba(14, 165, 233, 0.9);
  --accent-gradient-end: rgba(8, 145, 178, 0.78);
  --accent-glow: rgba(14, 165, 233, 0.3);
  --accent-shadow: 0 22px 48px rgba(8, 145, 178, 0.28);
  --sidebar-chip-bg: rgba(14, 165, 233, 0.18);
}

.app-shell.theme-dark.page-water {
  --accent-color: #38bdf8;
  --accent-highlight: #7dd3fc;
  --accent-surface: rgba(56, 189, 248, 0.28);
  --accent-hover-bg: rgba(56, 189, 248, 0.32);
  --accent-gradient-start: rgba(14, 165, 233, 0.82);
  --accent-gradient-end: rgba(8, 145, 178, 0.66);
  --accent-glow: rgba(56, 189, 248, 0.34);
  --accent-shadow: 0 28px 56px rgba(14, 165, 233, 0.36);
  --sidebar-chip-bg: rgba(8, 145, 178, 0.3);
}

.app-shell.theme-light.page-sensor {
  --accent-color: #065f46;
  --accent-highlight: #10b981;
  --accent-surface: rgba(16, 185, 129, 0.2);
  --accent-hover-bg: rgba(16, 185, 129, 0.24);
  --accent-gradient-start: rgba(16, 185, 129, 0.9);
  --accent-gradient-end: rgba(5, 150, 105, 0.78);
  --accent-glow: rgba(16, 185, 129, 0.3);
  --accent-shadow: 0 22px 48px rgba(5, 150, 105, 0.28);
  --sidebar-chip-bg: rgba(16, 185, 129, 0.18);
}

.app-shell.theme-dark.page-sensor {
  --accent-color: #34d399;
  --accent-highlight: #6ee7b7;
  --accent-surface: rgba(34, 197, 94, 0.28);
  --accent-hover-bg: rgba(34, 197, 94, 0.32);
  --accent-gradient-start: rgba(16, 185, 129, 0.82);
  --accent-gradient-end: rgba(22, 163, 74, 0.68);
  --accent-glow: rgba(34, 197, 94, 0.36);
  --accent-shadow: 0 28px 56px rgba(16, 185, 129, 0.36);
  --sidebar-chip-bg: rgba(22, 163, 74, 0.3);
}

body {
  background: var(--app-background);
  color: var(--text-color);
  transition: background var(--transition-speed) ease, color var(--transition-speed) ease;
}
</style>
