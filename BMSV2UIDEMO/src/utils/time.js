const locale = 'tr-TR'

const absoluteFormatter = new Intl.DateTimeFormat(locale, {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit'
})

const timeFormatter = new Intl.DateTimeFormat(locale, {
  hour: '2-digit',
  minute: '2-digit'
})

const pluralize = (value, unit) => {
  if (value <= 0) {
    return `0 ${unit}`
  }
  return `${value} ${unit}`
}

export const toDate = (value) => {
  if (value instanceof Date) return value
  return new Date(value)
}

export const formatAbsolute = (value) => absoluteFormatter.format(toDate(value))

export const formatClock = (value) => timeFormatter.format(toDate(value))

export const formatRelative = (from, to = new Date()) => {
  const start = toDate(from)
  const end = toDate(to)
  const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000)
  const absMinutes = Math.abs(diffMinutes)
  const hours = Math.floor(absMinutes / 60)
  const minutes = absMinutes % 60
  const parts = []
  if (hours > 0) {
    parts.push(pluralize(hours, 'saat'))
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(pluralize(minutes, 'dk'))
  }
  const label = parts.join(' ')
  return diffMinutes >= 0 ? `${label} sonra` : `${label} önce`
}

export const formatRelativeAgo = (value, reference = new Date()) => {
  const text = formatRelative(value, reference)
  return text.replace('sonra', 'önce')
}

export const hoursBetween = (from, to = new Date()) => {
  const start = toDate(from)
  const end = toDate(to)
  return (end.getTime() - start.getTime()) / 3600000
}

export const startOfHour = (value) => {
  const date = toDate(value)
  date.setMinutes(0, 0, 0)
  return date
}

export const formatDayTitle = (value) => {
  const date = toDate(value)
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  }).format(date)
}
