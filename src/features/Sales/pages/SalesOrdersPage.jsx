import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard, faPlus, faRefresh, faChevronLeft, faChevronRight, faEraser, faSearch, faXmark, faEye, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../../../store/auth.store';
import checkPermission from '../../../RBAC/checkPermission.util';
import { useSalesOrders } from '../hooks/useSalesOrders';
import SalesOrderFormModal from '../components/SalesOrderFormModal';
import { Toast, Button } from '../../../shared/components';

const PAGE_SIZE = 20;

const STATUS_THEME = {
  draft: 'bg-slate-100 text-slate-600',
  confirmed: 'bg-blue-50 text-blue-600',
  processing: 'bg-amber-50 text-amber-600',
  shipped: 'bg-emerald-50 text-emerald-600',
  delivered: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
};

function StatusBadge({ status }) {
  const cls = STATUS_THEME[status] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}

function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
}

export default function SalesOrdersPage() {
  const { permissions } = useAuthStore();
  const canEdit = checkPermission(permissions, 'sales_orders') && permissions?.role !== 'employee';
  const { fetchAll, fetchById, create, update, remove } = useSalesOrders();

  // ── Data state ──
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);

  // ── UI state ──
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ── Client-side search filter ──
  const filteredOrders = debouncedSearch
    ? orders.filter((o) => {
        const q = debouncedSearch.toLowerCase();
        return (
          String(o.id).includes(q) ||
          (o.customer_name ?? o.customer?.name ?? '').toLowerCase().includes(q)
        );
      })
    : orders;

  // ── Modal state ──
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const filterRef = useRef({ debouncedSearch, statusFilter });
  filterRef.current = { debouncedSearch, statusFilter };

  const doFetch = useCallback(async (targetPage) => {
    const f = filterRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAll({
        page: targetPage,
        page_size: PAGE_SIZE,
        status: f.statusFilter || undefined,
      });
      setOrders(result.items);
      setTotal(result.total);
      setPages(result.pages);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e) => e.msg).join(' · '));
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Failed to load sales orders.');
      }
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  // ── Debounce search ──
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Filters change → reset to page 1 and fetch
  useEffect(() => {
    setPage(1);
    doFetch(1);
  }, [debouncedSearch, statusFilter, doFetch]);

  // Page change → fetch that page
  useEffect(() => {
    if (page === 1) return;
    doFetch(page);
  }, [page, doFetch]);

  // ── Handlers ──
  const handleAdd = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleView = async (order) => {
    try {
      const full = await fetchById(order.id);
      setViewingOrder(full);
      setShowDetail(true);
    } catch {
      setToast({ type: 'error', message: 'Failed to load order details.' });
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleFormSave = async (data) => {
    setSaving(true);
    try {
      if (editingOrder) {
        const updated = await update(editingOrder.id, data);
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        setToast({ type: 'success', message: `Order #${updated.id} updated successfully.` });
      } else {
        const created = await create(data);
        setOrders((prev) => [...prev, created]);
        setToast({ type: 'success', message: `Order #${created.id} created successfully.` });
      }
      setShowForm(false);
      setEditingOrder(null);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ type: 'error', message: typeof detail === 'string' ? detail : 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (order) => {
    setDeletingOrder(order);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async (id) => {
    setDeleting(true);
    try {
      await remove(id);
      setToast({ type: 'success', message: `Order #${id} deleted successfully.` });
      setShowDelete(false);
      setDeletingOrder(null);
      setPage(1);
      await doFetch(1);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ type: 'error', message: typeof detail === 'string' ? detail : 'Failed to delete order.' });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatusFilter('');
    setPage(1);
  };

  const hasActiveFilters = search || statusFilter;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faClipboard} className="text-blue-500 w-5 h-5" />
            Sales Orders
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage sales orders and their line items.
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
              Add Sales Order
            </Button>
          )}
        </div>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3" role="search" aria-label="Search sales orders">
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or customer…"
            className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 w-56"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {hasActiveFilters && (
          <Button onClick={clearFilters}>
            <FontAwesomeIcon icon={faEraser} className="w-3.5 h-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <FontAwesomeIcon icon={faClipboard} className="text-slate-400 w-4 h-4" />
            <p className="text-sm font-semibold text-slate-800">Sales Orders</p>
            {!loading && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                {total}
              </span>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-6 space-y-3" role="status" aria-label="Loading orders">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-4 w-16 bg-slate-100 rounded" />
                <div className="h-4 w-32 bg-slate-100 rounded" />
                <div className="h-4 w-24 bg-slate-100 rounded" />
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
                <div className="h-4 w-20 bg-slate-100 rounded" />
                <div className="flex-1" />
                <div className="h-7 w-20 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-14 px-6">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faClipboard} className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">Failed to load sales orders</p>
            <p className="text-xs text-slate-500 mb-5 max-w-sm text-center">{error}</p>
            <Button onClick={() => doFetch(1)} variant="danger">
              <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
              Retry
            </Button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full" role="table" aria-label="Sales orders table">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Order #</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-14">
                        <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                          <FontAwesomeIcon icon={faClipboard} className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">No sales orders found</p>
                        <p className="text-xs text-slate-400 max-w-xs text-center">
                          There are no sales orders matching your current filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, idx) => (
                    <tr
                      key={order.id}
                      onClick={() => handleView(order)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleView(order); }}
                      tabIndex={0}
                      role="row"
                      className={`cursor-pointer transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                      } hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/30`}
                    >
                      <td className="px-4 py-3.5 text-sm font-mono text-slate-500 whitespace-nowrap">
                        #{String(order.id).padStart(4, '0')}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold text-slate-800">{order.customer_name ?? order.customer?.name ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 font-mono whitespace-nowrap text-right">
                        {formatCurrency(order.total ?? order.total_amount)}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleView(order)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            aria-label="View order details"
                          >
                            <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <>
                              <button
                                onClick={() => handleEdit(order)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                aria-label="Edit order"
                              >
                                <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(order)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30"
                                aria-label="Delete order"
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
      <SalesOrderFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingOrder(null); }}
        onSave={handleFormSave}
        order={editingOrder}
        saving={saving}
      />

      {/* ── Delete Confirm ── */}
      {showDelete && deletingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faClipboard} className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="delete-modal-title" className="text-lg font-semibold text-slate-900">Delete Sales Order</h2>
                <p className="text-sm text-slate-500 mt-2">
                  You are about to delete order <span className="font-medium text-slate-700">#{String(deletingOrder.id).padStart(4, '0')}</span>. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button onClick={() => { setShowDelete(false); setDeletingOrder(null); }}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDeleteConfirm(deletingOrder.id)} loading={deleting}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {showDetail && viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 id="detail-modal-title" className="text-lg font-semibold text-slate-900">
                Order #{String(viewingOrder.id).padStart(4, '0')}
              </h2>
              <button onClick={() => { setShowDetail(false); setViewingOrder(null); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30" aria-label="Close dialog">
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <DetailRow label="Customer" value={viewingOrder.customer_name ?? viewingOrder.customer?.name ?? '—'} />
              <DetailRow label="Status" value={viewingOrder.status ? viewingOrder.status.charAt(0).toUpperCase() + viewingOrder.status.slice(1) : '—'} />
              <DetailRow label="Notes" value={viewingOrder.notes || '—'} />
              <DetailRow label="Total" value={formatCurrency(viewingOrder.total ?? viewingOrder.total_amount)} />
            </div>

            {/* Items table */}
            {(viewingOrder.items ?? []).length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Items</p>
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400 uppercase">Product</th>
                        <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-400 uppercase">Qty</th>
                        <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-400 uppercase">Price</th>
                        <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-400 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(viewingOrder.items ?? []).map((it, idx) => (
                        <tr key={it.id ?? idx}>
                          <td className="px-3 py-2 text-slate-700">{it.product_name ?? it.product?.name ?? `Product #${it.product_id}`}</td>
                          <td className="px-3 py-2 text-right text-slate-500">{it.quantity}</td>
                          <td className="px-3 py-2 text-right text-slate-500 font-mono">{formatCurrency(it.unit_price)}</td>
                          <td className="px-3 py-2 text-right text-slate-700 font-mono font-medium">{formatCurrency(it.quantity * it.unit_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <Button onClick={() => { setShowDetail(false); setViewingOrder(null); }}>Close</Button>
              {canEdit && (
                <Button variant="primary" onClick={() => { const o = viewingOrder; setShowDetail(false); setViewingOrder(null); setEditingOrder(o); setShowForm(true); }}>
                  Edit Order
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
      <p className="text-sm font-medium text-slate-500 w-24 shrink-0">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
