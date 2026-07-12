import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboard, faPlus, faRefresh, faSearch, faTrash, faPaperPlane,
  faBoxes, faBan, faCircleCheck, faPenToSquare,
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../../../store/auth.store';
import checkPermission from '../../../RBAC/checkPermission.util';
import { usePurchaseOrders, useSuppliers, useProducts } from '../hooks/useInventory';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Toast, Button } from '../../../shared/components';

const PAGE_SIZE = 20;
const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v ?? 0));

const PO_STATUS_THEME = {
  draft: 'bg-slate-100 text-slate-600',
  ordered: 'bg-blue-50 text-blue-600',
  partially_received: 'bg-amber-50 text-amber-600',
  received: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600',
};

function PoStatusBadge({ status }) {
  const cls = PO_STATUS_THEME[status] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${cls}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

export default function PurchaseOrdersPage() {
  const { permissions } = useAuthStore();
  const canEdit = checkPermission(permissions, 'purchase_orders') && permissions?.role !== 'employee';
  const { fetchAll, fetchStats, fetchOne, create, update, remove, addItem, removeItem, submit, receive, cancel, loading, error } = usePurchaseOrders();
  const { fetchAll: fetchSupplierList } = useSuppliers();
  const { fetchAll: fetchProductList } = useProducts();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierId, setSupplierId] = useState('');

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [showCreate, setShowCreate] = useState(false);
  const [newSupplier, setNewSupplier] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newItems, setNewItems] = useState([{ product_id: '', quantity_ordered: 1, unit_cost: '' }]);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailBusy, setDetailBusy] = useState(false);
  const [addItemProduct, setAddItemProduct] = useState('');
  const [addItemQty, setAddItemQty] = useState(1);
  const [addItemCost, setAddItemCost] = useState('');

  const [showDelete, setShowDelete] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const dismissToast = useCallback(() => setToast(null), []);
  const filterRef = useRef({});
  filterRef.current = { statusFilter, supplierId };

  const doFetch = useCallback(async (targetPage) => {
    setLoadingList(true);
    const f = filterRef.current;
    try {
      const data = await fetchAll({
        page: targetPage, page_size: PAGE_SIZE,
        status: f.statusFilter || undefined,
        supplier_id: f.supplierId || undefined,
      });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      setPage(targetPage);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.detail ?? 'Failed to load purchase orders.' });
    } finally {
      setLoadingList(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    doFetch(1);
    (async () => { try { setStats(await fetchStats()); } catch {} })();
  }, [doFetch, fetchStats]);

  useEffect(() => { doFetch(1); /* eslint-disable-next-line */ }, [statusFilter, supplierId]);

  useEffect(() => {
    (async () => {
      try { setSuppliers((await fetchSupplierList({})).items ?? []); } catch {}
      try { setProducts((await fetchProductList({ page: 1, page_size: 100 })).items ?? []); } catch {}
    })();
  }, [fetchSupplierList, fetchProductList]);

  const openDetail = async (po) => {
    setShowDetail(true); setDetail(null); setDetailBusy(true);
    try { setDetail(await fetchOne(po.id)); } catch {} finally { setDetailBusy(false); }
  };

  const refreshStats = async () => { try { setStats(await fetchStats()); } catch {} };

  const handleCreate = async () => {
    setCreateError('');
    if (!newSupplier) { setCreateError('Select a supplier.'); return; }
    const cleanItems = newItems
      .filter((it) => it.product_id)
      .map((it) => ({ product_id: Number(it.product_id), quantity_ordered: Number(it.quantity_ordered), unit_cost: Number(it.unit_cost) }));
    if (cleanItems.length === 0) { setCreateError('Add at least one item.'); return; }
    if (cleanItems.some((it) => !it.product_id || it.quantity_ordered < 1 || Number.isNaN(it.unit_cost) || it.unit_cost < 0)) {
      setCreateError('Every item needs a product, quantity ≥ 1, and a valid cost.'); return;
    }
    setCreating(true);
    try {
      await create({ supplier_id: Number(newSupplier), notes: newNotes.trim() || null, items: cleanItems });
      setToast({ type: 'success', message: 'Purchase order created.' });
      setShowCreate(false);
      setNewItems([{ product_id: '', quantity_ordered: 1, unit_cost: '' }]); setNewNotes(''); setNewSupplier('');
      doFetch(1); refreshStats();
    } catch {
      setCreateError(error || 'Failed to create purchase order.');
    } finally {
      setCreating(false);
    }
  };

  const handleSubmit = async (id) => {
    setDetailBusy(true);
    try {
      const updated = await submit(id);
      setDetail(updated); setToast({ type: 'success', message: 'Order submitted.' }); refreshStats();
    } catch { setToast({ type: 'error', message: error || 'Failed to submit.' }); }
    finally { setDetailBusy(false); }
  };

  const handleReceiveAll = async (id) => {
    setDetailBusy(true);
    try {
      const updated = await receive(id);
      setDetail(updated); setToast({ type: 'success', message: 'Goods received.' }); refreshStats();
    } catch { setToast({ type: 'error', message: error || 'Failed to receive.' }); }
    finally { setDetailBusy(false); }
  };

  const handleReceiveItem = async (id, productId, qty) => {
    setDetailBusy(true);
    try {
      const updated = await receive(id, { items: [{ product_id: productId, quantity: qty }] });
      setDetail(updated); setToast({ type: 'success', message: 'Item received.' }); refreshStats();
    } catch { setToast({ type: 'error', message: error || 'Failed to receive.' }); }
    finally { setDetailBusy(false); }
  };

  const handleCancel = async (id) => {
    setDetailBusy(true);
    try {
      const updated = await cancel(id);
      setDetail(updated); setToast({ type: 'success', message: 'Order cancelled.' }); refreshStats();
    } catch { setToast({ type: 'error', message: error || 'Failed to cancel.' }); }
    finally { setDetailBusy(false); }
  };

  const handleDelete = async () => {
    setDeletingBusy(true);
    try {
      await remove(deletingId);
      setItems((prev) => prev.filter((p) => p.id !== deletingId));
      setToast({ type: 'success', message: 'Purchase order deleted.' });
      setShowDelete(false); setShowDetail(false); refreshStats();
    } catch { setToast({ type: 'error', message: error || 'Failed to delete.' }); }
    finally { setDeletingBusy(false); }
  };

  const handleAddItem = async () => {
    if (!detail || !addItemProduct) return;
    setDetailBusy(true);
    try {
      const updated = await addItem(detail.id, { product_id: Number(addItemProduct), quantity_ordered: Number(addItemQty), unit_cost: Number(addItemCost) });
      setDetail(updated); setAddItemProduct(''); setAddItemQty(1); setAddItemCost('');
    } catch { setToast({ type: 'error', message: 'Failed to add item.' }); }
    finally { setDetailBusy(false); }
  };

  const handleRemoveItem = async (itemId) => {
    if (!detail) return;
    setDetailBusy(true);
    try { setDetail(await removeItem(detail.id, itemId)); }
    catch { setToast({ type: 'error', message: 'Failed to remove item.' }); }
    finally { setDetailBusy(false); }
  };

  const StatCard = ({ label, value, tone = 'text-slate-900' }) => (
    <div className="bg-white rounded-xl border border-slate-200 px-3 py-2.5 text-center">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className={`text-base font-bold ${tone}`}>{value}</p>
    </div>
  );

  const updateNewItem = (idx, field, value) =>
    setNewItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faClipboard} className="text-blue-500 w-5 h-5" />
            Purchase Orders
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Order goods from suppliers and track receipts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setStatusFilter(''); setSupplierId(''); doFetch(1); }}>
            <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
            Refresh
          </Button>
          {canEdit && (
            <Button variant="primary" onClick={() => { setCreateError(''); setShowCreate(true); }}>
              <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
              New Order
            </Button>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Draft" value={stats.draft} />
          <StatCard label="Ordered" value={stats.ordered} tone="text-blue-600" />
          <StatCard label="Part. Rcv" value={stats.partially_received} tone="text-amber-600" />
          <StatCard label="Received" value={stats.received} tone="text-emerald-600" />
          <StatCard label="Cancelled" value={stats.cancelled} tone="text-red-600" />
          <StatCard label="Open Value" value={money(stats.open_value)} tone="text-blue-600" />
        </div>
      )}

      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="flex flex-wrap items-center gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="ordered">Ordered</option>
          <option value="partially_received">Partially Received</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option value="">All Suppliers</option>
          {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loadingList ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No purchase orders found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">#</th>
                <th className="text-left px-5 py-3 font-semibold">Supplier</th>
                <th className="text-center px-5 py-3 font-semibold">Items</th>
                <th className="text-right px-5 py-3 font-semibold">Total</th>
                <th className="text-center px-5 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">PO-{String(po.id).padStart(4, '0')}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{po.supplier_name}</td>
                  <td className="px-5 py-3 text-center text-slate-600">{po.received_count}/{po.item_count}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{money(po.total_amount)}</td>
                  <td className="px-5 py-3 text-center"><PoStatusBadge status={po.status} /></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" onClick={() => openDetail(po)}>View</Button>
                      {canEdit && po.status === 'draft' && (
                        <Button variant="ghost-danger" onClick={() => { setDeletingId(po.id); setShowDelete(true); }}><FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" /></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div className="flex justify-end">
          <div className="flex items-center gap-1">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => doFetch(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{p}</button>
            ))}
          </div>
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={showCreate} title="New Purchase Order" icon={faClipboard} onClose={() => setShowCreate(false)} maxWidth="max-w-2xl">
        <div className="space-y-4">
          {createError && <p className="text-sm text-red-600">{createError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
              <select value={newSupplier} onChange={(e) => setNewSupplier(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="">Select supplier…</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <input type="text" value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Items</p>
            {newItems.map((it, idx) => (
              <div key={idx} className="flex items-end gap-2">
                <div className="flex-1">
                  <select value={it.product_id} onChange={(e) => updateNewItem(idx, 'product_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="">Select product…</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <input type="number" min="1" value={it.quantity_ordered} onChange={(e) => updateNewItem(idx, 'quantity_ordered', e.target.value)}
                  className="w-20 px-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                <input type="number" step="0.01" placeholder="cost" value={it.unit_cost} onChange={(e) => updateNewItem(idx, 'unit_cost', e.target.value)}
                  className="w-24 px-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                <Button variant="ghost-danger" onClick={() => setNewItems((prev) => prev.filter((_, i) => i !== idx))} disabled={newItems.length === 1}>
                  <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            <Button variant="ghost" onClick={() => setNewItems((prev) => [...prev, { product_id: '', quantity_ordered: 1, unit_cost: '' }])}>
              <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" /> Add Item
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} loading={creating}>Create Order</Button>
          </div>
        </div>
      </Modal>

      {/* Detail modal */}
      <Modal isOpen={showDetail} title={detail ? `PO-${String(detail.id).padStart(4, '0')} — ${detail.supplier_name}` : 'Purchase Order'} icon={faClipboard} onClose={() => setShowDetail(false)} maxWidth="max-w-2xl">
        {detailBusy && !detail ? (
          <div className="py-10 text-center text-slate-400 text-sm">Loading…</div>
        ) : detail ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <PoStatusBadge status={detail.status} />
              <p className="text-sm text-slate-500">Total: <span className="font-semibold text-slate-800">{money(detail.total_amount)}</span></p>
            </div>
            {detail.notes && <p className="text-sm text-slate-500">{detail.notes}</p>}

            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Product</th>
                  <th className="text-center px-3 py-2 font-semibold">Ordered</th>
                  <th className="text-center px-3 py-2 font-semibold">Received</th>
                  <th className="text-right px-3 py-2 font-semibold">Cost</th>
                  {detail.status === 'draft' && canEdit && <th className="text-right px-3 py-2 font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detail.items.map((it) => {
                  const remaining = it.quantity_ordered - it.quantity_received;
                  return (
                    <tr key={it.id}>
                      <td className="px-3 py-2 font-medium text-slate-800">{it.name}</td>
                      <td className="px-3 py-2 text-center text-slate-600">{it.quantity_ordered}</td>
                      <td className="px-3 py-2 text-center text-slate-600">{it.quantity_received}</td>
                      <td className="px-3 py-2 text-right text-slate-600">{money(it.unit_cost)}</td>
                      {detail.status === 'draft' && canEdit && (
                        <td className="px-3 py-2 text-right">
                          <Button variant="ghost-danger" onClick={() => handleRemoveItem(it.id)}><FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" /></Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Draft: add item */}
            {detail.status === 'draft' && canEdit && (
              <div className="flex flex-wrap items-end gap-2 border-t border-slate-100 pt-3">
                <div className="flex-1 min-w-[160px]">
                  <select value={addItemProduct} onChange={(e) => setAddItemProduct(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="">Add product…</option>
                    {products.filter((p) => !detail.items.some((it) => it.product_id === p.id)).map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <input type="number" min="1" value={addItemQty} onChange={(e) => setAddItemQty(e.target.value)}
                  className="w-20 px-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                <input type="number" step="0.01" placeholder="cost" value={addItemCost} onChange={(e) => setAddItemCost(e.target.value)}
                  className="w-24 px-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                <Button variant="primary" onClick={handleAddItem} loading={detailBusy} disabled={!addItemProduct}><FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" /></Button>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
              {detail.status === 'draft' && canEdit && (
                <Button onClick={() => handleSubmit(detail.id)} loading={detailBusy}><FontAwesomeIcon icon={faPaperPlane} className="w-3.5 h-3.5 mr-1" />Submit</Button>
              )}
              {(detail.status === 'ordered' || detail.status === 'partially_received') && canEdit && (
                <>
                  <Button variant="ghost" onClick={() => { const it = detail.items.find((i) => i.quantity_ordered - i.quantity_received > 0); if (it) handleReceiveItem(detail.id, it.product_id, it.quantity_ordered - it.quantity_received); }} loading={detailBusy}><FontAwesomeIcon icon={faBoxes} className="w-3.5 h-3.5 mr-1" />Receive Next</Button>
                  <Button variant="primary" onClick={() => handleReceiveAll(detail.id)} loading={detailBusy}><FontAwesomeIcon icon={faCircleCheck} className="w-3.5 h-3.5 mr-1" />Receive All</Button>
                  <Button variant="ghost-danger" onClick={() => handleCancel(detail.id)} loading={detailBusy}><FontAwesomeIcon icon={faBan} className="w-3.5 h-3.5 mr-1" />Cancel</Button>
                </>
              )}
              {detail.status === 'draft' && canEdit && (
                <Button variant="ghost-danger" onClick={() => handleDelete(detail.id)} loading={detailBusy}><FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5 mr-1" />Delete</Button>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Purchase Order"
        message="Delete this draft purchase order? This cannot be undone."
        confirmLabel="Delete"
        loading={deletingBusy}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
