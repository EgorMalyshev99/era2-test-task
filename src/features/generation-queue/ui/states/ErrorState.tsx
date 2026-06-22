import { AlertCircle } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Typography } from '@/shared/ui/typography'

interface ErrorStateProps {
  onRetry: () => void
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-16
        text-center"
    >
      <div
        className="flex size-12 items-center justify-center rounded-full
          bg-[#2d1515]"
      >
        <AlertCircle className="size-6 text-status-failed" />
      </div>
      <div>
        <Typography variant="h3">Не удалось загрузить очередь</Typography>
        <Typography variant="body" className="mt-1 text-era-fg-mute">
          Произошла ошибка при инициализации данных
        </Typography>
      </div>
      <Button onClick={onRetry}>Повторить</Button>
    </div>
  )
}
