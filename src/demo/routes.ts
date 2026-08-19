/** Пути демо-страниц. Не описание пунктов меню (оно — JSX в Sidebar.tsx/MobileNav.tsx),
 *  просто общие строковые константы, чтобы не разъезжались Link'и, роуты и active-проверки. */
export const ROUTES = {
  trends: '/trends',
  tasks: '/tasks',
  payments: '/payments',
  clients: '/clients',
  clientsList: '/clients/list',
  clientsReviews: '/clients/reviews',
  clientsNotifications: '/clients/notifications',
  inventory: '/inventory',
  inventoryProducts: '/inventory/products',
  inventoryOrders: '/inventory/orders',
  inventorySuppliers: '/inventory/suppliers',
  settings: '/settings',
} as const
