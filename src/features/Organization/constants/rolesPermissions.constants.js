import {
  faBoxOpen,
  faShieldHalved,
  faShoppingCart,
  faUserCog,
  faUserTie,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

export const ROLES = [
  {
    value: 'admin',
    label: 'Admin',
    color: 'purple',
    dept: null,
    icon: faUserTie,
    description: 'Full access to all modules and user management.',
    tables: ['users', 'activity_logs', 'employees', 'attendance', 'leave_requests', 'payroll', 'departments', 'products', 'inventory_stock', 'suppliers', 'purchase_orders', 'customers', 'sales_orders', 'returns'],
  },
  {
    value: 'hr_manager',
    label: 'HR Manager',
    color: 'emerald',
    dept: 'hr',
    icon: faUserCog,
    description: 'Full CRUD access to HR department tables.',
    tables: ['employees', 'attendance', 'leave_requests', 'payroll', 'departments'],
  },
  {
    value: 'inventory_manager',
    label: 'Inventory Manager',
    color: 'blue',
    dept: 'inventory',
    icon: faBoxOpen,
    description: 'Full CRUD access to Inventory department tables.',
    tables: ['products', 'inventory_stock', 'suppliers', 'purchase_orders', 'product_categories'],
  },
  {
    value: 'sales_manager',
    label: 'Sales Manager',
    color: 'orange',
    dept: 'sales',
    icon: faShoppingCart,
    description: 'Full CRUD access to Sales department tables.',
    tables: ['customers', 'sales_orders', 'sales_order_items', 'returns'],
  },
  {
    value: 'employee',
    label: 'Employee',
    color: 'slate',
    dept: 'hr',
    icon: faUsers,
    description: 'Read-only access to their assigned department\'s tables.',
    tables: [],
  },
];

export const DEPARTMENTS = [
  { value: 'hr', label: 'Human Resources' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'sales', label: 'Sales' },
];

export const ROLE_THEME_MAP = {
  owner: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    panelCard: 'border-amber-300 bg-amber-50',
    panelIcon: 'bg-amber-100 text-amber-600',
    panelCheck: 'text-amber-500',
  },
  admin: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    panelCard: 'border-purple-300 bg-purple-50',
    panelIcon: 'bg-purple-100 text-purple-600',
    panelCheck: 'text-purple-500',
  },
  hr_manager: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    panelCard: 'border-emerald-300 bg-emerald-50',
    panelIcon: 'bg-emerald-100 text-emerald-600',
    panelCheck: 'text-emerald-500',
  },
  inventory_manager: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    panelCard: 'border-blue-300 bg-blue-50',
    panelIcon: 'bg-blue-100 text-blue-600',
    panelCheck: 'text-blue-500',
  },
  sales_manager: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    panelCard: 'border-orange-300 bg-orange-50',
    panelIcon: 'bg-orange-100 text-orange-600',
    panelCheck: 'text-orange-500',
  },
  employee: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    panelCard: 'border-slate-300 bg-slate-50',
    panelIcon: 'bg-slate-100 text-slate-500',
    panelCheck: 'text-slate-500',
  },
};

export const MODULE_TABLES = [
  {
    module: 'HR',
    icon: faUsers,
    color: 'emerald',
    tables: ['employees', 'attendance', 'leave_requests', 'payroll', 'departments'],
  },
  {
    module: 'Inventory',
    icon: faBoxOpen,
    color: 'blue',
    tables: ['products', 'inventory_stock', 'suppliers', 'purchase_orders', 'product_categories'],
  },
  {
    module: 'Sales',
    icon: faShoppingCart,
    color: 'orange',
    tables: ['customers', 'sales_orders', 'sales_order_items', 'returns'],
  },
  {
    module: 'Administration',
    icon: faShieldHalved,
    color: 'purple',
    tables: ['users', 'activity_logs'],
  },
];

export const COLOR_MAP = {
  emerald: { header: 'text-emerald-600 bg-emerald-50 border-emerald-100', dot: 'bg-emerald-400' },
  blue: { header: 'text-blue-600 bg-blue-50 border-blue-100', dot: 'bg-blue-400' },
  orange: { header: 'text-orange-600 bg-orange-50 border-orange-100', dot: 'bg-orange-400' },
  purple: { header: 'text-purple-600 bg-purple-50 border-purple-100', dot: 'bg-purple-400' },
};

export function getAccessibleTables(role, dept) {
  if (!role) return new Set();
  if (role === 'owner' || role === 'admin') return new Set(MODULE_TABLES.flatMap((module) => module.tables));
  if (role === 'hr_manager') return new Set(['employees', 'attendance', 'leave_requests', 'payroll', 'departments', 'users', 'activity_logs']);
  if (role === 'inventory_manager') return new Set(['products', 'inventory_stock', 'suppliers', 'purchase_orders', 'product_categories', 'users', 'activity_logs']);
  if (role === 'sales_manager') return new Set(['customers', 'sales_orders', 'sales_order_items', 'returns', 'users', 'activity_logs']);
  if (role === 'employee') {
    if (dept === 'hr') return new Set(['employees', 'attendance', 'leave_requests', 'payroll', 'departments']);
    if (dept === 'inventory') return new Set(['products', 'inventory_stock', 'suppliers', 'purchase_orders', 'product_categories']);
    if (dept === 'sales') return new Set(['customers', 'sales_orders', 'sales_order_items', 'returns']);
  }
  return new Set();
}

export function getRoleLabel(role) {
  if (!role) return '';
  if (role === 'owner') return 'Owner';
  if (role === 'admin') return 'Admin';
  if (role === 'hr_manager') return 'HR Manager';
  if (role === 'inventory_manager') return 'Inventory Manager';
  if (role === 'sales_manager') return 'Sales Manager';
  return 'Employee';
}

export function getDepartmentLabel(dept) {
  const map = { hr: 'HR', inventory: 'Inventory', sales: 'Sales' };
  return map[dept] ?? dept;
}
