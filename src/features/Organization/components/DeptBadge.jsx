import { getDepartmentLabel } from '../constants/rolesPermissions.constants';

export default function DeptBadge({ dept }) {
  if (!dept) return null;

  return (
    <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
      {getDepartmentLabel(dept)}
    </span>
  );
}
