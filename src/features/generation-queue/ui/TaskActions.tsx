import { Download, Loader2, MoreHorizontal, RefreshCw, X } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

import type { GenerationTask } from '@/entities/generation-task'

interface TaskActionsProps {
  task: GenerationTask
  onCancel: (id: string) => void
  onRetry: (id: string) => void
  onDownload: (id: string) => void
  onRemove: (id: string) => void
}

export function TaskActions({
  task,
  onCancel,
  onRetry,
  onDownload,
  onRemove,
}: TaskActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {task.status === 'running' || task.status === 'queued' ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onCancel(task.id)}
          aria-label="Отменить"
        >
          <X className="size-4" />
        </Button>
      ) : null}
      {task.status === 'failed' || task.status === 'canceled' ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onRetry(task.id)}
          aria-label="Повторить"
        >
          <RefreshCw className="size-4" />
        </Button>
      ) : null}
      {task.status === 'done' ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDownload(task.id)}
          aria-label="Скачать"
        >
          <Download className="size-4" />
        </Button>
      ) : null}
      {task.status === 'running' ? (
        <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Ещё">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onRemove(task.id)}
          >
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
