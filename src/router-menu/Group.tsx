import { Children, isValidElement, useId, type ReactElement, type ReactNode } from 'react'

import { Menu } from '../headless-menu'
import { useRouterMenuContext } from './context'

interface RouterMenuItemPropsForMatching {
  to?: string
}

export interface RouterMenuGroupProps {
  label: string
  children: ReactNode
  icon?: ReactNode
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

export function Group({
  label,
  children,
  icon,
  className,
  triggerClassName,
  contentClassName,
}: RouterMenuGroupProps) {
  const { pathname } = useRouterMenuContext('Group')
  const value = useId()

  const childRoutes = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => (child as ReactElement<RouterMenuItemPropsForMatching>).props.to)
    .filter((to): to is string => Boolean(to))

  const active = childRoutes.some((to) => pathname === to || pathname.startsWith(`${to}/`))

  return (
    <Menu.Sub value={value} className={className}>
      <Menu.SubTrigger data-active={active ? '' : undefined} className={triggerClassName}>
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{label}</span>
      </Menu.SubTrigger>

      <Menu.SubContent className={contentClassName}>{children}</Menu.SubContent>
    </Menu.Sub>
  )
}
