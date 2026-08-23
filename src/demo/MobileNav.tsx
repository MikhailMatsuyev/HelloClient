import type { ReactNode } from 'react'

import {
  Group as RouterMenuGroup,
  Item as RouterMenuItem,
  List as RouterMenuList,
  Root as RouterMenuRoot,
  useRouterMenuSub,
} from '../router-menu'
import { ROUTES } from './routes'
import {
  ClientsIcon,
  CloseIcon,
  InventoryIcon,
  PaymentsIcon,
  SettingsIcon,
  TasksIcon,
  TrendsIcon,
} from './icons'

export function MobileNav() {
  return (
    <RouterMenuRoot
      aria-label="Мобильная навигация"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white md:hidden"
    >
      <RouterMenuList className="flex items-stretch justify-around">
        <MobileItem to={ROUTES.trends} icon={<TrendsIcon />} label="Trends" />

        <MobileItem to={ROUTES.tasks} icon={<TasksIcon />} label="Tasks" />

        <MobileItem to={ROUTES.payments} icon={<PaymentsIcon />} label="Payments" />

        <MobileGroup label="Clients" icon={<ClientsIcon />}>
          <MobileSubItem to={ROUTES.clientsList} label="List" />
          <MobileSubItem to={ROUTES.clientsReviews} label="Reviews" />
          <MobileSubItem to={ROUTES.clientsNotifications} label="Notifications" />
        </MobileGroup>

        <MobileGroup label="Inventory" icon={<InventoryIcon />}>
          <MobileSubItem to={ROUTES.inventoryProducts} label="Products" />
          <MobileSubItem to={ROUTES.inventoryOrders} label="Orders" />
          <MobileSubItem to={ROUTES.inventorySuppliers} label="Suppliers" />
        </MobileGroup>

        <MobileItem to={ROUTES.settings} icon={<SettingsIcon />} label="Settings" />
      </RouterMenuList>
    </RouterMenuRoot>
  )
}

interface MobileItemProps {
  to: string
  icon: ReactNode
  label: string
}

function MobileItem({ to, icon, label }: MobileItemProps) {
  return (
    <RouterMenuItem
      to={to}
      label={label}
      icon={icon}
      className="flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[11px] text-slate-500 data-[active]:text-blue-600"
    />
  )
}

interface MobileGroupProps {
  label: string
  icon: ReactNode
  children: ReactNode
}

function MobileGroup({ label, icon, children }: MobileGroupProps) {
  return (
    <RouterMenuGroup
      label={label}
      icon={icon}
      className="contents"
      triggerClassName="flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[11px] text-slate-500 data-[state=open]:text-blue-600"
      contentClassName="fixed inset-0 z-30 bg-transparent"
    >
      <MobileSheet label={label}>{children}</MobileSheet>
    </RouterMenuGroup>
  )
}

function MobileSheet({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <MobileSheetBackdrop />

      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <span className="text-sm font-semibold text-slate-900">{label}</span>

          <MobileSheetCloseButton />
        </div>

        <div className="space-y-1 p-2 pb-6">{children}</div>
      </div>
    </>
  )
}

function MobileSheetBackdrop() {
  const { close } = useRouterMenuSub()

  return (
    <div
      data-testid="sheet-backdrop"
      className="absolute inset-0 bg-slate-900/40"
      onClick={close}
    />
  )
}

function MobileSheetCloseButton() {
  const { close } = useRouterMenuSub()

  return (
    <button
      type="button"
      onClick={close}
      aria-label="Закрыть"
      className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
    >
      <CloseIcon className="h-5 w-5" />
    </button>
  )
}

function MobileSubItem({ to, label }: { to: string; label: string }) {
  return (
    <RouterMenuItem
      to={to}
      label={label}
      className="block rounded-lg px-3 py-2 text-sm text-slate-600 data-[active]:bg-blue-50 data-[active]:font-medium data-[active]:text-blue-600"
    />
  )
}
