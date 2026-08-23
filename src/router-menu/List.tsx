import type { ComponentPropsWithRef, ReactNode } from 'react'

import { Menu } from '../headless-menu'

export interface RouterMenuListProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children: ReactNode
}

export function List({ children, ...rest }: RouterMenuListProps) {
  return (
    <Menu.List {...rest} className={`flex-1 space-y-1 px-2 py-3 ${rest.className ?? ''}`}>
      {children}
    </Menu.List>
  )
}
