import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function FieldRow({ icon, label, value, mono = false }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
        <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className={`mt-1.5 text-sm font-medium ${mono ? 'font-mono' : 'text-slate-800'}`}>
        {value}
      </div>
    </div>
  );
}
export default FieldRow;