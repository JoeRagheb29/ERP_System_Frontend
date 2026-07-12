import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxOpen, faWarehouse, faTruck, faClipboard, faTriangleExclamation,
  faArrowRight, faBoxes,
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../../../store/auth.store';
import checkPermission from '../../../RBAC/checkPermission.util';
import { useProducts, useSuppliers, usePurchaseOrders, useStock } from '../hooks/useInventory';
import { Toast, Button } from '../../../shared/components';

const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v ?? 0));

export default function InventoryDashboardPage() {
  const { permissions } = useAuthStore();
  const navigate = useNavigate();
  const { fetchStats: fetchProductStats } = useProducts();
  const { fetchStats: fetchSupplierStats } = useSuppliers();
  const { fetchStats: fetchPoStats, fetchAll: fetchPos } = usePurchaseOrders();
  const { fetchLow } = useStock();

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({ products: null, suppliers: null, po: null });
  const [lowStock, setLowStock] = useState([]);
  const [recentPos, setRecentPos] = useState([]);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [ps, ss, pos, low, recent] = await Promise.all([
          fetchProductStats(),
          fetchSupplierStats(),
          fetchPoStats(),
          fetchLow().catch(() => []),
          fetchPos({ page: 1, page_size: 5 }).catch(() => ({ items: [] })),
        ]);
        setStats({ products: ps, suppliers: ss, po: pos });
        setLowStock(low ?? []);
        setRecentPos(recent.items ?? []);
      } catch (e) {
        setToast({ type: 'error', message: e?.response?.data?.detail ?? 'Failed to load dashboard.' });
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchProductStats, fetchSupplierStats, fetchPoStats, fetchLow, fetchPos]);

  const card = (icon, label, value, tone, to) => (
    <button
      onClick={() => to && navigate(to)}
      className="bg-white rounded-2xl border border-slate-200 p-5 text-left hover:border-blue-300 hover:shadow-sm transition-all group"
    >
      <div className="flex items-center justify-between">
        <FontAwesomeIcon icon={icon} className={`w-5 h-5 ${tone}`} />
        {to && <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400" />}
      </div>
      <p className="text-2xl font-bold text-slate-900 mt-3">{value}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
          <FontAwesomeIcon icon={faBoxOpen} className="text-blue-500 w-5 h-5" />
          Inventory Overview
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">A snapshot of your inventory health.</p>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Loading dashboard…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {card(faBoxOpen, 'Products', stats.products?.total ?? 0, 'text-blue-500', '/inventory/products')}
            {card(faWarehouse, 'Inventory Value', money(stats.products?.total_inventory_value), 'text-emerald-500', '/inventory/stock')}
            {card(faTruck, 'Suppliers', stats.suppliers?.total ?? 0, 'text-purple-500', '/inventory/suppliers')}
            {card(faClipboard, 'Open PO Value', money(stats.po?.open_value), 'text-amber-500', '/inventory/purchase-orders')}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low stock alerts */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-500 w-4 h-4" />
                  Low Stock Alerts
                </h2>
                <Button variant="ghost" onClick={() => navigate('/inventory/stock')}>View all</Button>
              </div>
              {lowStock.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-400">No low-stock items. 🎉</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {lowStock.slice(0, 8).map((s) => (
                    <li key={s.product_id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{s.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-amber-600">{s.quantity_available} left</p>
                        <p className="text-xs text-slate-400">reorder at {s.reorder_threshold}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent purchase orders */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <FontAwesomeIcon icon={faClipboard} className="text-blue-500 w-4 h-4" />
                  Recent Purchase Orders
                </h2>
                <Button variant="ghost" onClick={() => navigate('/inventory/purchase-orders')}>View all</Button>
              </div>
              {recentPos.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-400">No purchase orders yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentPos.map((po) => (
                    <li key={po.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">PO-{String(po.id).padStart(4, '0')}</p>
                        <p className="text-xs text-slate-400">{po.supplier_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800">{money(po.total_amount)}</p>
                        <p className="text-xs text-slate-400 capitalize">{po.status.replace('_', ' ')}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
