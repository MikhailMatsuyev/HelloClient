import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useMatchMedia } from '../headless-menu'
import { useLocalStorageState } from './useLocalStorageState'

/** Ниже этой ширины широкий сайдбар начинает теснить контент — используем как дефолт для
 *  collapsed, только пока у пользователя ещё нет собственного сохранённого выбора. */
const NARROW_VIEWPORT_QUERY = '(max-width: 1024px)'

/** value каждого Menu.Sub в демо-сайдбаре ⇄ префикс роутов, которые в него входят. */
const SUBMENU_ROUTE_PREFIXES: Record<string, string> = {
  clients: '/clients',
  inventory: '/inventory',
}

function getSubmenuValueForPath(pathname: string): string | null {
  for (const [value, prefix] of Object.entries(SUBMENU_ROUTE_PREFIXES)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return value
  }
  return null
}

/**
 * Стейт демо-сайдбара, общий для десктопной и мобильной версий: собран из отдельных
 * независимых кусочков (localStorage для collapsed, React Router для openValue) — headless-меню
 * ни про один из этих источников не знает, просто получает готовые controlled value/onChange.
 */
export function useSidebarState() {
  const location = useLocation()
  // useMatchMedia — только источник значения по умолчанию для первого визита (localStorage
  // ничего ещё не хранит): дальше выбор пользователя (клик по Menu.Toggle) всегда главнее.
  const prefersCollapsedByDefault = useMatchMedia(NARROW_VIEWPORT_QUERY)
  const [collapsed, setCollapsed] = useLocalStorageState(
    'menu-collapsed',
    prefersCollapsedByDefault,
  )

  const [openValue, setOpenValue] = useState<string | null>(() =>
    getSubmenuValueForPath(location.pathname),
  )
  // "Adjust state during render" (react.dev), не useEffect: раскрываем (и тем самым подсвечиваем)
  // раздел подменю при переходе на его роут — в т.ч. по прямой ссылке или кнопке «назад» — без
  // лишнего рендера, который дал бы useEffect. Ручное открытие/закрытие кликом по SubTrigger
  // работает независимо: тот случай не меняет pathname, поэтому это не перезаписывает его.
  const [syncedPathname, setSyncedPathname] = useState(location.pathname)
  if (location.pathname !== syncedPathname) {
    setSyncedPathname(location.pathname)
    setOpenValue(getSubmenuValueForPath(location.pathname))
  }

  return { collapsed, setCollapsed, openValue, setOpenValue }
}
