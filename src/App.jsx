import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import OnboardingPage from './layouts/OnboardingPage';
import RolesPermissionsPage from './features/auth/pages/RolesPermissionsPage';

// كمبوننت بسيط لعرض الصفحات اللي لسه متبنتش
const Placeholder = ({ title }) => (
  <div className="p-2">
    <h1 className="text-xl font-semibold text-slate-800 mb-1">{title}</h1>
    <p className="text-slate-400 text-sm">Module under construction.</p>
  </div>
);

// دالة مساعدة سريعة (Helper) عشان نمنع تكرار الـ ProtectedRoute في كل سطر
const protect = (resource, path, title) => ({
  path,
  element: (
    <ProtectedRoute requiredResource={resource}>
      <Placeholder title={title} />
    </ProtectedRoute>
  )
});

const router = createBrowserRouter([
  // ── المسارات العامة (Public Routes) ──────────────────────────────────────────
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/unauthorized', element: <Placeholder title="403 — Access Denied" /> },

  // ── المسارات المحمية (Protected Routes) ──────────────────────────────────────
  {
    element: <ProtectedRoute />, // حماية عامة لكل اللي تحته (تأكيد تسجيل الدخول)
    children: [
      { path: '/onboarding', element: <OnboardingPage /> },
      
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <Placeholder title="Dashboard" /> },

          // Inventory Section
          protect('products',        'inventory/products',        'Products'),
          protect('inventory_stock', 'inventory/stock',           'Stock Levels'),
          protect('suppliers',       'inventory/suppliers',       'Suppliers'),
          protect('purchase_orders', 'inventory/purchase-orders', 'Purchase Orders'),

          // HR Section
          protect('employees',     'hr/employees',     'Employees'),
          protect('attendance',    'hr/attendance',    'Attendance'),
          protect('leave_requests','hr/leave-requests','Leave Requests'),
          protect('payroll',       'hr/payroll',       'Payroll'),

          // Sales Section
          protect('sales_orders', 'sales/orders',    'Sales Orders'),
          protect('customers',    'sales/customers', 'Customers'),
          protect('returns',      'sales/returns',   'Returns'),

          // Admin Section
          {
            path: 'admin/roles',
            element: (
              <ProtectedRoute requiredResource="users">
                <RolesPermissionsPage />
              </ProtectedRoute>
            ),
          },
          protect('activity_logs', 'admin/activity-logs', 'Activity Logs'),
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}