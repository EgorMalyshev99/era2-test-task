import { Inbox } from 'lucide-react'

import { Typography } from '@/shared/ui/typography'

interface EmptyStateProps {
  hasFilters: boolean
}

export function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16
        text-center"
    >
      <div
        className="flex size-12 items-center justify-center rounded-full
          bg-era-bg-2"
      >
        <Inbox className="size-6 text-era-fg-mute" />
      </div>
      <Typography variant="h3">
        {hasFilters ? 'Ничего не найдено' : 'Очередь пуста'}
      </Typography>
      <Typography variant="body" className="max-w-sm text-era-fg-mute">
        {hasFilters
          ? 'Попробуйте изменить фильтры или поисковый запрос'
          : 'Здесь появятся ваши задачи генерации'}
      </Typography>
    </div>
  )
}
