 /**
  * checkPermission — Pure utility (not a hook).
  *
  * Used inside filters/maps (Sidebar etc.)
  * to check user access without React hooks.
  */

function checkPermission(permissions, resource, action = 'read') {

  if (!permissions) return false;


  // Owners and admins have full access
  if (
    permissions.role === "owner" ||
    permissions.role === "admin"
  ) {
    return true;
  }


  const resourcePerm = permissions.permissions?.[resource];


  // Backend returns boolean:
  // { employees: true }
  if (resourcePerm === true) {
    return true;
  }


  // Backend returns object:
  // { employees: { read: true, write: false } }
  if (
    resourcePerm &&
    typeof resourcePerm === "object"
  ) {
    return !!resourcePerm[action];
  }


  return false;
}


export default checkPermission;