import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react'

import { Menu, useMenuSub } from '../headless-menu'
import { useSidebarMenuRootContext } from '../headless-menu/context'
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
  const { collapsed } = useSidebarMenuRootContext('Group')

  const value = useId()

  const childRoutes = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => (child as ReactElement<RouterMenuItemForMatching>).props.to)
    .filter((to): to is string => Boolean(to))

  const active = childRoutes.some((to) => pathname === to || pathname.startsWith(`${to}/`))

  return (
    <Menu.Sub value={value} className={className}>
      <GroupTrigger label={label} icon={icon} collapsed={collapsed} active={active} />

      <GroupContent label={label} collapsed={collapsed}>
        {children}
      </GroupContent>
    </Menu.Sub>
  )
}

interface GroupTriggerProps {
  label: string
  icon?: ReactNode
  collapsed: boolean
  active: boolean
}

function GroupTrigger({ label, icon, collapsed, active }: GroupTriggerProps) {
  const { open, openThis, toggle, triggerRef, contentId } = useMenuSub()

  const handleMouseEnter = () => {
    if (collapsed) {
      openThis()
    }
  }

  const handleClick = () => {
    if (collapsed) {
      openThis()
      return
    }

    toggle()
  }

  const triggerClassName = [
    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm',
    'hover:bg-slate-100',
    active
      ? 'bg-blue-50 font-medium text-blue-600'
      : open
        ? 'bg-blue-50 text-blue-600'
        : 'text-slate-600',
  ].join(' ')

  const iconClassName = active || open ? 'shrink-0 text-blue-600' : 'shrink-0 text-slate-500'

  return (
    <button
      ref={triggerRef as RefObject<HTMLButtonElement>}
      type="button"
      title={collapsed ? label : undefined}
      aria-expanded={open}
      aria-controls={contentId}
      data-state={open ? 'open' : 'closed'}
      data-active={active ? '' : undefined}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className={triggerClassName}
    >
      {icon && <span className={iconClassName}>{icon}</span>}

      {!collapsed && <span className="text-left">{label}</span>}
    </button>
  )
}

interface GroupContentProps {
  label: string
  collapsed: boolean
  children: ReactNode
}

function GroupContent({ label, collapsed, children }: GroupContentProps) {
  const { open, close, contentId } = useMenuSub()

  const closeTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const cancelScheduledClose = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const scheduleClose = () => {
    cancelScheduledClose()

    closeTimeoutRef.current = window.setTimeout(() => {
      if (open) {
        close()
      }

      closeTimeoutRef.current = null
    }, 200)
  }

  const contentClassName = collapsed
    ? [
        'absolute top-0 left-full z-10 ml-2 w-48 space-y-1',
        'rounded-lg border border-slate-200 bg-white p-2 shadow-lg',
        open ? 'visible opacity-100' : 'invisible opacity-0',
        'transition',
      ].join(' ')
    : ['ml-4 space-y-1 border-l border-slate-200 pl-3', open ? 'mt-1' : 'hidden'].join(' ')

  return (
    <Menu.SubContent
      id={contentId}
      onMouseEnter={collapsed ? cancelScheduledClose : undefined}
      onMouseLeave={collapsed ? scheduleClose : undefined}
      className={contentClassName}
    >
      {collapsed && <div className="px-2 py-1 text-xs font-semibold text-slate-900">{label}</div>}

      {children}
    </Menu.SubContent>
  )
}
