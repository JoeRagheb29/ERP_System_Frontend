import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faPlus, faRefresh, faSearch, faPenToSquare, faTrash, faBoxes } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../../../store/auth.store';
import checkPermission from '../../../RBAC/checkPermission.util';
import { useSuppliers, useProducts } from '../hooks/useInventory';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Toast, Button, StatusBadge } from '../../../shared/components';

function StatCard({ label, value, tone = 'text-slate-900' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-lg font-bold ${tone}`}>{value}</p>
    </div>
  );
}

export default function SuppliersPage() {
  const { permissions } = useAuthStore();
  const canEdit = checkPermission(permissions, 'suppliers') && permissions?.role !== 'employee';
  const { fetchAll, fetchStats, create, update, remove, fetchProducts, addProduct, removeProductLink, error } = useSuppliers();
  const { fetchAll: fetchProductList } = useProducts();

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', contact_name: '', email: '', phone: '', address: '', payment_terms: '', is_active: true });
  const [formError, setFormError] = useState('');

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState(null);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [newProductId, setNewProductId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [linkBusy, setLinkBusy] = useState(false);

  const dismissToast = useCallback(() => setToast(null), []);
  const filterRef = useRef({ debouncedSearch });
  filterRef.current = { debouncedSearch };

  const doFetch = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await fetchAll({ search: filterRef.current.debouncedSearch || undefined });
      setItems(data.items ?? []);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.detail ?? 'Failed to load suppliers.' });
    } finally {
      setLoadingList(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    doFetch();
    (async () => { try { setStats(await fetchStats()); } catch {} })();
  }, [doFetch, fetchStats]);

  const openAdd = () => { setEditing(null); setForm({ name: '', contact_name: '', email: '', phone: '', address: '', payment_terms: '', is_active: true }); setFormError(''); setShowForm(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, contact_name: s.contact_name ?? '', email: s.email ?? '', phone: s.phone ?? '', address: s.address ?? '', payment_terms: s.payment_terms ?? '', is_active: s.is_active }); setFormError(''); setShowForm(true); };

  const handleSave = async () => {
    setFormError('');
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      contact_name: form.contact_name.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      payment_terms: form.payment_terms.trim() || null,
      is_active: form.is_active,
    };
    try {
      if (editing) {
        const updated = await update(editing.id, payload);
        setItems((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        setToast({ type: 'success', message: `Supplier "${updated.name}" updated.` });
      } else {
        await create(payload);
        setToast({ type: 'success', message: `Supplier "${payload.name}" created.` });
        doFetch();
      }
      setShowForm(false);
      try { setStats(await fetchStats()); } catch {}
    } catch {
      setFormError(error || 'Failed to save supplier.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeletingBusy(true);
    try {
      await remove(deleting.id);
      setItems((prev) => prev.filter((s) => s.id !== deleting.id));
      setToast({ type: 'success', message: `Supplier "${deleting.name}" deleted.` });
      setShowDelete(false);
      try { setStats(await fetchStats()); } catch {}
    } catch {
      setToast({ type: 'error', message: error || 'Failed to delete supplier.' });
    } finally {
      setDeletingBusy(false);
    }
  };

  const openDetail = async (s) => {
    setDetail(s); setShowDetail(true); setSupplierProducts([]); setAllProducts([]); setNewProductId(''); setNewPrice('');
    try {
      const [sp, pl] = await Promise.all([fetchProducts(s.id), fetchProductList({ page: 1, page_size: 100 })]);
      setSupplierProducts(sp ?? []);
      setAllProducts(pl.items ?? []);
    } catch {}
  };

  const handleAddProduct = async () => {
    if (!newProductId) return;
    setLinkBusy(true);
    try {
      await addProduct(detail.id, { product_id: Number(newProductId), supplier_price: newPrice === '' ? null : Number(newPrice), is_preferred: false });
      const sp = await fetchProducts(detail.id);
      setSupplierProducts(sp ?? []);
      setNewProductId(''); setNewPrice('');
      setToast({ type: 'success', message: 'Product linked to supplier.' });
    } catch {
      setToast({ type: 'error', message: 'Failed to link product.' });
    } finally {
      setLinkBusy(false);
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      await removeProductLink(detail.id, productId);
      setSupplierProducts((prev) => prev.filter((p) => p.product_id !== productId));
    } catch {
      setToast({ type: 'error', message: 'Failed to remove product.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faTruck} className="text-blue-500 w-5 h-5" />
            Suppliers
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage vendor relationships and product sourcing.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setSearch(''); doFetch(); }}>
            <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
            Refresh
          </Button>
          {canEdit && (
            <Button variant="primary" onClick={openAdd}>
              <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
              Add Supplier
            </Button>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Active" value={stats.active} tone="text-emerald-600" />
          <StatCard label="Inactive" value={stats.inactive} tone="text-slate-500" />
          <StatCard label="With Products" value={stats.with_products} tone="text-blue-600" />
        </div>
      )}

      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="relative w-72">
        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search suppliers…"
          className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 w-full" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loadingList ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No suppliers found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Name</th>
                <th className="text-left px-5 py-3 font-semibold">Contact</th>
                <th className="text-left px-5 py-3 font-semibold">Email</th>
                <th className="text-center px-5 py-3 font-semibold">Products</th>
                <th className="text-center px-5 py-3 font-semibold">Status</th>
                {canEdit && <th className="text-right px-5 py-3 font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-medium text-slate-800">
                    <button onClick={() => openDetail(s)} className="hover:text-blue-600">{s.name}</button>
                    {s.payment_terms && <p className="text-xs text-slate-400">{s.payment_terms}</p>}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{s.contact_name || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{s.email || '—'}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-slate-600"><FontAwesomeIcon icon={faBoxes} className="w-3 h-3" />{s.product_count}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <StatusBadge status={s.is_active ? 'active' : 'resigned'} className="!capitalize">{s.is_active ? 'Active' : 'Inactive'}</StatusBadge>
                  </td>
                  {canEdit && (
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" onClick={() => openEdit(s)}><FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost-danger" onClick={() => { setDeleting(s); setShowDelete(true); }}><FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={showForm} title={editing ? 'Edit Supplier' : 'Add Supplier'} icon={faTruck} onClose={() => setShowForm(false)}>
        <div className="space-y-4">
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name</label>
              <input type="text" value={form.contact_name} onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <textarea rows={2} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
            <input type="text" value={form.payment_terms} onChange={(e) => setForm((f) => ({ ...f, payment_terms: e.target.value }))}
              placeholder="e.g. Net 30" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} /> Active
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDetail} title={`${detail?.name ?? ''} — Products`} icon={faBoxes} onClose={() => setShowDetail(false)} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-slate-600 mb-1">Add product</label>
              <select value={newProductId} onChange={(e) => setNewProductId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="">Select product…</option>
                {allProducts.filter((p) => !supplierProducts.some((sp) => sp.product_id === p.id)).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium text-slate-600 mb-1">Supplier price</label>
              <input type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <Button variant="primary" onClick={handleAddProduct} loading={linkBusy} disabled={!newProductId}>
              <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" /> Link
            </Button>
          </div>
          {supplierProducts.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No products linked yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Product</th>
                  <th className="text-right px-3 py-2 font-semibold">Supplier Price</th>
                  <th className="text-center px-3 py-2 font-semibold">Preferred</th>
                  <th className="text-right px-3 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplierProducts.map((sp) => (
                  <tr key={sp.product_id}>
                    <td className="px-3 py-2 font-medium text-slate-800">{sp.name}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{sp.supplier_price != null ? `$${sp.supplier_price}` : '—'}</td>
                    <td className="px-3 py-2 text-center">{sp.is_preferred ? <span className="text-blue-600 font-medium">Yes</span> : 'No'}</td>
                    <td className="px-3 py-2 text-right">
                      <Button variant="ghost-danger" onClick={() => handleRemoveProduct(sp.product_id)}><FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Supplier"
        message={deleting ? `Delete "${deleting.name}"? Cannot delete a supplier with existing purchase orders.` : ''}
        confirmLabel="Delete"
        loading={deletingBusy}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
