# HelloClient — headless sidebar menu

Тестовое задание: headless (без стилизации) компонент бокового меню. React + TypeScript +
Tailwind, интеграция с React Router — логика меню полностью отделена от внешнего вида.

**Живое демо:** https://mikhailmatsuyev.github.io/HelloClient/

## Что здесь

- **`src/headless-menu/`** — сам headless-компонент: только состояние и поведение (accordion
  подменю, controlled/uncontrolled API, клавиатурная доступность), ни одной строчки CSS/Tailwind
  и ни одного импорта роутера. Composition-API на JSX (`Menu.Root`, `Menu.Item`, `Menu.Sub`, ...),
  без JSON/JS-конфигов с описанием пунктов. Подробности и пример использования —
  [`src/headless-menu/README.md`](src/headless-menu/README.md).
- **`src/demo/`** — компонент-потребитель поверх него: стилизация на Tailwind по макетам из
  задания (широкий/узкий десктоп + мобильный bottom-sheet), интеграция с React Router
  (подсветка активного пункта, переходы по клику), persist свёрнутости меню в `localStorage`.

## Запуск локально

```bash
npm install
npm run dev        # http://localhost:5173
```

Другие команды:

```bash
npm run build       # прод-сборка (tsc + vite build) в dist/
npm run preview      # локально поднять собранный dist/
npm run test         # vitest (unit + integration + accessibility)
npm run test:watch   # то же, в watch-режиме
npm run lint          # eslint
npm run typecheck     # tsc -b, без сборки
npm run format         # prettier --write .
```

## Как устроена разработка

Пошаговый план реализации и решения по архитектуре (с обоснованием, что и почему сделано —
включая найденные и исправленные в процессе баги) — в [`docs/plan.md`](docs/plan.md). Правила
именования веток и коммитов — в [`docs/git-workflow.md`](docs/git-workflow.md).

## Деплой

Демо задеплоено на GitHub Pages через `.github/workflows/deploy.yml` — билд и публикация `dist/`
автоматически при каждом пуше в `main`. `vite.config.ts` использует `base: '/HelloClient/'`
(подпуть проектного репозитория) и `HashRouter` в `src/App.tsx` (чтобы клиентский роутинг работал
на статическом хостинге без серверных rewrite-правил).
