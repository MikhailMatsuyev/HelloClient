import { createContext, useContext } from 'react'
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
