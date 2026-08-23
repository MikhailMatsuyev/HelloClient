import { useLocation } from 'react-router-dom'
import type { ComponentPropsWithRef, ReactNode } from 'react'

import { useSidebarMenu } from '../headless-menu'
import { SidebarMenuRootContext } from '../headless-menu/context'
import type { UseSidebarMenuOptions } from '../headless-menu'
import { RouterMenuContext } from './context'

export interface RouterMenuRootProps
  extends UseSidebarMenuOptions, Omit<ComponentPropsWithRef<'nav'>, 'children'> {
  children: ReactNode
}

export function Root({
  children,
  collapsed,
  defaultCollapsed,
  onCollapsedChange,
  openValue,
  defaultOpenValue,
  onOpenValueChange,
  ...rest
}: RouterMenuRootProps) {
  const { pathname } = useLocation()

  const menu = useSidebarMenu({
    collapsed,
    defaultCollapsed,
    onCollapsedChange,
    openValue,
    defaultOpenValue,
    onOpenValueChange,
  })

  return (
    <RouterMenuContext.Provider value={{ pathname }}>
      <SidebarMenuRootContext.Provider value={menu}>
        <nav data-state={menu.collapsed ? 'collapsed' : 'expanded'} {...rest}>
          {children}
        </nav>
      </SidebarMenuRootContext.Provider>
    </RouterMenuContext.Provider>
  )
}
