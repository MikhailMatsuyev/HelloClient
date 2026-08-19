import { useCallback, useState } from 'react'

/**
 * Демонстрация того, что headless-меню легко подключается к любому внешнему источнику стейта:
 * этот хук ничего не знает о Menu.Root — просто обычная пара [value, setValue], которую
 * потребитель прокидывает как controlled `collapsed`/`onCollapsedChange`.
 */
export function useLocalStorageState(
  key: string,
  defaultValue: boolean,
): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(() => {
    const stored = localStorage.getItem(key)
    if (stored === null) return defaultValue
    try {
      return JSON.parse(stored) as boolean
    } catch {
      return defaultValue
    }
  })

  const setPersistedValue = useCallback(
    (next: boolean) => {
      setValue(next)
      localStorage.setItem(key, JSON.stringify(next))
    },
    [key],
  )

  return [value, setPersistedValue]
}
