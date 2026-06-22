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

interface TaskCardProps {
  task: GenerationTask
  onCancel: (id: string) => void
  onRetry: (id: string) => void
  onDownload: (id: string) => void
  onRemove: (id: string) => void
}

export const TaskCard = memo(function TaskCard({
  task,
  onCancel,
  onRetry,
  onDownload,
  onRemove,
}: TaskCardProps) {
  const Icon = typeIcons[task.type]

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
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
          <Typography variant="body" className="line-clamp-2 font-medium">
            {task.prompt}
          </Typography>
          <Typography variant="mono" as="p" className="mt-1">
            {task.model}
          </Typography>
          <Typography variant="bodySmall" className="mt-0.5">
            {formatTaskMeta(
              task.etaSeconds,
              task.durationMs,
              task.credits,
              task.queuePosition,
            )}
          </Typography>
        </div>
        <TaskActions
          task={task}
          onCancel={onCancel}
          onRetry={onRetry}
          onDownload={onDownload}
          onRemove={onRemove}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <StatusBadge status={task.status} />
        {task.status === 'running' ? (
          <div className="flex-1">
            <ProgressBar value={task.progress} />
          </div>
        ) : null}
      </div>
      {task.status === 'failed' && task.error ? (
        <Typography variant="bodySmall" className="mt-2 text-status-failed">
          {task.error}
        </Typography>
      ) : null}
    </div>
  )
})
