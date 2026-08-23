# RouterMenu integration — plan

## Цель

Отделить headless-логику меню от интеграции с React Router и от бизнес-слоя приложения.

Итоговая архитектура:

HeadlessMenu
→ поведение и accessibility, без router/business logic

RouterMenu
→ React Router integration + активный route + navigation + продуктовый дизайн

Business layer
→ простая декларативная разметка без useLocation, Menu.*, openValue, collapsed и ручных обработчиков

## Этапы

### 1. Анализ существующего поведения

- [*] Прочитать текущие `Sidebar.test.tsx`
- [*] Прочитать текущие `MobileNav.test.tsx`
- [*] Прочитать тесты `headless-menu`
- [*] Зафиксировать все существующие сценарии поведения
- [*] Ничего не менять до завершения анализа

### 2. RouterMenu API

- [*] Создать `src/router-menu/context.ts`
- [*] Создать `src/router-menu/Root.tsx`
- [*] Создать `src/router-menu/Item.tsx`
- [*] Создать `src/router-menu/Group.tsx`
- [*] Создать `src/router-menu/List.tsx`
- [*] Создать `src/router-menu/Toggle.tsx`
- [*] Создать `src/router-menu/index.ts`

### 3. RouterMenu behavior

- [ ] `Item` сам определяет active route
- [ ] `Item` сам выполняет navigation через `Link`
- [ *] `Group` сам определяет active parent по дочерним routes
- [ *] `Group` поддерживает accordion через headless API
- [ *] Desktop collapsed flyout работает
- [ *] Hover intent и delayed close работают
- [ *] Переход курсора с trigger на flyout не закрывает меню
- [* ] `Escape` закрывает группу и возвращает focus
- [* ] Mobile bottom-sheet работает
- [* ] Backdrop закрывает sheet
- [* ] Close button закрывает sheet
- [ ] Accessibility сохраняется

### 4. Business layer cleanup

- [ ] `Sidebar.tsx` использует только `RouterMenu.*`
- [ ] `Sidebar.tsx` не импортирует `headless-menu`
- [ ] `Sidebar.tsx` не использует `useLocation`
- [ ] `Sidebar.tsx` не управляет `openValue`
- [ ] `Sidebar.tsx` не управляет collapsed-состоянием меню
- [* ] `MobileNav.tsx` использует только `RouterMenu.*`
- [* ] `MobileNav.tsx` не импортирует `headless-menu`
- [* ] `MobileNav.tsx` не использует `useLocation`
- [* ] `MobileNav.tsx` не управляет `openValue`

### 5. Tests

- [ ] Добавить unit tests для `RouterMenu.Root`
- [ ] Добавить unit tests для `RouterMenu.Item`
- [ ] Добавить unit tests для `RouterMenu.Group`
- [ ] Добавить tests для active route
- [ ] Добавить tests для navigation
- [ ] Добавить tests для accordion
- [ ] Добавить tests для collapsed flyout
- [ ] Добавить tests для hover intent
- [ ] Добавить tests для mobile bottom-sheet
- [ ] Добавить accessibility tests
- [ ] Существующие `Sidebar.test.tsx` проходят
- [ ] Существующие `MobileNav.test.tsx` проходят
- [ ] Все существующие headless tests проходят

### 6. Финальная проверка

- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Проверить desktop expanded
- [ ] Проверить desktop collapsed
- [ ] Проверить mobile navigation
- [ ] Проверить прямой переход на nested route
- [ ] Проверить active parent
