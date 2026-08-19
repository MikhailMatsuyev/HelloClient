import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Menu, useMenuSub } from '../headless-menu'
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

interface MobileNavProps {
  openValue: string | null
  setOpenValue: (value: string | null) => void
}

/**
 * Мобильный вариант того же headless-меню: нижний таб-бар вместо боковой колонки, подменю —
 * bottom-sheet с оверлеем вместо flyout (см. "Сверка с Notion" в CLAUDE.md). Отдельный
 * Menu.Root от десктопного Sidebar — у мобильной раскладки нет понятия collapsed/expanded.
 */
export function MobileNav({ openValue, setOpenValue }: MobileNavProps) {
  return (
    <Menu.Root
      openValue={openValue}
      onOpenValueChange={setOpenValue}
      aria-label="Мобильная навигация"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white md:hidden"
    >
      <Menu.List className="flex items-stretch justify-around">
        <MobileLink to={ROUTES.trends} icon={<TrendsIcon />} label="Trends" />
        <MobileLink to={ROUTES.tasks} icon={<TasksIcon />} label="Tasks" />
        <MobileLink to={ROUTES.payments} icon={<PaymentsIcon />} label="Payments" />

        <MobileSubmenu value="clients" icon={<ClientsIcon />} label="Clients">
          <MobileSubLink to={ROUTES.clientsList} label="List" />
          <MobileSubLink to={ROUTES.clientsReviews} label="Reviews" />
          <MobileSubLink to={ROUTES.clientsNotifications} label="Notifications" />
        </MobileSubmenu>

        <MobileSubmenu value="inventory" icon={<InventoryIcon />} label="Inventory">
          <MobileSubLink to={ROUTES.inventoryProducts} label="Products" />
          <MobileSubLink to={ROUTES.inventoryOrders} label="Orders" />
          <MobileSubLink to={ROUTES.inventorySuppliers} label="Suppliers" />
        </MobileSubmenu>

        <MobileLink to={ROUTES.settings} icon={<SettingsIcon />} label="Settings" />
      </Menu.List>
    </Menu.Root>
  )
}

interface MobileLinkProps {
  to: string
  icon: ReactNode
  label: string
}

function MobileLink({ to, icon, label }: MobileLinkProps) {
  const { pathname } = useLocation()
  const active = pathname === to

  return (
    <Menu.Item
      asChild
      active={active}
      className="flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[11px] text-slate-500 data-[active]:text-blue-600"
    >
      <Link to={to}>
        <span className="h-5 w-5">{icon}</span>
        <span>{label}</span>
      </Link>
    </Menu.Item>
  )
}

interface MobileSubmenuProps {
  value: string
  icon: ReactNode
  label: string
  children: ReactNode
}

function MobileSubmenu({ value, icon, label, children }: MobileSubmenuProps) {
  return (
    <Menu.Sub value={value} className="contents">
      <Menu.SubTrigger className="flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[11px] text-slate-500 data-[state=open]:text-blue-600">
        <span className="h-5 w-5">{icon}</span>
        <span>{label}</span>
      </Menu.SubTrigger>

      <Menu.SubContent className="group/sheet invisible fixed inset-0 z-30 data-[state=open]:visible">
        <MobileSheetBackdrop />
        <div className="absolute inset-x-0 bottom-0 translate-y-full rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl transition-transform duration-200 group-data-[state=open]/sheet:translate-y-0">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-slate-900">{label}</span>
            <MobileSheetCloseButton />
          </div>
          <div className="space-y-1 p-2 pb-6">{children}</div>
        </div>
      </Menu.SubContent>
    </Menu.Sub>
  )
}

/** Клик по затемнённому фону закрывает bottom-sheet — используем useMenuSub, т.к. это не триггер. */
function MobileSheetBackdrop() {
  const { close } = useMenuSub()
  return (
    <div
      data-testid="sheet-backdrop"
      className="absolute inset-0 bg-slate-900/40"
      onClick={close}
    />
  )
}

/** Кнопка "×" в шапке bottom-sheet — ровно то, для чего задуман публичный хук useMenuSub. */
function MobileSheetCloseButton() {
  const { close } = useMenuSub()
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

function MobileSubLink({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation()
  const active = pathname === to

  return (
    <Menu.Item
      asChild
      active={active}
      className="block rounded-lg px-3 py-2 text-sm text-slate-600 data-[active]:bg-blue-50 data-[active]:font-medium data-[active]:text-blue-600"
    >
      <Link to={to}>{label}</Link>
    </Menu.Item>
  )
}
