import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faDatabase } from '@fortawesome/free-solid-svg-icons';
import {
  COLOR_MAP,
  DEPARTMENTS,
  MODULE_TABLES,
  ROLE_THEME_MAP,
  ROLES,
  getAccessibleTables,
} from '../constants/rolesPermissions.constants';

export default function CapabilitiesPanel({ selectedRole, onDeptChange }) {
  if (!selectedRole) return null;

  const roleInfo = ROLES.find((role) => role.value === selectedRole.value);
  const accessible = getAccessibleTables(selectedRole.value, selectedRole.dept);
  const theme = ROLE_THEME_MAP[selectedRole.value] ?? ROLE_THEME_MAP.employee;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${theme.bg} ${theme.text}`}>
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
            {DEPARTMENTS.map((department) => (
              <button
                key={department.value}
                onClick={() => onDeptChange(department.value)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  selectedRole.dept === department.value
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {department.label}
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
                {tables.map((table) => {
                  const hasAccess = accessible.has(table);
                  return (
                    <div key={table} className={`flex items-center gap-2 text-xs ${hasAccess ? 'text-slate-700' : 'text-slate-300'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${hasAccess ? colors.dot : 'bg-slate-200'}`} />
                      <span className="font-mono truncate min-w-0 flex-1" title={table}>{table}</span>
                      {hasAccess && <FontAwesomeIcon icon={faCheck} className={`ml-1 shrink-0 w-3 h-3 ${theme.text}`} />}
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
