import { createBrowserRouter } from "react-router";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProductsPage } from "@/features/products/pages/ProductsPage";
import { DashboardPage } from "@/pages/DashboardPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "products", element: <ProductsPage /> },
        ],
      },
    ],
  },
]);
