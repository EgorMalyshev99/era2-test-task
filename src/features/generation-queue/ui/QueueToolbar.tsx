import { Search } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { useUiStore } from '../model/uiStore'

import type { SortOption, StatusFilter, TypeFilter } from '../model/uiStore'

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'queued', label: 'В очереди' },
  { value: 'running', label: 'Идёт' },
  { value: 'done', label: 'Готово' },
  { value: 'failed', label: 'Ошибка' },
]

const typeFilters: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Все типы' },
  { value: 'text', label: 'Текст' },
  { value: 'image', label: 'Изображение' },
  { value: 'video', label: 'Видео' },
  { value: 'audio', label: 'Аудио' },
]

export function QueueToolbar() {
  const {
    statusFilter,
    typeFilter,
    sort,
    search,
    setStatusFilter,
    setTypeFilter,
    setSort,
    setSearch,
  } = useUiStore(
    useShallow((s) => ({
      statusFilter: s.statusFilter,
      typeFilter: s.typeFilter,
      sort: s.sort,
      search: s.search,
      setStatusFilter: s.setStatusFilter,
      setTypeFilter: s.setTypeFilter,
      setSort: s.setSort,
      setSearch: s.setSearch,
    })),
  )

  const [localSearch, setLocalSearch] = useState(search)
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setSearch(localSearch), 300)
    return () => clearTimeout(timer)
  }, [localSearch, setSearch])

  const handleChipKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const chips = chipRefs.current.filter(Boolean)
      const currentIndex = chips.findIndex(
        (chip) => chip === event.currentTarget,
      )
      if (currentIndex === -1) return

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        chips[(currentIndex + 1) % chips.length]?.focus()
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        chips[(currentIndex - 1 + chips.length) % chips.length]?.focus()
      }
    },
    [],
  )

  return (
    <div
      className="flex flex-col gap-3 lg:flex-row lg:items-center
        lg:justify-between"
      role="toolbar"
      aria-label="Фильтры и сортировка очереди"
    >
      <div className="flex flex-col gap-2">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:pb-0">
          {statusFilters.map((filter, index) => (
            <Button
              key={filter.value}
              ref={(el) => {
                chipRefs.current[index] = el
              }}
              variant={statusFilter === filter.value ? 'default' : 'secondary'}
              className={cn(
                'shrink-0 rounded-full',
                statusFilter !== filter.value && 'bg-era-bg-2',
              )}
              aria-pressed={statusFilter === filter.value}
              onClick={() => setStatusFilter(filter.value)}
              onKeyDown={handleChipKeyDown}
            >
              {filter.label}
            </Button>
          ))}
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:pb-0">
          {typeFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={typeFilter === filter.value ? 'default' : 'secondary'}
              className={cn(
                'shrink-0 rounded-full',
                typeFilter !== filter.value && 'bg-era-bg-2',
              )}
              aria-pressed={typeFilter === filter.value}
              onClick={() => setTypeFilter(filter.value as TypeFilter)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 lg:w-48">
          <Search
            className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2
              text-era-fg-mute"
            aria-hidden
          />
          <Input
            placeholder="Поиск по промпту..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="rounded-full bg-era-bg-2 pl-9"
            aria-label="Поиск по промпту"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
          <SelectTrigger
            className="w-[160px] rounded-full bg-era-bg-2"
            aria-label="Сортировка"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Сначала новые</SelectItem>
            <SelectItem value="oldest">Сначала старые</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
