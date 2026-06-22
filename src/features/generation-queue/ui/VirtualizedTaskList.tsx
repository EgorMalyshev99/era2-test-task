import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

import { useMediaQuery } from '@/shared/lib/useMediaQuery'

import { TaskCard } from './TaskCard'
import { TaskRow } from './TaskRow'

import type { GenerationTask } from '@/entities/generation-task'

const ROW_GAP = 12

interface TaskHandlers {
  onCancel: (id: string) => void
  onRetry: (id: string) => void
  onDownload: (id: string) => void
  onRemove: (id: string) => void
}

interface VirtualizedTaskListProps {
  tasks: GenerationTask[]
  handlers: TaskHandlers
}

function estimateTaskSize(
  task: GenerationTask,
  variant: 'row' | 'card',
): number {
  if (variant === 'row') {
    if (task.status === 'failed') return 110
    if (task.status === 'running') return 100
    return 88
  }
  if (task.status === 'failed') return 190
  if (task.status === 'running') return 175
  return 148
}

function VirtualizedColumn({
  tasks,
  handlers,
  variant,
}: VirtualizedTaskListProps & { variant: 'row' | 'card' }) {
  const parentRef = useRef<HTMLDivElement>(null)

  // TanStack Virtual returns unstable function refs — expected for virtualizers.
  // eslint-disable-next-line react-hooks/incompatible-library -- useVirtualizer
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    getItemKey: (index) => tasks[index]!.id,
    estimateSize: (index) => estimateTaskSize(tasks[index]!, variant),
    gap: ROW_GAP,
    overscan: 6,
  })

  const TaskComponent = variant === 'row' ? TaskRow : TaskCard

  return (
    <div
      ref={parentRef}
      className="max-h-[calc(100vh-20rem)] overflow-y-auto"
      role="list"
      aria-label="Список задач генерации"
    >
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const task = tasks[virtualRow.index]!
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              role="listitem"
              className="absolute top-0 left-0 w-full"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TaskComponent task={task} {...handlers} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function VirtualizedTaskList({
  tasks,
  handlers,
}: VirtualizedTaskListProps) {
  const isCardLayout = useMediaQuery('(max-width: 480px)')

  return (
    <VirtualizedColumn
      tasks={tasks}
      handlers={handlers}
      variant={isCardLayout ? 'card' : 'row'}
    />
  )
}
