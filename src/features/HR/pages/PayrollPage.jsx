import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoneyBillWave, faPlus, faRefresh, faDownload, faSearch, faBuilding,
  faCalendar, faFlag, faEraser, faEye, faPen, faTrash, faXmark, faChevronLeft, faChevronRight,
  faExclamationCircle, faClock, faDollarSign, faCoins, faCheckCircle, faHourglassHalf,
  faUsers, faCalendarAlt, faFileInvoiceDollar,
} from '@fortawesome/free-solid-svg-icons';
import { Toast, Button } from '../../../shared/components';

const PAYROLL_STATUSES = ['pending', 'paid', 'cancelled'];

const MONTHS = [
  { value: '', label: 'All Months' },
  { value: 'january', label: 'January' },
  { value: 'february', label: 'February' },
  { value: 'march', label: 'March' },
  { value: 'april', label: 'April' },
  { value: 'may', label: 'May' },
  { value: 'june', label: 'June' },
  { value: 'july', label: 'July' },
  { value: 'august', label: 'August' },
  { value: 'september', label: 'September' },
  { value: 'october', label: 'October' },
  { value: 'november', label: 'November' },
  { value: 'december', label: 'December' },
];

const YEARS = [
  { value: '', label: 'All Years' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
];

const DEPARTMENTS = [
  { value: '', label: 'All Departments' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'sales', label: 'Sales' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
];

const INITIAL_RECORDS = [
  { id: 1, employee_name: 'Ahmed Hassan', department: 'engineering', month: 'july', year: '2026', basic_salary: 12000, bonus: 1000, allowance: 500, deduction: 300, net_salary: 13200, status: 'paid', notes: '', created_at: '2026-07-01T10:00:00Z', updated_at: '2026-07-05T14:30:00Z' },
  { id: 2, employee_name: 'Sara Ahmed', department: 'hr', month: 'july', year: '2026', basic_salary: 15000, bonus: 2000, allowance: 800, deduction: 500, net_salary: 17300, status: 'paid', notes: '', created_at: '2026-07-01T10:00:00Z', updated_at: '2026-07-05T14:30:00Z' },
  { id: 3, employee_name: 'Mohamed Ali', department: 'it', month: 'july', year: '2026', basic_salary: 18000, bonus: 2500, allowance: 1000, deduction: 600, net_salary: 20900, status: 'pending', notes: 'Awaiting approval', created_at: '2026-07-01T10:00:00Z', updated_at: '2026-07-04T09:00:00Z' },
  { id: 4, employee_name: 'Nora Ehab', department: 'sales', month: 'july', year: '2026', basic_salary: 10000, bonus: 1500, allowance: 400, deduction: 200, net_salary: 11700, status: 'cancelled', notes: 'Duplicate entry', created_at: '2026-07-01T10:00:00Z', updated_at: '2026-07-03T16:00:00Z' },
  { id: 5, employee_name: 'Khaled Youssef', department: 'finance', month: 'july', year: '2026', basic_salary: 22000, bonus: 3000, allowance: 1200, deduction: 800, net_salary: 25400, status: 'paid', notes: '', created_at: '2026-07-02T10:00:00Z', updated_at: '2026-07-06T11:00:00Z' },
  { id: 6, employee_name: 'Laila Mostafa', department: 'marketing', month: 'july', year: '2026', basic_salary: 14000, bonus: 1800, allowance: 600, deduction: 400, net_salary: 16000, status: 'pending', notes: 'Pending HR review', created_at: '2026-07-02T10:00:00Z', updated_at: '2026-07-04T12:00:00Z' },
  { id: 7, employee_name: 'Omar Farouk', department: 'engineering', month: 'july', year: '2026', basic_salary: 16000, bonus: 2200, allowance: 700, deduction: 500, net_salary: 18400, status: 'paid', notes: '', created_at: '2026-07-01T10:00:00Z', updated_at: '2026-07-05T14:30:00Z' },
  { id: 8, employee_name: 'Dalia Hisham', department: 'hr', month: 'august', year: '2026', basic_salary: 13000, bonus: 1200, allowance: 500, deduction: 300, net_salary: 14400, status: 'pending', notes: 'New hire first payroll', created_at: '2026-08-01T10:00:00Z', updated_at: '2026-08-03T09:00:00Z' },
];

const STATUS_COLORS = {
  paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

function formatSalary(value) {
  if (value == null) return '\u2014';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatDate(value) {
  if (!value) return '\u2014';
  const d = new Date(value);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(value) {
  if (!value) return '\u2014';
  const d = new Date(value);
  return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function calculateNetSalary(basicSalary, bonus, allowance, deduction) {
  const numbers = [basicSalary, bonus, allowance, deduction].map((v) => {
    if (typeof v === 'number') return v;
    const parsed = parseFloat(v);
    return isNaN(parsed) ? 0 : parsed;
  });
  return numbers[0] + numbers[1] + numbers[2] - numbers[3];
}

function PayrollStatusBadge({ status }) {
  const theme = STATUS_COLORS[status] ?? { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${theme.bg} ${theme.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
      {capitalizeFirst(status)}
    </span>
  );
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <FontAwesomeIcon icon={icon} className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

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

export default function PayrollPage() {
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [saving, setSaving] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);

  const [showDelete, setShowDelete] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [filtersApplied, setFiltersApplied] = useState(false);

  const hasActiveFilters = search || department || month || year || statusFilter;

  const filteredRecords = records.filter((r) => {
    if (search && !r.employee_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (department && r.department !== department) return false;
    if (month && r.month !== month) return false;
    if (year && r.year !== year) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  const displayRecords = filtersApplied ? filteredRecords : records;

  const dismissToast = () => setToast(null);

  const handleView = (rec) => {
    setViewingRecord(rec);
    setShowDetail(true);
  };

  const handleEdit = (rec) => {
    setEditingRecord(rec);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleDeleteClick = (rec) => {
    setDeletingRecord(rec);
    setShowDelete(true);
  };

  const handleDeleteConfirm = () => {
    setDeleting(true);
    setTimeout(() => {
      setRecords((prev) => prev.filter((r) => r.id !== deletingRecord.id));
      setShowDelete(false);
      setDeletingRecord(null);
      setDeleting(false);
      setToast({ type: 'success', message: `${deletingRecord.employee_name}'s payroll deleted.` });
    }, 400);
  };

  const handleApplyFilters = () => {
    setSelectedIds(new Set());
    setFiltersApplied(true);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDepartment('');
    setMonth('');
    setYear('');
    setStatusFilter('');
    setFiltersApplied(false);
    setSelectedIds(new Set());
  };

  const handleRefreshClick = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setRecords(INITIAL_RECORDS);
      setFiltersApplied(false);
      setSearch('');
      setDepartment('');
      setMonth('');
      setYear('');
      setStatusFilter('');
      setSelectedIds(new Set());
      setLoading(false);
      setToast({ type: 'success', message: 'Payroll records refreshed.' });
    }, 600);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === displayRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayRecords.map((r) => r.id)));
    }
  };

  const totalPayrollAmount = records.reduce((sum, r) => sum + r.net_salary, 0);
  const paidCount = records.filter((r) => r.status === 'paid').length;
  const pendingCount = records.filter((r) => r.status === 'pending').length;
  const avgSalary = records.length ? Math.round(totalPayrollAmount / records.length) : 0;
  const thisMonthPayroll = records
    .filter((r) => r.month === 'july' && r.year === '2026')
    .reduce((sum, r) => sum + r.net_salary, 0);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-blue-500 w-5 h-5" />
            Payroll
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage employee payroll records and salary processing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setToast({ type: 'success', message: 'Payroll generation started.' })}>
            <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
            Generate Payroll
          </Button>
          <Button onClick={() => setToast({ type: 'success', message: 'Export started.' })}>
            <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
            Export
          </Button>
          <Button onClick={handleRefreshClick}>
            <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />

      {/* ── Statistics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={faFileInvoiceDollar}
          label="Total Payroll Records"
          value={records.length}
          color="bg-blue-500"
        />
        <StatCard
          icon={faDollarSign}
          label="Total Payroll Amount"
          value={formatSalary(totalPayrollAmount)}
          color="bg-emerald-500"
        />
        <StatCard
          icon={faCheckCircle}
          label="Paid Payrolls"
          value={paidCount}
          color="bg-teal-500"
        />
        <StatCard
          icon={faHourglassHalf}
          label="Pending Payrolls"
          value={pendingCount}
          color="bg-amber-500"
        />
        <StatCard
          icon={faUsers}
          label="Average Salary"
          value={formatSalary(avgSalary)}
          color="bg-indigo-500"
        />
        <StatCard
          icon={faCalendarAlt}
          label="This Month Payroll"
          value={formatSalary(thisMonthPayroll)}
          color="bg-violet-500"
        />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3" role="search" aria-label="Filter payroll">
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee…"
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

        <Button onClick={handleApplyFilters}>
          Apply Filters
        </Button>

        {hasActiveFilters && (
          <Button onClick={handleResetFilters}>
            <FontAwesomeIcon icon={faEraser} className="w-3.5 h-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* ── Bulk Action Bar ── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm">
          <span className="text-sm font-medium text-blue-700">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* ── Payroll Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-slate-400 w-4 h-4" />
            <p className="text-sm font-semibold text-slate-800">Payroll Records</p>
            {!loading && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                {displayRecords.length}
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
                <div className="h-4 w-20 bg-slate-100 rounded hidden md:block" />
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
              onClick={handleRefreshClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium transition-colors"
            >
              <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full" role="table" aria-label="Payroll table">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 sticky top-0 z-10 bg-white w-10">
                    <SelectAllCheckbox
                      checked={displayRecords.length > 0 && selectedIds.size === displayRecords.length}
                      indeterminate={selectedIds.size > 0 && selectedIds.size < displayRecords.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
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
                {displayRecords.length === 0 ? (
                  <tr>
                    <td colSpan={12}>
                      <div className="flex flex-col items-center justify-center py-14">
                        <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                          <FontAwesomeIcon icon={faMoneyBillWave} className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">No payroll records found</p>
                        <p className="text-xs text-slate-400 max-w-xs text-center">
                          There are no payroll records matching your current filters. Try adjusting or clearing them.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayRecords.map((rec, idx) => (
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
                      <td className="px-4 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                        <RowCheckbox
                          checked={selectedIds.has(rec.id)}
                          onChange={() => toggleSelect(rec.id)}
                          label={`Select ${rec.employee_name}`}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold text-slate-800">{rec.employee_name}</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 capitalize whitespace-nowrap hidden md:table-cell">{rec.department ?? '\u2014'}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 capitalize whitespace-nowrap">{capitalizeFirst(rec.month)}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap hidden md:table-cell">{rec.year}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 font-mono whitespace-nowrap hidden lg:table-cell">{formatSalary(rec.basic_salary)}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 font-mono whitespace-nowrap hidden lg:table-cell">{formatSalary(rec.bonus)}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 font-mono whitespace-nowrap hidden lg:table-cell">{formatSalary(rec.allowance)}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 font-mono whitespace-nowrap hidden lg:table-cell">{formatSalary(rec.deduction)}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-800 font-semibold font-mono whitespace-nowrap">{formatSalary(rec.net_salary)}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <PayrollStatusBadge status={rec.status} />
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
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            aria-label={`Edit ${rec.employee_name}`}
                          >
                            <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(rec)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30"
                            aria-label={`Delete ${rec.employee_name}`}
                          >
                            <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
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

      {/* ── Details Modal ── */}
      {showDetail && viewingRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-modal-title"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h2 id="detail-modal-title" className="text-lg font-semibold text-slate-900">Payroll Details</h2>
              <button onClick={() => { setShowDetail(false); setViewingRecord(null); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30" aria-label="Close dialog">
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4 overflow-y-auto">
              <DetailRow label="Employee Name" value={viewingRecord.employee_name} />
              <DetailRow label="Department" value={capitalizeFirst(viewingRecord.department)} />
              <DetailRow label="Month" value={capitalizeFirst(viewingRecord.month)} />
              <DetailRow label="Year" value={viewingRecord.year} />
              <DetailRow label="Basic Salary" value={formatSalary(viewingRecord.basic_salary)} />
              <DetailRow label="Bonus" value={formatSalary(viewingRecord.bonus)} />
              <DetailRow label="Allowance" value={formatSalary(viewingRecord.allowance)} />
              <DetailRow label="Deduction" value={formatSalary(viewingRecord.deduction)} />
              <DetailRow label="Net Salary" value={formatSalary(viewingRecord.net_salary)} />
              <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <FontAwesomeIcon icon={faFlag} className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Payroll Status</p>
                  <PayrollStatusBadge status={viewingRecord.status} />
                </div>
              </div>
              <DetailRow label="Notes" value={viewingRecord.notes || '\u2014'} />
              <DetailRow label="Created At" value={formatDateTime(viewingRecord.created_at)} />
              <DetailRow label="Updated At" value={formatDateTime(viewingRecord.updated_at)} />
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 shrink-0">
              <Button onClick={() => { setShowDetail(false); setViewingRecord(null); }}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {showForm && (
        <PayrollFormModal
          record={editingRecord}
          onClose={() => { setShowForm(false); setEditingRecord(null); }}
          onSave={(data) => {
            setSaving(true);
            setTimeout(() => {
              if (editingRecord) {
                setRecords((prev) => prev.map((r) => (r.id === editingRecord.id ? { ...r, ...data, net_salary: calculateNetSalary(data.basic_salary, data.bonus, data.allowance, data.deduction) } : r)));
                setToast({ type: 'success', message: `${data.employee_name}'s payroll updated.` });
              } else {
                const newRecord = { ...data, id: Date.now(), net_salary: calculateNetSalary(data.basic_salary, data.bonus, data.allowance, data.deduction), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
                setRecords((prev) => [...prev, newRecord]);
                setToast({ type: 'success', message: `Payroll for ${data.employee_name} created.` });
              }
              setShowForm(false);
              setEditingRecord(null);
              setSaving(false);
            }, 400);
          }}
          saving={saving}
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDelete && deletingRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faExclamationCircle} className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="delete-modal-title" className="text-lg font-semibold text-slate-900">Delete Payroll Record</h2>
                <p className="text-sm text-slate-500 mt-2">
                  You are about to delete payroll record for <span className="font-medium text-slate-700">{deletingRecord.employee_name}</span> ({capitalizeFirst(deletingRecord.month)} {deletingRecord.year}). This action cannot be undone.
                </p>
              </div>
              <button onClick={() => { setShowDelete(false); setDeletingRecord(null); }} disabled={deleting} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-slate-400/30" aria-label="Close dialog">
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button onClick={() => { setShowDelete(false); setDeletingRecord(null); }}>Cancel</Button>
              <Button variant="danger" onClick={handleDeleteConfirm} loading={deleting}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value, children }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
        <FontAwesomeIcon icon={icon || faClock} className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        {children || <p className="text-sm font-medium text-slate-800 mt-0.5">{value ?? '\u2014'}</p>}
      </div>
    </div>
  );
}

function PayrollFormModal({ record, onClose, onSave, saving }) {
  const [employeeName, setEmployeeName] = useState(record?.employee_name ?? '');
  const [department, setDepartment] = useState(record?.department ?? 'engineering');
  const [month, setMonth] = useState(record?.month ?? 'july');
  const [year, setYear] = useState(record?.year ?? '2026');
  const [basicSalary, setBasicSalary] = useState(record?.basic_salary ?? '');
  const [bonus, setBonus] = useState(record?.bonus ?? '');
  const [allowance, setAllowance] = useState(record?.allowance ?? '');
  const [deduction, setDeduction] = useState(record?.deduction ?? '');
  const [notes, setNotes] = useState(record?.notes ?? '');
  const [status, setStatus] = useState(record?.status ?? 'pending');

  const netSalary = calculateNetSalary(
    basicSalary === '' ? 0 : basicSalary,
    bonus === '' ? 0 : bonus,
    allowance === '' ? 0 : allowance,
    deduction === '' ? 0 : deduction,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeName.trim() || !basicSalary) return;
    onSave({
      employee_name: employeeName.trim(),
      department,
      month,
      year,
      basic_salary: parseFloat(basicSalary) || 0,
      bonus: parseFloat(bonus) || 0,
      allowance: parseFloat(allowance) || 0,
      deduction: parseFloat(deduction) || 0,
      notes,
      status,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-modal-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 id="form-modal-title" className="text-lg font-semibold text-slate-900">{record ? 'Edit Payroll' : 'Add Payroll'}</h2>
          <button onClick={onClose} disabled={saving} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-slate-400/30" aria-label="Close dialog">
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 overflow-y-auto">
          <FormField label="Employee" required>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Enter employee name"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Department" required>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
              >
                {DEPARTMENTS.filter((d) => d.value).map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Month" required>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
              >
                {MONTHS.filter((d) => d.value).map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Year" required>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
              >
                {YEARS.filter((d) => d.value).map((y) => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Basic Salary" required>
              <input
                type="number"
                value={basicSalary}
                onChange={(e) => setBasicSalary(e.target.value)}
                placeholder="0"
                required
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600"
              />
            </FormField>

            <FormField label="Bonus">
              <input
                type="number"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600"
              />
            </FormField>

            <FormField label="Allowance">
              <input
                type="number"
                value={allowance}
                onChange={(e) => setAllowance(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600"
              />
            </FormField>

            <FormField label="Deduction">
              <input
                type="number"
                value={deduction}
                onChange={(e) => setDeduction(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600"
              />
            </FormField>
          </div>

          <FormField label="Net Salary">
            <div className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-800 font-semibold font-mono">
              {formatSalary(netSalary)}
            </div>
          </FormField>

          <FormField label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes…"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 resize-none"
            />
          </FormField>

          <FormField label="Status" required>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
            >
              {PAYROLL_STATUSES.map((s) => (
                <option key={s} value={s}>{capitalizeFirst(s)}</option>
              ))}
            </select>
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>{record ? 'Update' : 'Create'} Payroll</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}