import { useAuthStore } from '../store/auth.store';
import checkPermission from './checkPermission.util.js';

/**
 * useHasPermission — Programmatic RBAC check for hiding UI elements.
 *
 *   const canExport = useHasPermission('payroll', 'export');
 *   {canExport && <ExportButton />}
 */

export function useHasPermission(resource, action) {
  const permissions = useAuthStore((s) => s.permissions);
  console.log("result of useHasPermission:", checkPermission(permissions, resource, action));
  return checkPermission(permissions, resource, action);
}

/**
 * useFieldAllowed — Check if a specific field is visible for a resource.
 *
 *   const canSeeSalary = useFieldAllowed('employees', 'read', 'base_salary');
 */

export function useFieldAllowed(resource, action, fieldName) {
  const permissions = useAuthStore((s) => s.permissions);
  if (!permissions) return false;
  if (permissions.is_org_owner) return true;
  const grant = permissions.permissions?.[resource]?.[action];
  if (!grant) return false;
  return !grant.denied_fields.includes(fieldName);
}