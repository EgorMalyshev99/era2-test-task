import { useDeferredValue, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useQueueActions, useQueueDispatch, useQueueState } from './queueHooks'
import { filterAndSortTasks, getActiveSummary, getStats } from './selectors'
import { useUiStore } from './uiStore'

export function useQueue() {
  const { tasks, initStatus } = useQueueState()
  const actions = useQueueActions()
  const dispatch = useQueueDispatch()

  const { statusFilter, typeFilter, sort, search } = useUiStore(
    useShallow((s) => ({
      statusFilter: s.statusFilter,
      typeFilter: s.typeFilter,
      sort: s.sort,
      search: s.search,
    })),
  )

  const deferredSearch = useDeferredValue(search)

  const stats = useMemo(() => getStats(tasks), [tasks])
  const activeSummary = useMemo(() => getActiveSummary(tasks), [tasks])
  const filteredTasks = useMemo(
    () =>
      filterAndSortTasks(tasks, statusFilter, typeFilter, sort, deferredSearch),
    [tasks, statusFilter, typeFilter, sort, deferredSearch],
  )

  return {
    tasks,
    filteredTasks,
    stats,
    activeSummary,
    initStatus,
    isLoading: initStatus === 'loading' || initStatus === 'idle',
    isError: initStatus === 'error',
    isReady: initStatus === 'ready',
    actions,
    dispatch,
  }
}
