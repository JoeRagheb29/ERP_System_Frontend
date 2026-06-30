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
  const { isAuthenticated, permissions } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredResource && requiredAction && permissions) {
    if (!checkPermission(permissions, requiredResource, requiredAction)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}