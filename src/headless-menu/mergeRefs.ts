import type { Ref } from 'react'

/** Объединяет несколько ref'ов (callback- и object-формы) в один — нужен, когда и Slot.asChild,
 *  и внутренняя логика компонента (например, фокус по Escape) хотят держать свою ссылку на узел. */
export function mergeRefs<T>(...refs: Array<Ref<T> | null | undefined>): Ref<T> {
  return (node: T | null) => {
    for (const ref of refs) {
      if (ref == null) continue
      if (typeof ref === 'function') ref(node)
      else (ref as { current: T | null }).current = node
    }
  }
}
