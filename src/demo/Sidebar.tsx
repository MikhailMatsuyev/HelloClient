import type { ReactNode } from 'react'

import {
  Group as RouterMenuGroup,
  Item as RouterMenuItem,
  List as RouterMenuList,
  Root as RouterMenuRoot,
  Toggle as RouterMenuToggle,
} from '../router-menu'
import { ROUTES } from './routes'
import {
  ClientsIcon,
  CollapseIcon,
  InventoryIcon,
  PaymentsIcon,
  SettingsIcon,
  TasksIcon,
  TrendsIcon,
} from './icons'

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  openValue: string | null
  setOpenValue: (value: string | null) => void
}

export function Sidebar({ collapsed, setCollapsed, openValue, setOpenValue }: SidebarProps) {
  return (
    <RouterMenuRoot
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      openValue={openValue}
      onOpenValueChange={setOpenValue}
      aria-label="Основная навигация"
      className={`hidden shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-150 md:flex ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex h-14 shrink-0 items-center overflow-hidden border-b border-slate-200 px-4">
        <span className="text-lg font-bold whitespace-nowrap text-blue-600">
          {collapsed ? 'HC' : 'HelloClient'}
        </span>
      </div>

      <RouterMenuList className="flex-1 space-y-1 px-2 py-3">
        <SidebarItem
          to={ROUTES.trends}
          icon={<TrendsIcon />}
          label="Trends"
          collapsed={collapsed}
        />

        <SidebarItem to={ROUTES.tasks} icon={<TasksIcon />} label="Tasks" collapsed={collapsed} />

        <SidebarItem
          to={ROUTES.payments}
          icon={<PaymentsIcon />}
          label="Payments"
          collapsed={collapsed}
        />

        <RouterMenuGroup value="clients" label="Clients" icon={<ClientsIcon />}>
          <SidebarSubItem to={ROUTES.clientsList} label="List" />
          <SidebarSubItem to={ROUTES.clientsReviews} label="Reviews" />
          <SidebarSubItem to={ROUTES.clientsNotifications} label="Notifications" />
        </RouterMenuGroup>

        <RouterMenuGroup value="inventory" label="Inventory" icon={<InventoryIcon />}>
          <SidebarSubItem to={ROUTES.inventoryProducts} label="Products" />
          <SidebarSubItem to={ROUTES.inventoryOrders} label="Orders" />
          <SidebarSubItem to={ROUTES.inventorySuppliers} label="Suppliers" />
        </RouterMenuGroup>

        <SidebarItem
          to={ROUTES.settings}
          icon={<SettingsIcon />}
          label="Settings"
          collapsed={collapsed}
        />
      </RouterMenuList>

      <RouterMenuToggle
        className="m-2 flex w-fit items-center justify-center self-start rounded-md border border-slate-300 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
      >
        <CollapseIcon className={`h-5 w-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
      </RouterMenuToggle>
    </RouterMenuRoot>
  )
}

interface SidebarItemProps {
  to: string
  icon: ReactNode
  label: string
  collapsed: boolean
}

function SidebarItem({ to, icon, label, collapsed }: SidebarItemProps) {
  return (
    <RouterMenuItem
      to={to}
      label={label}
      icon={icon}
      collapsed={collapsed}
      className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 data-[active]:bg-blue-50 data-[active]:font-medium data-[active]:text-blue-600"
    />
  )
}

function SidebarSubItem({ to, label }: { to: string; label: string }) {
  return (
    <RouterMenuItem
      to={to}
      label={label}
      className="block rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 data-[active]:bg-blue-50 data-[active]:font-medium data-[active]:text-blue-600"
    />
  )
}
