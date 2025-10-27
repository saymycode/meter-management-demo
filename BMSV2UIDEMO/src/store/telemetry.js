import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { meterSnapshots } from '../data/mockMeters'

const cloneMeter = (meter) =>
  typeof structuredClone === 'function'
    ? structuredClone(meter)
    : JSON.parse(JSON.stringify(meter))

const severityCatalog = [
  {
    level: 'info',
    tone: 'info',
    label: 'Bilgilendirme',
    weight: 0.55,
    messages: [
      (meter, delta) =>
        `${meter.zone} hattından ${meter.id} sayaç paketi alındı. Son 24 saat tüketimi ${delta > 0 ? '+' : ''}${delta.toFixed(
          1,
        )} ${meter.type === 'water' ? 'm³' : 'kWh'} güncellendi.`,
      (meter) => `${meter.id} sayaç penceresi sağlıklı. RSSI değeri ${meter.signal}.`,
      (meter) => `${meter.zone} hattında örnekleme tamamlandı. Yeni pencere ${meter.window}.`,
    ],
  },
  {
    level: 'warning',
    tone: 'warning',
    label: 'Uyarı',
    weight: 0.3,
    messages: [
      (meter) => `${meter.id} sayaç sinyal zayıfladı (${meter.signal}). Yedek ağ izleniyor.`,
      (meter) => `${meter.zone} bölgesinde gecikme gözlendi. Paket yeniden iletim kuyruğuna alındı.`,
    ],
  },
  {
    level: 'alarm',
    tone: 'alarm',
    label: 'Alarm',
    weight: 0.15,
    messages: [
      (meter) => `${meter.id} sayaç anomali tespit etti. Şebeke dengelemesi tetiklendi.`,
      (meter) => `${meter.zone} hattında kritik olay. Operatör doğrulaması gerekiyor.`,
    ],
  },
]

const pickSeverity = () => {
  const pivot = Math.random()
  let accumulator = 0
  for (const severity of severityCatalog) {
    accumulator += severity.weight
    if (pivot <= accumulator) {
      return severity
    }
  }
  return severityCatalog.at(-1)
}

const updateHistory = (history, nextValue) => {
  const cloned = history.slice()
  cloned.push(Number(nextValue.toFixed(1)))
  return cloned.slice(-8)
}

export const useTelemetryStore = defineStore('telemetry', () => {
  const meters = ref(
    meterSnapshots.map((meter, index) => ({
      ...cloneMeter(meter),
      status: 'normal',
      healthScore: 86 + (index % 9),
      flash: false,
      uptimeHours: 6200 + index * 3,
      packetsToday: 120 + (index % 11) * 3,
    })),
  )
  const notifications = ref([])
  const liveEvents = ref([])
  const activeMeterId = ref(null)
  const simulationHandle = ref(null)
  const lastEventAt = ref(null)

  const unreadCount = computed(
    () => notifications.value.filter((notification) => !notification.read).length,
  )

  const meterCounts = computed(() => ({
    all: meters.value.length,
    water: meters.value.filter((meter) => meter.type === 'water').length,
    electric: meters.value.filter((meter) => meter.type === 'electric').length,
  }))

  const activeMeter = computed(() =>
    meters.value.find((candidate) => candidate.id === activeMeterId.value) ?? null,
  )

  const highlightedMeters = computed(() =>
    new Set(meters.value.filter((meter) => meter.flash).map((meter) => meter.id)),
  )

  const getMetersByType = (type) => {
    if (type === 'water' || type === 'electric') {
      return meters.value.filter((meter) => meter.type === type)
    }
    return meters.value
  }

  const recordEvent = (event) => {
    liveEvents.value.unshift(event)
    if (liveEvents.value.length > 32) {
      liveEvents.value.pop()
    }
    if (event.severity === 'alarm') {
      activeMeterId.value = event.meterId
    }
    lastEventAt.value = event.timestamp
  }

  const pushNotification = (notification) => {
    notifications.value.unshift(notification)
    if (notifications.value.length > 28) {
      notifications.value.pop()
    }
  }

  const randomizeMeter = (meter) => {
    const now = new Date()
    const delta = Math.random() * 6 - 2.5
    const newConsumption = Math.max(0, meter.consumption.last24h + delta)
    meter.consumption = {
      last24h: Number(newConsumption.toFixed(1)),
      previous24h: meter.consumption.last24h,
      history: updateHistory(meter.consumption.history ?? [], newConsumption),
    }
    if (meter.type === 'water') {
      meter.lastReading = `${meter.consumption.last24h.toFixed(1)} m³`
    } else {
      meter.lastReading = `${Math.round(meter.consumption.last24h)} kWh`
    }
    meter.lastCommunication = now.toISOString()
    meter.packetsToday += Math.round(Math.random() * 3)
    meter.healthScore = Math.max(65, Math.min(99, meter.healthScore + (delta > 0 ? 1 : -1)))
    const signalStrength = Math.round(78 + Math.random() * 18)
    meter.signal =
      meter.communication === 'GPRS'
        ? `RSRP -${signalStrength} dBm`
        : `-${signalStrength} dBm`
    if (meter.battery && meter.battery !== '—') {
      const numeric = Math.max(
        45,
        Math.min(100, Number(String(meter.battery).replace('%', '')) - (Math.random() > 0.7 ? 1 : 0)),
      )
      meter.battery = `%${numeric}`
    }
    meter.flash = true
    setTimeout(() => {
      meter.flash = false
    }, 6500)
    return { now, delta }
  }

  const startSimulation = () => {
    if (simulationHandle.value) {
      return
    }

    const emitPulse = () => {
      const meter = meters.value[Math.floor(Math.random() * meters.value.length)]
      if (!meter) {
        return
      }
      const { now, delta } = randomizeMeter(meter)
      const severity = pickSeverity()
      meter.status = severity.level
      const messageFactory = severity.messages[Math.floor(Math.random() * severity.messages.length)]
      const message = messageFactory(meter, delta)
      const event = {
        id: `${now.getTime()}-${meter.id}`,
        meterId: meter.id,
        meterLabel: meter.id,
        zone: meter.zone,
        type: meter.type,
        communication: meter.communication,
        timestamp: now.toISOString(),
        severity: severity.level,
        tone: severity.tone,
        message,
      }
      pushNotification({ ...event, read: false })
      recordEvent({
        ...event,
        packetsToday: meter.packetsToday,
        signal: meter.signal,
        healthScore: meter.healthScore,
      })
    }

    emitPulse()
    simulationHandle.value = setInterval(emitPulse, 5200)
  }

  const stopSimulation = () => {
    if (simulationHandle.value) {
      clearInterval(simulationHandle.value)
      simulationHandle.value = null
    }
  }

  const markNotificationRead = (id) => {
    const target = notifications.value.find((entry) => entry.id === id)
    if (target) {
      target.read = true
    }
  }

  const markAllNotificationsRead = () => {
    notifications.value.forEach((notification) => {
      notification.read = true
    })
  }

  const setActiveMeter = (meterId) => {
    activeMeterId.value = meterId
  }

  return {
    meters,
    notifications,
    liveEvents,
    unreadCount,
    meterCounts,
    highlightedMeters,
    activeMeterId,
    activeMeter,
    lastEventAt,
    getMetersByType,
    startSimulation,
    stopSimulation,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveMeter,
  }
})

export const scadaRequirements = [
  {
    title: 'Yenilenen SCADA mimarisi',
    description:
      'Çok protokollü sayaç ağlarından gelen verileri tekleştirerek operatörlere tek panelde görünürlük sağlar.',
  },
  {
    title: 'Canlı telemetri ve otomasyon',
    description:
      'Paket akışı her 5 saniyede yenilenir, otomatik senaryolar gecikme veya alarm durumlarında tetiklenir.',
  },
  {
    title: 'Coğrafi farkındalık',
    description:
      'Harita katmanı, sayaç kümelerini ve anomali noktalarını parlak katman animasyonlarıyla vurgular.',
  },
  {
    title: 'Operatör görev akışı',
    description:
      'Bildirimler SCADA ekranından kapanabilir, alarm sayaçları otomatik olarak detay panelinde odaklanır.',
  },
]
