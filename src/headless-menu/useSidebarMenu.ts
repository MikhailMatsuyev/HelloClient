import { useCallback, useMemo } from 'react'
import { useControllableState } from './useControllableState'

export interface UseSidebarMenuOptions {
  /** Свёрнутость меню (узкий/широкий режим), controlled. */
  collapsed?: boolean
  /** Начальная свёрнутость для uncontrolled-режима. По умолчанию — широкий режим. */
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void

  /**
   * Id раздела с открытым подменю (аккордеон — открыт максимум один), controlled.
   * `null` — все разделы закрыты.
   */
  openValue?: string | null
  defaultOpenValue?: string | null
  onOpenValueChange?: (value: string | null) => void
}

export interface UseSidebarMenuResult {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void

  openValue: string | null
  /** Открыт ли раздел подменю с данным value. */
  isOpen: (value: string) => boolean
  openSubmenu: (value: string) => void
  /** Закрывает раздел. Без аргумента — закрывает любой открытый. С аргументом — только если он и открыт. */
  closeSubmenu: (value?: string) => void
  /** Открыть, если закрыт; закрыть, если уже открыт этот же раздел (переключение по клику). */
  toggleSubmenu: (value: string) => void
}

/**
 * Вся логика состояния headless-меню, без единого рендера DOM — компоненты (Root/Sub/...)
 * являются тонкими консьюмерами этого хука через контекст. Позволяет использовать логику
 * меню и без compound-компонентов, если потребителю нужен полностью свой рендер.
 */
export function useSidebarMenu(options: UseSidebarMenuOptions = {}): UseSidebarMenuResult {
  const {
    collapsed: controlledCollapsed,
    defaultCollapsed = false,
    onCollapsedChange,
    openValue: controlledOpenValue,
    defaultOpenValue = null,
    onOpenValueChange,
  } = options

  const [collapsed, setCollapsed] = useControllableState({
    value: controlledCollapsed,
    defaultValue: defaultCollapsed,
    onChange: onCollapsedChange,
  })

  const [openValue, setOpenValue] = useControllableState({
    value: controlledOpenValue,
    defaultValue: defaultOpenValue,
    onChange: onOpenValueChange,
  })

  const toggleCollapsed = useCallback(() => setCollapsed(!collapsed), [collapsed, setCollapsed])

  const isOpen = useCallback((value: string) => openValue === value, [openValue])

  const openSubmenu = useCallback((value: string) => setOpenValue(value), [setOpenValue])

  const closeSubmenu = useCallback(
    (value?: string) => {
      if (value === undefined || openValue === value) {
        setOpenValue(null)
      }
    },
    [openValue, setOpenValue],
  )

  // Фокус при переключении между разделами намеренно не трогаем: когда аккордеон закрывает
  // предыдущий открытый раздел из-за клика/Enter/Space на новом триггере, фокус и так уже стоит
  // на новом триггере (это и есть источник события) — двигать его программно было бы лишним.
  // Хук ничего не знает про DOM/фокус вообще; управляемый возврат фокуса при закрытии реализован
  // отдельно, только для Escape, на уровне компонента Menu.Sub (см. src/headless-menu/Sub.tsx).
  const toggleSubmenu = useCallback(
    (value: string) => setOpenValue(openValue === value ? null : value),
    [openValue, setOpenValue],
  )

  // Стабильная ссылка на результат: значение контекста не должно пересоздаваться на каждый
  // рендер Root, иначе любое изменение состояния перерендерит всё дерево пунктов меню.
  return useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapsed,
      openValue,
      isOpen,
      openSubmenu,
      closeSubmenu,
      toggleSubmenu,
    }),
    [
      collapsed,
      setCollapsed,
      toggleCollapsed,
      openValue,
      isOpen,
      openSubmenu,
      closeSubmenu,
      toggleSubmenu,
    ],
  )
}
