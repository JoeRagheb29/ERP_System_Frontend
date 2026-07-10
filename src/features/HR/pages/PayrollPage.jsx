import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoneyBillWave, faPlus, faRefresh, faSearch, faBuilding,
  faCalendar, faFlag, faEraser, faEye, faPen, faDownload, faClipboardList,
  faExclamationCircle, faArrowRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import { usePayroll } from '../hooks/usePayroll';
import { StatusBadge, Button, Toast } from '../../../shared/components';
import GeneratePayrollModal from '../components/GeneratePayrollModal';
import PayrollDetailsModal from '../components/PayrollDetailsModal';
import EditPayrollModal from '../components/EditPayrollModal';
import PayrollStatsCards from '../components/PayrollStatsCards';
import * as XLSX from 'xlsx';

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
  { value: '', label: 'All Months' },
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

const YEARS = [
  { value: '', label: 'All Years' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

function formatSalary(value) {
  if (value == null) return '\u2014';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function PayrollPage() {
  const { fetchAll, generate: generatePayroll, update: updatePayroll } = usePayroll();

  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);
  const [toast, setToast] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const hasActiveFilters = search || department || month || year || statusFilter;

  // Keep latest filter values in a ref so doFetch never goes stale
  const filterRef = useRef({ debouncedSearch, department, month, year, statusFilter });
  filterRef.current = { debouncedSearch, department, month, year, statusFilter };

  const doFetch = useCallback(async () => {
    const f = filterRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAll({
        page: 1,
        page_size: 100,
        search: f.debouncedSearch || undefined,
        department: f.department || undefined,
        month: f.month ? parseInt(f.month, 10) : undefined,
        year: f.year ? parseInt(f.year, 10) : undefined,
        status: f.statusFilter || undefined,
      });
      setRecords(result.items);
      setTotal(result.total);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to load payroll records.');
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // When filters change, fetch
  useEffect(() => {
    doFetch();
  }, [debouncedSearch, department, month, year, statusFilter, doFetch]);

  // Close export menu on outside click, Escape, or scroll
  useEffect(() => {
    if (!showExportMenu) return;
    const handleClick = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowExportMenu(false);
    };
    const handleScroll = () => setShowExportMenu(false);
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showExportMenu]);

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setDepartment('');
    setMonth('');
    setYear('');
    setStatusFilter('');
  };

  const handleView = (rec) => {
    setSelectedRecord(rec);
    setShowDetail(true);
  };

  const handleEdit = (rec) => {
    setEditingRecord(rec);
    setShowEdit(true);
  };

  const handleSaveEdit = async (id, data) => {
    setSaving(true);
    try {
      await updatePayroll(id, data);
      setShowEdit(false);
      setEditingRecord(null);
      setToast({ type: 'success', message: 'Payroll updated successfully.' });
      doFetch();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ type: 'error', message: typeof detail === 'string' ? detail : 'Failed to update payroll.' });
    } finally {
      setSaving(false);
    }
  };

  const triggerExport = useCallback(async (format) => {
    setExporting(true);
    try {
      const rows = records.map((rec) => {
        const overtimePay = rec.gross_salary != null
          ? Math.max(0, rec.gross_salary - rec.basic_salary - (rec.bonus ?? 0) - (rec.allowance ?? 0))
          : 0;
        const absenceDeduction = (rec.gross_salary != null && rec.net_salary != null)
          ? Math.max(0, rec.gross_salary - rec.net_salary - (rec.deductions ?? 0))
          : 0;
        return {
          'Employee Name': rec.employee_name ?? '',
          'Employee Number': rec.employee_number ?? '',
          'Department': rec.department ? capitalize(rec.department) : '',
          'Month': rec.month ? capitalize(rec.month) : '',
          'Year': rec.year ?? '',
          'Basic Salary': rec.basic_salary ?? 0,
          'Bonus': rec.bonus ?? 0,
          'Allowance': rec.allowance ?? 0,
          'Overtime Pay': overtimePay,
          'Absence Deduction': absenceDeduction,
          'Manual Deduction': rec.deductions ?? 0,
          'Gross Salary': rec.gross_salary ?? 0,
          'Net Salary': rec.net_salary ?? 0,
          'Payroll Status': rec.status ? capitalize(rec.status) : '',
        };
      });

      if (format === 'csv') {
        const headers = Object.keys(rows[0] ?? {});
        const csvContent = [
          headers.join(','),
          ...rows.map((row) =>
            headers.map((h) => {
              const val = row[h];
              const str = typeof val === 'number' ? String(val) : String(val ?? '');
              return str.includes(',') || str.includes('"') || str.includes('\n')
                ? '"' + str.replace(/"/g, '""') + '"'
                : str;
            }).join(',')
          ),
        ].join('\n');

        const bom = '\uFEFF';
        const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'payroll.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Payroll');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'payroll.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }

      setShowExportMenu(false);
      setToast({ type: 'success', message: 'Payroll exported successfully.' });
    } catch {
      setToast({ type: 'error', message: 'Export failed.' });
    } finally {
      setExporting(false);
    }
  }, [records]);

  const handleGenerate = async ({ month, year, employeeId }) => {
    setGenerating(true);
    try {
      const payload = employeeId
        ? { employee_id: Number(employeeId), month: Number(month), year: Number(year) }
        : { month: Number(month), year: Number(year) };
      await generatePayroll(payload);
      setShowGenerate(false);
      setToast({ type: 'success', message: 'Payroll generated successfully.' });
      doFetch();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ type: 'error', message: typeof detail === 'string' ? detail : 'Failed to generate payroll.' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="flex items-center justify-center">
          <Toast toast={toast} onDismiss={dismissToast} />
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-blue-500 w-5 h-5" />
            Payroll
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage employee payroll records and salary calculations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowGenerate(true)}>
            <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
            Generate Payroll
          </Button>
          <Button onClick={doFetch}>
            <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <div className="relative" ref={exportMenuRef}>
            <Button onClick={() => setShowExportMenu((v) => !v)} loading={exporting}>
              <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
              Export
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-44 z-20 bg-white rounded-xl border border-slate-200 shadow-lg py-1">
                <button
                  onClick={() => triggerExport('xlsx')}
                  className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => triggerExport('csv')}
                  className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  CSV (.csv)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <PayrollStatsCards records={records} />

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3" role="search" aria-label="Filter payroll records">
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees…"
            className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 w-56"
          />
        </div>

        <div className="relative">
          <FontAwesomeIcon icon={faBuilding} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept.value} value={dept.value}>{dept.label}</option>
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
            onChange={(e) => setYear(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
          >
            {YEARS.map((y) => (
              <option key={y.value} value={y.value}>{y.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <FontAwesomeIcon icon={faFlag} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
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

      {/* ── Payroll Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <FontAwesomeIcon icon={faClipboardList} className="text-slate-400 w-4 h-4" />
            <p className="text-sm font-semibold text-slate-800">Payroll Records</p>
            {!loading && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                {total}
              </span>
            )}
          </div>
        </div>

        {loading && (
          <div className="p-6 space-y-3" role="status" aria-label="Loading payroll records">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-4 w-36 bg-slate-100 rounded" />
                <div className="h-4 w-24 bg-slate-100 rounded" />
                <div className="h-4 w-20 bg-slate-100 rounded" />
                <div className="h-4 w-20 bg-slate-100 rounded hidden md:block" />
                <div className="h-4 w-20 bg-slate-100 rounded hidden lg:block" />
                <div className="h-4 w-20 bg-slate-100 rounded hidden lg:block" />
                <div className="h-4 w-20 bg-slate-100 rounded hidden lg:block" />
                <div className="h-4 w-20 bg-slate-100 rounded hidden lg:block" />
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
            <p className="text-sm font-semibold text-slate-800 mb-1">Failed to load payroll records</p>
            <p className="text-xs text-slate-500 mb-5 max-w-sm text-center">{error}</p>
            <button
              onClick={doFetch}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium transition-colors"
            >
              <FontAwesomeIcon icon={faArrowRotateRight} className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full" role="table" aria-label="Payroll table">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white hidden md:table-cell">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">
                    Month
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white hidden md:table-cell">
                    Year
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white hidden lg:table-cell">
                    Basic Salary
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white hidden lg:table-cell">
                    Bonus
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white hidden lg:table-cell">
                    Allowance
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white hidden lg:table-cell">
                    Deduction
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">
                    Net Salary
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={11}>
                      <div className="flex flex-col items-center justify-center py-14">
                        <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                          <FontAwesomeIcon icon={faClipboardList} className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">No payroll records found</p>
                        <p className="text-xs text-slate-400 max-w-xs text-center">
                          There are no payroll records matching your current filters. Try adjusting or clearing them.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((rec, idx) => (
                    <tr
                      key={rec.id}
                      onClick={() => handleView(rec)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleView(rec); }}
                      tabIndex={0}
                      role="row"
                      className={`cursor-pointer transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                      } hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/30`}
                    >
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold text-slate-800">{rec.employee_name}</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 capitalize whitespace-nowrap hidden md:table-cell">
                        {rec.department ? capitalize(rec.department) : '\u2014'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 capitalize whitespace-nowrap">{rec.month}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap hidden md:table-cell">{rec.year}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 font-mono whitespace-nowrap hidden lg:table-cell">{formatSalary(rec.basic_salary)}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 font-mono whitespace-nowrap hidden lg:table-cell">{formatSalary(rec.bonus)}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 font-mono whitespace-nowrap hidden lg:table-cell">{formatSalary(rec.allowance)}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 font-mono whitespace-nowrap hidden lg:table-cell">{formatSalary(rec.deduction)}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-800 font-semibold font-mono whitespace-nowrap">{formatSalary(rec.net_salary)}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={rec.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleView(rec)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            aria-label={`View details for ${rec.employee_name}`}
                          >
                            <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(rec)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            aria-label={`Edit payroll for ${rec.employee_name}`}
                          >
                            <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
                          </button>
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

      <GeneratePayrollModal
        isOpen={showGenerate}
        onClose={() => setShowGenerate(false)}
        onGenerate={handleGenerate}
        generating={generating}
      />

      <PayrollDetailsModal
        isOpen={showDetail}
        onClose={() => { setShowDetail(false); setSelectedRecord(null); }}
        record={selectedRecord}
      />

      <EditPayrollModal
        key={editingRecord?.id ?? 'no-edit'}
        isOpen={showEdit}
        onClose={() => { setShowEdit(false); setEditingRecord(null); }}
        onSave={handleSaveEdit}
        record={editingRecord}
        saving={saving}
      />
    </div>
  );
}
