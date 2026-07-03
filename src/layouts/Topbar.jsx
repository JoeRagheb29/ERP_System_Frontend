import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

/**
 * PAGE_TITLES — Maps route paths to human-readable page titles.
 * Used by Topbar to display the current module context.
 * Keep this in sync with the route definitions in App.jsx.
 */
const PAGE_TITLES = {
  '/dashboard':                 { title: 'Dashboard',         module: null },
  '/inventory/products':        { title: 'Products',          module: 'Inventory' },
  '/inventory/stock':           { title: 'Stock Levels',      module: 'Inventory' },
  '/inventory/suppliers':       { title: 'Suppliers',         module: 'Inventory' },
  '/inventory/purchase-orders': { title: 'Purchase Orders',   module: 'Inventory' },
  '/hr/employees':              { title: 'Employees',         module: 'Human Resources' },
  '/hr/attendance':             { title: 'Attendance',        module: 'Human Resources' },
  '/hr/leave-requests':         { title: 'Leave Requests',    module: 'Human Resources' },
  '/hr/payroll':                { title: 'Payroll',           module: 'Human Resources' },
  '/sales/orders':              { title: 'Sales Orders',      module: 'Sales' },
  '/sales/customers':           { title: 'Customers',         module: 'Sales' },
  '/sales/returns':             { title: 'Returns',           module: 'Sales' },
  '/admin/roles':               { title: 'Roles & Permissions', module: 'Administration' },
  '/admin/activity-logs':       { title: 'Activity Logs',    module: 'Administration' },
};

// ── Bell icon (notification placeholder) ─────────────────────────────────────
function BellIcon() {
  return <FontAwesomeIcon icon={faBell} className="w-5 h-5" />;
}

// ── User initials avatar (duplicated from Sidebar to avoid circular import) ───
function UserAvatar({ user }) {
  const initials = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join('') || user?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-semibold">
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Topbar
// ─────────────────────────────────────────────────────────────────────────────
export default function Topbar() {
  const { pathname } = useLocation();
  const { user, permissions } = useAuthStore();

  const page = PAGE_TITLES[pathname] ?? { title: 'ERP System', module: null };

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0">

      {/* Left: breadcrumb-style page title */}
      <div>
        {page.module && (
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider leading-none mb-0.5">
            {page.module}
          </p>
        )}
        <h1 className="text-base font-semibold text-slate-900 leading-none">
          {page.title}
        </h1>
      </div>

      {/* Right: notification bell + user chip */}
      <div className="flex items-center gap-3">
        <button aria-label="Notifications"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors relative"
        >
          <BellIcon />
          {/* Unread dot — replace with real count later */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 border-2 border-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200" />

        {/* User info chip */}
        <div className="flex items-center gap-2.5">
          <UserAvatar user={user} />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-none">
              {user?.first_name
                ? `${user.first_name} ${user.last_name ?? ''}`.trim()
                : user?.username}
            </p>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5 capitalize">
              {permissions?.role_name ?? 'Member'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}