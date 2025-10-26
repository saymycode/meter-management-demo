import { TRI_STATE, getTriStateValue, nextTriState, setTriStateValue } from './triStateFilter'

export const createTriStateChipHelpers = (stateRef) => {
  const getState = (option) => getTriStateValue(stateRef.value, option)
  const isInclude = (option) => getState(option) === TRI_STATE.INCLUDE
  const isExclude = (option) => getState(option) === TRI_STATE.EXCLUDE

  return {
    isInclude,
    isExclude,
    variant: (option) => (getState(option) === TRI_STATE.OFF ? 'outlined' : 'tonal'),
    color: (baseColor, option) => {
      const state = getState(option)
      if (state === TRI_STATE.INCLUDE) return baseColor
      if (state === TRI_STATE.EXCLUDE) return 'error'
      return undefined
    },
    stateClass: (option) => ({
      'filter-chip--include': isInclude(option),
      'filter-chip--exclude': isExclude(option),
    }),
    title: (option) => {
      const state = getState(option)
      if (state === TRI_STATE.INCLUDE) return 'Dahil ediliyor • tekrar tıklayınca hariç tutar'
      if (state === TRI_STATE.EXCLUDE) return 'Hariç tutuluyor • tekrar tıklayınca temizler'
      return 'Tıklayınca dahil eder'
    },
    cycle: (option) => {
      const current = getState(option)
      const next = nextTriState(current)
      stateRef.value = setTriStateValue(stateRef.value, option, next)
    },
  }
}

export const createTriStateChipHelpersWithColor = (stateRef, baseColor) => {
  const helpers = createTriStateChipHelpers(stateRef)
  return {
    ...helpers,
    color: (option) => helpers.color(baseColor, option),
  }
}
