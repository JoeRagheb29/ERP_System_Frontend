import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarehouse, faRefresh, faSearch, faPlusMinus, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../../../store/auth.store';
import checkPermission from '../../../RBAC/checkPermission.util';
import { useStock } from '../hooks/useInventory';
import Modal from '../components/Modal';
import { Toast, Button } from '../../../shared/components';

const PAGE_SIZE = 20;
const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v ?? 0));

export default function StockPage() {
  const { permissions } = useAuthStore();
  const canEdit = checkPermission(permissions, 'inventory_stock') && permissions?.role !== 'employee';
  const { fetchAll, fetchLow, adjust, loading, error } = useStock();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingList, setLoadingList] = useState(true);
  const [lowOnly, setLowOnly] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [showAdjust, setShowAdjust] = useState(false);
  const [adjusting, setAdjusting] = useState(null);
  const [mode, setMode] = useState('delta');
  const [amount, setAmount] = useState('');
  const [threshold, setThreshold] = useState('');
  const [saving, setSaving] = useState(false);

  const dismissToast = useCallback(() => setToast(null), []);
  const filterRef = useRef({});
  filterRef.current = { debouncedSearch, lowOnly };

  const doFetch = useCallback(async (targetPage) => {
    setLoadingList(true);
    const f = filterRef.current;
    try {
      const data = await fetchAll({
        page: targetPage, page_size: PAGE_SIZE,
        search: f.debouncedSearch || undefined,
        low_stock: f.lowOnly,
      });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      setPage(targetPage);
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.detail ?? 'Failed to load stock.' });
    } finally {
      setLoadingList(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { doFetch(1); /* eslint-disable-next-line */ }, [debouncedSearch, lowOnly]);

  const openAdjust = (s) => {
    setAdjusting(s);
    setMode('delta'); setAmount(''); setThreshold(String(s.reorder_threshold ?? 0));
    setShowAdjust(true);
  };

  const handleAdjustSave = async () => {
    const payload = {};
    if (mode === 'set') {
      if (amount === '') { setToast({ type: 'error', message: 'Enter a quantity.' }); return; }
      payload.quantity_available = Number(amount);
    } else {
      if (amount === '' || Number(amount) === 0) { setToast({ type: 'error', message: 'Enter a non-zero amount.' }); return; }
      payload.delta_available = Number(amount);
    }
    payload.reorder_threshold = threshold === '' ? 0 : Number(threshold);
    setSaving(true);
    try {
      const updated = await adjust(adjusting.product_id, payload);
      setItems((prev) => prev.map((s) => (s.product_id === updated.product_id ? updated : s)));
      setToast({ type: 'success', message: `Stock for "${updated.name}" updated.` });
      setShowAdjust(false);
    } catch {
      setToast({ type: 'error', message: error || 'Failed to adjust stock.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faWarehouse} className="text-blue-500 w-5 h-5" />
            Stock Levels
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Monitor inventory on hand and reorder thresholds.</p>
        </div>
        <Button onClick={() => { setSearch(''); setLowOnly(false); doFetch(1); }}>
          <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stock…"
            className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 w-full" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
          Low stock only
        </label>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loadingList ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No stock records found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">SKU</th>
                <th className="text-left px-5 py-3 font-semibold">Product</th>
                <th className="text-center px-5 py-3 font-semibold">Available</th>
                <th className="text-center px-5 py-3 font-semibold">Reserved</th>
                <th className="text-center px-5 py-3 font-semibold">Reorder At</th>
                <th className="text-right px-5 py-3 font-semibold">Value</th>
                {canEdit && <th className="text-right px-5 py-3 font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((s) => (
                <tr key={s.product_id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{s.sku}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{s.name}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={s.is_low_stock ? 'text-amber-600 font-semibold inline-flex items-center gap-1' : 'text-slate-700'}>
                      {s.is_low_stock && <FontAwesomeIcon icon={faTriangleExclamation} className="w-3 h-3" />}
                      {s.quantity_available}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-slate-600">{s.quantity_reserved}</td>
                  <td className="px-5 py-3 text-center text-slate-600">{s.reorder_threshold}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{money(s.inventory_value)}</td>
                  {canEdit && (
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" onClick={() => openAdjust(s)}><FontAwesomeIcon icon={faPlusMinus} className="w-3.5 h-3.5 mr-1" />Adjust</Button>
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

      <Modal isOpen={showAdjust} title={`Adjust Stock — ${adjusting?.name ?? ''}`} icon={faPlusMinus} onClose={() => setShowAdjust(false)}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setMode('delta')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border ${mode === 'delta' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>
              Add / Remove
            </button>
            <button onClick={() => setMode('set')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border ${mode === 'set' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>
              Set Exact
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {mode === 'set' ? 'Available quantity' : 'Amount (+ to add, − to subtract)'}
            </label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reorder threshold</label>
            <input type="number" min="0" value={threshold} onChange={(e) => setThreshold(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={() => setShowAdjust(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAdjustSave} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
