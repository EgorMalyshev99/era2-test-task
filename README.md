# ERA2 — Очередь генераций (тестовое задание)

Экран «Очередь генераций» с живым мок-движком очереди, глобальным статус-баром и адаптивной вёрсткой по дизайн-системе ERA2 (warm coal).

## Запуск

```bash
pnpm install
pnpm dev
```

Откройте [http://localhost:5173](http://localhost:5173).

- `/` — упрощённый фон (вместо чата) с глобальным статус-баром
- `/queue` — экран очереди генераций

## Стек

- React 19 + TypeScript (strict)
- Vite + Tailwind CSS v4
- shadcn/ui (radix-nova) в `src/shared/ui`
- **Context + useReducer** — движок очереди (задачи, FSM, таймеры)
- **Zustand** — UI-состояние (фильтры, сортировка, поиск, статус-бар)
- react-router v8 (data mode, `createBrowserRouter`)
- lucide-react, Geist + Geist Mono

## Архитектура (FSD)

```
app → pages → widgets → features → entities → shared
```

Публичный API слайсов — только через `index.ts`, без deep-import.

## Ключевые решения

### Восстановление `running` → `queued`

При перезагрузке страницы задачи в статусе `running` переводятся в `queued` и заново попадают в FIFO-очередь. Это безопаснее, чем продолжать «зависший» прогресс без активных таймеров.

### Гибридный стейт

| Что                           | Где                                              |
| ----------------------------- | ------------------------------------------------ |
| Задачи, FSM, движок           | `QueueProvider` + `queueReducer`                 |
| Фильтры, поиск, статус-бар UI | `uiStore` (Zustand)                              |
| Персист задач                 | `localStorage`, debounce 500ms в `QueueProvider` |
| Персист UI-предпочтений       | Zustand `persist` (фильтр/сортировка)            |

### Шрифты

Основной — **Geist Variable**. Моноширинный для мета/моделей — **Geist Mono Variable**. Если Geist Mono недоступен, браузер использует системный `ui-monospace`.

### Бонусные возможности (§6)

- **Undo** — удаление и «Очистить готовые» через Sonner toast с кнопкой «Отменить»
- **Виртуализация** — `@tanstack/react-virtual` при ≥80 задач; dev-кнопка «Загрузить 1000 задач»
- **Drag-to-reorder** — `@dnd-kit` для `queued` (отключается в большом списке)
- **Темы** — тёмная / светлая / системная (`next-themes`)
- **Анимации** — `framer-motion` + `prefers-reduced-motion`
- **Тесты** — Vitest (`pnpm test:run`)

### Роутинг

`createBrowserRouter` + `RouterProvider` из `react-router` / `react-router/dom`. Статус-бар монтируется в `AppLayout` и читает тот же `QueueProvider`.

## Дизайн-токены

Тёмная тема warm coal и светлая тема — переключатель в шапке. Акцент `#E85420`. Layout-контейнер — Tailwind `container` (см. `src/assets/globals.css`).

## Скрипты

```bash
pnpm dev      # разработка
pnpm build    # production-сборка
pnpm preview  # превью сборки
pnpm test     # тесты в watch-режиме
pnpm test:run # тесты один раз
pnpm lint     # ESLint
```
