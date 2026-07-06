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
  if (permissions.role === "owner" || permissions.role === "admin") return true;
  return !!permissions.permissions?.[resource]?.[action];
}

export default checkPermission;