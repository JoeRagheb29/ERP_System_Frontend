/**
 * checkPermission — Pure utility (not a hook).
 *
 * Use this inside .filter() / .map() calls (e.g. Sidebar nav items),
 * where React hook rules prohibit calling useHasPermission directly.
*/

function checkPermission(permissions, resource, action) {
  if (!permissions) return false;
  if (permissions.is_org_owner) return true;
  return !!permissions.permissions?.[resource]?.[action];
}

export default checkPermission;