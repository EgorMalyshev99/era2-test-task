import type { GenerationTask } from '@/entities/generation-task'

export const MAX_CONCURRENT = 2

export const STORAGE_KEY = 'era2-generation-queue'
export const STORAGE_VERSION = 1

export type InitStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface QueueState {
  tasks: GenerationTask[]
  initStatus: InitStatus
}

export type QueueAction =
  | { type: 'INIT_START' }
  | { type: 'INIT_SUCCESS'; tasks: GenerationTask[] }
  | { type: 'INIT_ERROR' }
  | { type: 'RETRY_INIT' }
  | { type: 'TICK'; taskId: string; progress: number }
  | { type: 'COMPLETE'; taskId: string }
  | { type: 'FAIL'; taskId: string; error: string }
  | { type: 'CANCEL'; taskId: string }
  | { type: 'RETRY'; taskId: string }
  | { type: 'REMOVE'; taskId: string }
  | { type: 'CLEAR_DONE' }
  | { type: 'RESTORE_TASKS'; tasks: GenerationTask[] }
  | { type: 'REORDER_QUEUED'; activeId: string; overId: string }
  | { type: 'LOAD_STRESS_TASKS'; tasks: GenerationTask[] }
  | { type: 'SCHEDULE' }

const FAIL_MESSAGES = [
  'Недостаточно кредитов',
  'Превышено время ожидания',
  'Модель временно недоступна',
] as const

export function pickRandomFailMessage(): string {
  return FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)]!
}

export function updateQueuePositions(
  tasks: GenerationTask[],
): GenerationTask[] {
  let position = 1
  return tasks.map((task) => {
    if (task.status !== 'queued') {
      const { queuePosition, ...rest } = task
      void queuePosition
      return rest
    }
    return { ...task, queuePosition: position++ }
  })
}

export function scheduleTasks(tasks: GenerationTask[]): GenerationTask[] {
  const runningCount = tasks.filter((t) => t.status === 'running').length
  const slots = MAX_CONCURRENT - runningCount
  if (slots <= 0) return updateQueuePositions(tasks)

  const queued = tasks.filter((t) => t.status === 'queued').slice(0, slots)
  const toStart = new Set(queued.map((t) => t.id))

  const next = tasks.map((task) =>
    toStart.has(task.id)
      ? { ...task, status: 'running' as const, progress: task.progress || 0 }
      : task,
  )

  return updateQueuePositions(next)
}

export function reorderQueuedTasks(
  tasks: GenerationTask[],
  activeId: string,
  overId: string,
): GenerationTask[] {
  const activeIndex = tasks.findIndex((t) => t.id === activeId)
  const overIndex = tasks.findIndex((t) => t.id === overId)
  if (activeIndex === -1 || overIndex === -1) return tasks

  const active = tasks[activeIndex]!
  const over = tasks[overIndex]!
  if (active.status !== 'queued' || over.status !== 'queued') return tasks

  const next = [...tasks]
  const [removed] = next.splice(activeIndex, 1)
  next.splice(overIndex, 0, removed!)
  return next
}

export function queueReducer(
  state: QueueState,
  action: QueueAction,
): QueueState {
  switch (action.type) {
    case 'INIT_START':
      return { ...state, initStatus: 'loading' }

    case 'INIT_SUCCESS': {
      const tasks = updateQueuePositions(
        scheduleTasks(
          action.tasks.map((t) =>
            t.status === 'running' ? { ...t, status: 'queued' as const } : t,
          ),
        ),
      )
      return { tasks, initStatus: 'ready' }
    }

    case 'INIT_ERROR':
      return { ...state, initStatus: 'error' }

    case 'RETRY_INIT':
      return { ...state, initStatus: 'idle' }

    case 'TICK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId ? { ...t, progress: action.progress } : t,
        ),
      }

    case 'COMPLETE':
      return {
        ...state,
        tasks: updateQueuePositions(
          scheduleTasks(
            state.tasks.map((t) =>
              t.id === action.taskId
                ? { ...t, status: 'done' as const, progress: 100 }
                : t,
            ),
          ),
        ),
      }

    case 'FAIL':
      return {
        ...state,
        tasks: updateQueuePositions(
          scheduleTasks(
            state.tasks.map((t) =>
              t.id === action.taskId
                ? {
                    ...t,
                    status: 'failed' as const,
                    error: action.error,
                  }
                : t,
            ),
          ),
        ),
      }

    case 'CANCEL':
      return {
        ...state,
        tasks: updateQueuePositions(
          scheduleTasks(
            state.tasks.map((t) =>
              t.id === action.taskId
                ? {
                    ...t,
                    status: 'canceled' as const,
                    progress: 0,
                    error: undefined,
                  }
                : t,
            ),
          ),
        ),
      }

    case 'RETRY':
      return {
        ...state,
        tasks: updateQueuePositions(
          scheduleTasks(
            state.tasks.map((t) =>
              t.id === action.taskId
                ? {
                    ...t,
                    status: 'queued' as const,
                    progress: 0,
                    error: undefined,
                    createdAt: Date.now(),
                  }
                : t,
            ),
          ),
        ),
      }

    case 'REMOVE':
      return {
        ...state,
        tasks: updateQueuePositions(
          scheduleTasks(state.tasks.filter((t) => t.id !== action.taskId)),
        ),
      }

    case 'CLEAR_DONE':
      return {
        ...state,
        tasks: updateQueuePositions(
          state.tasks.filter((t) => t.status !== 'done'),
        ),
      }

    case 'RESTORE_TASKS': {
      const existingIds = new Set(state.tasks.map((t) => t.id))
      const restored = action.tasks.filter((t) => !existingIds.has(t.id))
      if (restored.length === 0) return state
      return {
        ...state,
        tasks: updateQueuePositions(
          scheduleTasks([...state.tasks, ...restored]),
        ),
      }
    }

    case 'REORDER_QUEUED':
      return {
        ...state,
        tasks: updateQueuePositions(
          scheduleTasks(
            reorderQueuedTasks(state.tasks, action.activeId, action.overId),
          ),
        ),
      }

    case 'LOAD_STRESS_TASKS':
      return {
        ...state,
        tasks: updateQueuePositions(
          scheduleTasks([...state.tasks, ...action.tasks]),
        ),
      }

    case 'SCHEDULE':
      return {
        ...state,
        tasks: updateQueuePositions(scheduleTasks(state.tasks)),
      }

    default:
      return state
  }
}

export const initialQueueState: QueueState = {
  tasks: [],
  initStatus: 'idle',
}
