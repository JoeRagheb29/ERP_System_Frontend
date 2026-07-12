import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faPlus, faRefresh, faChevronLeft, faChevronRight, faBuilding, faFlag, faCalendar, faEraser, faDownload, faFileImport, faTrash, faCheck, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../../../store/auth.store';
import checkPermission from '../../../RBAC/checkPermission.util';
import { useEmployees } from '../hooks/useEmployees';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeFormModal from '../components/EmployeeFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import EmployeeDetailModal from '../components/EmployeeDetailModal';
import ImportModal from '../components/ImportModal';
import EmployeesStatsCards from '../components/EmployeesStatsCards';
import { Toast, Button } from '../../../shared/components';

const DEPARTMENTS = [
  { value: '', label: 'All Departments' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'sales', label: 'Sales' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'resigned', label: 'Resigned' },
];

const PAGE_SIZE = 20;

export default function EmployeesPage() {
  const { permissions } = useAuthStore();
  const canEdit = checkPermission(permissions, 'employees') && permissions?.role !== 'employee';
  const { fetchAll, create, update, remove, getImportTemplate, importFile, exportData, bulkDelete, bulkStatus } = useEmployees();

  // ── Data state ──
  const [employees, setEmployees] = useState([]);
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
  const [statusFilter, setStatusFilter] = useState('');
  const [hireDateFrom, setHireDateFrom] = useState('');
  const [hireDateTo, setHireDateTo] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  // ── Modal state ──
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showBulkStatus, setShowBulkStatus] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const exportMenuRef = useRef(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const hasActiveFilters = department || statusFilter || hireDateFrom || hireDateTo || search;

  const dismissToast = useCallback(() => setToast(null), []);

  // Keep latest filter values in a ref so doFetch never goes stale
  const filterRef = useRef({ debouncedSearch, department, statusFilter, hireDateFrom, hireDateTo, sortBy, sortOrder });
  filterRef.current = { debouncedSearch, department, statusFilter, hireDateFrom, hireDateTo, sortBy, sortOrder };

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
        status: f.statusFilter || undefined,
        hire_date_from: f.hireDateFrom || undefined,
        hire_date_to: f.hireDateTo || undefined,
        sort_by: f.sortBy !== 'id' ? f.sortBy : undefined,
        sort_order: f.sortOrder !== 'asc' ? f.sortOrder : undefined,
      });
      setEmployees(result.items);
      setTotal(result.total);
      setPages(result.pages);
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to load employees.');
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  // ── Debounce search ──
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // When filters change → reset to page 1 and fetch
  useEffect(() => {
    setPage(1);
    doFetch(1);
  }, [debouncedSearch, department, statusFilter, hireDateFrom, hireDateTo, sortBy, sortOrder, doFetch]);

  // When only page changes (pagination clicks) → fetch that page
  useEffect(() => {
    if (page === 1) return;
    doFetch(page);
  }, [page, doFetch]);

  // ── Handlers ──
  const handleAdd = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleView = (emp) => {
    setViewingEmployee(emp);
    setShowDetail(true);
  };

  const handleDetailEdit = (emp) => {
    setShowDetail(false);
    setViewingEmployee(null);
    setEditingEmployee(emp);
    setShowForm(true);
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setShowForm(true);
  };

  const handleSort = (column) => {
    setSortBy((prevBy) => {
      if (prevBy === column) {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        return prevBy;
      }
      setSortOrder('asc');
      return column;
    });
  };

  const handleFormSave = async (data) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        phone_number: data.phone_number || undefined,
        job_title: data.job_title || undefined,
        department: data.department || undefined,
      };
      if (editingEmployee) {
        const updated = await update(editingEmployee.id, payload);
        setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        setToast({ type: 'success', message: `${data.full_name} updated successfully.` });
      } else {
        const created = await create(payload);
        setEmployees((prev) => [...prev, created]);
        setToast({ type: 'success', message: `${data.full_name} added successfully.` });
      }
      setShowForm(false);
      setEditingEmployee(null);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ type: 'error', message: typeof detail === 'string' ? detail : 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (emp) => {
    setDeletingEmployee(emp);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async (id) => {
    setDeleting(true);
    try {
      await remove(id);
      setToast({ type: 'success', message: `${deletingEmployee.full_name} deleted successfully.` });
      setShowDelete(false);
      setDeletingEmployee(null);
      setPage(1);
      await doFetch(1);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ type: 'error', message: typeof detail === 'string' ? detail : 'Failed to delete employee.' });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setDepartment('');
    setStatusFilter('');
    setHireDateFrom('');
    setHireDateTo('');
    setSortBy('id');
    setSortOrder('asc');
    setPage(1);
  };

  // ── Export ──
  const triggerExport = useCallback(async (fileFormat, scope) => {
    try {
      const blob = await exportData({
        format: fileFormat,
        scope,
        page,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
        department: department || undefined,
        status: statusFilter || undefined,
        hire_date_from: hireDateFrom || undefined,
        hire_date_to: hireDateTo || undefined,
        sort_by: sortBy !== 'id' ? sortBy : undefined,
        sort_order: sortOrder !== 'asc' ? sortOrder : undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees.${fileFormat}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setShowExportMenu(false);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Export failed.';
      setToast({ type: 'error', message: msg });
    }
  }, [exportData, page, debouncedSearch, department, statusFilter, hireDateFrom, hireDateTo, sortBy, sortOrder]);

  // ── Import ──
  const handleImport = useCallback(async (file) => {
    setImporting(true);
    try {
      const result = await importFile(file);
      setImporting(false);
      if (result.imported > 0) {
        setToast({ type: 'success', message: `${result.imported} employee(s) imported.` });
        doFetch(1);
      }
      return result;
    } catch (err) {
      setImporting(false);
      throw err;
    }
  }, [importFile, doFetch]);

  const handleDownloadTemplate = useCallback(async () => {
    try {
      const blob = await getImportTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employee_import_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setToast({ type: 'error', message: 'Failed to download template.' });
    }
  }, [getImportTemplate]);

  // ── Bulk actions ──
  const handleBulkDelete = useCallback(async () => {
    setBulkBusy(true);
    try {
      const result = await bulkDelete([...selectedIds]);
      setToast({ type: 'success', message: result.message || `${result.deleted} employee(s) deleted.` });
      setSelectedIds(new Set());
      setShowBulkDeleteConfirm(false);
      doFetch(1);
    } catch {
      setToast({ type: 'error', message: 'Bulk delete failed.' });
    } finally {
      setBulkBusy(false);
    }
  }, [bulkDelete, selectedIds, doFetch]);

  const handleBulkStatus = useCallback(async (newStatus) => {
    setBulkBusy(true);
    try {
      const result = await bulkStatus([...selectedIds], newStatus);
      setToast({ type: 'success', message: result.message || `${result.updated} employee(s) updated.` });
      setSelectedIds(new Set());
      setShowBulkStatus(false);
      doFetch(1);
    } catch {
      setToast({ type: 'error', message: 'Bulk status change failed.' });
    } finally {
      setBulkBusy(false);
    }
  }, [bulkStatus, selectedIds, doFetch]);

  const handleBulkExport = useCallback(async (fileFormat) => {
    try {
      const params = { format: fileFormat, scope: 'filtered', page_size: 100 };
      const blob = await exportData(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `selected_employees.${fileFormat}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setToast({ type: 'error', message: 'Export selected failed.' });
    }
  }, [exportData]);

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

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faUsers} className="text-blue-500 w-5 h-5" />
            Employees
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your organization's employees and their information.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button onClick={() => setShowImport(true)}>
              <FontAwesomeIcon icon={faFileImport} className="w-3.5 h-3.5" />
              Import
            </Button>
          )}
          <div className="relative" ref={exportMenuRef}>
            <Button onClick={() => setShowExportMenu((v) => !v)}>
              <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
              Export
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-44 z-20 bg-white rounded-xl border border-slate-200 shadow-lg py-1">
                <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Page</p>
                <button onClick={() => triggerExport('xlsx', 'filtered')} className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Excel (.xlsx)</button>
                <button onClick={() => triggerExport('csv', 'filtered')} className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">CSV (.csv)</button>
                <hr className="my-1 border-slate-100" />
                <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">All Employees</p>
                <button onClick={() => triggerExport('xlsx', 'all')} className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">All Excel (.xlsx)</button>
                <button onClick={() => triggerExport('csv', 'all')} className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">All CSV (.csv)</button>
              </div>
            )}
          </div>
          <Button onClick={() => { clearFilters(); doFetch(1); }}>
            <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
            Refresh
          </Button>
          {canEdit && (
            <Button variant="primary" onClick={handleAdd}>
              <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
              Add Employee
            </Button>
          )}
        </div>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />

      <EmployeesStatsCards employees={employees} />

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3" role="search" aria-label="Filter employees">
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

        <div className="relative">
          <FontAwesomeIcon icon={faCalendar} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={hireDateFrom}
            onChange={(e) => setHireDateFrom(e.target.value)}
            placeholder="From"
            className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 w-40"
          />
        </div>

        <div className="relative">
          <FontAwesomeIcon icon={faCalendar} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={hireDateTo}
            onChange={(e) => setHireDateTo(e.target.value)}
            placeholder="To"
            className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 w-40"
          />
        </div>

        {hasActiveFilters && (
          <Button onClick={clearFilters}>
            <FontAwesomeIcon icon={faEraser} className="w-3.5 h-3.5" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* ── Bulk Action Bar ── */}
      {selectedIds.size > 0 && canEdit && (
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
      <EmployeeTable
        employees={employees}
        total={total}
        loading={loading}
        error={error}
        onRefresh={() => doFetch(1)}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        canEdit={canEdit}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        enableSelection={true}
      />

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

      {/* ── Add/Edit Modal ── */}
      <EmployeeFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingEmployee(null); }}
        onSave={handleFormSave}
        employee={editingEmployee}
        saving={saving}
      />

      {/* ── Delete Confirm Modal ── */}
      <DeleteConfirmModal
        isOpen={showDelete}
        onClose={() => { setShowDelete(false); setDeletingEmployee(null); }}
        onConfirm={handleDeleteConfirm}
        employee={deletingEmployee}
        deleting={deleting}
      />

      {/* ── Detail Modal ── */}
      <EmployeeDetailModal
        isOpen={showDetail}
        onClose={() => { setShowDetail(false); setViewingEmployee(null); }}
        employee={viewingEmployee}
        onEdit={canEdit ? handleDetailEdit : undefined}
      />

      {/* ── Import Modal ── */}
      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
        onDownloadTemplate={handleDownloadTemplate}
        importing={importing}
      />

      {/* ── Bulk Delete Confirm ── */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="bulk-delete-title">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faTrash} className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="bulk-delete-title" className="text-lg font-semibold text-slate-900">Delete {selectedIds.size} Employee(s)?</h2>
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
                <p className="text-sm text-slate-500 mt-2">Update status for {selectedIds.size} employee(s).</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <Button
                onClick={() => handleBulkStatus('active')}
                loading={bulkBusy}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                Set Active
              </Button>
              <Button
                onClick={() => handleBulkStatus('resigned')}
                loading={bulkBusy}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                Set Resigned
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
