import { Slot } from './Slot'
import type { ComponentPropsWithRef, ReactNode } from 'react'

export interface MenuItemProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  children: ReactNode
  /** Отрендерить поведение пункта на собственном элементе — обычно на <Link> роутера. */
  asChild?: boolean
  /** Активен ли пункт (текущий route/localStorage/что угодно) — вычисляет потребитель. */
  active?: boolean
}

/**
 * Листовой (не имеющий подменю) пункт меню. Не содержит роутинг-логики: `active` —
 * готовый булев результат, который headless-пакет только подсвечивает через data- и aria-атрибуты.
 *
 * Осознанно не читает SidebarMenuRootContext и рендерится вне <Menu.Root> — самому пункту
 * не нужно ничего из стейта меню (ни collapsed, ни accordion), поэтому он не привязан к дереву.
 */
export function Item({ children, asChild, active, ...rest }: MenuItemProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      type={asChild ? undefined : 'button'}
      data-active={active ? '' : undefined}
      aria-current={active ? 'page' : undefined}
      {...rest}
    >
      {children}
    </Comp>
  )
}
