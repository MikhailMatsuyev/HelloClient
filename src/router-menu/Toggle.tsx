import type { ComponentPropsWithRef, ReactNode } from 'react'

import { Menu } from '../headless-menu'

export interface RouterMenuToggleProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  children: ReactNode
}

export function Toggle({ children, ...rest }: RouterMenuToggleProps) {
  return <Menu.Toggle {...rest}>{children}</Menu.Toggle>
}
