import { TRI_STATE, getTriStateValue, setTriStateValue } from './triStateFilter'

const toggleState = (stateRef, option, targetState) => {
  const current = getTriStateValue(stateRef.value, option)
  const nextState = current === targetState ? TRI_STATE.OFF : targetState
  stateRef.value = setTriStateValue(stateRef.value, option, nextState)
}

export const createTriStateChipHelpers = (stateRef) => {
  const getState = (option) => getTriStateValue(stateRef.value, option)
  const isInclude = (option) => getState(option) === TRI_STATE.INCLUDE
  const isExclude = (option) => getState(option) === TRI_STATE.EXCLUDE
  const isOff = (option) => getState(option) === TRI_STATE.OFF

  const includeTitle = (option) =>
    isInclude(option)
      ? 'Dahil edilen filtreyi kaldır'
      : 'Bu değeri “+” ile filtreye dahil et'

  const excludeTitle = (option) =>
    isExclude(option)
      ? 'Hariç tutmayı kaldır'
      : 'Bu değeri “−” ile filtre dışı bırak'

  return {
    isInclude,
    isExclude,
    stateClass: (option) => ({
      'filter-pill--include': isInclude(option),
      'filter-pill--exclude': isExclude(option),
    }),
    includeTitle,
    excludeTitle,
    toggleInclude: (option) => toggleState(stateRef, option, TRI_STATE.INCLUDE),
    toggleExclude: (option) => toggleState(stateRef, option, TRI_STATE.EXCLUDE),
    clear: (option) => {
      if (!isOff(option)) {
        stateRef.value = setTriStateValue(stateRef.value, option, TRI_STATE.OFF)
      }
    },
    isOff,
  }
}
