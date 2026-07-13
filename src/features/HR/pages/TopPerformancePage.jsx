import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar, faRefresh, faChevronLeft, faChevronRight,
  faBuilding, faCalendar, faEraser,
  faClipboardList, faTrophy,
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../../../store/auth.store';
import checkPermission from '../../../RBAC/checkPermission.util';
import { getPerformance } from '../../../api/performance.api';
import PerformanceStatsCards from '../components/PerformanceStatsCards';
import { Toast, Button, StatusBadge } from '../../../shared/components';

const DEPARTMENTS = [
  { value: '', label: 'All Departments' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'sales', label: 'Sales' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
];

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const now = new Date();
const currentYear = now.getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const PAGE_SIZE = 50;

function getStatusLabel(item) {
  if (item.perfect_attendance) return { label: 'Perfect', type: 'perfect' };
  if (item.attendance_rate >= 90) return { label: 'Good', type: 'good' };
  return { label: 'Needs Attention', type: 'needs_attention' };
}

export default function TopPerformancePage() {
  const { permissions } = useAuthStore();
  checkPermission(permissions, 'employees');

  // ── Data state ──
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);

  // ── UI state ──
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [department, setDepartment] = useState('');
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(currentYear);

  const hasActiveFilters = department || month !== String(now.getMonth() + 1) || year !== currentYear;

  const dismissToast = useCallback(() => setToast(null), []);

  const fetchData = useCallback(async (targetPage) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPerformance({
        page: targetPage,
        page_size: PAGE_SIZE,
        month: parseInt(month),
        year,
        department: department || undefined,
      });
      setRecords(result.items);
      setStats(result.stats);
      setTotal(result.total);
      setPages(result.pages);
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to load performance data.');
    } finally {
      setLoading(false);
    }
  }, [month, year, department]);

  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [department, month, year, fetchData]);

  useEffect(() => {
    if (page === 1) return;
    fetchData(page);
  }, [page, fetchData]);

  const clearFilters = () => {
    setDepartment('');
    setMonth(String(now.getMonth() + 1));
    setYear(currentYear);
    setPage(1);
  };

  const handleRefresh = () => {
    clearFilters();
    fetchData(1);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faTrophy} className="text-amber-500 w-5 h-5" />
            Top Performance
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Track and compare employee performance.
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Based on attendance and punctuality data only — not a full performance review.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh}>
            <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />

      {stats && <PerformanceStatsCards stats={stats} />}

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3" role="search" aria-label="Filter performance data">
        <div className="relative">
          <FontAwesomeIcon icon={faBuilding} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <FontAwesomeIcon icon={faCalendar} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <FontAwesomeIcon icon={faCalendar} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <Button onClick={clearFilters}>
            <FontAwesomeIcon icon={faEraser} className="w-3.5 h-3.5" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3" role="status" aria-label="Loading performance data">
            <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse" />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <Button onClick={() => fetchData(page)} className="mt-3">
              Retry
            </Button>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faClipboardList} className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">No performance data found</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              No employees match the current filters for the selected month and year.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider w-12">Rank</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Employee</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Department</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Attendance Rate</th>
                  <th className="text-right px-4 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Late Count</th>
                  <th className="text-right px-4 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Leave Days</th>
                  <th className="text-center px-4 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((item, idx) => {
                  const rank = (page - 1) * PAGE_SIZE + idx + 1;
                  const statusInfo = getStatusLabel(item);
                  return (
                    <tr key={item.employee_id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-sm text-slate-500 font-medium">{rank}</td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold text-slate-800">{item.employee_name}</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 capitalize whitespace-nowrap">
                        {item.department ?? '\u2014'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700 tabular-nums font-medium">
                        {item.attendance_rate}%
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700 tabular-nums text-right">{item.late_count}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-700 tabular-nums text-right">{item.leave_days_used}</td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge status={statusInfo.type} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && !error && pages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-slate-400 order-2 sm:order-1">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </p>
          <nav className="flex items-center gap-1 order-1 sm:order-2" aria-label="Pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              aria-label="Previous page"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                  p === page
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              aria-label="Next page"
            >
              <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
