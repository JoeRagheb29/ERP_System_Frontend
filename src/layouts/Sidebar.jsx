import { useState } from 'react'; // 1. Added React state for open/close state
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightFromBracket,
  faBoxOpen,
  faCalendarCheck,
  faCalendarXmark,
  faChartBar,
  faClipboard,
  faCreditCard,
  faUser,
  faLayerGroup,
  faTruck,
  faTags,
  faUsers,
  faShoppingCart,
  faUserCheck,
  faRotateLeft,
  faShieldHalved,
  faBars,  // 2. Added hamburger icon
  faXmark, // 2. Added close icon
} from '@fortawesome/free-solid-svg-icons';

import { useAuthStore } from '../store/auth.store';
import checkPermission from '../RBAC/checkPermission.util';
import UserAvatar from '../features/Organization/components/UserAvatar';

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      {
        path: '/dashboard',
        label: 'Dashboard',
        resource: null,
        roles: ['owner', 'admin'],
        icon: faChartBar,
      },
      {
        path: '/profile',
        label: 'Profile',
        resource: null,
        icon: faUser,
      },
    ],
  },

  {
    label: 'Inventory',
    items: [
      {
        path: '/inventory',
        label: 'Dashboard',
        resource: 'products',
        icon: faChartBar,
      },
      {
        path: '/inventory/categories',
        label: 'Categories',
        resource: 'product_categories',
        icon: faTags,
      },
      {
        path: '/inventory/products',
        label: 'Products',
        resource: 'products',
        icon: faBoxOpen,
      },
      {
        path: '/inventory/stock',
        label: 'Stock Levels',
        resource: 'inventory_stock',
        icon: faLayerGroup,
      },
      {
        path: '/inventory/suppliers',
        label: 'Suppliers',
        resource: 'suppliers',
        icon: faTruck,
      },
      {
        path: '/inventory/purchase-orders',
        label: 'Purchase Orders',
        resource: 'purchase_orders',
        icon: faClipboard,
      },
    ],
  },

  {
    label: 'Human Resources',
    items: [
      {
        path: '/hr/employees',
        label: 'Employees',
        resource: 'employees',
        icon: faUsers,
      },
      {
        path: '/hr/attendance',
        label: 'Attendance',
        resource: 'attendance',
        icon: faCalendarCheck,
      },
      {
        path: '/hr/leave-requests',
        label: 'Leave Requests',
        resource: 'leave_requests',
        icon: faCalendarXmark,
      },
      {
        path: '/hr/payroll',
        label: 'Payroll',
        resource: 'payroll',
        icon: faCreditCard,
      },
    ],
  },

  {
    label: 'Sales',
    items: [
      {
        path: '/sales/orders',
        label: 'Sales Orders',
        resource: 'sales_orders',
        icon: faShoppingCart,
      },
      {
        path: '/sales/customers',
        label: 'Customers',
        resource: 'customers',
        icon: faUserCheck,
      },
      {
        path: '/sales/returns',
        label: 'Returns',
        resource: 'returns',
        icon: faRotateLeft,
      },
    ],
  },

  {
    label: 'Administration',
    items: [
      {
        path: '/admin/roles',
        label: 'Roles & Permissions',
        resource: 'users',
        icon: faShieldHalved,
      },
    ],
  },
];

const LogOutIcon = () => (
  <FontAwesomeIcon
    icon={faArrowRightFromBracket}
    className="w-4 h-4 shrink-0"
  />
);

const BarChartIcon = () => (
  <FontAwesomeIcon
    icon={faChartBar}
    className="w-5 h-5"
  />
);

export default function Sidebar() {
  const { user, permissions, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false); // Mobile state

  // Closes the menu on mobile when a route or logout is clicked
  const handleMobileNavClick = () => {
    setIsOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-white/[0.08] text-white'
        : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
    }`;

  return (
    <>
      {/* 3. Mobile Hamburger Trigger (Only visible when menu is CLOSED on small screens) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 flex items-center justify-center w-10 h-10 rounded-lg bg-slate-900 border border-white/[0.06] text-slate-400 hover:text-white transition-colors shadow-lg"
          aria-label="Open sidebar"
        >
          <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
        </button>
      )}

      {/* 4. Backdrop Overlay (Closes menu when clicked outside) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 5. Responsive Aside container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-slate-900 flex flex-col shrink-0 border-r border-white/[0.06] overflow-y-auto transition-transform duration-300 ease-in-out 
          md:static md:translate-x-0 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Header containing Logo & Mobile Close Trigger */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white">
              <BarChartIcon />
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">
              {/* NexusERP */}
              NAZAMHA
            </span>
          </div>

          {/* Close button inside sidebar on mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 focus:outline-none"
            aria-label="Close sidebar"
          >
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-5">
          {NAV_SECTIONS.map((section, sIdx) => {
            const visibleItems = section.items.filter((item) => {
              if (
                item.roles &&
                (!user || !item.roles.includes(user.role))
              ) {
                return false;
              }

              return (
                item.resource === null ||
                checkPermission(permissions, item.resource)
              );
            });

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
                      <NavLink
                        to={item.path}
                        end
                        className={navLinkClass}
                        onClick={handleMobileNavClick} // Close drawer on route click
                      >
                        <FontAwesomeIcon
                          icon={item.icon}
                          className="w-4 h-4 shrink-0"
                        />
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Footer / User Profile section */}
        <div className="px-3 pb-4 pt-3 border-t border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <UserAvatar user={user} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">
                {user?.first_name
                  ? `${user.first_name} ${user.last_name ?? ''}`.trim()
                  : user?.username}
              </p>
              <p className="text-slate-500 text-[11px] truncate capitalize">
                {permissions?.role ?? 'Member'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              handleMobileNavClick(); // Close drawer on logout
            }}
            className="mt-1 flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-white/[0.04] transition-colors"
          >
            <LogOutIcon />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}