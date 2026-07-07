import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function PermissionSnapshot({ permissions }) {
  const accessMap = permissions?.permissions ?? {};
  const resources = Object.entries(accessMap);

  if (!resources.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
        No detailed permission matrix available for this account.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {resources.slice(0, 6).map(([resource, actions]) => {
        const allowedActions = Object.entries(actions ?? {}).filter(([, allowed]) => Boolean(allowed));

        return (
          <div key={resource} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800 capitalize">{resource.replaceAll('_', ' ')}</p>
              <p className="text-xs text-slate-400">{allowedActions.length} allowed action(s)</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {allowedActions.slice(0, 4).map(([action]) => (
                <span key={action} className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                  {action}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PermissionSnapshot;