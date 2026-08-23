import { Children, isValidElement, useId, type ReactElement, type ReactNode } from 'react'

import { Menu } from '../headless-menu'
import { useRouterMenuContext } from './context'

interface RouterMenuItemForMatching {
  to?: string
}

export interface RouterMenuGroupProps {
  label: string
  children: ReactNode
  icon?: ReactNode
  className?: string
}

export function Group({ label, children, icon, className }: RouterMenuGroupProps) {
  const { pathname } = useRouterMenuContext('Group')
  const value = useId()

  const childRoutes = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => (child as ReactElement<RouterMenuItemForMatching>).props.to)
    .filter((to): to is string => Boolean(to))

  const active = childRoutes.some((to) => pathname === to || pathname.startsWith(`${to}/`))

  return (
    <Menu.Sub value={value} className={className}>
      <Menu.SubTrigger data-active={active ? '' : undefined}>
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{label}</span>
      </Menu.SubTrigger>

      <Menu.SubContent>{children}</Menu.SubContent>
    </Menu.Sub>
  )
}
