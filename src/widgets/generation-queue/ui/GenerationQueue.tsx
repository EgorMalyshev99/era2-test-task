import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'

import {
  EmptyState,
  ErrorState,
  generateStressTasks,
  LoadingState,
  QueueStats,
  QueueToolbar,
  TaskList,
  useQueue,
  useQueueUndo,
  useUiStore,
} from '@/features/generation-queue'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { Typography } from '@/shared/ui/typography'

export function GenerationQueue() {
  const { filteredTasks, stats, isLoading, isError, isReady, actions } =
    useQueue()
  const { removeWithUndo, clearDoneWithUndo } = useQueueUndo()

  const { statusFilter, search } = useUiStore(
    useShallow((s) => ({ statusFilter: s.statusFilter, search: s.search })),
  )

  const hasFilters = statusFilter !== 'all' || search.trim().length > 0
  const dragEnabled =
    filteredTasks.length < 80 &&
    (statusFilter === 'all' || statusFilter === 'queued') &&
    search.trim().length === 0

  const handleDownload = useCallback((id: string) => {
    console.info('Download stub for task', id)
  }, [])

  const handleLoadStress = useCallback(() => {
    actions.loadStressTasks(generateStressTasks(1000))
  }, [actions])

  const taskHandlers = {
    onCancel: actions.cancel,
    onRetry: actions.retry,
    onDownload: handleDownload,
    onRemove: removeWithUndo,
  }

  return (
    <div className="container space-y-6 py-8">
      <header
        className="flex flex-col gap-4 sm:flex-row sm:items-start
          sm:justify-between"
      >
        <div>
          <Typography variant="h1" className="text-3xl">
            Очередь генераций
          </Typography>
          <Typography variant="body" className="mt-1 text-era-fg-mute">
            Все ваши задачи в реальном времени
          </Typography>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {import.meta.env.DEV ? (
            <Button variant="outline" onClick={handleLoadStress}>
              Загрузить 1000 задач
            </Button>
          ) : null}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={clearDoneWithUndo}
                disabled={stats.done === 0}
              >
                Очистить готовые
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Удалить все задачи со статусом «Готово»
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      {isReady ? <QueueStats stats={stats} /> : null}

      {isReady ? <QueueToolbar /> : null}

      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState onRetry={actions.retryInit} /> : null}

      {isReady && filteredTasks.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : null}

      {isReady && filteredTasks.length > 0 ? (
        <TaskList
          tasks={filteredTasks}
          handlers={taskHandlers}
          dragEnabled={dragEnabled}
          onReorder={actions.reorderQueued}
        />
      ) : null}
    </div>
  )
}
