import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import { useAuthStore } from './store/auth.store';
import OnboardingPage from './layouts/OnboardingPage';
import DashboardPage from './features/Organization/pages/DashboardPage';
import RolesPermissionsPage from './features/Organization/pages/RolesPermissionsPage';
import ProfilePage from './features/Profile/pages/ProfilePage';
import EmployeesPage from './features/HR/pages/EmployeesPage';
import AttendancePage from './features/HR/pages/AttendancePage';
import LeaveRequestsPage from './features/HR/pages/LeaveRequestsPage';
import PayrollPage from './features/HR/pages/PayrollPage';
import CustomersPage from './features/Sales/pages/CustomersPage';
import SalesOrdersPage from './features/Sales/pages/SalesOrdersPage';
import ReturnsPage from './features/Sales/pages/ReturnsPage';
import InventoryDashboardPage from './features/Inventory/pages/InventoryDashboardPage';
import CategoriesPage from './features/Inventory/pages/CategoriesPage';
import ProductsPage from './features/Inventory/pages/ProductsPage';
import StockPage from './features/Inventory/pages/StockPage';
import SuppliersPage from './features/Inventory/pages/SuppliersPage';
import PurchaseOrdersPage from './features/Inventory/pages/PurchaseOrdersPage';
// import LandingPage from './features/Landing/pages/LandingPage';

// import TopPerformancePage from './features/HR/pages/TopPerformancePage';

const Placeholder = ({ title }) => (
  <div className="p-2">
    <h1 className="text-xl font-semibold text-slate-800 mb-1">{title}</h1>
    <p className="text-slate-400 text-sm">Module under construction.</p>
  </div>
);

// دالة مساعدة سريعة (Helper) عشان نمنع تكرار الـ ProtectedRoute في كل سطر

const protect = (resource, requiredRole = null, path, element) => ({
  path,
  element: (
    <ProtectedRoute
      requiredResource={resource}
      requiredRoles={requiredRole}
    >
      {element}
    </ProtectedRoute>
  ),
});


const getDefaultRoute = (user, permissions) => {
  if (!user || !permissions) return '/profile';
  if (permissions.role === 'owner' || permissions.role === 'admin') {
    return '/dashboard';
  }
  if (permissions.role === 'hr_manager' || permissions.department === 'hr') {
    return '/hr/employees';
  }
  if (permissions.role === 'inventory_manager' || permissions.department === 'inventory') {
    return '/inventory/products';
  }
  if (permissions.role === 'sales_manager' || permissions.department === 'sales') {
    return '/sales/orders';
  }
  return '/profile';
};

function DefaultRouteRedirect() {
  const { user, permissions } = useAuthStore();
  return <Navigate to={getDefaultRoute(user, permissions)} replace />;
}

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
          { index: true, element: <DefaultRouteRedirect /> },
          protect('dashboard', ["owner", "admin"], '/dashboard', <DashboardPage />),
          { path: 'profile', element: <ProfilePage /> },
          // protect('inventory', ["owner", "admin", "inventory_manager"], '/inventory', <InventoryDashboardPage />),
          protect('inventory', ["owner", "admin", "inventory_manager"], '/inventory/dashboard', <InventoryDashboardPage />),
          {
            path: 'inventory/categories',
            element: (
              <ProtectedRoute requiredResource="product_categories">
                <CategoriesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'inventory/products',
            element: (
              <ProtectedRoute requiredResource="products">
                <ProductsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'inventory/stock',
            element: (
              <ProtectedRoute requiredResource="inventory_stock">
                <StockPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'inventory/suppliers',
            element: (
              <ProtectedRoute requiredResource="suppliers">
                <SuppliersPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'inventory/purchase-orders',
            element: (
              <ProtectedRoute requiredResource="purchase_orders">
                <PurchaseOrdersPage />
              </ProtectedRoute>
            ),
          },

          // HR Section
          protect("employees", ["owner", "admin", "hr_manager"], "hr/employees", <EmployeesPage />),
          protect("attendance", ["owner", "admin", "hr_manager"], "hr/attendance", <AttendancePage />),
          protect("leave_requests", ["owner", "admin", "hr_manager"], "hr/leave-requests", <LeaveRequestsPage />),
          protect("payroll", ["owner", "admin", "hr_manager"], "hr/payroll", <PayrollPage />),

          // Sales Section
          protect('sales', ["owner", "admin", "sales_manager"], '/sales/orders', <SalesOrdersPage />),
          protect('customers', ["owner", "admin", "sales_manager"], '/sales/customers', <CustomersPage />),
          protect('returns', ["owner", "admin", "sales_manager"], '/sales/returns', <ReturnsPage />),

          // Admin Section
          protect("users", ["owner", "admin"], "admin/roles", <RolesPermissionsPage />), 
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function App() {
  // Initialize auth state on app startup (rehydrate + fetch user + fetch permissions)
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // lzom el wad3 el 7azm
    let isCancelled = false;

    const bootstrapAuth = async () => {
      // rehydrate (tgeb el token le zustand mn el local storage)
      await useAuthStore.persist.rehydrate();

      // If the component unmounted before the async call finished, don't call setState
      if (!isCancelled) {
        await initializeAuth();
      }
    };

    void bootstrapAuth();

    return () => {
      // Mark the effect as cancelled to prevent state updates on unmounted component
      isCancelled = true;
    };
  }, [initializeAuth]);

  return <RouterProvider router={router} />;
}