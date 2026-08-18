import { useId, useRef } from 'react'
import { Slot } from './Slot'
import { mergeRefs } from './mergeRefs'
import {
  SidebarMenuSubContext,
  useSidebarMenuRootContext,
  useSidebarMenuSubContext,
} from './context'
import type { ComponentPropsWithRef, KeyboardEvent, MouseEvent, ReactNode, RefObject } from 'react'

export interface MenuSubProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children: ReactNode
  asChild?: boolean
  /** Уникальный id раздела — по нему Root отслеживает, какой раздел подменю сейчас открыт. */
  value: string
}

/** Группа "пункт с подменю": объединяет Menu.SubTrigger и Menu.SubContent общим value. */
export function Sub({ children, asChild, value, onKeyDown, ...rest }: MenuSubProps) {
  const { isOpen, closeSubmenu } = useSidebarMenuRootContext('Sub')
  const open = isOpen(value)
  const triggerRef = useRef<HTMLElement | null>(null)
  const contentId = `${useId()}-sub-content`
  const Comp = asChild ? Slot : 'div'

  return (
    <SidebarMenuSubContext.Provider value={{ value, open, triggerRef, contentId }}>
      <Comp
        data-state={open ? 'open' : 'closed'}
        // Escape закрывает открытое подменю и возвращает фокус на его триггер (ARIA Disclosure
        // pattern) — работает вне зависимости от того, как потребитель показывает SubContent
        // (инлайн/flyout/bottom-sheet), т.к. опирается только на всплытие события по DOM-дереву.
        // Осознанно скопировано именно на "свой" Sub, а не глобально на Root: SubContent не
        // ловит фокус (Tab свободно уходит из открытого раздела в соседние триггеры), поэтому
        // Escape симметрично реагирует только пока фокус ещё внутри ЭТОГО раздела — Escape,
        // нажатый на триггере другого (закрытого) Sub, не должен "дотягиваться" и закрывать
        // раздел, с которым пользователь уже не взаимодействует.
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          onKeyDown?.(event)
          if (event.key === 'Escape' && open) {
            closeSubmenu(value)
            triggerRef.current?.focus()
          }
        }}
        {...rest}
      >
        {children}
      </Comp>
    </SidebarMenuSubContext.Provider>
  )
}

export interface MenuSubTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  children: ReactNode
  asChild?: boolean
}

/**
 * Переключает подменю своего Menu.Sub по клику. Открытие одного раздела автоматически
 * закрывает ранее открытый другой — аккордеон реализован в useSidebarMenu, здесь только вызов.
 */
export function SubTrigger({ children, asChild, onClick, ref, ...rest }: MenuSubTriggerProps) {
  const { toggleSubmenu } = useSidebarMenuRootContext('SubTrigger')
  const { value, open, triggerRef, contentId } = useSidebarMenuSubContext('SubTrigger')
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      ref={mergeRefs(ref, triggerRef as RefObject<HTMLButtonElement | null>)}
      type={asChild ? undefined : 'button'}
      aria-expanded={open}
      aria-controls={contentId}
      data-state={open ? 'open' : 'closed'}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        toggleSubmenu(value)
      }}
      {...rest}
    >
      {children}
    </Comp>
  )
}

export interface MenuSubContentProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children: ReactNode
  asChild?: boolean
}

/**
 * Контейнер дочерних Menu.Item. Всегда смонтирован — открытость отражена только через
 * `data-state`, чтобы потребитель сам выбрал способ показа: инлайн-раскрытие в широком режиме,
 * CSS-flyout в узком или bottom-sheet на мобильном (см. "Сверка с Notion" в CLAUDE.md).
 */
export function SubContent({ children, asChild, id, ...rest }: MenuSubContentProps) {
  const { open, contentId } = useSidebarMenuSubContext('SubContent')
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp id={id ?? contentId} data-state={open ? 'open' : 'closed'} {...rest}>
      {children}
    </Comp>
  )
}
