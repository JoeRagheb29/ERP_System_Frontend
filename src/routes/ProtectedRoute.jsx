import { Navigate, Outlet, useLocation } from 'react-router-dom';
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

export function ProtectedRoute({ requiredResource, requiredAction, requiredRoles, children }) {
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

  // Role-based guard: if route declares requiredRoles, ensure the current user's role is allowed
  if (requiredRoles && user) {
    const allowed = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    if (!allowed.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (requiredResource && permissions) {
    const actionToCheck = requiredAction || 'read';

    if (!checkPermission(permissions, requiredResource, actionToCheck)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  console.log("check FROM PROTECTED ROUTE", requiredResource, "action:", requiredAction);
  return children ? children : <Outlet />;
}