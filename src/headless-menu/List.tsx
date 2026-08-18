import { Slot } from './Slot'
import { useSidebarMenuRootContext } from './context'
import type { ComponentPropsWithRef, ReactNode } from 'react'

export interface MenuListProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children: ReactNode
  asChild?: boolean
}

/** Контейнер верхнеуровневых пунктов меню. Само по себе — просто группировка для композиции. */
export function List({ children, asChild, ...rest }: MenuListProps) {
  const { collapsed } = useSidebarMenuRootContext('List')
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp data-state={collapsed ? 'collapsed' : 'expanded'} {...rest}>
      {children}
    </Comp>
  )
}
