import { TRI_STATE, getTriStateValue, nextTriState, setTriStateValue } from './triStateFilter'

const applyModeTransition = (stateRef, option, currentState, mode) => {
  if (mode === TRI_STATE.INCLUDE) {
    const next = currentState === TRI_STATE.INCLUDE ? TRI_STATE.OFF : TRI_STATE.INCLUDE
    stateRef.value = setTriStateValue(stateRef.value, option, next)
    return true
  }

  if (mode === TRI_STATE.EXCLUDE) {
    const next = currentState === TRI_STATE.EXCLUDE ? TRI_STATE.OFF : TRI_STATE.EXCLUDE
    stateRef.value = setTriStateValue(stateRef.value, option, next)
    return true
  }

  return false
}

export const createTriStateChipHelpers = (stateRef, modeRef = null) => {
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
      if (modeRef) {
        if (modeRef.value === TRI_STATE.EXCLUDE) {
          return state === TRI_STATE.EXCLUDE
            ? 'Hariç tutuluyor • tekrar tıklayınca temizler'
            : '“− filtre” ile hariç tut'
        }

        return state === TRI_STATE.INCLUDE
          ? 'Dahil ediliyor • tekrar tıklayınca temizler'
          : '“+ filtre” ile dahil et'
      }

      if (state === TRI_STATE.INCLUDE) return 'Dahil ediliyor • tekrar tıklayınca hariç tutar'
      if (state === TRI_STATE.EXCLUDE) return 'Hariç tutuluyor • tekrar tıklayınca temizler'
      return 'Tıklayınca dahil eder'
    },
    cycle: (option) => {
      const current = getState(option)
      if (modeRef && applyModeTransition(stateRef, option, current, modeRef.value)) {
        return
      }

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
