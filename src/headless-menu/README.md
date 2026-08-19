# headless-menu

Headless (без стилизации) сайдбар-меню: только логика и состояние, ноль CSS/DOM-решений.
Компонент-потребитель сам решает, как всё это выглядит и из чего состоит — headless-пакет
отдаёт только `data-*`/`aria-*` атрибуты и обработчики. Живой пример полноценного потребителя —
`src/demo` (стилизация на Tailwind, интеграция с React Router).

## Быстрый старт

```tsx
import { Link, useLocation } from 'react-router-dom'
import { Menu } from '../headless-menu'

function Sidebar() {
  const { pathname } = useLocation()

  return (
    <Menu.Root defaultCollapsed={false} aria-label="Основная навигация">
      <Menu.List>
        {/* Обычный пункт: asChild подставляет <Link> вместо дефолтного <button> */}
        <Menu.Item asChild active={pathname === '/trends'}>
          <Link to="/trends">Trends</Link>
        </Menu.Item>

        {/* Пункт с подменю */}
        <Menu.Sub value="inventory">
          <Menu.SubTrigger>Inventory</Menu.SubTrigger>
          <Menu.SubContent>
            <Menu.Item asChild active={pathname === '/inventory/products'}>
              <Link to="/inventory/products">Products</Link>
            </Menu.Item>
          </Menu.SubContent>
        </Menu.Sub>
      </Menu.List>

      <Menu.Toggle>Свернуть меню</Menu.Toggle>
    </Menu.Root>
  )
}
```

Никаких `items={[...]}` — пункты меню всегда JSX-композиция, не конфиг-объект.

## Компоненты

Всё в объекте `Menu` (`import { Menu } from '../headless-menu'`), плюс типы пропсов
(`MenuRootProps`, `MenuListProps`, `MenuItemProps`, `MenuSubProps`, `MenuSubTriggerProps`,
`MenuSubContentProps`, `MenuToggleProps`) для тех, кто оборачивает компоненты своими.

| Компонент         | Дефолтный тег | Обязательные пропсы | Что делает                                                                                         |
| ----------------- | ------------- | ------------------- | -------------------------------------------------------------------------------------------------- |
| `Menu.Root`       | `<nav>`       | —                   | Владеет состоянием (`useSidebarMenu`), раздаёт через контекст. `data-state="expanded\|collapsed"`. |
| `Menu.List`       | `<div>`       | —                   | Группировка верхнеуровневых пунктов. `data-state` — то же, что у `Root`.                           |
| `Menu.Item`       | `<button>`    | —                   | Листовой пункт. Проп `active` вычисляет потребитель (роут/стейт) — headless этого не знает.        |
| `Menu.Sub`        | `<div>`       | `value: string`     | Группа "пункт с подменю". `value` — id для аккордеона.                                             |
| `Menu.SubTrigger` | `<button>`    | —                   | Открывает/закрывает свой `Menu.Sub` по клику (accordion — открыт максимум один раздел).            |
| `Menu.SubContent` | `<div>`       | —                   | Контейнер дочерних `Menu.Item`. Всегда смонтирован — открытость только через `data-state`.         |
| `Menu.Toggle`     | `<button>`    | —                   | Переключает `collapsed` всего меню.                                                                |

Каждый компонент принимает `asChild?: boolean`, чтобы подставить свой элемент (например,
`<Link>` из React Router) вместо дефолтного тега — поведенческие пропсы (обработчики,
`data-*`/`aria-*`, `ref`) при этом мержатся на подставленный элемент, а не теряются.

## Controlled / uncontrolled

Как у нативного `<input value/onChange>` — каждый кусок стейта можно оставить неконтролируемым
(тогда работает `defaultCollapsed`/`defaultOpenValue`) или полностью отдать наружу:

```tsx
<Menu.Root
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
  openValue={openValue}
  onOpenValueChange={setOpenValue}
>
```

Так меню одинаково легко подключается и к обычному `useState`, и к localStorage, и к
React Router (см. `src/demo/useSidebarState.ts` — синхронизация открытого раздела с текущим
роутом, без единого импорта `react-router` внутри самого headless-пакета).

## Хуки (без компонентов)

Если готовые компоненты не подходят — вся логика доступна напрямую:

- **`useSidebarMenu(options?)`** — то же состояние, что стоит за `Menu.Root`
  (`collapsed`/`openValue` + аккордеон-экшены `isOpen`/`openSubmenu`/`closeSubmenu`/`toggleSubmenu`),
  без единого рендера DOM.
- **`useMenuSub()`** — `{ value, open, openThis, close, toggle, triggerRef, contentId }` для
  кастомного триггера внутри `Menu.Sub`, которому не подходит готовый `Menu.SubTrigger`
  (например, отдельная кнопка "×" в шапке мобильного bottom-sheet — см. `src/demo/MobileNav.tsx`).
  `openThis` открывает раздел безусловно (не toggle) — нужен, когда триггер должен одинаково
  реагировать и на hover, и на click, не толкая друг друга (см. `src/demo/Sidebar.tsx`).
- **`useMatchMedia(query)`** — реактивный `matchMedia`; удобно как дефолт для `collapsed` на
  узком вьюпорте, брейкпоинт — параметр, не константа пакета.
- **`useControllableState({ value, defaultValue, onChange })`** — общий примитив
  controlled/uncontrolled стейта, на котором построено всё выше.

## Поведение

- **Аккордеон**: `openValue` — id максимум одного открытого раздела. Открытие одного
  автоматически закрывает ранее открытый другой.
- **Автораскрытие по активному роуту** — не забота headless-пакета: потребитель сам решает,
  какой раздел должен быть открыт при монтировании/навигации (см. `useSidebarState`), и
  передаёт это как `openValue`/`defaultOpenValue`.
- **Клавиатура**: обычные `<button>`/`<a>` внутри `<nav>` — не ARIA-виджет `role="menu"`, поэтому
  `Tab`/`Shift+Tab`/`Enter`/`Space` работают нативно, без кастомного roving tabindex. Отдельно
  реализован паттерн ARIA Disclosure для `Menu.Sub`: `Escape` закрывает открытый раздел и
  возвращает фокус на его `SubTrigger` (только пока фокус ещё внутри этого раздела — см.
  комментарий в `Sub.tsx`); `aria-controls`/`aria-expanded` на триггере, `id` на контенте.
- **Показ подменю** — целиком на потребителе: `Menu.SubContent` всегда смонтирован, открытость
  видна только через `data-state="open"/"closed"`. Один и тот же примитив стилизуется как
  инлайн-раскрытие (широкий десктоп), CSS-flyout по hover/click (узкий десктоп) или bottom-sheet
  с оверлеем (мобильный) — см. три варианта в `src/demo/Sidebar.tsx` и `src/demo/MobileNav.tsx`.

## `data-*`-конвенция для стилизации

Headless-пакет ничего не стилизует, но проставляет предсказуемые атрибуты, чтобы потребитель
стилизовал состояния через Tailwind (`data-[state=open]:...`) без единой строчки JS:

| Атрибут                          | Где                                         | Значения                                                   |
| -------------------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| `data-state`                     | `Root`, `List`                              | `"expanded" \| "collapsed"`                                |
| `data-state`                     | `Sub`, `SubTrigger`, `SubContent`, `Toggle` | `"open" \| "closed"` (Toggle: `"collapsed" \| "expanded"`) |
| `data-active`                    | `Item`                                      | присутствует, если `active`                                |
| `aria-current="page"`            | `Item`                                      | то же самое, что `data-active`                             |
| `aria-expanded`, `aria-controls` | `SubTrigger`                                | стандартный ARIA Disclosure                                |

## Что осознанно НЕ входит в пакет

- Никаких стилей/классов Tailwind — `grep -r "className=" src/headless-menu` (кроме `...rest`)
  должен быть пустым.
- Никакого `react-router` (или другого роутера) внутри — `active`/`isActive` всегда вычисляет
  потребитель.
- Никакого `localStorage`/фетчинга — персист состояния целиком на стороне потребителя
  (пример — `src/demo/useLocalStorageState.ts`).
- Никакого roving-tabindex/стрелок — обоснование см. в "Поведение" выше и в `docs/plan.md` (шаг 3).
