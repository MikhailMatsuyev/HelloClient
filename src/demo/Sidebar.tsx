import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import { Menu, useMenuSub } from '../headless-menu'
import { ROUTES } from './routes'
import {
  ChevronIcon,
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

/**
 * Стилизованный компонент-потребитель поверх headless Menu.* — широкий/узкий вариант из макетов.
 * Все стили и разметка здесь, в headless-пакете (src/headless-menu) их нет вообще.
 */
export function Sidebar({ collapsed, setCollapsed, openValue, setOpenValue }: SidebarProps) {
  return (
    <Menu.Root
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

      {/* Без overflow-y-auto: если сделать вертикальный скролл, CSS по спеке принудительно
          превращает overflow-x в auto и flyout из SidebarSubmenu (position: absolute, торчит
          вправо за границу колонки) начинает провоцировать горизонтальный скролл всего списка.
          Пунктов в демо немного, поэтому скролл не нужен — это самое простое верное решение. */}
      <Menu.List className="flex-1 space-y-1 px-2 py-3">
        <SidebarLink
          to={ROUTES.trends}
          icon={<TrendsIcon />}
          label="Trends"
          collapsed={collapsed}
        />
        <SidebarLink to={ROUTES.tasks} icon={<TasksIcon />} label="Tasks" collapsed={collapsed} />
        <SidebarLink
          to={ROUTES.payments}
          icon={<PaymentsIcon />}
          label="Payments"
          collapsed={collapsed}
        />

        <SidebarSubmenu
          value="clients"
          icon={<ClientsIcon />}
          label="Clients"
          collapsed={collapsed}
          routePrefix={ROUTES.clients}
          openValue={openValue}
          setOpenValue={setOpenValue}
        >
          <SidebarSubLink to={ROUTES.clientsList} label="List" />
          <SidebarSubLink to={ROUTES.clientsReviews} label="Reviews" />
          <SidebarSubLink to={ROUTES.clientsNotifications} label="Notifications" />
        </SidebarSubmenu>

        <SidebarSubmenu
          value="inventory"
          icon={<InventoryIcon />}
          label="Inventory"
          collapsed={collapsed}
          routePrefix={ROUTES.inventory}
          openValue={openValue}
          setOpenValue={setOpenValue}
        >
          <SidebarSubLink to={ROUTES.inventoryProducts} label="Products" />
          <SidebarSubLink to={ROUTES.inventoryOrders} label="Orders" />
          <SidebarSubLink to={ROUTES.inventorySuppliers} label="Suppliers" />
        </SidebarSubmenu>

        <SidebarLink
          to={ROUTES.settings}
          icon={<SettingsIcon />}
          label="Settings"
          collapsed={collapsed}
        />
      </Menu.List>

      {/* self-start — иначе Menu.Toggle растянулся бы на всю ширину колонки (Menu.Root это
          flex-col, cross-axis по умолчанию stretch), и рамка вокруг стрелки оказалась бы
          посередине, а не слева, как в макете. */}
      <Menu.Toggle
        className="m-2 flex w-fit items-center justify-center self-start rounded-md border border-slate-300 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
      >
        <CollapseIcon className={`h-5 w-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
      </Menu.Toggle>
    </Menu.Root>
  )
}

interface SidebarLinkProps {
  to: string
  icon: ReactNode
  label: string
  collapsed: boolean
}

function SidebarLink({ to, icon, label, collapsed }: SidebarLinkProps) {
  const { pathname } = useLocation()
  const active = pathname === to

  return (
    <Menu.Item
      asChild
      active={active}
      className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 data-[active]:bg-blue-50 data-[active]:font-medium data-[active]:text-blue-600"
    >
      <Link to={to} title={collapsed ? label : undefined}>
        <span className="shrink-0 text-slate-500 group-data-[active]:text-blue-600">{icon}</span>
        {!collapsed && <span>{label}</span>}
      </Link>
    </Menu.Item>
  )
}

interface SidebarSubmenuProps {
  value: string
  icon: ReactNode
  label: string
  collapsed: boolean
  /** Префикс роутов дочерних пунктов — по нему определяем "содержит ли раздел активную страницу". */
  routePrefix: string
  openValue: string | null
  setOpenValue: (value: string | null) => void
  children: ReactNode
}

function SidebarSubmenu({
  value,
  icon,
  label,
  collapsed,
  routePrefix,
  openValue,
  setOpenValue,
  children,
}: SidebarSubmenuProps) {
  const { pathname } = useLocation()
  const hasActiveDescendant = pathname === routePrefix || pathname.startsWith(`${routePrefix}/`)

  // "Hover intent" с отложенным закрытием: Menu.Sub — обычный блочный <div>, его bounding box
  // не расширяется абсолютно спозиционированным flyout'ом (CSS так не работает — position:
  // absolute вынимает элемент из потока и не влияет на размер родителя). Значит, ведя курсор от
  // триггера к flyout'у, он неизбежно на миг покидает bounding box триггера ДО того, как попадёт
  // на flyout — мгновенное закрытие по mouseleave (как было раньше) убивало flyout ровно в этот
  // момент, не давая до него доехать. Поэтому закрытие теперь не мгновенное: schedule на таймере,
  // отменяется, если курсор за это время добрался и до триггера, и до самого flyout'а (у обоих
  // свой mouseenter → cancel). Тот же паттерн, что в реальных hover-меню (Radix, Floating UI и т.п.).
  const closeTimeoutRef = useRef<number | null>(null)

  // Отдельный ref-снимок openValue: колбэк внутри setTimeout иначе закрыл бы себя же поверх
  // раздела, который успел стать открытым за эти 200мс другим путём (клик/hover на другой Sub) —
  // classic stale closure. Проверяем самый свежий openValue на момент срабатывания таймера,
  // а не тот, что был закрыт в замыкании при вызове scheduleClose.
  const openValueRef = useRef(openValue)
  useEffect(() => {
    openValueRef.current = openValue
  }, [openValue])

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
        setOpenValue(null)
      }
    }, 200)
  }

  useEffect(() => cancelScheduledClose, [])

  return (
    <Menu.Sub value={value} className="relative">
      <SidebarSubmenuTrigger
        icon={icon}
        label={label}
        collapsed={collapsed}
        active={hasActiveDescendant}
        onHoverStart={collapsed ? cancelScheduledClose : undefined}
        onHoverEnd={collapsed ? scheduleClose : undefined}
      />

      <Menu.SubContent
        onMouseEnter={collapsed ? cancelScheduledClose : undefined}
        onMouseLeave={collapsed ? scheduleClose : undefined}
        className={
          collapsed
            ? // Узкий режим: flyout справа от иконки. data-state=open отражает и клик, и hover
              // (см. SidebarSubmenuTrigger) — оба идут через один и тот же accordion-экшен, так что
              // никогда не может оказаться открыто/видимо два flyout'а одновременно.
              'invisible absolute top-0 left-full z-10 ml-2 w-48 space-y-1 rounded-lg border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition data-[state=open]:visible data-[state=open]:opacity-100'
            : // Широкий режим: инлайн-раскрытие под самим пунктом, только по клику.
              'ml-4 hidden space-y-1 border-l border-slate-200 pl-3 data-[state=open]:mt-1 data-[state=open]:block'
        }
      >
        {collapsed && <div className="px-2 py-1 text-xs font-semibold text-slate-900">{label}</div>}
        {children}
      </Menu.SubContent>
    </Menu.Sub>
  )
}

interface SidebarSubmenuTriggerProps {
  icon: ReactNode
  label: string
  collapsed: boolean
  /** Содержит ли раздел текущую активную страницу — персистентный сигнал, независимый от того,
   *  открыт ли сейчас flyout (тот гаснет, стоит навести мышь на соседний раздел). */
  active: boolean
  /** Отменить отложенное закрытие flyout'а (см. SidebarSubmenu) — курсор снова над триггером. */
  onHoverStart?: () => void
  /** Запланировать закрытие flyout'а — курсор ушёл с триггера (возможно, к самому flyout'у). */
  onHoverEnd?: () => void
}

/**
 * Полностью кастомная кнопка вместо готового Menu.SubTrigger — намеренно: тот всегда переключает
 * (open/close) по клику, а в узком режиме клик нужен вместе с hover (см. onMouseEnter). Сочетание
 * "hover уже открыл → click тут же переключает обратно в closed" — реальная гонка событий (мышь
 * всегда сначала входит в элемент, потом кликает), поэтому в узком режиме click должен ТОЛЬКО
 * открывать (idempotent, как и hover), а не toggle. useMenuSub() — ровно для таких случаев.
 */
function SidebarSubmenuTrigger({
  icon,
  label,
  collapsed,
  active,
  onHoverStart,
  onHoverEnd,
}: SidebarSubmenuTriggerProps) {
  const { open, openThis, toggle, triggerRef, contentId } = useMenuSub()

  return (
    <button
      ref={triggerRef as RefObject<HTMLButtonElement>}
      type="button"
      // В узком режиме подпись скрыта (только иконка) — без title кнопка осталась бы вообще без
      // доступного имени для скринридера (иконка помечена aria-hidden).
      title={collapsed ? label : undefined}
      aria-expanded={open}
      aria-controls={contentId}
      onMouseEnter={
        collapsed
          ? () => {
              onHoverStart?.()
              openThis()
            }
          : undefined
      }
      onMouseLeave={collapsed ? onHoverEnd : undefined}
      onClick={collapsed ? openThis : toggle}
      data-state={open ? 'open' : 'closed'}
      // data-active — персистентный сигнал "содержит активную страницу", независимый от data-state
      // (тот гаснет, стоит навести на соседний раздел). См. референс-видео: иконка родителя залита
      // синим, даже когда flyout не наведён. Оба выглядят одинаково — синим, как на видео (там при
      // наведении на Inventory он подсвечивается точно так же, как ранее активный Clients).
      data-active={active ? '' : undefined}
      className="group/trigger flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 data-[active]:bg-blue-50 data-[active]:font-medium data-[active]:text-blue-600 data-[state=open]:bg-blue-50 data-[state=open]:text-blue-600"
    >
      <span className="shrink-0 text-slate-500 group-data-[active]/trigger:text-blue-600 group-data-[state=open]/trigger:text-blue-600">
        {icon}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 text-left">{label}</span>
          <ChevronIcon className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-data-[state=open]/trigger:rotate-90" />
        </>
      )}
    </button>
  )
}

function SidebarSubLink({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation()
  const active = pathname === to

  return (
    <Menu.Item
      asChild
      active={active}
      className="block rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 data-[active]:bg-blue-50 data-[active]:font-medium data-[active]:text-blue-600"
    >
      <Link to={to}>{label}</Link>
    </Menu.Item>
  )
}
