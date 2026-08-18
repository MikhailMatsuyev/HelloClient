import { describe, expect, it, vi } from 'vitest'
import { mergeRefs } from './mergeRefs'

describe('mergeRefs', () => {
  it('пропускает null/undefined рефы, не падая', () => {
    const merged = mergeRefs<string>(null, undefined)
    expect(() => (merged as (node: string | null) => void)('node')).not.toThrow()
  })

  it('вызывает callback-реф с узлом', () => {
    const callbackRef = vi.fn()
    const merged = mergeRefs<string>(callbackRef)

    ;(merged as (node: string | null) => void)('node')
    expect(callbackRef).toHaveBeenCalledWith('node')
  })

  it('проставляет .current у object-рефа', () => {
    const objectRef = { current: null as string | null }
    const merged = mergeRefs<string>(objectRef)

    ;(merged as (node: string | null) => void)('node')
    expect(objectRef.current).toBe('node')
  })

  it('одновременно обновляет и callback-, и object-реф в переданном порядке', () => {
    const calls: string[] = []
    const callbackRef = vi.fn(() => {
      calls.push('callback')
    })
    const objectRef = { current: null as string | null }
    const anotherObjectRef = {
      set current(_value: string | null) {
        calls.push('object')
      },
    }

    const merged = mergeRefs<string>(callbackRef, objectRef, anotherObjectRef)
    ;(merged as (node: string | null) => void)('node')

    expect(objectRef.current).toBe('node')
    expect(calls).toEqual(['callback', 'object'])
  })

  it('очищает все рефы при вызове с null (размонтирование)', () => {
    const callbackRef = vi.fn()
    const objectRef = { current: 'stale' as string | null }
    const merged = mergeRefs<string>(callbackRef, objectRef)

    ;(merged as (node: string | null) => void)(null)

    expect(callbackRef).toHaveBeenCalledWith(null)
    expect(objectRef.current).toBeNull()
  })
})
