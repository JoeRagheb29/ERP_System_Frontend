import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import LoginPage    from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';

const Placeholder = ({ title }) => (
  <div className="p-2">
    <h1 className="text-xl font-semibold text-slate-800 mb-1">{title}</h1>
    <p className="text-slate-400 text-sm">Module under construction.</p>
  </div>
);

const router = createBrowserRouter([
  { path: '/login',        element: <LoginPage /> },
  { path: '/register',     element: <RegisterPage /> },
  { path: '/unauthorized', element: <Placeholder title="403 — Access Denied" /> },

  // ── Protected (auth required) ─────────────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <Placeholder title="Dashboard" /> },

          // Inventory (resource gate: products)
          { element: <ProtectedRoute requiredResource="products" requiredAction="read" />, children: [
            { path: 'inventory/products',        element: <Placeholder title="Products" /> },
            { path: 'inventory/stock',           element: <Placeholder title="Stock Levels" /> },
            { path: 'inventory/suppliers',       element: <Placeholder title="Suppliers" /> },
            { path: 'inventory/purchase-orders', element: <Placeholder title="Purchase Orders" /> },
          ]},

          // HR (resource gate: employees)
          { element: <ProtectedRoute requiredResource="employees" requiredAction="read" />, children: [
            { path: 'hr/employees',      element: <Placeholder title="Employees" /> },
            { path: 'hr/attendance',     element: <Placeholder title="Attendance" /> },
            { path: 'hr/leave-requests', element: <Placeholder title="Leave Requests" /> },
            { path: 'hr/payroll',        element: <Placeholder title="Payroll" /> },
          ]},

          // Sales (resource gate: sales_orders)
          { element: <ProtectedRoute requiredResource="sales_orders" requiredAction="read" />, children: [
            { path: 'sales/orders',    element: <Placeholder title="Sales Orders" /> },
            { path: 'sales/customers', element: <Placeholder title="Customers" /> },
            { path: 'sales/returns',   element: <Placeholder title="Returns" /> },
          ]},

          // Admin (resource gate: roles)
          { element: <ProtectedRoute requiredResource="roles" requiredAction="read" />, children: [
            { path: 'admin/roles',         element: <Placeholder title="Roles & Permissions" /> },
            { path: 'admin/activity-logs', element: <Placeholder title="Activity Logs" /> },
          ]},
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}