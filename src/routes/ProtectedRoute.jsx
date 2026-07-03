import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import checkPermission from '../RBAC/checkPermission.util';

/**
 * ProtectedRoute — Dual-purpose route guard.
 *
 * No props      → authentication gate only.
 * With props    → also enforces RBAC against the resolved permission matrix.
 * Org owners bypass ALL RBAC checks (mirrors backend logic exactly).
 */

export function ProtectedRoute({ requiredResource, requiredAction }) {
  const { isAuthenticated, permissions, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  console.log("location pathname: ",location.pathname);
  console.log("user: ", user);
  console.log("user.organization_id: ", user.org_id);

  // 🔥 2. الفحص الجديد: لو مسجل دخول بس معندوش منظمة (ولم يذهب لصفحة الـ onboarding بعد)
  // بافتراض إن الباك إند بيرجع الحقل ده باسم organization_id أو يمكنك تعديله حسب الـ Response
  if (user && !user.org_id && location.pathname !== '/onboarding') {
    console.log("done")
    return <Navigate to="/onboarding" />;
  }

  if (requiredResource && requiredAction && permissions) {
    // console.log("Permissions:", permissions);
    // console.log("Required Resource:", requiredResource);
    // console.log("Required Action:", requiredAction);

    if (!checkPermission(permissions, requiredResource, requiredAction)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}