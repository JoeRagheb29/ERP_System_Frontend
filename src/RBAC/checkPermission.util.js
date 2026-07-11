/**
 * checkPermission — Pure utility (not a hook).
 *
 * Use this inside .filter() / .map() calls (e.g. Sidebar nav items),
 * where React hook rules prohibit calling useHasPermission directly.
 */

function checkPermission(permissions, resource, action) {
  
  console.log("permissions:", permissions);
  console.log("role:", permissions.role);
  if (permissions.role === "owner" || permissions.role === "admin") console.log("returning true for owner/admin");
  console.log("resource: ", resource);

  if (!permissions) return false;

  // Owners and admins see everything
  if (permissions.role === "owner" || permissions.role === "admin") return true;

  const resourcePerm = permissions.permissions?.[resource];
  // If backend returns a boolean (e.g. { permissions: { employees: true } })
  if (resourcePerm === true) return true;

  // If backend returns an object with action keys (e.g. { employees: { read: true, write: false } })
  if (resourcePerm && typeof resourcePerm === 'object') {
    const actionToCheck = action || 'read';
    return !!resourcePerm[actionToCheck];
  }

  return false;
}

export default checkPermission;