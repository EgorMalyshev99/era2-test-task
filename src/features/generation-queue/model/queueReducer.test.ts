import { describe, expect, it } from 'vitest'

import {
  MAX_CONCURRENT,
  initialQueueState,
  queueReducer,
  reorderQueuedTasks,
  scheduleTasks,
  updateQueuePositions,
} from './queueReducer'

import type { GenerationTask } from '@/entities/generation-task'

function makeTask(
  overrides: Partial<GenerationTask> & Pick<GenerationTask, 'id' | 'status'>,
): GenerationTask {
  return {
    type: 'text',
    prompt: 'test prompt',
    model: 'gpt-4o',
    progress: 0,
    createdAt: Date.now(),
    etaSeconds: 30,
    durationMs: 5000,
    credits: 1,
    ...overrides,
  }
}

describe('queueReducer', () => {
  it('INIT_SUCCESS converts running to queued and schedules slots', () => {
    const tasks = [
      makeTask({ id: '1', status: 'running', progress: 40 }),
      makeTask({ id: '2', status: 'queued', createdAt: 1 }),
      makeTask({ id: '3', status: 'queued', createdAt: 2 }),
    ]

    const state = queueReducer(initialQueueState, {
      type: 'INIT_SUCCESS',
      tasks,
    })

    expect(state.initStatus).toBe('ready')
    const running = state.tasks.filter((t) => t.status === 'running')
    expect(running.length).toBeLessThanOrEqual(MAX_CONCURRENT)
  })

  it('TICK updates progress for a running task', () => {
    const state = {
      ...initialQueueState,
      initStatus: 'ready' as const,
      tasks: [makeTask({ id: '1', status: 'running', progress: 10 })],
    }

    const next = queueReducer(state, {
      type: 'TICK',
      taskId: '1',
      progress: 55,
    })

    expect(next.tasks[0]?.progress).toBe(55)
  })

  it('COMPLETE marks task done and schedules next queued', () => {
    const state = {
      ...initialQueueState,
      initStatus: 'ready' as const,
      tasks: [
        makeTask({ id: '1', status: 'running', progress: 99 }),
        makeTask({ id: '2', status: 'queued', createdAt: 1 }),
      ],
    }

    const next = queueReducer(state, { type: 'COMPLETE', taskId: '1' })

    expect(next.tasks.find((t) => t.id === '1')?.status).toBe('done')
    expect(next.tasks.find((t) => t.id === '2')?.status).toBe('running')
  })

  it('FAIL moves task to failed and frees a slot', () => {
    const state = {
      ...initialQueueState,
      initStatus: 'ready' as const,
      tasks: [
        makeTask({ id: '1', status: 'running' }),
        makeTask({ id: '2', status: 'queued', createdAt: 1 }),
      ],
    }

    const next = queueReducer(state, {
      type: 'FAIL',
      taskId: '1',
      error: 'Недостаточно кредитов',
    })

    expect(next.tasks.find((t) => t.id === '1')?.status).toBe('failed')
    expect(next.tasks.find((t) => t.id === '2')?.status).toBe('running')
  })

  it('respects MAX_CONCURRENT slot limit', () => {
    const tasks = [
      makeTask({ id: '1', status: 'queued', createdAt: 1 }),
      makeTask({ id: '2', status: 'queued', createdAt: 2 }),
      makeTask({ id: '3', status: 'queued', createdAt: 3 }),
    ]

    const scheduled = scheduleTasks(tasks)
    expect(scheduled.filter((t) => t.status === 'running').length).toBe(
      MAX_CONCURRENT,
    )
  })

  it('schedules queued tasks in array order, not createdAt', () => {
    const tasks = [
      makeTask({ id: 'newer', status: 'queued', createdAt: 200 }),
      makeTask({ id: 'older', status: 'queued', createdAt: 100 }),
    ]

    const scheduled = scheduleTasks(tasks)
    const running = scheduled.filter((t) => t.status === 'running')
    expect(running[0]?.id).toBe('newer')
  })

  it('REMOVE drops task and reschedules', () => {
    const state = {
      ...initialQueueState,
      initStatus: 'ready' as const,
      tasks: [
        makeTask({ id: '1', status: 'running' }),
        makeTask({ id: '2', status: 'queued', createdAt: 1 }),
      ],
    }

    const next = queueReducer(state, { type: 'REMOVE', taskId: '1' })
    expect(next.tasks.find((t) => t.id === '1')).toBeUndefined()
    expect(next.tasks.find((t) => t.id === '2')?.status).toBe('running')
  })

  it('CLEAR_DONE removes only done tasks', () => {
    const state = {
      ...initialQueueState,
      initStatus: 'ready' as const,
      tasks: [
        makeTask({ id: '1', status: 'done' }),
        makeTask({ id: '2', status: 'queued' }),
      ],
    }

    const next = queueReducer(state, { type: 'CLEAR_DONE' })
    expect(next.tasks).toHaveLength(1)
    expect(next.tasks[0]?.id).toBe('2')
  })

  it('RESTORE_TASKS brings removed tasks back', () => {
    const removed = makeTask({ id: '1', status: 'done' })
    const state = {
      ...initialQueueState,
      initStatus: 'ready' as const,
      tasks: [makeTask({ id: '2', status: 'queued' })],
    }

    const next = queueReducer(state, {
      type: 'RESTORE_TASKS',
      tasks: [removed],
    })

    expect(next.tasks.some((t) => t.id === '1')).toBe(true)
  })

  it('REORDER_QUEUED changes FIFO order', () => {
    const state = {
      ...initialQueueState,
      initStatus: 'ready' as const,
      tasks: [
        makeTask({ id: 'a', status: 'queued', createdAt: 1 }),
        makeTask({ id: 'b', status: 'queued', createdAt: 2 }),
        makeTask({ id: 'c', status: 'running' }),
      ],
    }

    const reordered = reorderQueuedTasks(state.tasks, 'b', 'a')
    expect(reordered.map((t) => t.id)).toEqual(['b', 'a', 'c'])

    const next = queueReducer(state, {
      type: 'REORDER_QUEUED',
      activeId: 'b',
      overId: 'a',
    })
    expect(next.tasks.map((t) => t.id)).toEqual(['b', 'a', 'c'])
  })

  it('updateQueuePositions assigns sequential queue numbers', () => {
    const tasks = [
      makeTask({ id: '1', status: 'queued' }),
      makeTask({ id: '2', status: 'running' }),
      makeTask({ id: '3', status: 'queued' }),
    ]

    const positioned = updateQueuePositions(tasks)
    expect(positioned.find((t) => t.id === '1')?.queuePosition).toBe(1)
    expect(positioned.find((t) => t.id === '3')?.queuePosition).toBe(2)
    expect(positioned.find((t) => t.id === '2')?.queuePosition).toBeUndefined()
  })
})
