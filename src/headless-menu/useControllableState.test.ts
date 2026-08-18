import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useControllableState } from './useControllableState'

describe('useControllableState', () => {
  it('работает в uncontrolled-режиме от defaultValue', () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: 'a' }))
    expect(result.current[0]).toBe('a')

    act(() => result.current[1]('b'))
    expect(result.current[0]).toBe('b')
  })

  it('вызывает onChange в uncontrolled-режиме', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState({ defaultValue: 'a', onChange }))

    act(() => result.current[1]('b'))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('в controlled-режиме не меняет значение сам — источник истины снаружи', () => {
    const onChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ value }) => useControllableState({ value, defaultValue: 'unused', onChange }),
      { initialProps: { value: 'controlled' } },
    )

    expect(result.current[0]).toBe('controlled')

    act(() => result.current[1]('next'))
    // setValue вызвал onChange, но значение не изменилось — потребитель ещё не отразил его в value.
    expect(onChange).toHaveBeenCalledWith('next')
    expect(result.current[0]).toBe('controlled')

    rerender({ value: 'next' })
    expect(result.current[0]).toBe('next')
  })
})
