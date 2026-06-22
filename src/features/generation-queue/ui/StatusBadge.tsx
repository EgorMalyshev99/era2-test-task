import { cn } from '@/shared/lib/cn'
import { Typography } from '@/shared/ui/typography'

import type { TaskStatus } from '@/entities/generation-task'

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  queued: {
    label: 'В очереди',
    className: 'bg-status-queued-bg text-status-queued',
  },
  running: {
    label: 'Идёт',
    className: 'bg-era-accent-soft text-status-running',
  },
  done: {
    label: 'Готово',
    className: 'bg-[#0d2818] text-status-done',
  },
  failed: {
    label: 'Ошибка',
    className: 'bg-[#2d1515] text-status-failed',
  },
  canceled: {
    label: 'Отменено',
    className: 'bg-era-bg-3 text-status-canceled',
  },
}

interface StatusBadgeProps {
  status: TaskStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Typography
      variant="label"
      as="span"
      className={cn(
        `inline-flex items-center rounded-full px-2.5 py-0.5 tracking-normal
        normal-case`,
        config.className,
        className,
      )}
    >
      {config.label}
    </Typography>
  )
}
