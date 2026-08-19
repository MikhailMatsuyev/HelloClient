import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MobileNav } from './demo/MobileNav'
import { PlaceholderPage } from './demo/PlaceholderPage'
import { ROUTES } from './demo/routes'
import { Sidebar } from './demo/Sidebar'
import { useSidebarState } from './demo/useSidebarState'

// HashRouter — чтобы демо работало на статическом хостинге (GitHub Pages) без серверных
// rewrite-правил для client-side роутинга.
function AppLayout() {
  const { collapsed, setCollapsed, openValue, setOpenValue } = useSidebarState()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        openValue={openValue}
        setOpenValue={setOpenValue}
      />

      <main className="min-w-0 flex-1 pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<Navigate to={ROUTES.trends} replace />} />
          <Route path={ROUTES.trends} element={<PlaceholderPage title="Trends" />} />
          <Route path={ROUTES.tasks} element={<PlaceholderPage title="Tasks" />} />
          <Route path={ROUTES.payments} element={<PlaceholderPage title="Payments" />} />
          <Route path="/clients" element={<Navigate to={ROUTES.clientsList} replace />} />
          <Route path={ROUTES.clientsList} element={<PlaceholderPage title="Clients — List" />} />
          <Route
            path={ROUTES.clientsReviews}
            element={<PlaceholderPage title="Clients — Reviews" />}
          />
          <Route
            path={ROUTES.clientsNotifications}
            element={<PlaceholderPage title="Clients — Notifications" />}
          />
          <Route path="/inventory" element={<Navigate to={ROUTES.inventoryProducts} replace />} />
          <Route
            path={ROUTES.inventoryProducts}
            element={<PlaceholderPage title="Inventory — Products" />}
          />
          <Route
            path={ROUTES.inventoryOrders}
            element={<PlaceholderPage title="Inventory — Orders" />}
          />
          <Route
            path={ROUTES.inventorySuppliers}
            element={<PlaceholderPage title="Inventory — Suppliers" />}
          />
          <Route path={ROUTES.settings} element={<PlaceholderPage title="Settings" />} />
          <Route path="*" element={<Navigate to={ROUTES.trends} replace />} />
        </Routes>
      </main>

      <MobileNav openValue={openValue} setOpenValue={setOpenValue} />
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  )
}

export default App
