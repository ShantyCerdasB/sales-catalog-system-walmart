import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'
import { PrivateRoute } from '../auth/PrivateRoute'
import { PublicRoute } from '../auth/PublicRoute'
//import { RoleGuard } from '../auth/RoleGuard'
import Header from '../components/ui/header'
import AuthPage from '../pages/Auth/AuthPage'
import ProductsListPage from '../pages/Products/ProductsListPage'
import ClientsListPage from '../pages/Clients/ClientsListPage'
import DiscountsListPage from '../pages/Discounts/DiscountsListPage'
import SalesListPage from '../pages/Sales/SalesListPage'
import ReportsPage from '../pages/Reports/ReportsPage'
import NotFoundPage from '../pages/NotFoundPage'
import UsersListPage from '../pages/User/UserListPage'

export const AppRouter: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <Header />

      <Routes>
        {/* Public route: login */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="products" element={<ProductsListPage />} />
          <Route path="clients"  element={<ClientsListPage  />} />
          <Route path="discounts" element={<DiscountsListPage />} />
          <Route path="sales"    element={<SalesListPage    />} />
          <Route path="users"    element={<UsersListPage    />} />

          <Route
            path="reports/top-products"
            element={
                <ReportsPage />
            }
          />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)

export default AppRouter
