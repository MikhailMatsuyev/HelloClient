import { createContext, useContext } from 'react'

export interface RouterMenuContextValue {
  pathname: string
}

export const RouterMenuContext = createContext<RouterMenuContextValue | null>(null)

export function useRouterMenuContext(componentName: string): RouterMenuContextValue {
  const context = useContext(RouterMenuContext)

  if (!context) {
    throw new Error(`RouterMenu.${componentName} должен рендериться внутри <RouterMenu.Root>.`)
  }

  return context
}
