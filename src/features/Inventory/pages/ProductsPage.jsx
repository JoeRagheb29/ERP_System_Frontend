import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen, faPlus, faRefresh, faSearch, faPenToSquare, faTrash, faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../../../store/auth.store';
import checkPermission from '../../../RBAC/checkPermission.util';
import { useProducts, useCategories, useStock } from '../hooks/useInventory';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Toast, Button, StatusBadge } from '../../../shared/components';

const PAGE_SIZE = 20;

const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v ?? 0));

function StatCard({ label, value, tone = 'text-slate-900' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-lg font-bold ${tone}`}>{value}</p>
    </div>
  );
}

export default function ProductsPage() {
  const { permissions } = useAuthStore();
  const canEdit = checkPermission(permissions, 'products') && permissions?.role !== 'employee';
  const { fetchAll, fetchStats, create, update, remove, error } = useProducts();
  const { fetchAll: fetchCategories } = useCategories();
  const { fetchOne: fetchStock, adjust } = useStock();

  const [items, setItems] = useState([]);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingList, setLoadingList] = useState(true);
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ sku: '', name: '', description: '', category_id: '', unit_price: '', cost_price: '', image_url: '', is_active: true });
  const [formError, setFormError] = useState('');

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const [showStock, setShowStock] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockDetail, setStockDetail] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustBusy, setAdjustBusy] = useState(false);

  const dismissToast = useCallback(() => setToast(null), []);
  const filterRef = useRef({});
  filterRef.current = { debouncedSearch, categoryId, activeFilter };

  const doFetch = useCallback(async (targetPage) => {
    setLoadingList(true);
    const f = filterRef.current;
    try {
      const data = await fetchAll({
        page: targetPage, page_size: PAGE_SIZE,
        search: f.debouncedSearch || undefined,
        category_id: f.categoryId || undefined,
        is_active: f.activeFilter === '' ? undefined : f.activeFilter === 'true',
      });
      setItems(data.items ?? []);
      setPages(data.pages ?? 1);
      setPage(targetPage);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.detail ?? 'Failed to load products.' });
    } finally {
      setLoadingList(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    (async () => {
      try { const c = await fetchCategories(); setCategories(c.items ?? []); } catch {}
    })();
    (async () => {
      try { setStats(await fetchStats()); } catch {}
    })();
  }, [fetchCategories, fetchStats]);

  useEffect(() => { doFetch(1); /* eslint-disable-next-line */ }, [debouncedSearch, categoryId, activeFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm({ sku: '', name: '', description: '', category_id: '', unit_price: '', cost_price: '', image_url: '', is_active: true });
    setFormError(''); setShowForm(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      sku: p.sku, name: p.name, description: p.description ?? '',
      category_id: p.category_id ?? '', unit_price: String(p.unit_price),
      cost_price: String(p.cost_price), image_url: p.image_url ?? '',
      is_active: p.is_active,
    });
    setFormError(''); setShowForm(true);
  };

  const handleSave = async () => {
    setFormError('');
    if (!form.sku.trim() || !form.name.trim()) { setFormError('SKU and Name are required.'); return; }
    setSaving(true);
    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      category_id: form.category_id ? Number(form.category_id) : null,
      unit_price: form.unit_price === '' ? 0 : Number(form.unit_price),
      cost_price: form.cost_price === '' ? 0 : Number(form.cost_price),
      image_url: form.image_url.trim() || null,
      is_active: form.is_active,
    };
    try {
      if (editing) {
        const updated = await update(editing.id, payload);
        setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setToast({ type: 'success', message: `Product "${updated.name}" updated.` });
      } else {
        await create(payload);
        setToast({ type: 'success', message: `Product "${payload.name}" created.` });
        doFetch(1);
      }
      setShowForm(false);
      try { setStats(await fetchStats()); } catch {}
    } catch {
      setFormError(error || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeletingBusy(true);
    try {
      await remove(deleting.id);
      setItems((prev) => prev.filter((p) => p.id !== deleting.id));
      setToast({ type: 'success', message: `Product "${deleting.name}" deleted.` });
      setShowDelete(false);
      try { setStats(await fetchStats()); } catch {}
    } catch {
      setToast({ type: 'error', message: error || 'Failed to delete product.' });
    } finally {
      setDeletingBusy(false);
    }
  };

  const openStock = async (p) => {
    setStockProduct(p); setShowStock(true); setStockDetail(null); setAdjustQty('');
    try { setStockDetail(await fetchStock(p.id)); } catch {}
  };

  const handleAdjust = async () => {
    if (!stockProduct) return;
    const qty = Number(adjustQty);
    if (!adjustQty || Number.isNaN(qty) || qty <= 0) { setToast({ type: 'error', message: 'Enter a positive quantity.' }); return; }
    setAdjustBusy(true);
    try {
      const updated = await adjust(stockProduct.id, { delta_available: qty, reason: 'Manual adjustment' });
      setStockDetail(updated);
      setItems((prev) => prev.map((p) => (p.id === stockProduct.id ? { ...p, quantity_available: updated.quantity_available, is_low_stock: updated.is_low_stock } : p)));
      setToast({ type: 'success', message: `Added ${qty} to stock.` });
      setAdjustQty('');
      try { setStats(await fetchStats()); } catch {}
    } catch {
      setToast({ type: 'error', message: 'Failed to adjust stock.' });
    } finally {
      setAdjustBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faBoxOpen} className="text-blue-500 w-5 h-5" />
            Products
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your product catalog and pricing.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setSearch(''); setCategoryId(''); setActiveFilter(''); doFetch(1); }}>
            <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
            Refresh
          </Button>
          {canEdit && (
            <Button variant="primary" onClick={openAdd}>
              <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Active" value={stats.active} tone="text-emerald-600" />
          <StatCard label="Low Stock" value={stats.low_stock} tone="text-amber-600" />
          <StatCard label="Out of Stock" value={stats.out_of_stock} tone="text-red-600" />
          <StatCard label="Inventory Value" value={money(stats.total_inventory_value)} tone="text-blue-600" />
        </div>
      )}

      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 w-full"
          />
        </div>
        <select
          value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600"
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loadingList ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No products found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">SKU</th>
                <th className="text-left px-5 py-3 font-semibold">Name</th>
                <th className="text-left px-5 py-3 font-semibold">Category</th>
                <th className="text-right px-5 py-3 font-semibold">Price</th>
                <th className="text-center px-5 py-3 font-semibold">Stock</th>
                <th className="text-center px-5 py-3 font-semibold">Status</th>
                {canEdit && <th className="text-right px-5 py-3 font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{p.sku}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-5 py-3 text-slate-500">{p.category_name || '—'}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{money(p.unit_price)}</td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => openStock(p)} className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600">
                      <FontAwesomeIcon icon={faWarehouse} className="w-3.5 h-3.5" />
                      {p.quantity_available}
                    </button>
                    {p.is_low_stock && <span className="ml-1 text-xs text-amber-600 font-medium">Low</span>}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <StatusBadge status={p.is_active ? 'active' : 'resigned'} className="!capitalize">{p.is_active ? 'Active' : 'Inactive'}</StatusBadge>
                  </td>
                  {canEdit && (
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" onClick={() => openEdit(p)}><FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost-danger" onClick={() => { setDeleting(p); setShowDelete(true); }}><FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  )}
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

      <Modal isOpen={showForm} title={editing ? 'Edit Product' : 'Add Product'} icon={faBoxOpen} onClose={() => setShowForm(false)}>
        <div className="space-y-4">
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
              <input type="text" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="">Uncategorized</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
              <input type="text" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price</label>
              <input type="number" step="0.01" value={form.unit_price} onChange={(e) => setForm((f) => ({ ...f, unit_price: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price</label>
              <input type="number" step="0.01" value={form.cost_price} onChange={(e) => setForm((f) => ({ ...f, cost_price: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
            Active
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showStock} title={`Stock — ${stockProduct?.name ?? ''}`} icon={faWarehouse} onClose={() => setShowStock(false)}>
        <div className="space-y-4">
          {stockDetail ? (
            <>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 rounded-lg py-3">
                  <p className="text-xs text-slate-400">Available</p>
                  <p className="text-lg font-bold text-slate-900">{stockDetail.quantity_available}</p>
                </div>
                <div className="bg-slate-50 rounded-lg py-3">
                  <p className="text-xs text-slate-400">Reserved</p>
                  <p className="text-lg font-bold text-slate-900">{stockDetail.quantity_reserved}</p>
                </div>
                <div className="bg-slate-50 rounded-lg py-3">
                  <p className="text-xs text-slate-400">Reorder At</p>
                  <p className="text-lg font-bold text-slate-900">{stockDetail.reorder_threshold}</p>
                </div>
              </div>
              {canEdit && (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Add to stock</label>
                    <input type="number" min="1" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <Button variant="primary" onClick={handleAdjust} loading={adjustBusy}>Add</Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">Loading stock…</div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Product"
        message={deleting ? `Delete "${deleting.name}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        loading={deletingBusy}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
