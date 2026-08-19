import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useLocalStorageState } from './useLocalStorageState'

describe('useLocalStorageState', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('использует defaultValue, если в localStorage ничего нет', () => {
    const { result } = renderHook(() => useLocalStorageState('menu-collapsed', false))
    expect(result.current[0]).toBe(false)
  })

  it('читает уже сохранённое значение при монтировании', () => {
    localStorage.setItem('menu-collapsed', JSON.stringify(true))
    const { result } = renderHook(() => useLocalStorageState('menu-collapsed', false))
    expect(result.current[0]).toBe(true)
  })

  it('сохраняет новое значение в localStorage', () => {
    const { result } = renderHook(() => useLocalStorageState('menu-collapsed', false))
    act(() => result.current[1](true))

    expect(result.current[0]).toBe(true)
    expect(localStorage.getItem('menu-collapsed')).toBe('true')
  })

  it('не падает на битом JSON в localStorage — использует defaultValue', () => {
    localStorage.setItem('menu-collapsed', 'not-json{{{')
    const { result } = renderHook(() => useLocalStorageState('menu-collapsed', false))
    expect(result.current[0]).toBe(false)
  })
})
