import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faPlus, faRefresh, faChevronLeft, faChevronRight, faEraser, faSearch, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../../../store/auth.store';
import checkPermission from '../../../RBAC/checkPermission.util';
import { useCustomers } from '../hooks/useCustomers';
import CustomerTable from '../components/CustomerTable';
import CustomerFormModal from '../components/CustomerFormModal';
import { Toast, Button } from '../../../shared/components';

const PAGE_SIZE = 20;

export default function CustomersPage() {
  const { permissions } = useAuthStore();
  const canEdit = checkPermission(permissions, 'customers') && permissions?.role !== 'employee';
  const { fetchAll, create, update, remove } = useCustomers();

  // ── Data state ──
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);

  // ── UI state ──
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // ── Modal state ──
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const filterRef = useRef({ debouncedSearch, sortBy, sortOrder });
  filterRef.current = { debouncedSearch, sortBy, sortOrder };

  const doFetch = useCallback(async (targetPage) => {
    const f = filterRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAll({
        page: targetPage,
        page_size: PAGE_SIZE,
        search: f.debouncedSearch || undefined,
        sort_by: f.sortBy !== 'name' ? f.sortBy : undefined,
        sort_order: f.sortOrder !== 'asc' ? f.sortOrder : undefined,
      });
      setCustomers(result.items);
      setTotal(result.total);
      setPages(result.pages);
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to load customers.');
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
  }, [debouncedSearch, sortBy, sortOrder, doFetch]);

  // When only page changes → fetch that page
  useEffect(() => {
    if (page === 1) return;
    doFetch(page);
  }, [page, doFetch]);

  // ── Handlers ──
  const handleAdd = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const handleView = (cust) => {
    setViewingCustomer(cust);
    setShowDetail(true);
  };

  const handleEdit = (cust) => {
    setEditingCustomer(cust);
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
        phone: data.phone || undefined,
        credit_limit: data.credit_limit || undefined,
        address: data.address || undefined,
      };
      if (editingCustomer) {
        const updated = await update(editingCustomer.id, payload);
        setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setToast({ type: 'success', message: `${data.name} updated successfully.` });
      } else {
        const created = await create(payload);
        setCustomers((prev) => [...prev, created]);
        setToast({ type: 'success', message: `${data.name} added successfully.` });
      }
      setShowForm(false);
      setEditingCustomer(null);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ type: 'error', message: typeof detail === 'string' ? detail : 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (cust) => {
    setDeletingCustomer(cust);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async (id) => {
    setDeleting(true);
    try {
      await remove(id);
      setToast({ type: 'success', message: `${deletingCustomer.name} deleted successfully.` });
      setShowDelete(false);
      setDeletingCustomer(null);
      setPage(1);
      await doFetch(1);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ type: 'error', message: typeof detail === 'string' ? detail : 'Failed to delete customer.' });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSortBy('name');
    setSortOrder('asc');
    setPage(1);
  };

  const hasActiveFilters = search;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faUsers} className="text-blue-500 w-5 h-5" />
            Customers
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your customers and their information.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { clearFilters(); doFetch(1); }}>
            <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
            Refresh
          </Button>
          {canEdit && (
            <Button variant="primary" onClick={handleAdd}>
              <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
              Add Customer
            </Button>
          )}
        </div>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />

      {/* ── Search ── */}
      <div className="flex flex-wrap items-center gap-3" role="search" aria-label="Search customers">
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, email or phone…"
            className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 w-64"
          />
        </div>

        {hasActiveFilters && (
          <Button onClick={clearFilters}>
            <FontAwesomeIcon icon={faEraser} className="w-3.5 h-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* ── Table ── */}
      <CustomerTable
        customers={customers}
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
      <CustomerFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingCustomer(null); }}
        onSave={handleFormSave}
        customer={editingCustomer}
        saving={saving}
      />

      {/* ── Delete Confirm Modal ── */}
      {showDelete && deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="delete-modal-title" className="text-lg font-semibold text-slate-900">Delete Customer</h2>
                <p className="text-sm text-slate-500 mt-2">
                  You are about to delete <span className="font-medium text-slate-700">{deletingCustomer.name}</span>. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button onClick={() => { setShowDelete(false); setDeletingCustomer(null); }}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDeleteConfirm(deletingCustomer.id)} loading={deleting}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal (simple) ── */}
      {showDetail && viewingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 id="detail-modal-title" className="text-lg font-semibold text-slate-900">Customer Details</h2>
              <button onClick={() => { setShowDetail(false); setViewingCustomer(null); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30" aria-label="Close dialog">
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <DetailRow label="Name" value={viewingCustomer.name} />
              <DetailRow label="Email" value={viewingCustomer.email} />
              <DetailRow label="Phone" value={viewingCustomer.phone || '—'} />
              <DetailRow label="Credit Limit" value={viewingCustomer.credit_limit ? `$${Number(viewingCustomer.credit_limit).toLocaleString()}` : '—'} />
              <DetailRow label="Address" value={viewingCustomer.address || '—'} />
              <DetailRow label="Status" value={viewingCustomer.status ? viewingCustomer.status.charAt(0).toUpperCase() + viewingCustomer.status.slice(1) : 'Active'} />
            </div>
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <Button onClick={() => { setShowDetail(false); setViewingCustomer(null); }}>Close</Button>
              {canEdit && (
                <Button variant="primary" onClick={() => { const cust = viewingCustomer; setShowDetail(false); setViewingCustomer(null); setEditingCustomer(cust); setShowForm(true); }}>
                  Edit Customer
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
      <p className="text-sm font-medium text-slate-500 w-28 shrink-0">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
