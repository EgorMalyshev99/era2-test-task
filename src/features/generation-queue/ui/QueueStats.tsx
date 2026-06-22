import { cn } from '@/shared/lib/cn'
import { Card } from '@/shared/ui/card'
import { Typography } from '@/shared/ui/typography'

import type { QueueStats } from '../model/selectors'

const statItems = [
  { key: 'queued' as const, label: 'В очереди', color: 'bg-status-queued' },
  { key: 'running' as const, label: 'Идёт', color: 'bg-status-running' },
  { key: 'done' as const, label: 'Готово', color: 'bg-status-done' },
  { key: 'failed' as const, label: 'Ошибка', color: 'bg-status-failed' },
]

interface QueueStatsProps {
  stats: QueueStats
}

export function QueueStats({ stats }: QueueStatsProps) {
  return (
    <div
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      aria-live="polite"
      aria-label="Сводка по статусам задач"
    >
      {statItems.map((item) => (
        <Card
          key={item.key}
          className={cn(
            'flex flex-col items-start gap-2 bg-era-bg-1 px-4 py-3',
          )}
        >
          <div className="flex items-center gap-2">
            <span className={cn('block size-2 rounded-full', item.color)} />
            <Typography variant="bodySmall">{item.label}</Typography>
          </div>

          <Typography variant="h3" className="tabular-nums">
            {stats[item.key]}
          </Typography>
        </Card>
      ))}
    </div>
  )
}
