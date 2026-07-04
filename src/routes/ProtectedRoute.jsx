import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import checkPermission from '../RBAC/checkPermission.util';

/**
 * ProtectedRoute — Dual-purpose route guard.
 *
 * No props       → authentication gate only (checks login + org membership).
 * requiredResource → also checks the user's permission map for that table.
 *
 * Access is table-level: the backend returns { permissions: { "employees": true, ... } }.
 * No action distinction — the endpoint logic handles read/write differentiation.
 */

export function ProtectedRoute({ requiredResource, children }) {
  const { isAuthenticated, permissions, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if the user has no organization yet
  if (user && !user.org_id && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  // Table-level permission check
  if (requiredResource && permissions) {
    if (!checkPermission(permissions, requiredResource)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children || <Outlet />;
}