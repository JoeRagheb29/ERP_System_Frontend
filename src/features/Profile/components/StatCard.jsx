import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function StatCard({ icon, label, value, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone] ?? tones.slate}`}>
        <FontAwesomeIcon icon={icon} className="w-4 h-4" />
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

export default StatCard;