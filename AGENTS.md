# ERA2 — руководство для AI-агентов

Тестовое задание: экран **«Очередь генераций»** с клиентским мок-движком, глобальным статус-баром и адаптивной вёрсткой. Бэкенда нет.

Полное ТЗ: [`тз.md`](./тз.md). Краткий обзор для людей: [`README.md`](./README.md).

---

## Быстрый старт

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm test:run     # Vitest
pnpm lint         # ESLint
pnpm build        # tsc + vite build
```

| Маршрут  | Назначение                                        |
| -------- | ------------------------------------------------- |
| `/`      | Упрощённый фон + глобальный `GenerationStatusBar` |
| `/queue` | Экран очереди генераций                           |

---

## Стек

- React 19, TypeScript (strict), Vite 8
- Tailwind CSS v4, shadcn/ui (`radix-nova`) в `src/shared/ui`
- **Context + useReducer** — задачи, FSM, мок-движок
- **Zustand** — UI-состояние (фильтры, поиск, режим статус-бара)
- react-router v8 (`createBrowserRouter`)
- lucide-react, Geist / Geist Mono, framer-motion, sonner

---

## Архитектура (Feature-Sliced Design)

```
app → pages → widgets → features → entities → shared
```

| Слой        | Роль                                               |
| ----------- | -------------------------------------------------- |
| `app/`      | Провайдеры, роутер, layout. Менять редко.          |
| `pages/`    | Тонкая композиция — только собирает виджеты.       |
| `widgets/`  | Композитный блок экрана (`GenerationQueue`).       |
| `features/` | Сценарии, состояние, UI фичи (`generation-queue`). |
| `entities/` | Доменные типы и сид (`generation-task`).           |
| `shared/`   | UI-kit, `cn`, утилиты без бизнес-логики.           |

### Обязательные правила импортов

- Алиас `@/` → `src/`
- **Публичный API слайса — только `index.ts`**
- ✅ `import { useQueue } from '@/features/generation-queue'`
- ❌ `import { TaskRow } from '@/features/generation-queue/ui/TaskRow'`
- ❌ относительные цепочки `../../..` между слайсами
- Один компонент — один файл, имя файла = имя компонента
- Бизнес-логика — в `model/`, компоненты — «тупые» (данные + колбэки)

### Сегменты внутри слайса

`ui/` · `model/` · `lib/` · `api/` (если нужен)

---

## Карта кодовой базы

| Что искать                         | Где смотреть                                           |
| ---------------------------------- | ------------------------------------------------------ |
| Типы домена                        | `entities/generation-task/model/types.ts`              |
| Стартовый сид (8–12 задач)         | `entities/generation-task/model/seed.ts`               |
| FSM / редьюсер                     | `features/generation-queue/model/queueReducer.ts`      |
| Мок-движок (тики, слоты, сбои)     | `features/generation-queue/model/queueEngine.ts`       |
| Провайдер + persist localStorage   | `features/generation-queue/model/QueueProvider.tsx`    |
| Селекторы (фильтр, сорт, счётчики) | `features/generation-queue/model/selectors.ts`         |
| Публичный хук                      | `features/generation-queue/model/useQueue.ts`          |
| UI-стор (фильтры, статус-бар)      | `features/generation-queue/model/uiStore.ts`           |
| Сборка экрана                      | `widgets/generation-queue/ui/GenerationQueue.tsx`      |
| Глобальный статус-бар              | `features/generation-queue/ui/GenerationStatusBar.tsx` |
| Монтирование провайдеров           | `app/providers/AppProviders.tsx`                       |
| Layout + статус-бар                | `app/layouts/AppLayout.tsx`                            |
| Роутинг                            | `app/router.tsx`                                       |
| Дизайн-токены                      | `src/assets/globals.css`                               |
| shadcn-примитивы                   | `src/shared/ui/`                                       |

---

## Стейт-менеджмент (гибрид)

| Данные                     | Хранилище                        | Persist                         |
| -------------------------- | -------------------------------- | ------------------------------- |
| Задачи, FSM, initStatus    | `QueueProvider` + `queueReducer` | `localStorage`, debounce 500 ms |
| Фильтры, сортировка, поиск | `useUiStore` (Zustand)           | фильтр/сорт — Zustand `persist` |
| Режим статус-бара          | `useUiStore`                     | нет (вычисляется из задач)      |

**Единый источник правды для задач:** и страница `/queue`, и `GenerationStatusBar` читают один `QueueProvider`. Дублировать состояние задач нельзя.

### Восстановление после reload

Задачи в `running` при загрузке из `localStorage` переводятся в `queued` и снова попадают в FIFO — см. `INIT_SUCCESS` в `queueReducer.ts`.

---

## Мок-движок (контракт)

- `MAX_CONCURRENT = 2` — не больше двух `running` одновременно
- FIFO по `createdAt` при освобождении слота
- Прогресс: тики ~400–700 ms, случайный шаг; video/audio медленнее text/image
- ~15% шанс `failed` после progress > 15%
- `cancel` / `remove` — немедленная остановка таймеров (`engine.onCancel`)
- При unmount — `engine.stopAll()`

Действия редьюсера: `TICK`, `COMPLETE`, `FAIL`, `CANCEL`, `RETRY`, `REMOVE`, `CLEAR_DONE`, `REORDER_QUEUED`, `SCHEDULE`, …

---

## UI и дизайн

- Тёмная тема **warm coal** + светлая (`next-themes`, переключатель в шапке)
- Акцент `#E85420` (`--era-accent`)
- Статусы: queued — нейтральный, running — оранжевый, done — зелёный, failed — красный, canceled — приглушённый
- Шрифты: Geist Variable, Geist Mono для мета/моделей
- Брейкпоинты: xs 480, sm 640, md 768, lg 1024, xl 1280 (см. `globals.css`)
- Desktop — `TaskRow`, mobile — `TaskCard` (через `useMediaQuery`)

---

## Реализованные бонусы (не ломать без запроса)

- Undo через Sonner (`useQueueUndo`) — удаление и «Очистить готовые»
- Виртуализация `@tanstack/react-virtual` при ≥80 задач
- Drag-to-reorder `@dnd-kit` для `queued` (отключается при большом списке)
- Dev-кнопка «Загрузить 1000 задач» (`generateStressTasks`)
- Vitest: `queueReducer.test.ts`, `queueEngine.test.ts`, `selectors.test.ts`
- `prefers-reduced-motion` в анимациях

---

## Что делать при типичных задачах

### Изменить логику очереди / FSM

1. `queueReducer.ts` — переходы статусов
2. `queueEngine.ts` — таймеры и side effects
3. Добавить/обновить тесты в `model/*.test.ts`
4. UI не трогать, если контракт `useQueue()` не меняется

### Изменить фильтрацию / сортировку

1. `selectors.ts` — чистые функции
2. `uiStore.ts` — если нужно новое UI-состояние
3. `QueueToolbar.tsx` — контролы

### Новый UI-компонент фичи

1. Файл в `features/generation-queue/ui/`
2. Экспорт через `features/generation-queue/index.ts` только если нужен снаружи слайса

### Новый shadcn-примитив

1. `src/shared/ui/`, экспорт из `shared/ui/index.ts`
2. Стили через токены из `globals.css`, не хардкод hex

---

## Чего не делать

- Реальный бэкенд, API, авторизация
- Deep-import между слайсами
- Бизнес-логику в React-компонентах
- Второй стор для задач (нарушит синхронизацию со статус-баром)
- «Utils-помойки» в корне — утилита живёт в `lib/` своего слайса
- Коммиты и push — только по явной просьбе пользователя

---

## Стиль кода

- Минимальный diff, без over-engineering
- Следовать существующим паттернам (хуки, CVA для вариантов, `cn()`)
- Комментарии — только для неочевидной бизнес-логики
- ESLint + Prettier настроены; перед PR: `pnpm lint && pnpm test:run && pnpm build`
- Тесты добавлять только для нетривиальной логики или по запросу

---

## Связь с Cursor

Правила в `.cursor/rules/` дублируют ключевые ограничения для автоматического применения в IDE:

| Файл                   | Когда применяется |
| ---------------------- | ----------------- |
| `project.mdc`          | Всегда            |
| `fsd-architecture.mdc` | Файлы в `src/**`  |
| `generation-queue.mdc` | Фича очереди      |
