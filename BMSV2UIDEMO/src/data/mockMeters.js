export const organizationProfile = {
  id: 'aski',
  name: 'ASKİ Yönetim Merkezi',
  scope: 'ASKİ',
  region: 'Ankara',
  description:
    'ASKİ sayaçları LoRa ve GPRS ağları üzerinden gün içinde rastgele saatlerde veri gönderir. Tüm paneller kurum kapsamında filtrelenir ve başka bir organizasyonun verisi bu ekranda yer almaz.',
  tagline: 'Günlük pencere tabanlı sayaç izlemesi',
}

export const referenceNow = '2025-01-14T10:30:00+03:00'

const createRandomGenerator = (seed) => {
  let state = seed % 2147483647
  if (state <= 0) state += 2147483646
  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

const pad = (value) => String(value).padStart(2, '0')

const toAnkaraTimestamp = (baseTimestamp, minutesOffset) => {
  const timestamp = baseTimestamp - minutesOffset * 60 * 1000
  const adjusted = new Date(timestamp + 3 * 60 * 60 * 1000)
  const year = adjusted.getUTCFullYear()
  const month = pad(adjusted.getUTCMonth() + 1)
  const day = pad(adjusted.getUTCDate())
  const hour = pad(adjusted.getUTCHours())
  const minute = pad(adjusted.getUTCMinutes())
  const second = pad(adjusted.getUTCSeconds())
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+03:00`
}

const randomBetween = (random, min, max) => random() * (max - min) + min

const buildHistory = (random) =>
  Array.from({ length: 5 }, () => Number(randomBetween(random, 90, 110).toFixed(1)))

const waterZones = [
  { zone: 'Çankaya DMA-1', district: 'Çankaya', label: 'Kızılay Mah.', lat: 39.9208, lng: 32.8541 },
  { zone: 'Çankaya DMA-3', district: 'Çankaya', label: 'Maltepe Mah.', lat: 39.9182, lng: 32.8372 },
  { zone: 'Yenimahalle Batı', district: 'Yenimahalle', label: 'Demetevler Mah.', lat: 39.9713, lng: 32.7575 },
  { zone: 'Sincan Sanayi', district: 'Sincan', label: 'Temelli OSB', lat: 39.9099, lng: 32.4898 },
  { zone: 'Mamak Doğu', district: 'Mamak', label: 'Natoyolu Mah.', lat: 39.9334, lng: 32.9113 },
  { zone: 'Keçiören Kuzey', district: 'Keçiören', label: 'Esertepe Mah.', lat: 40.0017, lng: 32.8703 },
  { zone: 'Beypazarı Hat', district: 'Beypazarı', label: 'Bağözü Mah.', lat: 40.1652, lng: 31.9199 },
  { zone: 'Gölbaşı Güney', district: 'Gölbaşı', label: 'Taşpınar Mah.', lat: 39.7682, lng: 32.8026 },
  { zone: 'Etimesgut Batı', district: 'Etimesgut', label: 'Elvankent Mah.', lat: 39.9471, lng: 32.6367 },
  { zone: 'Polatlı Hat', district: 'Polatlı', label: 'Zafer Mah.', lat: 39.584, lng: 32.1413 },
]

const electricZones = [
  { zone: 'Etimesgut Enerji', district: 'Etimesgut', label: 'Elvankent Trafo', lat: 39.9471, lng: 32.6367 },
  { zone: 'Polatlı Şebeke', district: 'Polatlı', label: 'Zafer Trafo', lat: 39.584, lng: 32.1413 },
  { zone: 'Altındağ Sanayi', district: 'Altındağ', label: 'Siteler Trafo', lat: 39.9541, lng: 32.8748 },
  { zone: 'Ostim Enerji', district: 'Yenimahalle', label: 'Ostim OSB', lat: 39.974, lng: 32.7685 },
  { zone: 'Kazan Besleme', district: 'Kahramankazan', label: 'Saray Trafo', lat: 40.1964, lng: 32.6839 },
  { zone: 'Ayaş İletim', district: 'Ayaş', label: 'Ayaş Merkezi', lat: 40.0165, lng: 32.3372 },
  { zone: 'Pursaklar Dağıtım', district: 'Pursaklar', label: 'Altınova Trafo', lat: 40.0421, lng: 32.9012 },
  { zone: 'Elmadağ Besleme', district: 'Elmadağ', label: 'Hasanoğlan Trafo', lat: 39.9204, lng: 33.1152 },
  { zone: 'Gölbaşı Enerji', district: 'Gölbaşı', label: 'Karataş Trafo', lat: 39.7682, lng: 32.8026 },
  { zone: 'Şereflikoçhisar Şebeke', district: 'Şereflikoçhisar', label: 'Balışeyh Trafo', lat: 38.9383, lng: 33.5384 },
]

const createMeterRecords = (type, count, seed, zones) => {
  const random = createRandomGenerator(seed)
  const baseTime = Date.parse(referenceNow)
  const records = []

  for (let index = 0; index < count; index += 1) {
    const zone = zones[index % zones.length]
    const commMethod = random() > 0.55 ? 'LoRa' : 'GPRS'
    const minutesAgo = Math.round(randomBetween(random, 0, 72 * 60))
    const last24h = Number(randomBetween(random, 90, 110).toFixed(1))
    const previous24h = Number(randomBetween(random, 90, 110).toFixed(1))
    const history = buildHistory(random)
    const batteryPercent = Math.round(randomBetween(random, 55, 100))
    const signalStrength = Math.round(randomBetween(random, 78, 110))
    const latOffset = ((index % 5) - 2) * 0.002 + randomBetween(random, -0.0005, 0.0005)
    const lngOffset = ((index % 7) - 3) * 0.002 + randomBetween(random, -0.0005, 0.0005)
    const lat = Number((zone.lat + latOffset).toFixed(4))
    const lng = Number((zone.lng + lngOffset).toFixed(4))

    const idPrefix = type === 'water' ? 'AK311' : 'BYT11'
    const idBase = type === 'water' ? 10000 : 22000
    const id = `${idPrefix}-${idBase + index}`

    const record = {
      id,
      type,
      communication: commMethod,
      location: `${zone.district} • ${zone.label} ${pad((index % 20) + 1)}`,
      lastCommunication: toAnkaraTimestamp(baseTime, minutesAgo),
      consumption: {
        last24h,
        previous24h,
        history,
      },
      zone: zone.zone,
      lastReading: type === 'water' ? `${last24h.toFixed(1)} m³` : `${Math.round(last24h)} kWh`,
      battery: commMethod === 'GPRS' && type === 'electric' ? '—' : `%${batteryPercent}`,
      signal: commMethod === 'GPRS' ? `RSRP -${signalStrength} dBm` : `-${signalStrength} dBm`,
      window: 'Dinamik 24s',
      lat,
      lng,
      sparkline: history,
    }

    if (type === 'water') {
      record.prepaidCredit = Math.round(randomBetween(random, 3000, 9000))
    }

    records.push(record)
  }

  return records
}

export const meterSnapshots = [
  ...createMeterRecords('water', 103, 202401, waterZones),
  ...createMeterRecords('electric', 91, 502021, electricZones),
]

export const hourlyActivity = [
  { hour: '00', count: 36 },
  { hour: '01', count: 28 },
  { hour: '02', count: 25 },
  { hour: '03', count: 19 },
  { hour: '04', count: 31 },
  { hour: '05', count: 44 },
  { hour: '06', count: 52 },
  { hour: '07', count: 68 },
  { hour: '08', count: 75 },
  { hour: '09', count: 81 },
  { hour: '10', count: 62 },
  { hour: '11', count: 55 },
  { hour: '12', count: 48 },
  { hour: '13', count: 42 },
  { hour: '14', count: 37 },
  { hour: '15', count: 33 },
  { hour: '16', count: 29 },
  { hour: '17', count: 24 },
  { hour: '18', count: 21 },
  { hour: '19', count: 19 },
  { hour: '20', count: 17 },
  { hour: '21', count: 14 },
  { hour: '22', count: 12 },
  { hour: '23', count: 9 },
]
