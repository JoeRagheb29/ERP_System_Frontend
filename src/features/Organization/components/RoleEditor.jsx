import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSpinner, faXmark, faBoxOpen, faShoppingCart, faUsers, faUserCog, faUserTie } from '@fortawesome/free-solid-svg-icons';
import { DEPARTMENTS, ROLES } from '../constants/rolesPermissions.constants';

export default function RoleEditor({ member, onSave, onCancel, saving }) {
  const [selectedRole, setSelectedRole] = useState(member.role ?? '');
  const [selectedDept, setSelectedDept] = useState(member.department ?? '');

  const handleRoleSelect = (roleValue) => {
    setSelectedRole(roleValue);

    if (roleValue === 'hr_manager') setSelectedDept('hr');
    else if (roleValue === 'inventory_manager') setSelectedDept('inventory');
    else if (roleValue === 'sales_manager') setSelectedDept('sales');
    else if (roleValue === 'admin' || roleValue === '') setSelectedDept('');
  };

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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        {ROLES.map((role) => {
          const iconMap = {
            admin: faUserTie,
            hr_manager: faUserCog,
            inventory_manager: faBoxOpen,
            sales_manager: faShoppingCart,
            employee: faUsers,
          };

          return (
            <button
              key={role.value}
              onClick={() => handleRoleSelect(role.value)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left ${
                selectedRole === role.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <FontAwesomeIcon icon={iconMap[role.value] ?? faUsers} className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{role.label}</span>
              {selectedRole === role.value && (
                <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-blue-500 ml-auto shrink-0" />
              )}
            </button>
          );
        })}

        <button
          onClick={() => handleRoleSelect('')}
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

      {needsDept && (
        <div className="mb-3">
          <p className="text-xs font-medium text-slate-500 mb-2">Department</p>
          <div className="flex gap-2">
            {DEPARTMENTS.map((department) => (
              <button
                key={department.value}
                onClick={() => setSelectedDept(department.value)}
                className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                  selectedDept === department.value
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                {department.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
