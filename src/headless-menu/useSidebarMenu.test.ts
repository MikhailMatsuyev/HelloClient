import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSidebarMenu } from './useSidebarMenu'

describe('useSidebarMenu', () => {
  it('по умолчанию развёрнут и без открытого подменю', () => {
    const { result } = renderHook(() => useSidebarMenu())
    expect(result.current.collapsed).toBe(false)
    expect(result.current.openValue).toBeNull()
    expect(result.current.isOpen('inventory')).toBe(false)
  })

  it('toggleCollapsed переключает свёрнутость (uncontrolled)', () => {
    const { result } = renderHook(() => useSidebarMenu())
    act(() => result.current.toggleCollapsed())
    expect(result.current.collapsed).toBe(true)
    act(() => result.current.toggleCollapsed())
    expect(result.current.collapsed).toBe(false)
  })

  it('collapsed управляется извне (controlled) и не меняется локально', () => {
    const onCollapsedChange = vi.fn()
    const { result } = renderHook(() => useSidebarMenu({ collapsed: true, onCollapsedChange }))

    expect(result.current.collapsed).toBe(true)
    act(() => result.current.toggleCollapsed())
    expect(onCollapsedChange).toHaveBeenCalledWith(false)
    // источник истины — снаружи, локально значение не поменялось несмотря на act()
    expect(result.current.collapsed).toBe(true)
  })

  it('открытие раздела подменю — аккордеон: второй открытый закрывает первый', () => {
    const { result } = renderHook(() => useSidebarMenu())

    act(() => result.current.openSubmenu('inventory'))
    expect(result.current.isOpen('inventory')).toBe(true)

    act(() => result.current.openSubmenu('clients'))
    expect(result.current.isOpen('inventory')).toBe(false)
    expect(result.current.isOpen('clients')).toBe(true)
  })

  it('toggleSubmenu закрывает уже открытый раздел повторным вызовом', () => {
    const { result } = renderHook(() => useSidebarMenu())

    act(() => result.current.toggleSubmenu('inventory'))
    expect(result.current.isOpen('inventory')).toBe(true)

    act(() => result.current.toggleSubmenu('inventory'))
    expect(result.current.isOpen('inventory')).toBe(false)
  })

  it('closeSubmenu без аргумента закрывает любой открытый раздел', () => {
    const { result } = renderHook(() => useSidebarMenu({ defaultOpenValue: 'inventory' }))
    expect(result.current.isOpen('inventory')).toBe(true)

    act(() => result.current.closeSubmenu())
    expect(result.current.isOpen('inventory')).toBe(false)
  })

  it('closeSubmenu с аргументом не закрывает чужой раздел', () => {
    const { result } = renderHook(() => useSidebarMenu({ defaultOpenValue: 'inventory' }))

    act(() => result.current.closeSubmenu('clients'))
    expect(result.current.isOpen('inventory')).toBe(true)
  })

  it('openValue управляется извне (controlled)', () => {
    const onOpenValueChange = vi.fn()
    const { result } = renderHook(() =>
      useSidebarMenu({ openValue: 'inventory', onOpenValueChange }),
    )

    expect(result.current.isOpen('inventory')).toBe(true)
    act(() => result.current.toggleSubmenu('inventory'))
    expect(onOpenValueChange).toHaveBeenCalledWith(null)
    expect(result.current.isOpen('inventory')).toBe(true)
  })

  it('closeSubmenu в controlled-режиме только сообщает об изменении, не меняет openValue сама', () => {
    const onOpenValueChange = vi.fn()
    const { result } = renderHook(() =>
      useSidebarMenu({ openValue: 'inventory', onOpenValueChange }),
    )

    act(() => result.current.closeSubmenu())
    expect(onOpenValueChange).toHaveBeenCalledWith(null)
    expect(result.current.isOpen('inventory')).toBe(true)
  })

  it('несколько переключений collapsed подряд (controlled) каждый раз сообщают актуальное значение', () => {
    const onCollapsedChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ collapsed }) => useSidebarMenu({ collapsed, onCollapsedChange }),
      { initialProps: { collapsed: false } },
    )

    act(() => result.current.toggleCollapsed())
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true)

    rerender({ collapsed: true })
    act(() => result.current.toggleCollapsed())
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false)

    rerender({ collapsed: false })
    expect(result.current.collapsed).toBe(false)
    expect(onCollapsedChange).toHaveBeenCalledTimes(2)
  })
})
