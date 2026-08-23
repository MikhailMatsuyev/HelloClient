import { useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

import { Menu } from '../headless-menu'
import type { MenuRootProps } from '../headless-menu/Root'
import { RouterMenuContext } from './context'

export interface RouterMenuRootProps extends Omit<MenuRootProps, 'children'> {
  children: ReactNode
}

export function Root({ children, ...rest }: RouterMenuRootProps) {
  const { pathname } = useLocation()

  return (
    <RouterMenuContext.Provider value={{ pathname }}>
      <Menu.Root {...rest}>{children}</Menu.Root>
    </RouterMenuContext.Provider>
  )
}
