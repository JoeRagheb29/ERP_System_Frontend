import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoneyBillWave,
  faPlus,
  faRefresh,
  faChevronLeft,
  faChevronRight,
  faBuilding,
  faFlag,
  faCalendar,
  faEraser,
  faDownload,
  faSearch,
  faEye,
  faPen,
  faClipboardList,
  faExclamationCircle,
  faTriangleExclamation,
  faXmark,
  faTrash,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';
import { usePayroll } from '../hooks/usePayroll';
import {
  Button,
  Toast,
  StatusBadge,
} from '../../../shared/components';
import GeneratePayrollModal from '../components/GeneratePayrollModal';
import PayrollDetailsModal from '../components/PayrollDetailsModal';
import EditPayrollModal from '../components/EditPayrollModal';
import PayrollStatsCards from '../components/PayrollStatsCards';

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

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
];

const PAGE_SIZE = 20;

function formatSalary(value) {
  if (value === null || value === undefined) return '\u2014';
  const number = Number(value);
  if (Number.isNaN(number)) return '\u2014';
  return `$${number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function PayrollPage() {
  const {
    fetchAll,
    generate: generatePayroll,
    update: updatePayroll,
    remove: deletePayroll,
  } = usePayroll();

  // ── Data state ──
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);

  // ── UI state ──
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ── Modal state ──
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showBulkStatus, setShowBulkStatus] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  // ── Export state ──
  const exportMenuRef = useRef(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const hasActiveFilters = department || statusFilter || month || year || search;

  const dismissToast = useCallback(() => setToast(null), []);

  // Keep latest filter values in a ref so doFetch never goes stale
  const filterRef = useRef({ debouncedSearch, department, month, year, statusFilter });
  filterRef.current = { debouncedSearch, department, month, year, statusFilter };

  // Stable fetch helper — reads filters from ref on each call
  const doFetch = useCallback(async (targetPage) => {
    const f = filterRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAll({
        page: targetPage,
        page_size: PAGE_SIZE,
        search: f.debouncedSearch || undefined,
        department: f.department || undefined,
        month: f.month ? Number(f.month) : undefined,
        year: f.year ? Number(f.year) : undefined,
        status: f.statusFilter || undefined,
      });
      setRecords(result.items ?? []);
      setTotal(result.total ?? 0);
      setPages(result.pages ?? 1);
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to load payroll records.');
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  // ── Debounce search ──
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // When filters change → reset selection, reset to page 1, fetch
  useEffect(() => {
    setSelectedIds(new Set());
    setPage(1);
    doFetch(1);
  }, [debouncedSearch, department, month, year, statusFilter, doFetch]);

  // When only page changes → fetch that page
  useEffect(() => {
    if (page === 1) return;
    doFetch(page);
  }, [page, doFetch]);

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

  // ── Handlers ──
  const handleView = (record) => {
    setSelectedRecord(record);
    setShowDetail(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setShowEdit(true);
  };

  const handleDeleteClick = (record) => {
    setDeletingRecord(record);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deletePayroll(deletingRecord.id);
      setToast({ type: 'success', message: 'Payroll record deleted successfully.' });
      setShowDelete(false);
      setDeletingRecord(null);
      setPage(1);
      await doFetch(1);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ type: 'error', message: typeof detail === 'string' ? detail : 'Failed to delete record.' });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setDepartment('');
    setMonth('');
    setYear('');
    setStatusFilter('');
    setSelectedIds(new Set());
    setPage(1);
  };

  const handleRefresh = useCallback(() => {
    clearFilters();
    doFetch(1);
  }, [doFetch]);

  // ── Export ──
  const triggerExport = useCallback(async (fileFormat, scope) => {
    setExporting(true);
    try {
      let data;
      if (scope === 'selected') {
        data = records.filter((r) => selectedIds.has(r.id));
      } else {
        data = records;
      }

      const rows = data.map((rec) => ({
        'Employee Name': rec.employee_name ?? '',
        Department: capitalize(rec.department),
        Month: capitalize(rec.month),
        Year: rec.year ?? '',
        'Basic Salary': rec.basic_salary ?? 0,
        Bonus: rec.bonus ?? 0,
        Allowance: rec.allowance ?? 0,
        Deduction: rec.deductions ?? 0,
        'Net Salary': rec.net_salary ?? 0,
        Status: capitalize(rec.status),
      }));

      if (fileFormat === 'csv') {
        const headers = Object.keys(rows[0] || {});
        const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => row[h]).join(','))].join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payroll.${fileFormat}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll');
        XLSX.writeFile(workbook, `payroll.${fileFormat}`);
      }

      setShowExportMenu(false);
      setToast({ type: 'success', message: 'Payroll exported successfully.' });
    } catch {
      setToast({ type: 'error', message: 'Export failed.' });
    } finally {
      setExporting(false);
    }
  }, [records, selectedIds]);

  // ── Save Edit ──
  const handleSaveEdit = async (id, data) => {
    setSaving(true);
    try {
      await updatePayroll(id, data);
      setShowEdit(false);
      setEditingRecord(null);
      setToast({ type: 'success', message: 'Payroll updated successfully.' });
      doFetch(page);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({
        type: 'error',
        message: typeof detail === 'string' ? detail : 'Failed to update payroll.',
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Generate Payroll ──
  const handleGenerate = async ({ month, year, employeeId }) => {
    setGenerating(true);
    try {
      const payload = employeeId
        ? { employee_id: Number(employeeId), month: Number(month), year: Number(year) }
        : { month: Number(month), year: Number(year) };
      await generatePayroll(payload);
      setShowGenerate(false);
      setToast({ type: 'success', message: 'Payroll generated successfully.' });
      doFetch(1);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({
        type: 'error',
        message: typeof detail === 'string' ? detail : 'Failed to generate payroll.',
      });
    } finally {
      setGenerating(false);
    }
  };

  // ── Bulk actions ──
  const handleBulkDelete = useCallback(async () => {
    setBulkBusy(true);
    try {
      const ids = [...selectedIds];
      let deleted = 0;
      for (const id of ids) {
        await deletePayroll(id);
        deleted++;
      }
      setToast({ type: 'success', message: `${deleted} record(s) deleted.` });
      setSelectedIds(new Set());
      setShowBulkDeleteConfirm(false);
      doFetch(1);
    } catch {
      setToast({ type: 'error', message: 'Bulk delete failed.' });
    } finally {
      setBulkBusy(false);
    }
  }, [deletePayroll, selectedIds, doFetch]);

  const handleBulkStatus = useCallback(async (newStatus) => {
    setBulkBusy(true);
    try {
      const ids = [...selectedIds];
      let updated = 0;
      for (const id of ids) {
        await updatePayroll(id, { status: newStatus });
        updated++;
      }
      setToast({ type: 'success', message: `${updated} record(s) updated.` });
      setSelectedIds(new Set());
      setShowBulkStatus(false);
      doFetch(1);
    } catch {
      setToast({ type: 'error', message: 'Bulk status change failed.' });
    } finally {
      setBulkBusy(false);
    }
  }, [updatePayroll, selectedIds, doFetch]);

  const handleBulkExport = useCallback(async (fileFormat) => {
    setExporting(true);
    try {
      const rows = records.filter((r) => selectedIds.has(r.id)).map((rec) => ({
        'Employee Name': rec.employee_name ?? '',
        Department: capitalize(rec.department),
        Month: capitalize(rec.month),
        Year: rec.year ?? '',
        'Basic Salary': rec.basic_salary ?? 0,
        Bonus: rec.bonus ?? 0,
        Allowance: rec.allowance ?? 0,
        Deduction: rec.deductions ?? 0,
        'Net Salary': rec.net_salary ?? 0,
        Status: capitalize(rec.status),
      }));

      if (fileFormat === 'csv') {
        const headers = Object.keys(rows[0] || {});
        const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => row[h]).join(','))].join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `selected_payroll.${fileFormat}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll');
        XLSX.writeFile(workbook, `selected_payroll.${fileFormat}`);
      }

      setToast({ type: 'success', message: 'Selected records exported.' });
    } catch {
      setToast({ type: 'error', message: 'Export selected failed.' });
    } finally {
      setExporting(false);
    }
  }, [records, selectedIds]);

  // ── Selection ──
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(records.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
          <div className="relative" ref={exportMenuRef}>
            <Button
              loading={exporting}
              onClick={() => setShowExportMenu((v) => !v)}
            >
              <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
              Export
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-44 z-20 bg-white rounded-xl border border-slate-200 shadow-lg py-1">
                <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Page</p>
                <button onClick={() => triggerExport('xlsx', 'filtered')} className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Excel (.xlsx)</button>
                <button onClick={() => triggerExport('csv', 'filtered')} className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">CSV (.csv)</button>
                <hr className="my-1 border-slate-100" />
                <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">All Records</p>
                <button onClick={() => triggerExport('xlsx', 'all')} className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">All Excel (.xlsx)</button>
                <button onClick={() => triggerExport('csv', 'all')} className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">All CSV (.csv)</button>
              </div>
            )}
          </div>
          <Button onClick={handleRefresh}>
            <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button variant="primary" onClick={() => setShowGenerate(true)}>
            <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
            Generate Payroll
          </Button>
        </div>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />

      <PayrollStatsCards records={records} />

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3" role="search" aria-label="Filter payroll records">
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees\u2026"
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
            <option value="">All Years</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
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

      {/* ── Bulk Action Bar ── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm">
          <span className="text-sm font-medium text-blue-700">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button onClick={() => setShowBulkStatus(true)} loading={bulkBusy}>
              <FontAwesomeIcon icon={faFlag} className="w-3.5 h-3.5" />
              Change Status
            </Button>
            <Button variant="ghost-danger" onClick={() => setShowBulkDeleteConfirm(true)} loading={bulkBusy}>
              <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
              Delete Selected
            </Button>
            <Button onClick={() => handleBulkExport('xlsx')}>
              <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
              Export Selected
            </Button>
            <Button onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <FontAwesomeIcon icon={faClipboardList} className="text-slate-400 w-4 h-4" />
          <p className="text-sm font-semibold text-slate-800">Payroll Records</p>
          {!loading && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
              {total}
            </span>
          )}
        </div>

        {loading && (
          <div className="p-10 text-center">
            <FontAwesomeIcon icon={faRefresh} spin className="text-2xl text-blue-600" />
            <p className="mt-3 text-slate-500">Loading payroll records...</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-10 text-center">
            <FontAwesomeIcon icon={faExclamationCircle} className="text-4xl text-red-500" />
            <p className="mt-3 text-red-600">{error}</p>
            <Button className="mt-4" onClick={() => doFetch(page)}>Retry</Button>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full" role="table" aria-label="Payroll table">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 sticky top-0 z-10 bg-white w-10">
                    <input
                      type="checkbox"
                      checked={records.length > 0 && selectedIds.size === records.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
                      aria-label={selectedIds.size === records.length ? 'Deselect all' : 'Select all'}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">Employee</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">Department</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">Month</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">Year</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">Basic Salary</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">Bonus</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">Allowance</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">Deduction</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">Net Salary</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">Status</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-16">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <FontAwesomeIcon icon={faClipboardList} className="text-slate-300 w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-slate-700">No payroll records found</h3>
                        <p className="text-sm text-slate-400 text-center">
                          There are no payroll records matching your current filters.
                        </p>
                        <p className="text-sm text-slate-400 text-center">
                          Try adjusting or clearing them.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((record, idx) => (
                    <tr
                      key={record.id}
                      className={`cursor-pointer transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                      } hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/30`}
                      onClick={() => handleView(record)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleView(record); }}
                      tabIndex={0}
                      role="row"
                    >
                      <td className="px-4 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(record.id)}
                          onChange={() => handleSelectOne(record.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
                          aria-label={`Select ${record.employee_name}`}
                        />
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-900">{record.employee_name}</td>
                      <td className="px-4 py-3.5 text-slate-600">{capitalize(record.department)}</td>
                      <td className="px-4 py-3.5 text-slate-600">{capitalize(record.month)}</td>
                      <td className="px-4 py-3.5 text-right text-slate-600">{record.year}</td>
                      <td className="px-4 py-3.5 text-right text-slate-600">{formatSalary(record.basic_salary)}</td>
                      <td className="px-4 py-3.5 text-right text-slate-600">{formatSalary(record.bonus)}</td>
                      <td className="px-4 py-3.5 text-right text-slate-600">{formatSalary(record.allowance)}</td>
                      <td className="px-4 py-3.5 text-right text-slate-600">{formatSalary(record.deductions)}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-slate-900">{formatSalary(record.net_salary)}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleView(record)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            aria-label={`View details for ${record.employee_name}`}
                          >
                            <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(record)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            aria-label={`Edit ${record.employee_name}`}
                          >
                            <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
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

      {/* ── Pagination ── */}
      {!loading && !error && pages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-slate-400 order-2 sm:order-1">
            Showing {(page - 1) * PAGE_SIZE + 1}\u2013{Math.min(page * PAGE_SIZE, total)} of {total}
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

      {/* ── Generate Payroll Modal ── */}
      <GeneratePayrollModal
        isOpen={showGenerate}
        onClose={() => setShowGenerate(false)}
        onGenerate={handleGenerate}
        generating={generating}
      />

      {/* ── Detail Modal ── */}
      <PayrollDetailsModal
        isOpen={showDetail}
        onClose={() => { setShowDetail(false); setSelectedRecord(null); }}
        record={selectedRecord}
      />

      {/* ── Edit Modal ── */}
      <EditPayrollModal
        key={editingRecord?.id}
        isOpen={showEdit}
        onClose={() => { setShowEdit(false); setEditingRecord(null); }}
        record={editingRecord}
        onSave={handleSaveEdit}
        saving={saving}
      />

      {/* ── Delete Confirm Modal ── */}
      {showDelete && deletingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faTriangleExclamation} className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="delete-modal-title" className="text-lg font-semibold text-slate-900">Delete Payroll Record</h2>
                <p className="text-sm text-slate-500 mt-2">
                  You are about to delete the payroll record for <span className="font-medium text-slate-700">{deletingRecord.employee_name}</span> ({deletingRecord.month ?? ''} {deletingRecord.year ?? ''}). This action cannot be undone.
                </p>
              </div>
              <button onClick={() => { setShowDelete(false); setDeletingRecord(null); }} disabled={deleting} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-slate-400/30" aria-label="Close dialog">
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button onClick={() => { setShowDelete(false); setDeletingRecord(null); }} disabled={deleting}>Cancel</Button>
              <Button variant="danger" onClick={handleDeleteConfirm} loading={deleting}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Delete Confirm ── */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="bulk-delete-title">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faTrash} className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="bulk-delete-title" className="text-lg font-semibold text-slate-900">Delete {selectedIds.size} Record(s)?</h2>
                <p className="text-sm text-slate-500 mt-2">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button onClick={() => setShowBulkDeleteConfirm(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleBulkDelete} loading={bulkBusy}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Status Change ── */}
      {showBulkStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="bulk-status-title">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faFlag} className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="bulk-status-title" className="text-lg font-semibold text-slate-900">Change Status</h2>
                <p className="text-sm text-slate-500 mt-2">Update status for {selectedIds.size} record(s).</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <Button
                onClick={() => handleBulkStatus('paid')}
                loading={bulkBusy}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                Set Paid
              </Button>
              <Button
                onClick={() => handleBulkStatus('pending')}
                loading={bulkBusy}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                Set Pending
              </Button>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setShowBulkStatus(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
