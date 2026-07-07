import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBuilding, faCalendarDays, faChartSimple, faEnvelope,
  faKey, faLayerGroup, faPhone, faShieldHalved, faUser, faUserTie } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../../../store/auth.store';
import { ROLE_THEME_MAP, getDepartmentLabel, getRoleLabel } from '../../Organization/constants/rolesPermissions.constants';
import StatCard from '../components/StatCard';
import SectionCard from '../components/SectionCard';
import FieldRow from '../components/FieldRow';
import PermissionSnapshot from '../components/PermissionSnapshot';
import { formatDate, getDisplayName, getInitials } from '../utils/utils';

export default function ProfilePage() {
  const { user, permissions, isAuthenticated } = useAuthStore();

  const displayName = getDisplayName(user);
  const initials = getInitials(user);
  const role = permissions?.role ?? 'member';
  const roleLabel = getRoleLabel(role) || 'Member';
  const department = permissions?.department ?? user?.department ?? null;
  const theme = ROLE_THEME_MAP[role] ?? ROLE_THEME_MAP.employee;

  const accessMap = permissions?.permissions ?? {};
  const grantedResources = Object.values(accessMap).filter((actions) => Object.values(actions ?? {}).some(Boolean)).length;
  const grantedActions = Object.values(accessMap).reduce(
    (total, actions) => total + Object.values(actions ?? {}).filter(Boolean).length,0 );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500" />
        <div className="absolute -left-20 top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-16 top-16 h-56 w-56 rounded-full bg-slate-900/10 blur-3xl" />

        <div className="relative px-6 pb-6 pt-20 md:px-8 md:pb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="relative h-28 w-28 shrink-0 rounded-3xl border-4 border-white bg-slate-100 text-3xl font-bold text-slate-700 shadow-lg flex items-center justify-center">
                {initials}
                <button
                  type="button"
                  className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-white bg-blue-600 text-white shadow-md transition-colors hover:bg-blue-700"
                  aria-label="Profile image upload coming soon"
                  disabled
                >
                  <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
                  <div className={`inline-flex w-max items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${theme.bg} ${theme.text} ${theme.border}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                    {roleLabel}
                  </div>
                </div>
                <p className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500 sm:justify-start">
                  <FontAwesomeIcon icon={faBuilding} className="text-slate-400" />
                  <span>Organization ID:</span>
                  <span className="font-mono text-slate-700">{user?.org_id ?? 'N/A'}</span>
                  {department && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span>{getDepartmentLabel(department)}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard icon={faShieldHalved} label="Role" value={roleLabel} tone="blue" />
              <StatCard icon={faLayerGroup} label="Resources" value={grantedResources || '0'} tone="emerald" />
              <StatCard icon={faChartSimple} label="Actions" value={grantedActions || '0'} tone="amber" />
              <StatCard icon={faUserTie} label="Auth" value={isAuthenticated ? 'Signed in' : 'Guest'} tone="slate" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <SectionCard title="Personal Details" description="Read-only account information synced from the authenticated user session.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldRow icon={faUser} label="Full name" value={displayName} />
            <FieldRow icon={faEnvelope} label="Email" value={user?.email ?? 'Not available'} />
            <FieldRow icon={faPhone} label="Phone" value={user?.phone ?? 'Not provided'} />
            <FieldRow icon={faBuilding} label="Organization ID" value={user?.org_id ?? 'N/A'} mono />
            <FieldRow icon={faCalendarDays} label="Member since" value={formatDate(user?.created_at ?? user?.joined_at)} />
            <FieldRow icon={faShieldHalved} label="Department" value={department ? getDepartmentLabel(department) : 'Not assigned'} />
          </div>
        </SectionCard>

        <SectionCard title="Security & Access" description="The page is available only to authenticated users through route protection.">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <FontAwesomeIcon icon={faKey} className="text-slate-400" />
                Session access
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Route access is controlled by `ProtectedRoute`, and profile data comes from the current auth store session.
              </p>
            </div>

            <div className="space-y-3">
              <PermissionSnapshot permissions={permissions} />
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Need to review permissions?</p>
                <p className="text-xs text-slate-500">Open the roles and permissions page to inspect module access.</p>
              </div>
              <Link
                to="/admin/roles"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Roles & Permissions
                <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
