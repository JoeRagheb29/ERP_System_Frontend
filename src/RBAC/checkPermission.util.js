/**
 * checkPermission — Pure utility (not a hook).
 *
 * Use this inside .filter() / .map() calls (e.g. Sidebar nav items),
 * where React hook rules prohibit calling useHasPermission directly.
 */

function checkPermission(permissions, resource) {
  if (!permissions) return false;
  return permissions.permissions?.[resource] === true;
}

export default checkPermission;