import { useAuthStore } from '../store/auth.store';
import checkPermission from './checkPermission.util.js';

/**
 * useHasPermission — Programmatic role-based check for hiding UI elements.
 *
 * Checks if the current user has access to a specific resource (database table).
 *
 *   const canAccessPayroll = useHasPermission('payroll');
 *   {canAccessPayroll && <PayrollSection />}
 *
 * Note: The `action` parameter is no longer used — access is table-level only.
 * It is kept as an optional second param for backward compatibility so existing
 * call sites don't break immediately (it is ignored).
 */
export function useHasPermission(resource) {
  const permissions = useAuthStore((s) => s.permissions);
  return checkPermission(permissions, resource);
}