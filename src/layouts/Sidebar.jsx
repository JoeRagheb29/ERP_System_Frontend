import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faBoxOpen,faCalendarCheck,faCalendarXmark,faChartBar,faClipboard,faCreditCard,
  faLayerGroup,faListCheck,faRotateLeft,faShieldHalved,faShoppingCart,faTruck,faUserCheck,faUsers
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../store/auth.store';
import checkPermission from '../RBAC/checkPermission.util';

/**
 * NAV_SECTIONS — Single source of truth for the entire sidebar navigation.
 *
 * Each item declares which backend `resource` it requires `read` access to.
 * A null resource means the item is always visible (e.g. Dashboard).
 * The Sidebar filters items and entire sections dynamically based on the
 * user's resolved permission matrix — RBAC gates the nav automatically.
 */

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { path: '/dashboard',           label: 'Dashboard',        resource: null,              icon: faChartBar },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { path: '/inventory/products',        label: 'Products',        resource: 'products',              icon: faBoxOpen },
      { path: '/inventory/stock',           label: 'Stock Levels',    resource: 'inventory_stock',       icon: faLayerGroup },
      { path: '/inventory/suppliers',       label: 'Suppliers',       resource: 'suppliers',             icon: faTruck },
      { path: '/inventory/purchase-orders', label: 'Purchase Orders', resource: 'purchase_orders',       icon: faClipboard },
    ],
  },
  {
    label: 'Human Resources',
    items: [
      { path: '/hr/employees',      label: 'Employees',      resource: 'employees',      icon: faUsers },
      { path: '/hr/attendance',     label: 'Attendance',     resource: 'attendance',     icon: faCalendarCheck },
      { path: '/hr/leave-requests', label: 'Leave Requests', resource: 'leave_requests', icon: faCalendarXmark },
      { path: '/hr/payroll',        label: 'Payroll',        resource: 'payroll',        icon: faCreditCard },
    ],
  },
  {
    label: 'Sales',
    items: [
      { path: '/sales/orders',    label: 'Sales Orders', resource: 'sales_orders', icon: faShoppingCart },
      { path: '/sales/customers', label: 'Customers',    resource: 'customers',    icon: faUserCheck },
      { path: '/sales/returns',   label: 'Returns',      resource: 'returns',      icon: faRotateLeft },
    ],
  },
  {
    label: 'Administration',
    items: [
      { path: '/admin/roles',         label: 'Roles & Permissions', resource: 'roles',          icon: faShieldHalved },
      { path: '/admin/activity-logs', label: 'Activity Logs',       resource: 'activity_logs',  icon: faListCheck },
    ],
  },
];

// ── Icon components ──────────────────────────────────────────────────────────
// Kept as named functions at the top so the NAV_SECTIONS config above
// can reference them by name without forward-declaration issues.

const LogOutIcon = () =>  <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-4 h-4 shrink-0" />; 
const BarChartIcon = () =>   <FontAwesomeIcon icon={faChartBar} className="w-5 h-5" />; 

// ── User initials avatar ──────────────────────────────────────────────────────
function UserAvatar({ user }) {
  const initials = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join('') || user?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-semibold shrink-0">
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const { user, permissions, logout } = useAuthStore();

  // NavLink active style — consistent across all nav items
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-white/[0.08] text-white'
        : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
    }`;

  return (
    <aside className="w-80 bg-slate-900 flex flex-col shrink-0 border-r border-white/[0.06] overflow-y-auto">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white">
          <BarChartIcon />
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">NexusERP</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {NAV_SECTIONS.map((section, sIdx) => {
          // Filter items the user doesn't have permission to see
          const visibleItems = section.items.filter(
            (item) => item.resource === null || checkPermission(permissions, item.resource, 'read')
          );

          // If the whole section has no visible items, skip it entirely
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx}>
              {section.label && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  {section.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {visibleItems.map((item) => (
                  <li key={item.path}>
                    <NavLink to={item.path} end className={navLinkClass}>
                      <FontAwesomeIcon icon={item.icon} className="w-4 h-4 shrink-0" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 pt-3 border-t border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <UserAvatar user={user} />
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : user?.username}
            </p>
            <p className="text-slate-500 text-[11px] truncate capitalize">
              {permissions?.role_name ?? 'Member'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-1 flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-white/[0.04] transition-colors"
        >
          <LogOutIcon />
          Sign out
        </button>
      </div>
    </aside>
  );
}