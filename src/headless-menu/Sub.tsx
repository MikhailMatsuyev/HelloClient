import { Slot } from './Slot'
import {
  SidebarMenuSubContext,
  useSidebarMenuRootContext,
  useSidebarMenuSubContext,
} from './context'
import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react'

export interface MenuSubProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children: ReactNode
  asChild?: boolean
  /** Уникальный id раздела — по нему Root отслеживает, какой раздел подменю сейчас открыт. */
  value: string
}

/** Группа "пункт с подменю": объединяет Menu.SubTrigger и Menu.SubContent общим value. */
export function Sub({ children, asChild, value, ...rest }: MenuSubProps) {
  const { isOpen } = useSidebarMenuRootContext('Sub')
  const open = isOpen(value)
  const Comp = asChild ? Slot : 'div'

  return (
    <SidebarMenuSubContext.Provider value={{ value, open }}>
      <Comp data-state={open ? 'open' : 'closed'} {...rest}>
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
export function SubTrigger({ children, asChild, onClick, ...rest }: MenuSubTriggerProps) {
  const { toggleSubmenu } = useSidebarMenuRootContext('SubTrigger')
  const { value, open } = useSidebarMenuSubContext('SubTrigger')
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      type={asChild ? undefined : 'button'}
      aria-expanded={open}
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
export function SubContent({ children, asChild, ...rest }: MenuSubContentProps) {
  const { open } = useSidebarMenuSubContext('SubContent')
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp data-state={open ? 'open' : 'closed'} {...rest}>
      {children}
    </Comp>
  )
}
