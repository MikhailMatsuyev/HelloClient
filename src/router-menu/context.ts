import { createContext, useContext } from 'react'
import type { RefObject } from 'react'

import type { UseSidebarMenuResult } from '../headless-menu'
import { SidebarMenuSubContext, SidebarMenuRootContext } from '../headless-menu/context'

export interface RouterMenuContextValue {
  pathname: string
}

export const RouterMenuContext = createContext<RouterMenuContextValue | null>(null)

export function useRouterMenuContext(componentName: string): RouterMenuContextValue {
  const context = useContext(RouterMenuContext)

  if (!context) {
    throw new Error(`RouterMenu.${componentName} должен рендериться внутри <RouterMenu.Root>.`)
  }

  return context
}

export function useRouterMenuSub() {
  const context = useContext(SidebarMenuSubContext)
  const menu = useContext(SidebarMenuRootContext)

  if (!context) {
    throw new Error('RouterMenu.useRouterMenuSub должен вызываться внутри <RouterMenu.Group>.')
  }

  if (!menu) {
    throw new Error('RouterMenu.useRouterMenuSub должен вызываться внутри <RouterMenu.Root>.')
  }

  const { value, open, triggerRef, contentId } = context

  const { openSubmenu, closeSubmenu, toggleSubmenu } = menu as UseSidebarMenuResult

  return {
    value,
    open,
    openThis: () => openSubmenu(value),
    close: () => closeSubmenu(value),
    toggle: () => toggleSubmenu(value),
    triggerRef: triggerRef as RefObject<HTMLElement | null>,
    contentId,
  }
}
