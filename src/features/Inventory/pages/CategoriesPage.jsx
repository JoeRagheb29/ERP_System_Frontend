import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTags, faPlus, faRefresh, faSearch, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../../../store/auth.store';
import checkPermission from '../../../RBAC/checkPermission.util';
import { useCategories } from '../hooks/useInventory';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Toast, Button, StatusBadge } from '../../../shared/components';

export default function CategoriesPage() {
  const { permissions } = useAuthStore();
  const canEdit = checkPermission(permissions, 'product_categories') && permissions?.role !== 'employee';
  const { fetchAll, create, update, remove, error } = useCategories();

  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const dismissToast = useCallback(() => setToast(null), []);
  const filterRef = useRef({ debouncedSearch });
  filterRef.current = { debouncedSearch };

  const doFetch = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await fetchAll({ search: filterRef.current.debouncedSearch || undefined });
      setItems(data.items ?? []);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.detail ?? 'Failed to load categories.' });
    } finally {
      setLoadingList(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { doFetch(); /* eslint-disable-next-line */ }, [debouncedSearch]);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '' }); setFormError(''); setShowForm(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description ?? '' }); setFormError(''); setShowForm(true); };

  const handleSave = async () => {
    setFormError('');
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    setSaving(true);
    try {
      if (editing) {
        const updated = await update(editing.id, { name: form.name.trim(), description: form.description.trim() || null });
        setItems((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setToast({ type: 'success', message: `Category "${updated.name}" updated.` });
      } else {
        const created = await create({ name: form.name.trim(), description: form.description.trim() || null });
        setToast({ type: 'success', message: `Category "${created.name}" created.` });
        doFetch();
      }
      setShowForm(false);
    } catch {
      setFormError(error || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeletingBusy(true);
    try {
      await remove(deleting.id);
      setItems((prev) => prev.filter((c) => c.id !== deleting.id));
      setToast({ type: 'success', message: `Category "${deleting.name}" deleted.` });
      setShowDelete(false);
    } catch {
      setToast({ type: 'error', message: error || 'Failed to delete category.' });
    } finally {
      setDeletingBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faTags} className="text-blue-500 w-5 h-5" />
            Product Categories
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Group your products into manageable categories.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setSearch(''); doFetch(); }}>
            <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
            Refresh
          </Button>
          {canEdit && (
            <Button variant="primary" onClick={openAdd}>
              <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
              Add Category
            </Button>
          )}
        </div>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="relative w-72">
        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories…"
          className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 w-full"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loadingList ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No categories found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Name</th>
                <th className="text-left px-5 py-3 font-semibold">Description</th>
                <th className="text-center px-5 py-3 font-semibold">Products</th>
                {canEdit && <th className="text-right px-5 py-3 font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-medium text-slate-800">{c.name}</td>
                  <td className="px-5 py-3 text-slate-500 max-w-xs truncate">{c.description || '—'}</td>
                  <td className="px-5 py-3 text-center">
                    <StatusBadge status={c.product_count > 0 ? 'active' : 'resigned'} className="!capitalize">
                      {c.product_count}
                    </StatusBadge>
                  </td>
                  {canEdit && (
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" onClick={() => openEdit(c)}><FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost-danger" onClick={() => { setDeleting(c); setShowDelete(true); }}><FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={showForm}
        title={editing ? 'Edit Category' : 'Add Category'}
        icon={faTags}
        onClose={() => setShowForm(false)}
      >
        <div className="space-y-4">
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Electronics"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Optional description"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Category"
        message={deleting ? `Delete "${deleting.name}"? Products in this category will be uncategorized.` : ''}
        confirmLabel="Delete"
        loading={deletingBusy}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
