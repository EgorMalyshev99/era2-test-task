import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

import { AnimatedTaskItem, AnimatedTaskList } from './AnimatedTaskList'
import { TaskCard } from './TaskCard'
import { TaskRow } from './TaskRow'
import { VirtualizedTaskList } from './VirtualizedTaskList'

import type { GenerationTask } from '@/entities/generation-task'

const VIRTUAL_THRESHOLD = 80

interface TaskHandlers {
  onCancel: (id: string) => void
  onRetry: (id: string) => void
  onDownload: (id: string) => void
  onRemove: (id: string) => void
}

interface TaskListProps {
  tasks: GenerationTask[]
  handlers: TaskHandlers
  dragEnabled: boolean
  onReorder: (activeId: string, overId: string) => void
}

interface SortableShellProps {
  task: GenerationTask
  dragEnabled: boolean
  variant: 'row' | 'card'
  children: ReactNode
}

function SortableShell({
  task,
  dragEnabled,
  variant,
  children,
}: SortableShellProps) {
  const canDrag = dragEnabled && task.status === 'queued'
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !canDrag,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handle = canDrag ? (
    <button
      type="button"
      ref={setActivatorNodeRef}
      className="shrink-0 cursor-grab touch-none text-era-fg-mute
        hover:text-foreground active:cursor-grabbing"
      aria-label="Перетащить задачу"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-4" />
    </button>
  ) : !dragEnabled ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="flex size-4 shrink-0 items-center justify-center
            text-era-fg-low"
          aria-hidden
        >
          <GripVertical className="size-4 opacity-30" />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        Перетаскивание недоступно в большом списке
      </TooltipContent>
    </Tooltip>
  ) : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-stretch gap-2',
        variant === 'card' && 'flex-col',
        isDragging && 'z-10 opacity-80',
      )}
      role="listitem"
    >
      {handle ? (
        <div className={cn(variant === 'row' && 'flex items-center')}>
          {handle}
        </div>
      ) : null}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

function PlainList({
  tasks,
  handlers,
  dragEnabled,
  variant,
  onReorder,
}: TaskListProps & { variant: 'row' | 'card' }) {
  const queuedIds = useMemo(
    () => tasks.filter((t) => t.status === 'queued').map((t) => t.id),
    [tasks],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onReorder(String(active.id), String(over.id))
  }

  const renderTask = (task: GenerationTask) => {
    const TaskComponent = variant === 'row' ? TaskRow : TaskCard
    const content = <TaskComponent task={task} {...handlers} />

    if (!dragEnabled) {
      return (
        <AnimatedTaskItem key={task.id} id={task.id}>
          <div role="listitem">{content}</div>
        </AnimatedTaskItem>
      )
    }

    return (
      <AnimatedTaskItem key={task.id} id={task.id}>
        <SortableShell task={task} dragEnabled={dragEnabled} variant={variant}>
          {content}
        </SortableShell>
      </AnimatedTaskItem>
    )
  }

  const list = (
    <AnimatedTaskList>{tasks.map((task) => renderTask(task))}</AnimatedTaskList>
  )

  if (!dragEnabled) {
    return (
      <div
        role="list"
        aria-label="Список задач генерации"
        className="space-y-3"
      >
        {list}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={queuedIds} strategy={verticalListSortingStrategy}>
        <div
          role="list"
          aria-label="Список задач генерации"
          className="space-y-3"
        >
          {list}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export function TaskList({
  tasks,
  handlers,
  dragEnabled,
  onReorder,
}: TaskListProps) {
  const useVirtual = tasks.length >= VIRTUAL_THRESHOLD

  if (useVirtual) {
    return <VirtualizedTaskList tasks={tasks} handlers={handlers} />
  }

  return (
    <>
      <div className="hidden min-[481px]:block">
        <PlainList
          tasks={tasks}
          handlers={handlers}
          dragEnabled={dragEnabled}
          onReorder={onReorder}
          variant="row"
        />
      </div>
      <div className="max-[480px]:block min-[481px]:hidden">
        <PlainList
          tasks={tasks}
          handlers={handlers}
          dragEnabled={dragEnabled}
          onReorder={onReorder}
          variant="card"
        />
      </div>
    </>
  )
}
