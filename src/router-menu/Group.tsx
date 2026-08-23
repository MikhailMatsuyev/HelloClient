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
  value?: string
  label: string
  children: ReactNode
  icon?: ReactNode
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

export function Group({
  value: explicitValue,
  label,
  children,
  icon,
  className,
  triggerClassName,
  contentClassName,
}: RouterMenuGroupProps) {
  const { pathname } = useRouterMenuContext('Group')
  const { collapsed } = useSidebarMenuRootContext('Group')

  const generatedValue = useId()
  const value = explicitValue ?? generatedValue

  const childRoutes = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => (child as ReactElement<RouterMenuItemForMatching>).props.to)
    .filter((to): to is string => Boolean(to))

  const active = childRoutes.some((to) => pathname === to || pathname.startsWith(`${to}/`))

  return (
    <Menu.Sub value={value} className={className}>
      <GroupBody
        label={label}
        icon={icon}
        collapsed={collapsed}
        active={active}
        triggerClassName={triggerClassName}
        contentClassName={contentClassName}
      >
        {children}
      </GroupBody>
    </Menu.Sub>
  )
}

interface GroupBodyProps {
  label: string
  icon?: ReactNode
  collapsed: boolean
  active: boolean
  triggerClassName?: string
  contentClassName?: string
  children: ReactNode
}

function GroupBody({
  label,
  icon,
  collapsed,
  active,
  triggerClassName,
  contentClassName,
  children,
}: GroupBodyProps) {
  const { open, openThis, close, toggle, triggerRef, contentId, value } = useMenuSub()

  const { openValue } = useSidebarMenuRootContext('Group')
  const openValueRef = useRef(openValue)
  const closeTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    openValueRef.current = openValue
  }, [openValue])

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
      if (openValueRef.current === value) {
        close()
      }

      closeTimeoutRef.current = null
    }, 200)
  }

  const handleMouseEnter = () => {
    if (collapsed) {
      cancelScheduledClose()
      openThis()
    }
  }

  const handleMouseLeave = () => {
    if (collapsed) {
      scheduleClose()
    }
  }

  const handleClick = () => {
    if (collapsed) {
      openThis()
      return
    }

    toggle()
  }

  const defaultTriggerClassName = [
    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm',
    'hover:bg-slate-100',
    active
      ? 'bg-blue-50 font-medium text-blue-600'
      : open
        ? 'bg-blue-50 text-blue-600'
        : 'text-slate-600',
  ].join(' ')

  const iconClassName = active || open ? 'shrink-0 text-blue-600' : 'shrink-0 text-slate-500'

  const defaultContentClassName = collapsed
    ? [
        'absolute top-0 left-full z-10 ml-2 w-48 space-y-1',
        'rounded-lg border border-slate-200 bg-white p-2 shadow-lg',
        open ? 'visible opacity-100' : 'invisible opacity-0',
        'transition',
      ].join(' ')
    : ['ml-4 space-y-1 border-l border-slate-200 pl-3', open ? 'mt-1' : 'hidden'].join(' ')

  const resolvedContentClassName = contentClassName
    ? [
        contentClassName,
        open
          ? 'visible opacity-100 pointer-events-auto'
          : 'invisible opacity-0 pointer-events-none',
      ].join(' ')
    : defaultContentClassName

  return (
    <>
      <button
        ref={triggerRef as RefObject<HTMLButtonElement>}
        type="button"
        title={collapsed ? label : undefined}
        aria-expanded={open}
        aria-controls={contentId}
        data-state={open ? 'open' : 'closed'}
        data-active={active ? '' : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={triggerClassName ?? defaultTriggerClassName}
      >
        {icon && <span className={iconClassName}>{icon}</span>}

        {!collapsed && <span className="text-left">{label}</span>}
      </button>

      <Menu.SubContent
        id={contentId}
        onMouseEnter={collapsed ? cancelScheduledClose : undefined}
        onMouseLeave={collapsed ? scheduleClose : undefined}
        className={resolvedContentClassName}
      >
        {collapsed && <div className="px-2 py-1 text-xs font-semibold text-slate-900">{label}</div>}

        {children}
      </Menu.SubContent>
    </>
  )
}
