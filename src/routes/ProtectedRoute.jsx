import { Navigate, Outlet, useLocation } from 'react-router-dom';
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
  const { isAuthenticated, isInitializing, permissions, user } = useAuthStore();
  const location = useLocation();

  // Wait until initializeAuth() finishes before making any routing decision
  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.org_id && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (requiredResource && requiredAction && permissions) {
    if (!checkPermission(permissions, requiredResource, requiredAction)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}