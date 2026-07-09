import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarXmark, faPlus, faRefresh, faChevronLeft, faChevronRight, faBuilding, faFlag, faCalendar, faEraser, faSearch, faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../../../store/auth.store';
import checkPermission from '../../../RBAC/checkPermission.util';
import { useLeaveRequests } from '../hooks/useLeaveRequests';
import { getEmployees } from '../../../api/hr.api';
import LeaveRequestsTable from '../components/LeaveRequestsTable';
import LeaveRequestFormModal from '../components/LeaveRequestFormModal';
import LeaveRequestDetailsModal from '../components/LeaveRequestDetailsModal';
import { Toast, Button } from '../../../shared/components';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

const LEAVE_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'annual', label: 'Annual' },
  { value: 'sick', label: 'Sick' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'maternity', label: 'Maternity' },
  { value: 'paternity', label: 'Paternity' },
];

const PAGE_SIZE = 20;

export default function LeaveRequestsPage() {
  const { permissions } = useAuthStore();
  const canEdit = checkPermission(permissions, 'leave_requests') && permissions?.role !== 'employee';
  const { fetchAll, create, update, remove } = useLeaveRequests();

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
  const [statusFilter, setStatusFilter] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('requested_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // ── Employees for dropdown ──
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // ── Modal state ──
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);

  const hasActiveFilters = department || statusFilter || leaveTypeFilter || dateFrom || dateTo || search;

  const dismissToast = useCallback(() => setToast(null), []);

  const filterRef = useRef({ debouncedSearch, department, statusFilter, leaveTypeFilter, dateFrom, dateTo, sortBy, sortOrder });
  filterRef.current = { debouncedSearch, department, statusFilter, leaveTypeFilter, dateFrom, dateTo, sortBy, sortOrder };

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
        leave_type: f.leaveTypeFilter || undefined,
        date_from: f.dateFrom || undefined,
        date_to: f.dateTo || undefined,
        sort_by: f.sortBy !== 'requested_at' ? f.sortBy : undefined,
        sort_order: f.sortOrder !== 'desc' ? f.sortOrder : undefined,
      });
      setRecords(result.items);
      setTotal(result.total);
      setPages(result.pages);
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getEmployees({ page: 1, page_size: 100 });
        if (!cancelled) setEmployees(data.items ?? []);
      } catch {
        if (!cancelled) setToast({ type: 'error', message: 'Failed to load employees list.' });
      } finally {
        if (!cancelled) setLoadingEmployees(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
    doFetch(1);
  }, [debouncedSearch, department, statusFilter, leaveTypeFilter, dateFrom, dateTo, sortBy, sortOrder, doFetch]);

  useEffect(() => {
    if (page === 1) return;
    doFetch(page);
  }, [page, doFetch]);

  const handleAdd = () => {
    if (loadingEmployees) return;
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleView = (rec) => {
    setViewingRecord(rec);
    setShowDetail(true);
  };

  const handleDetailEdit = (rec) => {
    setShowDetail(false);
    setViewingRecord(null);
    setEditingRecord(rec);
    setShowForm(true);
  };

  const handleEdit = (rec) => {
    setEditingRecord(rec);
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
      if (editingRecord) {
        const updated = await update(editingRecord.id, data);
        setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        setToast({ type: 'success', message: 'Leave request updated successfully.' });
      } else {
        const created = await create(data);
        setRecords((prev) => [...prev, created]);
        setToast({ type: 'success', message: 'Leave request added successfully.' });
      }
      setShowForm(false);
      setEditingRecord(null);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ type: 'error', message: typeof detail === 'string' ? detail : 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (rec) => {
    setDeletingRecord(rec);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await remove(deletingRecord.id);
      setToast({ type: 'success', message: 'Leave request deleted successfully.' });
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
    setStatusFilter('');
    setLeaveTypeFilter('');
    setDateFrom('');
    setDateTo('');
    setSortBy('requested_at');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faCalendarXmark} className="text-blue-500 w-5 h-5" />
            Leave Requests
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage employee leave requests and approvals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => doFetch(1)}>
            <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
            Refresh
          </Button>
          {canEdit && (
            <Button variant="primary" onClick={handleAdd}>
              <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
              Add Request
            </Button>
          )}
        </div>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3" role="search" aria-label="Filter leave requests">
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
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Department…"
            className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 w-40"
          />
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
          <FontAwesomeIcon icon={faFlag} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            value={leaveTypeFilter}
            onChange={(e) => setLeaveTypeFilter(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
          >
            {LEAVE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <FontAwesomeIcon icon={faCalendar} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="From"
            className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 w-40"
          />
        </div>

        <div className="relative">
          <FontAwesomeIcon icon={faCalendar} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
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

      {/* ── Table ── */}
      <LeaveRequestsTable
        records={records}
        total={total}
        loading={loading}
        error={error}
        onRefresh={() => doFetch(page)}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        canEdit={canEdit}
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
      {showForm && (
        <LeaveRequestFormModal
          isOpen={showForm}
          onClose={() => { setShowForm(false); setEditingRecord(null); }}
          onSave={handleFormSave}
          record={editingRecord}
          saving={saving}
          employees={employees}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDelete && deletingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faTriangleExclamation} className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="delete-modal-title" className="text-lg font-semibold text-slate-900">Delete Leave Request</h2>
                <p className="text-sm text-slate-500 mt-2">
                  You are about to delete the leave request for <span className="font-medium text-slate-700">{deletingRecord.employee_name}</span> ({deletingRecord.leave_type}). This action cannot be undone.
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

      {/* ── Detail Modal ── */}
      <LeaveRequestDetailsModal
        isOpen={showDetail}
        onClose={() => { setShowDetail(false); setViewingRecord(null); }}
        record={viewingRecord}
        onEdit={canEdit ? handleDetailEdit : undefined}
      />
    </div>
  );
}
