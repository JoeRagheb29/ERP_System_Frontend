import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faExclamationCircle, faClipboardList, faEye, faSort, faSortUp, faSortDown, faArrowRotateRight } from '@fortawesome/free-solid-svg-icons';
import { StatusBadge } from '../../../shared/components';
import { calculateOvertime } from '../utils/attendance';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(value) {
  if (!value) return '—';
  return value.substring(0, 5);
}

const SORT_COLUMNS = [
  { key: 'employee_id', label: 'Employee' },
  { key: 'attendance_date', label: 'Date' },
];

const DISPLAY_COLUMNS = [
  { key: 'check_in_time', label: 'Check In' },
  { key: 'check_out_time', label: 'Check Out' },
  { key: 'overtime', label: 'Overtime' },
];

const SORT_COLUMNS_END = [
  { key: 'status', label: 'Status' },
];

function SelectAllCheckbox({ checked, indeterminate, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => { if (el) el.indeterminate = indeterminate; }}
      onChange={onChange}
      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
      aria-label={checked ? 'Deselect all' : 'Select all'}
    />
  );
}

function RowCheckbox({ checked, onChange, label }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
      aria-label={label}
    />
  );
}

function SortIcon({ columnKey, sortBy, sortOrder }) {
  if (sortBy !== columnKey) {
    return <FontAwesomeIcon icon={faSort} className="w-3 h-3 ml-1 text-slate-300 group-hover:text-slate-400" />;
  }
  return (
    <FontAwesomeIcon
      icon={sortOrder === 'asc' ? faSortUp : faSortDown}
      className="w-3 h-3 ml-1 text-blue-500"
    />
  );
}

export default function AttendanceTable({
  records,
  total,
  loading,
  error,
  onRefresh,
  onView,
  onEdit,
  onDelete,
  sortBy,
  sortOrder,
  onSort,
  canEdit,
  selectedIds,
  onSelectionChange,
  enableSelection,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <FontAwesomeIcon icon={faClipboardList} className="text-slate-400 w-4 h-4" />
          <p className="text-sm font-semibold text-slate-800">Attendance Records</p>
          {!loading && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
              {total}
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="p-6 space-y-3" role="status" aria-label="Loading attendance records">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-4 w-36 bg-slate-100 rounded" />
              <div className="h-4 w-28 bg-slate-100 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded hidden md:block" />
              <div className="h-5 w-16 bg-slate-100 rounded-full shrink-0" />
              <div className="flex-1 hidden sm:block" />
              <div className="h-7 w-20 bg-slate-100 rounded shrink-0" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-14 px-6">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faExclamationCircle} className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-sm font-semibold text-slate-800 mb-1">Failed to load attendance records</p>
          <p className="text-xs text-slate-500 mb-5 max-w-sm text-center">{error}</p>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium transition-colors"
          >
            <FontAwesomeIcon icon={faArrowRotateRight} className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full" role="table" aria-label="Attendance table">
            <thead>
              <tr className="border-b border-slate-100">
                {enableSelection && (
                  <th className="px-4 py-3 sticky top-0 z-10 bg-white w-10">
                    <SelectAllCheckbox
                      checked={records.length > 0 && selectedIds.size === records.length}
                      indeterminate={selectedIds.size > 0 && selectedIds.size < records.length}
                      onChange={() => {
                        if (selectedIds.size === records.length) {
                          onSelectionChange(new Set());
                        } else {
                          onSelectionChange(new Set(records.map((r) => r.id)));
                        }
                      }}
                    />
                  </th>
                )}
                {SORT_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => onSort(col.key)}
                    className={`group px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-slate-600 transition-colors sticky top-0 z-10 bg-white`}
                    aria-sort={sortBy === col.key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <span className="inline-flex items-center">
                      {col.label}
                      <SortIcon columnKey={col.key} sortBy={sortBy} sortOrder={sortOrder} />
                    </span>
                  </th>
                ))}
                {DISPLAY_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white ${
                      col.key === 'check_out_time' || col.key === 'overtime' ? 'hidden md:table-cell' : ''
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
                {SORT_COLUMNS_END.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => onSort(col.key)}
                    className={`group px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-slate-600 transition-colors sticky top-0 z-10 bg-white`}
                    aria-sort={sortBy === col.key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <span className="inline-flex items-center">
                      {col.label}
                      <SortIcon columnKey={col.key} sortBy={sortBy} sortOrder={sortOrder} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={SORT_COLUMNS.length + DISPLAY_COLUMNS.length + SORT_COLUMNS_END.length + 1 + (enableSelection ? 1 : 0)}>
                    <div className="flex flex-col items-center justify-center py-14">
                      <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                        <FontAwesomeIcon icon={faClipboardList} className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">No attendance records found</p>
                      <p className="text-xs text-slate-400 max-w-xs text-center">
                        There are no attendance records matching your current filters. Try adjusting or clearing them.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((rec, idx) => (
                  <tr
                    key={rec.id}
                    onClick={() => onView(rec)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onView(rec); }}
                    tabIndex={0}
                    role="row"
                    className={`cursor-pointer transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    } hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/30`}
                  >
                    {enableSelection && (
                      <td className="px-4 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                        <RowCheckbox
                          checked={selectedIds.has(rec.id)}
                          onChange={() => {
                            const next = new Set(selectedIds);
                            if (next.has(rec.id)) next.delete(rec.id);
                            else next.add(rec.id);
                            onSelectionChange(next);
                          }}
                          label={`Select ${rec.employee_name}`}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-slate-800">{rec.employee_name}</p>
                      <p className="text-[11px] text-slate-400">{rec.department ? rec.department.charAt(0).toUpperCase() + rec.department.slice(1) : ''}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">{formatDate(rec.attendance_date)}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-500 font-mono whitespace-nowrap">{formatTime(rec.check_in_time)}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-500 font-mono whitespace-nowrap hidden md:table-cell">{formatTime(rec.check_out_time)}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-500 font-mono whitespace-nowrap hidden md:table-cell">{calculateOvertime(rec.check_in_time, rec.check_out_time)}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={rec.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onView(rec)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          aria-label={`View details for ${rec.employee_name}`}
                        >
                          <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => onEdit(rec)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                              aria-label={`Edit ${rec.employee_name}`}
                            >
                              <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDelete(rec)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30"
                              aria-label={`Delete record for ${rec.employee_name}`}
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}