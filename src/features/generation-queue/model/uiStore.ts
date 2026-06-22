import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { GenType, TaskStatus } from '@/entities/generation-task'

export type StatusFilter = 'all' | TaskStatus
export type TypeFilter = 'all' | GenType
export type SortOption = 'newest' | 'oldest'
export type StatusBarMode = 'hidden' | 'compact' | 'expanded' | 'collapsed'

export interface UiState {
  statusFilter: StatusFilter
  typeFilter: TypeFilter
  sort: SortOption
  search: string
  statusBarMode: StatusBarMode
  setStatusFilter: (filter: StatusFilter) => void
  setTypeFilter: (filter: TypeFilter) => void
  setSort: (sort: SortOption) => void
  setSearch: (search: string) => void
  setStatusBarMode: (mode: StatusBarMode) => void
  toggleStatusBar: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      statusFilter: 'all',
      typeFilter: 'all',
      sort: 'newest',
      search: '',
      statusBarMode: 'hidden',
      setStatusFilter: (statusFilter) => set({ statusFilter }),
      setTypeFilter: (typeFilter) => set({ typeFilter }),
      setSort: (sort) => set({ sort }),
      setSearch: (search) => set({ search }),
      setStatusBarMode: (statusBarMode) => set({ statusBarMode }),
      toggleStatusBar: () => {
        const mode = get().statusBarMode
        if (mode === 'expanded') {
          set({ statusBarMode: 'collapsed' })
        } else if (mode === 'collapsed' || mode === 'compact') {
          set({ statusBarMode: 'expanded' })
        }
      },
    }),
    {
      name: 'era2-queue-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        statusFilter: state.statusFilter,
        typeFilter: state.typeFilter,
        sort: state.sort,
      }),
    },
  ),
)
