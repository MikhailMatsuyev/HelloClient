import { createContext, useContext } from 'react'
import type { RefObject } from 'react'
import type { UseSidebarMenuResult } from './useSidebarMenu'

/** Состояние и экшены всего меню — то, что возвращает useSidebarMenu, отданное через контекст. */
export const SidebarMenuRootContext = createContext<UseSidebarMenuResult | null>(null)

export function useSidebarMenuRootContext(componentName: string): UseSidebarMenuResult {
  const context = useContext(SidebarMenuRootContext)
  if (!context) {
    throw new Error(`Menu.${componentName} должен рендериться внутри <Menu.Root>.`)
  }
  return context
}

export interface SidebarMenuSubContextValue {
  value: string
  open: boolean
  /** DOM-узел SubTrigger — чтобы SubContent мог вернуть на него фокус (например, по Escape). */
  triggerRef: RefObject<HTMLElement | null>
  /** id, который SubContent проставляет себе и на который SubTrigger ссылается через aria-controls. */
  contentId: string
}

/** Идентификатор текущего раздела подменю и его открытость — для Menu.SubTrigger/Menu.SubContent. */
export const SidebarMenuSubContext = createContext<SidebarMenuSubContextValue | null>(null)

export function useSidebarMenuSubContext(componentName: string): SidebarMenuSubContextValue {
  const context = useContext(SidebarMenuSubContext)
  if (!context) {
    throw new Error(`Menu.${componentName} должен рендериться внутри <Menu.Sub>.`)
  }
  return context
}

/**
 * Публичный хук для кастомных элементов управления внутри Menu.Sub (например, отдельной кнопки
 * "×" в шапке мобильного bottom-sheet — см. макет в CLAUDE.md), которым не подходит готовый
 * Menu.SubTrigger. Должен вызываться внутри дерева <Menu.Sub>.
 */
export function useMenuSub() {
  const { value, open } = useSidebarMenuSubContext('useMenuSub')
  const { closeSubmenu, toggleSubmenu } = useSidebarMenuRootContext('useMenuSub')

  return {
    value,
    open,
    close: () => closeSubmenu(value),
    toggle: () => toggleSubmenu(value),
  }
}
