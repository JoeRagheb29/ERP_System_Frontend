import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved, faUsers, faBoxOpen, faShoppingCart,
  faCheck, faXmark, faPen, faSpinner, faChevronDown,
  faExclamationCircle, faUserTie, faUserCog, faUserGear,
  faDatabase, faTriangleExclamation, faRefresh, faUserPlus, faTrash,
} from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../../api/client';
import { useAuthStore } from '../../../store/auth.store';

// ─────────────────────────────────────────────────────────────────────────────
// Static role definitions — mirrors backend utils/roles.py
// ─────────────────────────────────────────────────────────────────────────────

const ROLES = [
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
    dept: 'hr', // default to hr so checkmarks appear immediately
    icon: faUsers,
    description: 'Read-only access to their assigned department\'s tables.',
    tables: [], // dynamic based on dept
  },
];

const DEPARTMENTS = [
  { value: 'hr', label: 'Human Resources' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'sales', label: 'Sales' },
];

const ROLE_COLOR_MAP = {
  owner:              { bg: 'bg-amber-500/10',   text: 'text-amber-600',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  admin:              { bg: 'bg-purple-500/10',  text: 'text-purple-600',  border: 'border-purple-200',  dot: 'bg-purple-500' },
  hr_manager:         { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  inventory_manager:  { bg: 'bg-blue-500/10',    text: 'text-blue-600',    border: 'border-blue-200',    dot: 'bg-blue-500' },
  sales_manager:      { bg: 'bg-orange-500/10',  text: 'text-orange-600',  border: 'border-orange-200',  dot: 'bg-orange-500' },
  employee:           { bg: 'bg-slate-500/10',   text: 'text-slate-600',   border: 'border-slate-200',   dot: 'bg-slate-400' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper components
// ─────────────────────────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  if (!role) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200">
        No role
      </span>
    );
  }
  const colors = ROLE_COLOR_MAP[role] ?? ROLE_COLOR_MAP.employee;
  const label = role === 'owner' ? 'Owner'
    : role === 'admin' ? 'Admin'
    : role === 'hr_manager' ? 'HR Manager'
    : role === 'inventory_manager' ? 'Inventory Manager'
    : role === 'sales_manager' ? 'Sales Manager'
    : 'Employee';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {label}
    </span>
  );
}

function DeptBadge({ dept }) {
  if (!dept) return null;
  const map = { hr: 'HR', inventory: 'Inventory', sales: 'Sales' };
  return (
    <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
      {map[dept] ?? dept}
    </span>
  );
}

function UserAvatar({ user }) {
  const initials = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join('') || user?.username?.[0]?.toUpperCase() || '?';

  const colorMap = {
    A: 'bg-red-500/15 text-red-600', B: 'bg-orange-500/15 text-orange-600',
    C: 'bg-amber-500/15 text-amber-600', D: 'bg-emerald-500/15 text-emerald-600',
    E: 'bg-teal-500/15 text-teal-600', F: 'bg-cyan-500/15 text-cyan-600',
    G: 'bg-blue-500/15 text-blue-600', H: 'bg-indigo-500/15 text-indigo-600',
    I: 'bg-violet-500/15 text-violet-600', J: 'bg-purple-500/15 text-purple-600',
    K: 'bg-pink-500/15 text-pink-600', L: 'bg-rose-500/15 text-rose-600',
  };
  const color = colorMap[initials[0]] ?? 'bg-slate-100 text-slate-600';

  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Role Editor Popover
// ─────────────────────────────────────────────────────────────────────────────

function RoleEditor({ member, onSave, onCancel, saving }) {
  const [selectedRole, setSelectedRole] = useState(member.role ?? '');
  const [selectedDept, setSelectedDept] = useState(member.department ?? '');

  // Auto-set department when role is a specific manager
  useEffect(() => {
    if (selectedRole === 'hr_manager') setSelectedDept('hr');
    else if (selectedRole === 'inventory_manager') setSelectedDept('inventory');
    else if (selectedRole === 'sales_manager') setSelectedDept('sales');
    else if (selectedRole === 'admin' || selectedRole === '') setSelectedDept('');
  }, [selectedRole]);

  const needsDept = selectedRole === 'employee';
  const isValid = selectedRole === '' || selectedRole === 'admin' ||
    (selectedRole === 'employee' && selectedDept !== '') ||
    ['hr_manager', 'inventory_manager', 'sales_manager'].includes(selectedRole);

  const handleSave = () => {
    onSave(member.id, {
      role: selectedRole || null,
      department: selectedRole === 'admin' || selectedRole === '' ? null : selectedDept || null,
    });
  };

  return (
    <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-top-1 duration-150">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Assign Role</p>

      {/* Role picker */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        {ROLES.map((r) => (
          <button
            key={r.value}
            onClick={() => setSelectedRole(r.value)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left ${
              selectedRole === r.value
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <FontAwesomeIcon icon={r.icon} className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{r.label}</span>
            {selectedRole === r.value && (
              <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-blue-500 ml-auto shrink-0" />
            )}
          </button>
        ))}
        {/* No role option */}
        <button
          onClick={() => setSelectedRole('')}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
            selectedRole === ''
              ? 'border-red-400 bg-red-50 text-red-600 shadow-sm'
              : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
          }`}
        >
          <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5 shrink-0" />
          <span>Unassign</span>
          {selectedRole === '' && (
            <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-red-500 ml-auto shrink-0" />
          )}
        </button>
      </div>

      {/* Department picker — only for employee role */}
      {needsDept && (
        <div className="mb-3">
          <p className="text-xs font-medium text-slate-500 mb-2">Department</p>
          <div className="flex gap-2">
            {DEPARTMENTS.map((d) => (
              <button
                key={d.value}
                onClick={() => setSelectedDept(d.value)}
                className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                  selectedDept === d.value
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <><FontAwesomeIcon icon={faSpinner} className="animate-spin w-3 h-3" /> Saving…</>
          ) : (
            <><FontAwesomeIcon icon={faCheck} className="w-3 h-3" /> Apply</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Role Capabilities Panel (static table access display)
// ─────────────────────────────────────────────────────────────────────────────

const MODULE_TABLES = [
  {
    module: 'HR', icon: faUsers, color: 'emerald',
    tables: ['employees', 'attendance', 'leave_requests', 'payroll', 'departments'],
  },
  {
    module: 'Inventory', icon: faBoxOpen, color: 'blue',
    tables: ['products', 'inventory_stock', 'suppliers', 'purchase_orders', 'product_categories'],
  },
  {
    module: 'Sales', icon: faShoppingCart, color: 'orange',
    tables: ['customers', 'sales_orders', 'sales_order_items', 'returns'],
  },
  {
    module: 'Administration', icon: faShieldHalved, color: 'purple',
    tables: ['users', 'activity_logs'],
  },
];

function getAccessibleTables(role, dept) {
  if (!role) return new Set();
  if (role === 'owner' || role === 'admin') return new Set(MODULE_TABLES.flatMap(m => m.tables));
  if (role === 'hr_manager')        return new Set(['employees', 'attendance', 'leave_requests', 'payroll', 'departments', 'users', 'activity_logs']);
  if (role === 'inventory_manager') return new Set(['products', 'inventory_stock', 'suppliers', 'purchase_orders', 'product_categories', 'users', 'activity_logs']);
  if (role === 'sales_manager')     return new Set(['customers', 'sales_orders', 'sales_order_items', 'returns', 'users', 'activity_logs']);
  if (role === 'employee') {
    if (dept === 'hr')        return new Set(['employees', 'attendance', 'leave_requests', 'payroll', 'departments']);
    if (dept === 'inventory') return new Set(['products', 'inventory_stock', 'suppliers', 'purchase_orders', 'product_categories']);
    if (dept === 'sales')     return new Set(['customers', 'sales_orders', 'sales_order_items', 'returns']);
  }
  return new Set();
}

const COLOR_MAP = {
  emerald: { header: 'text-emerald-600 bg-emerald-50 border-emerald-100', dot: 'bg-emerald-400' },
  blue:    { header: 'text-blue-600 bg-blue-50 border-blue-100',          dot: 'bg-blue-400' },
  orange:  { header: 'text-orange-600 bg-orange-50 border-orange-100',    dot: 'bg-orange-400' },
  purple:  { header: 'text-purple-600 bg-purple-50 border-purple-100',    dot: 'bg-purple-400' },
};

function CapabilitiesPanel({ selectedRole, onDeptChange }) {
  if (!selectedRole) return null;

  const roleInfo = ROLES.find(r => r.value === selectedRole.value);
  const accessible = getAccessibleTables(selectedRole.value, selectedRole.dept);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            ROLE_COLOR_MAP[selectedRole.value]?.bg ?? 'bg-slate-100'
          } ${ROLE_COLOR_MAP[selectedRole.value]?.text ?? 'text-slate-600'}`}>
            <FontAwesomeIcon icon={faDatabase} className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {roleInfo?.label ?? selectedRole.value} — Table Access
            </p>
            <p className="text-xs text-slate-400">{roleInfo?.description}</p>
          </div>
        </div>

        {selectedRole.value === 'employee' && onDeptChange && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {DEPARTMENTS.map(d => (
              <button
                key={d.value}
                onClick={() => onDeptChange(d.value)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  selectedRole.dept === d.value
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODULE_TABLES.map(({ module, icon, color, tables }) => {
          const colors = COLOR_MAP[color];
          return (
            <div key={module} className={`rounded-xl border ${colors.header} border-opacity-60 flex flex-col`}>
              <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${colors.header} border-opacity-40`}>
                <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5 shrink-0" />
                <p className="text-xs font-semibold uppercase tracking-wider truncate">{module}</p>
              </div>
              <div className="px-4 py-3 bg-white space-y-2 flex-1">
                {tables.map(t => {
                  const has = accessible.has(t);
                  return (
                    <div key={t} className={`flex items-center gap-2 text-xs ${has ? 'text-slate-700' : 'text-slate-300'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${has ? colors.dot : 'bg-slate-200'}`} />
                      <span className="font-mono truncate min-w-0 flex-1" title={t}>{t}</span>
                      {has && <FontAwesomeIcon icon={faCheck} className={`ml-1 shrink-0 w-3 h-3 ${ROLE_COLOR_MAP[selectedRole.value]?.text ?? 'text-slate-500'}`} />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function RolesPermissionsPage() {
  const { user: currentUser, permissions } = useAuthStore();
  const isOwner = permissions?.role === 'owner';
  const isManager = ['hr_manager', 'inventory_manager', 'sales_manager'].includes(permissions?.role);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [previewRole, setPreviewRole] = useState(ROLES[0]);

  // Add / Remove member state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ── Fetch members ─────────────────────────────────────────────────────────

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/organization/members');
      setMembers(data);
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to load organization members.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  // ── Auto-dismiss toast ────────────────────────────────────────────────────

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Assign role ───────────────────────────────────────────────────────────

  const handleSaveRole = async (userId, { role, department }) => {
    setSavingId(userId);
    try {
      await apiClient.put(`/organization/members/${userId}/role`, { role, department });
      setMembers(prev => prev.map(m =>
        m.id === userId ? { ...m, role, department } : m
      ));
      setEditingId(null);
      setToast({ type: 'success', message: role ? `Role '${role}' assigned successfully.` : 'Role unassigned.' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail ?? 'Failed to update role.' });
    } finally {
      setSavingId(null);
    }
  };

  // ── Add member ────────────────────────────────────────────────────────────
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newUserId.trim()) return;
    setAdding(true);
    try {
      await apiClient.post(`/organization/members/${newUserId.trim()}`);
      setToast({ type: 'success', message: `User ID ${newUserId} added to organization successfully.` });
      setNewUserId('');
      setShowAddModal(false);
      fetchMembers();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail ?? 'Failed to add user to organization.' });
    } finally {
      setAdding(false);
    }
  };

  // ── Remove member ─────────────────────────────────────────────────────────
  const handleRemoveMember = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the organization?`)) return;
    setDeletingId(userId);
    try {
      await apiClient.delete(`/organization/members/${userId}`);
      setMembers(prev => prev.filter(m => m.id !== userId));
      setToast({ type: 'success', message: `${name} removed from organization.` });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail ?? 'Failed to remove user.' });
    } finally {
      setDeletingId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faShieldHalved} className="text-blue-500 w-5 h-5" />
            Roles & Permissions
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage team members and their access levels within the organization.
          </p>
        </div>
        {!loading && (
          <button
            onClick={fetchMembers}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors self-start sm:self-auto"
          >
            <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
            Refresh
          </button>
        )}
      </div>

      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
          toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <FontAwesomeIcon icon={toast.type === 'success' ? faCheck : faExclamationCircle} className="w-4 h-4" />
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-auto opacity-60 hover:opacity-100">
            <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

        {/* ── Left: Members Table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <FontAwesomeIcon icon={faUserGear} className="text-slate-400 w-4 h-4" />
              <p className="text-sm font-semibold text-slate-800">
                {isManager ? `${currentUser?.department?.toUpperCase() ?? ''} Department Members` : 'Organization Members'}
              </p>
              {!loading && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                  {members.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isOwner && (
                <button
                  onClick={() => setShowAddModal(!showAddModal)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-sm"
                >
                  <FontAwesomeIcon icon={faUserPlus} className="w-3.5 h-3.5" />
                  Add Member
                </button>
              )}
              {!isOwner && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="w-3 h-3" />
                  {isManager ? `Department: ${currentUser?.department?.toUpperCase()}` : 'View only'}
                </div>
              )}
            </div>
          </div>

          {/* Add Member inline form */}
          {showAddModal && (
            <form onSubmit={handleAddMember} className="p-4 bg-blue-50/50 border-b border-blue-100 flex items-center gap-3 flex-wrap animate-in slide-in-from-top-1 duration-150">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[11px] font-semibold text-blue-900 uppercase tracking-wider mb-1">
                  Add User by ID
                </label>
                <input
                  type="number"
                  placeholder="Enter User ID (e.g. 2)..."
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>
              <div className="flex items-center gap-2 self-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding || !newUserId.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {adding ? <FontAwesomeIcon icon={faSpinner} className="animate-spin w-3 h-3" /> : <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />}
                  Add User
                </button>
              </div>
            </form>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin w-5 h-5 mr-2" />
              Loading members…
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="m-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Failed to load members</p>
                <p className="text-xs mt-0.5 opacity-80">{error}</p>
              </div>
            </div>
          )}

          {/* Members list */}
          {!loading && !error && (
            <ul className="divide-y divide-slate-100">
              {members.map((member) => {
                const isCurrentUser = member.id === currentUser?.id;
                const isEditing = editingId === member.id;
                const isSaving = savingId === member.id;
                const isOwnerMember = member.role === 'owner';
                const canEdit = isOwner && !isCurrentUser && !isOwnerMember;

                return (
                  <li key={member.id} className="px-6 py-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <UserAvatar user={member} />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {member.first_name
                              ? `${member.first_name} ${member.last_name ?? ''}`.trim()
                              : member.username}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-medium">You</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{member.email}</p>
                      </div>

                      {/* Role + Edit */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col items-end gap-1">
                          <RoleBadge role={member.role} />
                          {member.department && <DeptBadge dept={member.department} />}
                        </div>

                        {canEdit && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingId(isEditing ? null : member.id)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                                isEditing
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                              }`}
                              title="Edit role"
                            >
                              <FontAwesomeIcon icon={isEditing ? faXmark : faPen} className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id, member.first_name ? `${member.first_name} ${member.last_name ?? ''}`.trim() : member.username)}
                              disabled={deletingId === member.id}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Remove from organization"
                            >
                              {deletingId === member.id ? (
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin w-3.5 h-3.5" />
                              ) : (
                                <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inline role editor */}
                    {isEditing && (
                      <RoleEditor
                        member={member}
                        saving={isSaving}
                        onSave={handleSaveRole}
                        onCancel={() => setEditingId(null)}
                      />
                    )}
                  </li>
                );
              })}

              {members.length === 0 && (
                <li className="px-6 py-12 text-center text-slate-400 text-sm">
                  No members found in your organization.
                </li>
              )}
            </ul>
          )}
        </div>

        {/* ── Right: Role Reference ── */}
        <div className="space-y-4">
          {/* Role picker */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800">Role Reference</p>
              <p className="text-xs text-slate-400 mt-0.5">Click a role to see its table access</p>
            </div>
            <div className="p-4 space-y-2">
              {/* Owner (display only) */}
              <button
                onClick={() => setPreviewRole({ value: 'owner', dept: null })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  previewRole?.value === 'owner'
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
                  previewRole?.value === 'owner' ? 'bg-amber-100 text-amber-600' : 'bg-white text-slate-400 border border-slate-200'
                }`}>
                  <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Owner</p>
                  <p className="text-[11px] text-slate-400">Unrestricted access • Auto-assigned</p>
                </div>
                {previewRole?.value === 'owner' && (
                  <FontAwesomeIcon icon={faCheck} className="ml-auto text-amber-500 w-3.5 h-3.5" />
                )}
              </button>

              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setPreviewRole({ value: r.value, dept: r.dept })}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    previewRole?.value === r.value
                      ? `border-${r.color}-300 bg-${r.color}-50`
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
                    previewRole?.value === r.value
                      ? `${ROLE_COLOR_MAP[r.value]?.bg} ${ROLE_COLOR_MAP[r.value]?.text}`
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}>
                    <FontAwesomeIcon icon={r.icon} className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{r.label}</p>
                    <p className="text-[11px] text-slate-400 truncate">{r.description}</p>
                  </div>
                  {previewRole?.value === r.value && (
                    <FontAwesomeIcon icon={faCheck} className={`ml-auto w-3.5 h-3.5 ${ROLE_COLOR_MAP[r.value]?.text}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities display */}
          <CapabilitiesPanel
            selectedRole={previewRole}
            onDeptChange={(dept) => setPreviewRole({ ...previewRole, dept })}
          />
        </div>
      </div>
    </div>
  );
}
