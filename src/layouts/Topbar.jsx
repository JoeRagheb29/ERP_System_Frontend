import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faBars } from '@fortawesome/free-solid-svg-icons';
import UserAvatar from '../features/Organization/components/UserAvatar';

/**
 * PAGE_TITLES — Maps route paths to human-readable page titles.
 * Used by Topbar to display the current module context.
 * Keep this in sync with the route definitions in App.jsx.
 */
const PAGE_TITLES = {
  '/dashboard':                 { title: 'Dashboard',         module: null },
  '/profile':                   { title: 'Profile',           module: null },
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

// ─────────────────────────────────────────────────────────────────────────────
// Topbar
// ─────────────────────────────────────────────────────────────────────────────
export default function Topbar({ onToggleSidebar }) {
  const { pathname } = useLocation();
  const { user, permissions } = useAuthStore();

  const page = PAGE_TITLES[pathname] ?? { title: 'ERP System', module: null };

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-4 md:px-6 flex items-center justify-between shrink-0">

      {/* Left: Menu toggle button + breadcrumb-style page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        >
          <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
        </button>

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
        <Link to="/profile" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <UserAvatar user={user} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-none">
              {user?.first_name
                ? `${user.first_name} ${user.last_name ?? ''}`.trim()
                : user?.username}
            </p>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5 capitalize">
              {permissions?.role ?? 'Member'}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}