import { ThemeProvider } from 'next-themes'

import { QueueProvider } from '@/features/generation-queue'
import { Toaster } from '@/shared/ui/sonner'
import { TooltipProvider } from '@/shared/ui/tooltip'

import type { ReactNode } from 'react'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <QueueProvider>
          {children}
          <Toaster position="bottom-center" />
        </QueueProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
