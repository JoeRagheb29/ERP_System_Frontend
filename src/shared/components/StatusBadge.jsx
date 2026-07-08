const STATUS_THEME = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  resigned: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
};

export default function StatusBadge({ status, className = '' }) {
  const theme = STATUS_THEME[status] ?? { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${theme.bg} ${theme.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
}
