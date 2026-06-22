import { describe, expect, it } from 'vitest'

import { filterAndSortTasks, getActiveSummary, getStats } from './selectors'

import type { GenerationTask } from '@/entities/generation-task'

function makeTask(
  overrides: Partial<GenerationTask> & Pick<GenerationTask, 'id' | 'status'>,
): GenerationTask {
  return {
    type: 'text',
    prompt: 'hello world',
    model: 'gpt-4o',
    progress: 0,
    createdAt: Date.now(),
    etaSeconds: 30,
    durationMs: 5000,
    credits: 1,
    ...overrides,
  }
}

describe('selectors', () => {
  const tasks = [
    makeTask({ id: '1', status: 'queued', createdAt: 100, type: 'text' }),
    makeTask({ id: '2', status: 'running', createdAt: 200, type: 'image' }),
    makeTask({
      id: '3',
      status: 'done',
      createdAt: 300,
      type: 'video',
      prompt: 'other',
    }),
  ]

  it('getStats counts by status', () => {
    const stats = getStats(tasks)
    expect(stats.queued).toBe(1)
    expect(stats.running).toBe(1)
    expect(stats.done).toBe(1)
    expect(stats.total).toBe(3)
  })

  it('getActiveSummary returns active tasks and average progress', () => {
    const summary = getActiveSummary([
      makeTask({ id: '1', status: 'running', progress: 40 }),
      makeTask({ id: '2', status: 'queued', progress: 0 }),
      makeTask({ id: '3', status: 'done', progress: 100 }),
    ])

    expect(summary.count).toBe(2)
    expect(summary.averageProgress).toBe(40)
  })

  it('filterAndSortTasks filters by status, type and search', () => {
    const filtered = filterAndSortTasks(
      tasks,
      'done',
      'video',
      'newest',
      'other',
    )
    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.id).toBe('3')
  })

  it('filterAndSortTasks sorts oldest first', () => {
    const filtered = filterAndSortTasks(tasks, 'all', 'all', 'oldest', '')
    expect(filtered.map((t) => t.id)).toEqual(['1', '2', '3'])
  })
})
