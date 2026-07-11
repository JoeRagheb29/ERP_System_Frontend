import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark, faUser, faCalendar, faClock, faFlag, faComment,
  faIdBadge, faBuilding,
} from '@fortawesome/free-solid-svg-icons';

const STATUS_THEME = {
  present: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  absent: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  late: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  leave: { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' },
  holiday: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
};

function formatDate(value) {
  if (!value) return '\u2014';
  const d = new Date(value);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(value) {
  if (!value) return '\u2014';
  return value.substring(0, 5);
}

function formatDateTime(value) {
  if (!value) return '\u2014';
  const d = new Date(value);
  return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function DetailRow({ icon, label, value, children }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
        <FontAwesomeIcon icon={icon} className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        {children || <p className="text-sm font-medium text-slate-800 mt-0.5">{value ?? '\u2014'}</p>}
      </div>
    </div>
  );
}

export default function AttendanceDetailsModal({ isOpen, onClose, record, onEdit }) {
  if (!isOpen || !record) return null;

  const theme = STATUS_THEME[record.status] ?? { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden mx-4 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 id="detail-modal-title" className="text-lg font-semibold text-slate-900">Attendance Details</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30" aria-label="Close dialog">
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-1">
            <DetailRow icon={faUser} label="Employee">
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{record.employee_name}</p>
            </DetailRow>
            <DetailRow icon={faBuilding} label="Department" value={record.department ? record.department.charAt(0).toUpperCase() + record.department.slice(1) : '\u2014'} />
            <DetailRow icon={faIdBadge} label="Employee Number" value={record.employee_number ?? '\u2014'} />
            <DetailRow icon={faIdBadge} label="Employee ID" value={String(record.employee_id)} />
            <DetailRow icon={faCalendar} label="Date" value={formatDate(record.attendance_date)} />
            <DetailRow icon={faClock} label="Check In" value={formatTime(record.check_in_time)} />
            <DetailRow icon={faClock} label="Check Out" value={formatTime(record.check_out_time)} />
            <DetailRow icon={faFlag} label="Status">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${theme.bg} ${theme.text} mt-1`}>
                <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                {record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'Unknown'}
              </span>
            </DetailRow>
            <DetailRow icon={faComment} label="Notes" value={record.notes || '\u2014'} />
            <DetailRow icon={faClock} label="Created At" value={formatDateTime(record.created_at)} />
            <DetailRow icon={faClock} label="Updated At" value={formatDateTime(record.updated_at)} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={() => { onClose(); onEdit(record); }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              Edit Record
            </button>
          )}
        </div>
      </div>
    </div>
  );
}