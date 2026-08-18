import { cloneElement, isValidElement } from 'react'
import type { ReactElement, ReactNode, Ref } from 'react'
import { mergeRefs } from './mergeRefs'

type AnyProps = Record<string, unknown>

function isRecord(value: unknown): value is AnyProps {
  return typeof value === 'object' && value !== null
}

function isEventHandlerKey(key: string): boolean {
  return key.length > 2 && key.startsWith('on') && key[2] === key[2].toUpperCase()
}

/** Мержит пропсы Slot'а (от headless-компонента) и пропсы единственного JSX-ребёнка. */
function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...childProps }

  for (const key in slotProps) {
    const slotValue = slotProps[key]
    const childValue = childProps[key]

    if (
      isEventHandlerKey(key) &&
      typeof slotValue === 'function' &&
      typeof childValue === 'function'
    ) {
      // Оба обработчика должны отработать: сначала пользовательский, потом поведенческий.
      merged[key] = (...args: unknown[]) => {
        childValue(...args)
        slotValue(...args)
      }
    } else if (
      key === 'className' &&
      typeof slotValue === 'string' &&
      typeof childValue === 'string'
    ) {
      merged[key] = [slotValue, childValue].filter(Boolean).join(' ')
    } else if (key === 'style' && isRecord(slotValue) && isRecord(childValue)) {
      merged[key] = { ...slotValue, ...childValue }
    } else if (slotValue !== undefined) {
      merged[key] = slotValue
    }
  }

  return merged
}

export interface SlotProps {
  children: ReactNode
  ref?: Ref<HTMLElement>
  [key: string]: unknown
}

/**
 * Реализация паттерна `asChild` (как в Radix UI): вместо рендера собственного DOM-узла
 * headless-компонент передаёт своё поведение (обработчики, data- и aria-атрибуты, ref)
 * единственному JSX-ребёнку. Так потребитель подставляет свой `<Link>` из React Router
 * вместо дефолтного `<button>`, а headless-пакет остаётся не в курсе, что такое роутер.
 */
export function Slot({ children, ref, ...slotProps }: SlotProps) {
  if (!isValidElement(children)) {
    if (import.meta.env.DEV) {
      console.error(
        'Menu: asChild ожидает единственный валидный React-элемент в качестве children.',
      )
    }
    return null
  }

  const child = children as ReactElement<AnyProps & { ref?: Ref<HTMLElement> }>

  return cloneElement(child, {
    ...mergeProps(slotProps, child.props),
    ref: mergeRefs(ref, child.props.ref),
  })
}
