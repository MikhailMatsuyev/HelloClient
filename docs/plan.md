# План реализации — Headless Sidebar Menu (HelloClient)

Разбивка тестового задания на шаги. Источник требований — [CLAUDE.md](../CLAUDE.md).

## 0. Уточнение требований

- [x] Открыть Notion-страницу задания через Playwright MCP и свериться с референс-видео и
      макетами узкого/широкого вариантов меню.
- [x] Зафиксировать в CLAUDE.md найденные детали, которых не было в исходном скриншоте
      (см. раздел "Сверка с Notion" в CLAUDE.md).

## 1. Настройка проекта

- [x] Инициализировать Vite + React + TypeScript.
- [x] Подключить Tailwind CSS.
- [x] Настроить ESLint + Prettier (базово, без избыточной конфигурации).
- [x] Настроить Husky (pre-commit hook) + lint-staged, чтобы линт/форматирование
      прогонялись автоматически на закоммиченных файлах.
- [x] Настроить Vitest + React Testing Library + user-event + jest-dom (jsdom-окружение),
      один тривиальный smoke-тест, чтобы убедиться, что раннер работает с текущим
      flat ESLint/TS конфигом без конфликтов.
- [ ] Структура папок: `src/headless-menu` (библиотека) и `src/demo` (компонент-потребитель).

## 2. Проектирование API headless-компонента

Реализовано в `src/headless-menu/` на ветке `feat/menu-compound-api` (26 тестов, lint+typecheck
чистые). API: `Menu.Root/List/Item/Sub/SubTrigger/SubContent/Toggle`.

- [x] Выбрать паттерн composition: compound components (`Menu.Root`, `Menu.List`, `Menu.Item`,
      `Menu.Sub`/`Menu.SubTrigger`/`Menu.SubContent`, `Menu.Toggle`) на основе React Context —
      без JSON/JS-конфигов. Названия по аналогии с Radix `DropdownMenu.Sub`/`SubTrigger`.
- [x] Определить controlled/uncontrolled API для состояния (`collapsed`, `openValue` — id открытого
      раздела подменю) через общий типизированный хук `useControllableState<T>`.
- [x] Продумать, как потребитель подключит внешний стейт: `active` на `Menu.Item` — готовый булев
      проп, который считает сам потребитель (роут/localStorage/useState); `collapsed`/`openValue`
      можно и не контролировать явно, и подключить к любому внешнему источнику через
      controlled-режим. Реальная интеграция с React Router и localStorage — демо-компонент, шаг 4.
- [x] Headless-модуль не импортирует `react-router` и не содержит роутинг-логики — проверено:
      `isActive`/`active` полностью вычисляет потребитель.
- [x] `asChild`/`Slot`-паттерн реализован (`Slot.tsx`): мерж `className`/`style`/обработчиков
      (оба вызываются, не перезаписывают друг друга) и `ref` (через `mergeRefs`).
- [x] `data-state="expanded|collapsed"` на `Root`/`List`/`Toggle`, `data-state="open|closed"` на
      `Sub`/`SubContent`, `data-active` + `aria-current="page"` на активном `Item`.
- [x] Вся логика стейта — в `useSidebarMenu` (collapsed + accordion), не завязана на JSX,
      протестирована через `renderHook` без рендера DOM (`useSidebarMenu.test.ts`).
- [~] Контекст один (`SidebarMenuRootContext`), не разделён на state/actions — но его значение
  мемоизировано (`useMemo` по всем полям), так что лишний ре-рендер не возникает при
  неизменных зависимостях. Разделение на два контекста осознанно не делали (YAGNI: для
  объёма стейта этого компонента не даёт ощутимой выгоды) — пересмотреть, если в шаге 3
  появится явная просадка производительности.

### Что дополнительно проверено тестами (после ревью)

- `data-state` на самом `Root`, `List` и `Sub` (не только на `Toggle`/`SubContent`).
- Осмысленная ошибка вне обязательного родителя — для всех компонентов, которым он нужен
  (`List`, `Toggle`, `Sub` вне `Root`; `SubTrigger`/`SubContent` вне `Sub`).
- `Menu.Item` осознанно работает автономно, без `Menu.Root` — задокументировано тестом и
  комментарием в коде (ему не нужен стейт меню).
- `asChild` на `Menu.Toggle`: обработчик потребителя и переключение `collapsed` вызываются оба.
- `Slot` с невалидными children — не рендерит ничего, логирует ошибку в DEV.
- `useSidebarMenu`: controlled `closeSubmenu`, несколько переключений `collapsed` подряд.
- Попутно найден и исправлен баг тестовой инфры: RTL не чистил DOM между тестами в одном файле
  (в `vite.config.ts` нет `test.globals: true`, поэтому не сработал авто-`afterEach`-детект RTL) —
  добавлен явный `cleanup()` в `src/test/setup.ts`.

### Принципы, которые проверяем в code review

- **Composition over configuration** — нигде не должно быть `items.map()` по конфиг-массиву.
- **KISS/YAGNI** — не проектировать generic-систему на все случаи жизни; расширяемость через
  добавление новых компонентов-потомков, а не разрастающийся список пропсов на `Root`.
- **Explicit over implicit** — роутинг и `isActive` вычисляет потребитель, не headless.
- **Accessibility-first** — `nav`/`aria-label`, `aria-expanded`, `aria-current="page"`,
  `aria-controls`, клавиатурная навигация (стрелки, Home/End, Enter/Space, Escape), возврат
  фокуса на trigger при закрытии.
- **Анти-паттерны**: god-component с кучей несвязанных булевых пропсов; fetch/routing/localStorage
  внутри headless-пакета; один гигантский context на всё дерево; утечка Tailwind-классов внутрь
  headless-компонентов (grep на `className=` в `src/headless-menu` должен быть пустым, кроме
  `...rest`).

## 3. Реализация логики меню

- [ ] Состояние "узкий/широкий" режим (collapsed/expanded) с controlled/uncontrolled API.
- [ ] Состояние активного/выбранного пункта меню.
- [ ] Логика раскрытия/закрытия вложенных пунктов: accordion (раскрытие одного родителя
      схлопывает другой), автораскрытие + подсветка родителя при активном дочернем пункте,
      триггеры и hover, и click (см. "Сверка с Notion" в CLAUDE.md).
- [ ] Клавиатурная доступность и ARIA-атрибуты (`role="navigation"`, `aria-expanded`, и т.п.).
- [ ] Адаптивное поведение: дефолтный `matchMedia`-хук переключает `isCompact` сам, но значение
      полностью перекрываемо потребителем (controlled `mode`/`variant`); брейкпоинт — опциональный
      параметр хука, не захардкоженная константа.
- [ ] Писать unit-тесты (Vitest + `renderHook`) на `useSidebarMenu`/`useControllableState`
      параллельно с реализацией (TDD для хука состояния — без рендера DOM, дёшево и полезно):
      переходы состояний, controlled/uncontrolled переключение, установка активного пункта,
      индексация для клавиатурной навигации.
- [ ] Integration-тесты (RTL) на сборку compound-дерева: `Item` вне `Root` кидает осмысленную
      ошибку; controlled-режим отражает внешний стейт; uncontrolled — стреляет `onChange`;
      `asChild`/Slot корректно мёржит пропсы и форвардит `ref` (проверить на фейковом `<Link>`,
      имитирующем React Router).

## 4. Компонент-потребитель (демо)

- [ ] Стилизация через Tailwind поверх headless-компонента для обоих режимов (узкий/широкий),
      согласно макетам.
- [ ] Интеграция с React Router: пункты меню подсвечивают активный route, переходы по клику.
- [ ] Демонстрация persist состояния (например, свёрнутость меню в localStorage).
- [ ] Проверка адаптива вручную в браузере (ресайз окна, мобильные размеры).
- [ ] Accessibility-тест демо-компонента (`vitest-axe`/`jest-axe`) — без нарушений; явные assert
      на `aria-expanded`/`aria-current`/работу клавиатуры через `user-event`.

## 5. Комментарии и документация в коде

- [ ] Комментарии к ключевым местам headless-логики (почему, а не что).
- [ ] Короткий README для `src/headless-menu` с примером использования.

## 6. Сборка, CI и деплой демо

- [ ] Прогнать локальный билд (`vite build`), проверить отсутствие ошибок типов.
- [ ] Настроить GitHub Actions workflow (`lint` + `typecheck` + `test` на push/PR) — дешёвый,
      но заметный сигнал инженерной зрелости для ревьюеров репозитория.
- [ ] (Опционально) Один e2e-смоук на Playwright поверх задеплоенного демо: ресайз вьюпорта →
      проверка переключения узкий/широкий режим. Не приоритет, если не хватает времени.
- [ ] Задеплоить живое демо (GitHub Pages или Cloudflare Pages).
- [ ] Проверить работоспособность демо-ссылки в чистом окне браузера.

## 7. Финальная проверка и сдача

- [ ] Сверить реализацию с чек-листом требований из CLAUDE.md (React+TS+Tailwind, только JSX-API,
      controlled state, настоящий headless, React Router только в потребителе, комментарии, адаптив).
- [ ] Обновить корневой README.md (описание, ссылка на демо, инструкция запуска).
- [ ] Запушить код в GitHub, приложить ссылку на демо в описание репозитория/README.
