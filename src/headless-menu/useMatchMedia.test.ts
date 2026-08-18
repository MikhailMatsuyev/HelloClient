import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMatchMedia } from './useMatchMedia'

function createMatchMediaMock(initialMatches: boolean) {
  let matches = initialMatches
  let listener: (() => void) | null = null

  const mediaQueryList = {
    get matches() {
      return matches
    },
    addEventListener: vi.fn((_event: string, cb: () => void) => {
      listener = cb
    }),
    removeEventListener: vi.fn(() => {
      listener = null
    }),
  }

  return {
    matchMedia: vi.fn().mockReturnValue(mediaQueryList),
    setMatches: (next: boolean) => {
      matches = next
      listener?.()
    },
  }
}

describe('useMatchMedia', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('возвращает текущее состояние media-query и реагирует на его изменение', () => {
    const { matchMedia, setMatches } = createMatchMediaMock(false)
    vi.stubGlobal('matchMedia', matchMedia)

    const { result } = renderHook(() => useMatchMedia('(max-width: 768px)'))
    expect(result.current).toBe(false)

    act(() => setMatches(true))
    expect(result.current).toBe(true)
  })

  it('отписывается от media-query при размонтировании', () => {
    const { matchMedia } = createMatchMediaMock(false)
    vi.stubGlobal('matchMedia', matchMedia)

    const { unmount } = renderHook(() => useMatchMedia('(max-width: 768px)'))
    const mediaQueryList = matchMedia.mock.results[0]?.value as { removeEventListener: () => void }

    unmount()
    expect(mediaQueryList.removeEventListener).toHaveBeenCalled()
  })
})
