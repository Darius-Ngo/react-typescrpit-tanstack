import { createBrowserRouter } from 'react-router'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProductsPage } from '@/features/products/pages/ProductsPage'
import { DashboardPage } from '@/pages/DashboardPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'products', element: <ProductsPage /> },
    ],
  },
])
