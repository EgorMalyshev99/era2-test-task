import { useCallback, useRef } from 'react'
import { toast } from 'sonner'

import { useQueueDispatch, useQueueState } from '../model/queueHooks'

import type { GenerationTask } from '@/entities/generation-task'

const UNDO_DURATION_MS = 5000

export function useQueueUndo() {
  const dispatch = useQueueDispatch()
  const { tasks } = useQueueState()
  const undoToastId = useRef<string | number | null>(null)

  const dismissUndo = useCallback(() => {
    if (undoToastId.current !== null) {
      toast.dismiss(undoToastId.current)
      undoToastId.current = null
    }
  }, [])

  const showUndoToast = useCallback(
    (message: string, snapshot: GenerationTask[]) => {
      dismissUndo()
      undoToastId.current = toast(message, {
        duration: UNDO_DURATION_MS,
        action: {
          label: 'Отменить',
          onClick: () => {
            dispatch({ type: 'RESTORE_TASKS', tasks: snapshot })
            undoToastId.current = null
          },
        },
        onDismiss: () => {
          undoToastId.current = null
        },
      })
    },
    [dismissUndo, dispatch],
  )

  const removeWithUndo = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return
      dispatch({ type: 'REMOVE', taskId })
      showUndoToast('Задача удалена', [task])
    },
    [dispatch, showUndoToast, tasks],
  )

  const clearDoneWithUndo = useCallback(() => {
    const doneTasks = tasks.filter((t) => t.status === 'done')
    if (doneTasks.length === 0) return
    dispatch({ type: 'CLEAR_DONE' })
    const count = doneTasks.length
    showUndoToast(
      `Удалено ${count} готов${count === 1 ? 'ая задача' : count < 5 ? 'ые задачи' : 'ых задач'}`,
      doneTasks,
    )
  }, [dispatch, showUndoToast, tasks])

  return { removeWithUndo, clearDoneWithUndo }
}
