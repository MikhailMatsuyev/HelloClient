import { Slot } from './Slot'
import { SidebarMenuRootContext } from './context'
import { useSidebarMenu } from './useSidebarMenu'
import type { UseSidebarMenuOptions } from './useSidebarMenu'
import type { ComponentPropsWithRef, ReactNode } from 'react'

export interface MenuRootProps
  extends UseSidebarMenuOptions, Omit<ComponentPropsWithRef<'nav'>, 'defaultValue' | 'children'> {
  children: ReactNode
  /** Отрендерить поведение на собственном элементе потребителя вместо дефолтного <nav>. */
  asChild?: boolean
}

/**
 * Корень headless-меню: владеет состоянием (useSidebarMenu) и раздаёт его через контекст
 * всем вложенным Menu.*-компонентам. Сам по себе не содержит ни стилей, ни разметки пунктов —
 * по умолчанию рендерит только семантический <nav>-контейнер с `data-state`.
 */
export function Root({
  children,
  asChild,
  collapsed,
  defaultCollapsed,
  onCollapsedChange,
  openValue,
  defaultOpenValue,
  onOpenValueChange,
  ...rest
}: MenuRootProps) {
  const menu = useSidebarMenu({
    collapsed,
    defaultCollapsed,
    onCollapsedChange,
    openValue,
    defaultOpenValue,
    onOpenValueChange,
  })

  const Comp = asChild ? Slot : 'nav'

  return (
    <SidebarMenuRootContext.Provider value={menu}>
      <Comp data-state={menu.collapsed ? 'collapsed' : 'expanded'} {...rest}>
        {children}
      </Comp>
    </SidebarMenuRootContext.Provider>
  )
}
