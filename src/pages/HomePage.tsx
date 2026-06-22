import { Link } from 'react-router'

import { Typography } from '@/shared/ui/typography'

export function HomePage() {
  return (
    <div
      className="flex min-h-[calc(100svh-4rem)] flex-col items-center
        justify-center gap-6 px-4 py-16 text-center"
    >
      <div
        className="flex size-12 items-center justify-center rounded-xl
          bg-primary text-lg font-bold text-primary-foreground"
      >
        e
      </div>
      <div>
        <Typography variant="h2">era2</Typography>
        <Typography variant="body" className="mt-2 max-w-md text-era-fg-mute">
          Агрегатор нейросетей. Это упрощённый фон вместо экрана чата —
          глобальный статус-бар генераций виден внизу при активных задачах.
        </Typography>
      </div>
      <Typography
        variant="body"
        asChild
        className="text-primary underline-offset-4 hover:underline"
      >
        <Link to="/queue">Открыть очередь генераций →</Link>
      </Typography>
    </div>
  )
}
