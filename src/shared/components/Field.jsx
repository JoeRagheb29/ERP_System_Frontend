import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Field({ id, label, icon, error: fieldErrors, children }) {
  const error = fieldErrors?.[id];
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <FontAwesomeIcon icon={icon} className="w-4 h-4" />
          </span>
        )}
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
