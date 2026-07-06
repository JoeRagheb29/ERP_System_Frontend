import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { ROLE_THEME_MAP, ROLES } from '../constants/rolesPermissions.constants';
import CapabilitiesPanel from './CapabilitiesPanel';

export default function RoleReferencePanel({ previewRole, onPreviewChange }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">Role Reference</p>
          <p className="text-xs text-slate-400 mt-0.5">Click a role to see its table access</p>
        </div>
        <div className="p-4 space-y-2">
          <button
            onClick={() => onPreviewChange({ value: 'owner', dept: null })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
              previewRole?.value === 'owner'
                ? ROLE_THEME_MAP.owner.panelCard
                : 'border-slate-100 bg-slate-50 hover:border-slate-200'
            }`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
              previewRole?.value === 'owner'
                ? ROLE_THEME_MAP.owner.panelIcon
                : 'bg-white text-slate-400 border border-slate-200'
            }`}>
              <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">Owner</p>
              <p className="text-[11px] text-slate-400">Unrestricted access • Auto-assigned</p>
            </div>
            {previewRole?.value === 'owner' && (
              <FontAwesomeIcon icon={faCheck} className={`ml-auto w-3.5 h-3.5 ${ROLE_THEME_MAP.owner.panelCheck}`} />
            )}
          </button>

          {ROLES.map((role) => {
            const theme = ROLE_THEME_MAP[role.value] ?? ROLE_THEME_MAP.employee;

            return (
              <button
                key={role.value}
                onClick={() => onPreviewChange({ value: role.value, dept: role.dept })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  previewRole?.value === role.value
                    ? theme.panelCard
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
                  previewRole?.value === role.value
                    ? theme.panelIcon
                    : 'bg-white text-slate-400 border border-slate-200'
                }`}>
                  <FontAwesomeIcon icon={role.icon} className="w-3.5 h-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{role.label}</p>
                  <p className="text-[11px] text-slate-400 truncate">{role.description}</p>
                </div>
                {previewRole?.value === role.value && (
                  <FontAwesomeIcon icon={faCheck} className={`ml-auto w-3.5 h-3.5 ${theme.panelCheck}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <CapabilitiesPanel
        selectedRole={previewRole}
        onDeptChange={(dept) => onPreviewChange({ ...previewRole, dept })}
      />
    </div>
  );
}
