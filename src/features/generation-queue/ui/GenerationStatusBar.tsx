import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import { useShallow } from 'zustand/react/shallow'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Typography } from '@/shared/ui/typography'

import { ProgressBar } from './ProgressBar'
import { useQueueState } from '../model/queueHooks'
import { getActiveSummary } from '../model/selectors'
import { useUiStore } from '../model/uiStore'

const typeLabels = {
  text: 'Текст',
  image: 'Изображение',
  video: 'Видео',
  audio: 'Аудио',
} as const

const barMotion = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.98 },
}

export function GenerationStatusBar() {
  const reducedMotion = useReducedMotion()
  const { tasks } = useQueueState()
  const { statusBarMode, setStatusBarMode, toggleStatusBar } = useUiStore(
    useShallow((s) => ({
      statusBarMode: s.statusBarMode,
      setStatusBarMode: s.setStatusBarMode,
      toggleStatusBar: s.toggleStatusBar,
    })),
  )

  const summary = useMemo(() => getActiveSummary(tasks), [tasks])

  useEffect(() => {
    if (summary.count === 0) {
      setStatusBarMode('hidden')
      return
    }
    if (statusBarMode === 'hidden') {
      setStatusBarMode(summary.count === 1 ? 'compact' : 'expanded')
    }
  }, [summary.count, setStatusBarMode, statusBarMode])

  const transition = reducedMotion ? { duration: 0 } : { duration: 0.2 }

  if (statusBarMode === 'hidden' || summary.count === 0) {
    return null
  }

  const isCollapsed = statusBarMode === 'collapsed'
  const isCompact = statusBarMode === 'compact'
  const singleTask = summary.tasks[0]

  const positionClass = cn(
    'fixed z-50 shadow-lg',
    'right-6 bottom-[max(1.5rem,env(safe-area-inset-bottom))]',
    `max-sm:inset-x-4 max-sm:right-auto
    max-sm:bottom-[max(1rem,env(safe-area-inset-bottom))]`,
  )

  return (
    <AnimatePresence mode="wait">
      {isCollapsed ? (
        <motion.button
          key="collapsed"
          type="button"
          onClick={toggleStatusBar}
          className={cn(
            positionClass,
            `flex items-center gap-2 rounded-full border border-era-line bg-card
              px-4 py-2`,
          )}
          {...(reducedMotion ? {} : barMotion)}
          transition={transition}
        >
          <Loader2 className="size-4 animate-spin text-primary" />
          <Typography variant="body" as="span">
            {summary.count} генераций · {summary.averageProgress}%
          </Typography>
          <ChevronUp className="size-4 text-era-fg-mute" />
        </motion.button>
      ) : null}

      {!isCollapsed && isCompact && singleTask ? (
        <motion.div
          key="compact"
          className={cn(positionClass, 'w-80')}
          {...(reducedMotion ? {} : barMotion)}
          transition={transition}
        >
          <Card
            className="gap-3 rounded-xl border-era-line bg-card p-4 shadow-xl
              max-sm:inset-x-0 max-sm:w-full max-sm:rounded-t-xl
              max-sm:rounded-b-none max-sm:border-x-0"
          >
            <button
              type="button"
              onClick={toggleStatusBar}
              className="w-full text-left"
            >
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                <div className="min-w-0 flex-1">
                  <Typography variant="body" className="truncate font-medium">
                    {typeLabels[singleTask.type]} · {singleTask.model}
                  </Typography>
                  <ProgressBar
                    value={singleTask.progress}
                    className="mt-2"
                    label={`Прогресс: ${singleTask.model}`}
                  />
                </div>
              </div>
            </button>
          </Card>
        </motion.div>
      ) : null}

      {!isCollapsed && !isCompact ? (
        <motion.div
          key="expanded"
          className={cn(
            positionClass,
            'w-96 max-sm:inset-x-0 max-sm:bottom-0 max-sm:w-full',
          )}
          {...(reducedMotion ? {} : barMotion)}
          transition={transition}
        >
          <Card
            className="gap-0 rounded-xl border-era-line bg-card p-0 shadow-xl
              max-sm:rounded-t-xl max-sm:rounded-b-none max-sm:border-x-0"
          >
            <button
              type="button"
              onClick={() => setStatusBarMode('collapsed')}
              className="flex w-full items-center justify-between border-b
                border-era-line px-4 py-3 text-left"
            >
              <div>
                <Typography variant="body" className="font-medium">
                  Генерации идут · {summary.count} активны ·{' '}
                  {summary.averageProgress}%
                </Typography>
              </div>
              <ChevronDown className="size-4 text-era-fg-mute" />
            </button>

            <div className="space-y-3 px-4 py-3">
              {summary.tasks.map((task) => (
                <div key={task.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Typography variant="body" className="truncate">
                      {task.status === 'queued'
                        ? 'в очереди'
                        : typeLabels[task.type]}
                    </Typography>
                    <Typography
                      variant="mono"
                      as="span"
                      className="text-era-fg-mute"
                    >
                      {task.status === 'running'
                        ? `${Math.round(task.progress)}%`
                        : ''}
                    </Typography>
                  </div>
                  {task.status === 'running' ? (
                    <ProgressBar
                      value={task.progress}
                      showLabel={false}
                      label={`Прогресс: ${task.model}`}
                    />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="border-t border-era-line px-4 py-2">
              <Button variant="link" className="h-auto p-0" asChild>
                <Link to="/queue">Открыть очередь →</Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
