import { ROLE_THEME_MAP, getRoleLabel } from '../constants/rolesPermissions.constants';

export default function RoleBadge({ role }) {
  if (!role) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200">
        No role
      </span>
    );
  }

  const theme = ROLE_THEME_MAP[role] ?? ROLE_THEME_MAP.employee;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${theme.bg} ${theme.text} ${theme.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
      {getRoleLabel(role)}
    </span>
  );
}
