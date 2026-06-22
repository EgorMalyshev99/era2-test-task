import type { SortOption, StatusFilter, TypeFilter } from './uiStore'
import type { GenerationTask } from '@/entities/generation-task'

export interface QueueStats {
  queued: number
  running: number
  done: number
  failed: number
  canceled: number
  total: number
}

export interface ActiveSummary {
  count: number
  averageProgress: number
  tasks: GenerationTask[]
}

export function getStats(tasks: GenerationTask[]): QueueStats {
  return tasks.reduce<QueueStats>(
    (acc, task) => {
      acc[task.status] += 1
      acc.total += 1
      return acc
    },
    { queued: 0, running: 0, done: 0, failed: 0, canceled: 0, total: 0 },
  )
}

export function getActiveSummary(tasks: GenerationTask[]): ActiveSummary {
  const active = tasks.filter(
    (t) => t.status === 'running' || t.status === 'queued',
  )
  const running = active.filter((t) => t.status === 'running')
  const averageProgress =
    running.length > 0
      ? Math.round(
          running.reduce((sum, t) => sum + t.progress, 0) / running.length,
        )
      : 0

  return {
    count: active.length,
    averageProgress,
    tasks: active
      .sort((a, b) => {
        if (a.status === 'running' && b.status !== 'running') return -1
        if (b.status === 'running' && a.status !== 'running') return 1
        return b.createdAt - a.createdAt
      })
      .slice(0, 3),
  }
}

export function filterAndSortTasks(
  tasks: GenerationTask[],
  statusFilter: StatusFilter,
  typeFilter: TypeFilter,
  sort: SortOption,
  search: string,
): GenerationTask[] {
  const query = search.trim().toLowerCase()

  let result = tasks.filter((task) => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false
    if (typeFilter !== 'all' && task.type !== typeFilter) return false
    if (query && !task.prompt.toLowerCase().includes(query)) return false
    return true
  })

  result = [...result].sort((a, b) =>
    sort === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt,
  )

  return result
}
