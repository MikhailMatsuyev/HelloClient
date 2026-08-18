import { Root } from './Root'
import { List } from './List'
import { Item } from './Item'
import { Sub, SubContent, SubTrigger } from './Sub'
import { Toggle } from './Toggle'

/**
 * Публичный API headless-меню: только composition-компоненты, никаких JSON/JS-конфигов
 * с описанием пунктов. Все стили и разметка — на стороне компонента-потребителя.
 */
export const Menu = {
  Root,
  List,
  Item,
  Sub,
  SubTrigger,
  SubContent,
  Toggle,
}

export type { MenuRootProps } from './Root'
export type { MenuListProps } from './List'
export type { MenuItemProps } from './Item'
export type { MenuSubProps, MenuSubTriggerProps, MenuSubContentProps } from './Sub'
export type { MenuToggleProps } from './Toggle'

// Логика без компонентов — для потребителей, которым нужен полностью свой рендер.
export { useSidebarMenu } from './useSidebarMenu'
export type { UseSidebarMenuOptions, UseSidebarMenuResult } from './useSidebarMenu'

export { useControllableState } from './useControllableState'
export { useMatchMedia } from './useMatchMedia'
export { useMenuSub } from './context'
