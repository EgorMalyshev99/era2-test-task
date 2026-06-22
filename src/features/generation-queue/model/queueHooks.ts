import { createContext, useContext, useMemo } from 'react'

import type { QueueAction, QueueState } from './queueReducer'
import type { GenerationTask } from '@/entities/generation-task'

export const QueueStateContext = createContext<QueueState | null>(null)
export const QueueDispatchContext =
  createContext<React.Dispatch<QueueAction> | null>(null)

export function useQueueState() {
  const context = useContext(QueueStateContext)
  if (!context) {
    throw new Error('useQueueState must be used within QueueProvider')
  }
  return context
}

export function useQueueDispatch() {
  const context = useContext(QueueDispatchContext)
  if (!context) {
    throw new Error('useQueueDispatch must be used within QueueProvider')
  }
  return context
}

export function useQueueActions() {
  const dispatch = useQueueDispatch()

  return useMemo(
    () => ({
      cancel: (taskId: string) => dispatch({ type: 'CANCEL', taskId }),
      retry: (taskId: string) => dispatch({ type: 'RETRY', taskId }),
      remove: (taskId: string) => dispatch({ type: 'REMOVE', taskId }),
      clearDone: () => dispatch({ type: 'CLEAR_DONE' }),
      retryInit: () => dispatch({ type: 'RETRY_INIT' }),
      reorderQueued: (activeId: string, overId: string) =>
        dispatch({ type: 'REORDER_QUEUED', activeId, overId }),
      loadStressTasks: (tasks: GenerationTask[]) =>
        dispatch({ type: 'LOAD_STRESS_TASKS', tasks }),
    }),
    [dispatch],
  )
}
