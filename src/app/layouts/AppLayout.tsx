import { Link, Outlet } from 'react-router'

import { GenerationStatusBar } from '@/features/generation-queue'
import { MockUserAvatar } from '@/shared/ui/mock-user-avatar'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { Typography } from '@/shared/ui/typography'

export function AppLayout() {
  return (
    <div className="min-h-svh bg-background">
      <header
        className="sticky top-0 z-40 border-b border-era-line bg-background/80
          backdrop-blur-sm"
      >
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span
              className="flex size-7 items-center justify-center rounded-md
                bg-primary text-xs font-bold text-primary-foreground"
            >
              e
            </span>
            <Typography
              className="text-xl leading-none font-semibold text-era-fg"
            >
              era2
            </Typography>
            <Typography
              variant="bodySmall"
              className="leading-none tracking-normal normal-case"
            >
              .ai
            </Typography>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MockUserAvatar />
          </div>
        </div>
      </header>

      <main className="pb-32">
        <Outlet />
      </main>

      <GenerationStatusBar />
    </div>
  )
}
