import { useCallback, useEffect, useRef, useState } from 'react'

interface UseControllableStateOptions<T> {
  /** Значение, полностью управляемое потребителем. Если передано — хук работает в controlled-режиме. */
  value?: T
  /** Начальное значение для uncontrolled-режима (когда `value` не передан). */
  defaultValue: T
  /** Вызывается при каждом изменении значения — и в controlled, и в uncontrolled режиме. */
  onChange?: (value: T) => void
}

/**
 * Единый паттерн "controlled или uncontrolled" (как у нативного <input value/onChange>),
 * переиспользуемый для любого куска стейта headless-меню (collapsed, openValue и т.п.).
 */
export function useControllableState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): [T, (next: T) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  // onChange держим в ref (обновляем эффектом, не во время рендера — иначе react-hooks/refs
  // ругается на мутацию рефа при рендере), чтобы не пересоздавать setValue на каждый чих потребителя.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) {
        setUncontrolledValue(next)
      }
      onChangeRef.current?.(next)
    },
    [isControlled],
  )

  return [value, setValue]
}
