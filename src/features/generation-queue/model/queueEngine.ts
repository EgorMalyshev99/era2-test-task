import { pickRandomFailMessage } from './queueReducer'

import type { QueueAction } from './queueReducer'
import type { GenerationTask } from '@/entities/generation-task'

type Dispatch = (action: QueueAction) => void
type GetTasks = () => GenerationTask[]

export function createQueueEngine(getTasks: GetTasks, dispatch: Dispatch) {
  const timers = new Map<string, ReturnType<typeof setInterval>>()
  const runningIds = new Set<string>()

  function clearTimer(taskId: string) {
    const timer = timers.get(taskId)
    if (timer !== undefined) {
      clearInterval(timer)
      timers.delete(taskId)
    }
    runningIds.delete(taskId)
  }

  function getStepBase(type: GenerationTask['type']): number {
    return type === 'video' || type === 'audio' ? 2 : 5
  }

  function startTask(task: GenerationTask) {
    if (timers.has(task.id)) return

    runningIds.add(task.id)
    const tickMs = 400 + Math.random() * 300

    const interval = setInterval(() => {
      const current = getTasks().find((t) => t.id === task.id)
      if (!current || current.status !== 'running') {
        clearTimer(task.id)
        return
      }

      if (current.progress > 15 && Math.random() < 0.15) {
        clearTimer(task.id)
        dispatch({
          type: 'FAIL',
          taskId: task.id,
          error: pickRandomFailMessage(),
        })
        return
      }

      const step =
        getStepBase(current.type) + Math.random() * getStepBase(current.type)
      const nextProgress = Math.min(100, current.progress + step)

      if (nextProgress >= 100) {
        clearTimer(task.id)
        dispatch({ type: 'COMPLETE', taskId: task.id })
      } else {
        dispatch({ type: 'TICK', taskId: task.id, progress: nextProgress })
      }
    }, tickMs)

    timers.set(task.id, interval)
  }

  function sync() {
    const tasks = getTasks()
    const running = tasks.filter((t) => t.status === 'running')

    for (const task of running) {
      if (!timers.has(task.id)) {
        startTask(task)
      }
    }

    for (const taskId of [...timers.keys()]) {
      const task = tasks.find((t) => t.id === taskId)
      if (!task || task.status !== 'running') {
        clearTimer(taskId)
      }
    }
  }

  function onCancel(taskId: string) {
    clearTimer(taskId)
  }

  function stopAll() {
    for (const taskId of [...timers.keys()]) {
      clearTimer(taskId)
    }
  }

  return { sync, onCancel, stopAll, clearTimer }
}
