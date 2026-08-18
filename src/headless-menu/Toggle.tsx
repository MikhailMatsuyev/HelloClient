import { Slot } from './Slot'
import { useSidebarMenuRootContext } from './context'
import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react'

export interface MenuToggleProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  children: ReactNode
  asChild?: boolean
}

/** Кнопка "свернуть"/"развернуть" всё меню целиком (см. кнопку из макетов узкого/широкого варианта). */
export function Toggle({ children, asChild, onClick, ...rest }: MenuToggleProps) {
  const { collapsed, toggleCollapsed } = useSidebarMenuRootContext('Toggle')
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      type={asChild ? undefined : 'button'}
      aria-expanded={!collapsed}
      data-state={collapsed ? 'collapsed' : 'expanded'}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        toggleCollapsed()
      }}
      {...rest}
    >
      {children}
    </Comp>
  )
}
