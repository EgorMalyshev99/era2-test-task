import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createQueueEngine } from './queueEngine'

import type { GenerationTask } from '@/entities/generation-task'

function makeTask(
  overrides: Partial<GenerationTask> & Pick<GenerationTask, 'id' | 'status'>,
): GenerationTask {
  return {
    type: 'text',
    prompt: 'test',
    model: 'gpt-4o',
    progress: 10,
    createdAt: Date.now(),
    etaSeconds: 30,
    durationMs: 5000,
    credits: 1,
    ...overrides,
  }
}

describe('queueEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('ticks progress for running tasks', () => {
    const tasks = [makeTask({ id: '1', status: 'running', progress: 10 })]
    const dispatch = vi.fn()
    const engine = createQueueEngine(() => tasks, dispatch)

    engine.sync()
    vi.advanceTimersByTime(700)

    expect(dispatch).toHaveBeenCalled()
    const tickAction = dispatch.mock.calls.find(
      (call) => call[0]?.type === 'TICK',
    )
    expect(tickAction).toBeDefined()
  })

  it('stops ticking after cancel', () => {
    let tasks = [makeTask({ id: '1', status: 'running', progress: 10 })]
    const dispatch = vi.fn()
    const engine = createQueueEngine(() => tasks, dispatch)

    engine.sync()
    vi.advanceTimersByTime(500)
    const callsBefore = dispatch.mock.calls.length

    tasks = [makeTask({ id: '1', status: 'canceled', progress: 0 })]
    engine.onCancel('1')
    vi.advanceTimersByTime(2000)

    expect(dispatch.mock.calls.length).toBe(callsBefore)
  })

  it('can fail with random error after progress threshold', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const tasks = [makeTask({ id: '1', status: 'running', progress: 20 })]
    const dispatch = vi.fn()
    const engine = createQueueEngine(() => tasks, dispatch)

    engine.sync()
    vi.advanceTimersByTime(700)

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'FAIL', taskId: '1' }),
    )
  })

  it('stopAll clears all timers on unmount', () => {
    const tasks = [makeTask({ id: '1', status: 'running', progress: 10 })]
    const dispatch = vi.fn()
    const engine = createQueueEngine(() => tasks, dispatch)

    engine.sync()
    engine.stopAll()
    vi.advanceTimersByTime(2000)

    expect(dispatch).not.toHaveBeenCalled()
  })

  it('video tasks progress slower than text tasks', () => {
    const textTask = makeTask({
      id: 'text',
      status: 'running',
      progress: 10,
      type: 'text',
    })
    const videoTask = makeTask({
      id: 'video',
      status: 'running',
      progress: 10,
      type: 'video',
    })

    const textDispatch = vi.fn()
    const videoDispatch = vi.fn()

    createQueueEngine(() => [textTask], textDispatch).sync()
    createQueueEngine(() => [videoTask], videoDispatch).sync()

    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    vi.advanceTimersByTime(700)

    const textTick = textDispatch.mock.calls.find((c) => c[0]?.type === 'TICK')
    const videoTick = videoDispatch.mock.calls.find(
      (c) => c[0]?.type === 'TICK',
    )

    expect(textTick?.[0]?.progress).toBeGreaterThan(
      videoTick?.[0]?.progress ?? 0,
    )
  })
})
