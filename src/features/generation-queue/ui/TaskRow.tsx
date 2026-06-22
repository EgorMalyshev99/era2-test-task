import { FileText, Image, Music, Video } from 'lucide-react'
import { memo } from 'react'

import { cn } from '@/shared/lib/cn'
import { Typography } from '@/shared/ui/typography'

import { ProgressBar } from './ProgressBar'
import { StatusBadge } from './StatusBadge'
import { TaskActions } from './TaskActions'
import { formatTaskMeta } from '../lib/formatEta'

import type { GenType, GenerationTask } from '@/entities/generation-task'

const typeIcons: Record<GenType, typeof FileText> = {
  text: FileText,
  image: Image,
  video: Video,
  audio: Music,
}

interface TaskRowProps {
  task: GenerationTask
  onCancel: (id: string) => void
  onRetry: (id: string) => void
  onDownload: (id: string) => void
  onRemove: (id: string) => void
}

export const TaskRow = memo(function TaskRow({
  task,
  onCancel,
  onRetry,
  onDownload,
  onRemove,
}: TaskRowProps) {
  const Icon = typeIcons[task.type]

  return (
    <div
      className="group flex items-center gap-4 rounded-xl border border-border
        bg-card px-4 py-3 transition-colors hover:border-era-fg-low/30"
    >
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          task.type === 'image' || task.type === 'video'
            ? 'bg-era-bg-3'
            : 'bg-era-accent-soft',
        )}
      >
        <Icon className="size-5 text-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <Typography
          variant="body"
          className="truncate font-medium text-foreground"
        >
          {task.prompt}
        </Typography>
        <Typography variant="mono" as="p" className="mt-0.5">
          {task.model}
          <Typography variant="bodySmall" as="span" className="ml-2">
            {formatTaskMeta(
              task.etaSeconds,
              task.durationMs,
              task.credits,
              task.queuePosition,
            )}
          </Typography>
        </Typography>
        {task.status === 'running' ? (
          <ProgressBar value={task.progress} className="mt-2" />
        ) : null}
        {task.status === 'failed' && task.error ? (
          <Typography variant="bodySmall" className="mt-1 text-status-failed">
            {task.error}
          </Typography>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={task.status} />
        <TaskActions
          task={task}
          onCancel={onCancel}
          onRetry={onRetry}
          onDownload={onDownload}
          onRemove={onRemove}
        />
      </div>
    </div>
  )
})
