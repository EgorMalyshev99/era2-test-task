import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'

import { seedTasks } from '@/entities/generation-task'

import { createQueueEngine } from './queueEngine'
import { QueueDispatchContext, QueueStateContext } from './queueHooks'
import {
  initialQueueState,
  queueReducer,
  STORAGE_KEY,
  STORAGE_VERSION,
  type QueueAction,
} from './queueReducer'

import type { GenerationTask } from '@/entities/generation-task'

function loadPersistedTasks(): GenerationTask[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      version: number
      tasks: GenerationTask[]
    }
    if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.tasks)) {
      return null
    }
    return parsed.tasks
  } catch {
    return null
  }
}

function saveTasks(tasks: GenerationTask[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: STORAGE_VERSION, tasks }),
  )
}

export function QueueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queueReducer, initialQueueState)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const engineRef = useRef<ReturnType<typeof createQueueEngine> | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getTasks = useCallback(() => stateRef.current.tasks, [])

  useEffect(() => {
    engineRef.current = createQueueEngine(getTasks, dispatch)
    return () => engineRef.current?.stopAll()
  }, [getTasks])

  useEffect(() => {
    if (state.initStatus !== 'idle') return
    dispatch({ type: 'INIT_START' })
  }, [state.initStatus])

  useEffect(() => {
    if (state.initStatus !== 'loading') return

    const timer = setTimeout(() => {
      const shouldFail = !loadPersistedTasks() && Math.random() < 0.05

      if (shouldFail) {
        dispatch({ type: 'INIT_ERROR' })
        return
      }

      const persisted = loadPersistedTasks()
      const tasks = persisted ?? seedTasks
      dispatch({ type: 'INIT_SUCCESS', tasks })
    }, 600)

    return () => clearTimeout(timer)
  }, [state.initStatus])

  useEffect(() => {
    if (state.initStatus !== 'ready') return
    engineRef.current?.sync()
  }, [state.tasks, state.initStatus])

  useEffect(() => {
    if (state.initStatus !== 'ready') return

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveTasks(state.tasks)
    }, 500)

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [state.tasks, state.initStatus])

  const wrappedDispatch = useCallback((action: QueueAction) => {
    if (action.type === 'CANCEL' || action.type === 'REMOVE') {
      engineRef.current?.onCancel(action.taskId)
    }
    dispatch(action)
  }, [])

  return (
    <QueueDispatchContext.Provider value={wrappedDispatch}>
      <QueueStateContext.Provider value={state}>
        {children}
      </QueueStateContext.Provider>
    </QueueDispatchContext.Provider>
  )
}
