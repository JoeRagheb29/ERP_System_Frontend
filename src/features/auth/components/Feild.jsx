// ── Reusable input field component ────────────────────────────────────────────
function Field({ id, label, icon: Icon, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon />
          </span>
        )}
        {children}
      </div>
      {hint  && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
      {error &&           <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default Field;