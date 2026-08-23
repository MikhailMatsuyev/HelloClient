import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Menu } from '../headless-menu'
import { useRouterMenuContext } from './context'

export interface RouterMenuItemProps {
  to: string
  label: string
  icon?: ReactNode
  collapsed?: boolean
  className?: string
}

export function Item({ to, label, icon, collapsed = false, className }: RouterMenuItemProps) {
  const { pathname } = useRouterMenuContext('Item')
  const active = pathname === to

  return (
    <Menu.Item
      asChild
      active={active}
      className={
        className ??
        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 data-[active]:bg-blue-50 data-[active]:font-medium data-[active]:text-blue-600'
      }
    >
      <Link to={to} title={collapsed ? label : undefined}>
        {icon && (
          <span className="shrink-0 text-slate-500 group-data-[active]:text-blue-600">{icon}</span>
        )}

        {!collapsed && <span>{label}</span>}
      </Link>
    </Menu.Item>
  )
}
