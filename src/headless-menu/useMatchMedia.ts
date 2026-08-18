import { useEffect, useState } from 'react'

/**
 * Реактивно отслеживает media-query. Используется потребителем как опциональный дефолт для
 * collapsed на мобильном вьюпорте — брейкпоинт передаётся параметром, а не зашит в пакет меню,
 * и потребитель в любой момент может полностью перекрыть значение своим состоянием.
 */
export function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const listener = () => setMatches(mediaQueryList.matches)

    listener()
    mediaQueryList.addEventListener('change', listener)
    return () => mediaQueryList.removeEventListener('change', listener)
  }, [query])

  return matches
}
