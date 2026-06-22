import { cn } from '@/shared/lib/cn'
import { Progress } from '@/shared/ui/progress'
import { Typography } from '@/shared/ui/typography'

interface ProgressBarProps {
  value: number
  className?: string
  showLabel?: boolean
  label?: string
}

export function ProgressBar({
  value,
  className,
  showLabel = true,
  label = 'Прогресс генерации',
}: ProgressBarProps) {
  const rounded = Math.min(100, Math.max(0, Math.round(value)))
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Progress
        value={rounded}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
        className="h-1 flex-1 bg-era-bg-3
          [&_[data-slot=progress-indicator]]:bg-primary"
      />
      {showLabel ? (
        <Typography
          variant="mono"
          as="span"
          className="w-9 shrink-0 text-right text-era-fg-dim"
          aria-hidden
        >
          {rounded}%
        </Typography>
      ) : null}
    </div>
  )
}
