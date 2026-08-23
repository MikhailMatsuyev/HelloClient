import {
  Root as RouterMenuRoot,
  List as RouterMenuList,
  Toggle as RouterMenuToggle,
  Item as RouterMenuItem,
  Group as RouterMenuGroup,
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

      <RouterMenuList>
        <RouterMenuItem
          to={ROUTES.trends}
          label="Trends"
          icon={<TrendsIcon />}
          collapsed={collapsed}
        />

        <RouterMenuItem
          to={ROUTES.tasks}
          label="Tasks"
          icon={<TasksIcon />}
          collapsed={collapsed}
        />

        <RouterMenuItem
          to={ROUTES.payments}
          label="Payments"
          icon={<PaymentsIcon />}
          collapsed={collapsed}
        />

        <RouterMenuGroup label="Clients" icon={<ClientsIcon />}>
          <RouterMenuItem to={ROUTES.clientsList} label="List" />
          <RouterMenuItem to={ROUTES.clientsReviews} label="Reviews" />
          <RouterMenuItem to={ROUTES.clientsNotifications} label="Notifications" />
        </RouterMenuGroup>

        <RouterMenuGroup label="Inventory" icon={<InventoryIcon />}>
          <RouterMenuItem to={ROUTES.inventoryProducts} label="Products" />
          <RouterMenuItem to={ROUTES.inventoryOrders} label="Orders" />
          <RouterMenuItem to={ROUTES.inventorySuppliers} label="Suppliers" />
        </RouterMenuGroup>

        <RouterMenuItem
          to={ROUTES.settings}
          label="Settings"
          icon={<SettingsIcon />}
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
