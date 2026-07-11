import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import checkPermission from '../RBAC/checkPermission.util';


/**
 * ProtectedRoute — Route guard.
 *
 * Without requiredResource:
 *  - checks authentication only.
 *
 * With requiredResource:
 *  - checks user permission for that resource.
 *
 * With requiredRoles:
 *  - checks user role access.
 */

export function ProtectedRoute({
  requiredResource,
  requiredAction = 'read',
  requiredRoles,
  children,
}) {

  const {
    isAuthenticated,
    isInitializing,
    permissions,
    user,
  } = useAuthStore();


  const location = useLocation();


  // Wait for auth initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }


  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }


  // User must complete onboarding
  if (
    user &&
    !user.org_id &&
    location.pathname !== '/onboarding'
  ) {
    return <Navigate to="/onboarding" replace />;
  }


  // Role-based protection
  if (requiredRoles && user) {

    const allowedRoles = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles];


    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }


  // Permission-based protection
  if (requiredResource && permissions) {

    const hasPermission = checkPermission(
      permissions,
      requiredResource,
      requiredAction
    );


    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }


  return children ? children : <Outlet />;
}