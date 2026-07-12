import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faExclamationCircle, faUsers, faEye, faSort, faSortUp, faSortDown, faArrowRotateRight } from '@fortawesome/free-solid-svg-icons';
import { StatusBadge } from '../../../shared/components';

function formatCurrency(value) {
  if (value == null) return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const SORT_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'credit_limit', label: 'Credit Limit' },
  { key: 'status', label: 'Status' },
];

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

export default function CustomerTable({
  customers,
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
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <FontAwesomeIcon icon={faUsers} className="text-slate-400 w-4 h-4" />
          <p className="text-sm font-semibold text-slate-800">Customers</p>
          {!loading && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
              {total}
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="p-6 space-y-3" role="status" aria-label="Loading customers">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-4 w-32 bg-slate-100 rounded" />
              <div className="h-4 w-48 bg-slate-100 rounded" />
              <div className="h-4 w-28 bg-slate-100 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded hidden md:block" />
              <div className="h-5 w-16 bg-slate-100 rounded-full shrink-0" />
              <div className="flex-1" />
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
          <p className="text-sm font-semibold text-slate-800 mb-1">Failed to load customers</p>
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
          <table className="w-full" role="table" aria-label="Customers table">
            <thead>
              <tr className="border-b border-slate-100">
                {SORT_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => onSort(col.key)}
                    className={`group px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-slate-600 transition-colors sticky top-0 z-10 bg-white ${
                      col.key === 'credit_limit' ? 'hidden md:table-cell' : ''
                    }`}
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
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={SORT_COLUMNS.length + 1}>
                    <div className="flex flex-col items-center justify-center py-14">
                      <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                        <FontAwesomeIcon icon={faUsers} className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">No customers found</p>
                      <p className="text-xs text-slate-400 max-w-xs text-center">
                        There are no customers matching your current filters. Try adjusting or clearing them.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((cust, idx) => (
                  <tr
                    key={cust.id}
                    onClick={() => onView(cust)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onView(cust); }}
                    tabIndex={0}
                    role="row"
                    className={`cursor-pointer transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    } hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/30`}
                  >
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-slate-800">{cust.name}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">{cust.email}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">{cust.phone ?? '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-500 font-mono whitespace-nowrap hidden md:table-cell">{formatCurrency(cust.credit_limit)}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={cust.status ?? 'active'} />
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onView(cust)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          aria-label={`View details for ${cust.name}`}
                        >
                          <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => onEdit(cust)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                              aria-label={`Edit ${cust.name}`}
                            >
                              <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDelete(cust)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30"
                              aria-label={`Delete ${cust.name}`}
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
