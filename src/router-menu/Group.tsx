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
  const { open, openThis, toggle, triggerRef, contentId } = useMenuSub()

  const value = useId()
  const closeTimeoutRef = useRef<number | null>(null)

  const childRoutes = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => (child as ReactElement<RouterMenuItemForMatching>).props.to)
    .filter((to): to is string => Boolean(to))

  const active = childRoutes.some((to) => pathname === to || pathname.startsWith(`${to}/`))

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
        toggle()
      }
      closeTimeoutRef.current = null
    }, 200)
  }

  return (
    <Menu.Sub value={value} className={className}>
      <button
        ref={triggerRef as RefObject<HTMLButtonElement>}
        type="button"
        title={collapsed ? label : undefined}
        aria-expanded={open}
        aria-controls={contentId}
        data-state={open ? 'open' : 'closed'}
        data-active={active ? '' : undefined}
        onMouseEnter={
          collapsed
            ? () => {
                cancelScheduledClose()
                openThis()
              }
            : undefined
        }
        onMouseLeave={collapsed ? scheduleClose : undefined}
        onClick={collapsed ? openThis : toggle}
        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 data-[active]:bg-blue-50 data-[active]:font-medium data-[active]:text-blue-600 data-[state=open]:bg-blue-50 data-[state=open]:text-blue-600"
      >
        {icon && (
          <span className="shrink-0 text-slate-500 group-data-[active]:text-blue-600 group-data-[state=open]:text-blue-600">
            {icon}
          </span>
        )}

        {!collapsed && <span className="text-left">{label}</span>}
      </button>

      <Menu.SubContent
        id={contentId}
        onMouseEnter={collapsed ? cancelScheduledClose : undefined}
        onMouseLeave={collapsed ? scheduleClose : undefined}
        className={
          collapsed
            ? 'invisible absolute top-0 left-full z-10 ml-2 w-48 space-y-1 rounded-lg border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition data-[state=open]:visible data-[state=open]:opacity-100'
            : 'ml-4 hidden space-y-1 border-l border-slate-200 pl-3 data-[state=open]:mt-1 data-[state=open]:block'
        }
      >
        {collapsed && <div className="px-2 py-1 text-xs font-semibold text-slate-900">{label}</div>}

        {children}
      </Menu.SubContent>
    </Menu.Sub>
  )
}
