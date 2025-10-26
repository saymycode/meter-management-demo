export const TRI_STATE = {
  OFF: 'off',
  INCLUDE: 'include',
  EXCLUDE: 'exclude',
}

export const nextTriState = (current) => {
  if (current === TRI_STATE.INCLUDE) return TRI_STATE.EXCLUDE
  if (current === TRI_STATE.EXCLUDE) return TRI_STATE.OFF
  return TRI_STATE.INCLUDE
}


export const getTriStateValue = (stateMap, key) => stateMap?.[key] ?? TRI_STATE.OFF

export const setTriStateValue = (stateMap, key, value) => {
  const updated = { ...(stateMap || {}) }
  if (!value || value === TRI_STATE.OFF) {
    delete updated[key]
  } else {
    updated[key] = value
  }
  return updated
}

export const matchesTriState = (stateMap, candidate) => {
  const entries = Object.entries(stateMap || {})
  const includeEntries = entries.filter(([, state]) => state === TRI_STATE.INCLUDE)
  const excludeEntries = entries.filter(([, state]) => state === TRI_STATE.EXCLUDE)

  if (includeEntries.length) {
    const includeValues = includeEntries.map(([value]) => value)
    if (!includeValues.includes(candidate)) {
      return false
    }
  }

  if (excludeEntries.length) {
    const excludeValues = excludeEntries.map(([value]) => value)
    if (excludeValues.includes(candidate)) {
      return false
    }
  }

  return true
}
