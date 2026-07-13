import { useEffect, useRef, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faFileLines, faShoppingCart, faTrash, faPlus, faBox, faClipboardCheck, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { useSalesOrders } from '../hooks/useSalesOrders';
import { getProducts } from '../../../api/inventory.api';
import { Field, Button } from '../../../shared/components';

const returnSchema = z.object({
  order_id: z.string().min(1, 'Sales order is required.'),
  reason: z.string().optional(),
});

const INSPECTION_OPTIONS = [
  { value: '', label: '—' },
  { value: 'pass', label: 'Pass' },
  { value: 'fail', label: 'Fail' },
];

const REFUND_METHOD_OPTIONS = [
  { value: '', label: '—' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_note', label: 'Credit Note' },
  { value: 'replace', label: 'Replace' },
];

function getInputClass(errors, fieldName) {
  return `w-full pl-10 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
    errors[fieldName]
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
  }`;
}

export default function ReturnFormModal({ isOpen, onClose, onSave, saving }) {
  const submittingRef = useRef(false);
  const { fetchAll: fetchOrders } = useSalesOrders();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [newItems, setNewItems] = useState([{ product_id: '', quantity: 1, inspection_status: '', refund_method: '' }]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      order_id: '',
      reason: '',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      const [ordResult, prodResult] = await Promise.allSettled([
        fetchOrders({ page_size: 100 }),
        getProducts({ page_size: 100 }),
      ]);
      if (cancelled) return;
      if (ordResult.status === 'fulfilled') {
        const d = ordResult.value;
        setOrders(d?.items ?? d ?? []);
      } else {
        console.error('Failed to load sales orders for dropdown', ordResult.reason);
      }
      if (prodResult.status === 'fulfilled') {
        const d = prodResult.value;
        setProducts(d?.items ?? d ?? []);
      } else {
        console.error('Failed to load products for dropdown', prodResult.reason);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, fetchOrders]);

  useEffect(() => {
    if (isOpen) {
      submittingRef.current = false;
      reset({ order_id: '', reason: '' });
      setNewItems([{ product_id: '', quantity: 1, inspection_status: '', refund_method: '' }]);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (!saving) submittingRef.current = false;
  }, [saving]);

  const updateNewItem = (idx, field, value) =>
    setNewItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));

  const removeItem = (idx) =>
    setNewItems((prev) => prev.filter((_, i) => i !== idx));

  const addItem = () =>
    setNewItems((prev) => [...prev, { product_id: '', quantity: 1, inspection_status: '', refund_method: '' }]);

  const handleClose = useCallback(() => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to close?')) return;
    onClose();
  }, [isDirty, onClose]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    if (submittingRef.current) return;

    const validItems = newItems.filter((it) => it.product_id);
    if (validItems.length === 0) {
      alert('Please add at least one item.');
      return;
    }
    for (const it of validItems) {
      if (!it.quantity || Number(it.quantity) < 1) {
        alert('Each item must have a quantity of at least 1.');
        return;
      }
    }

    submittingRef.current = true;
    onSave({
      order_id: Number(data.order_id),
      reason: data.reason || undefined,
      items: validItems.map((it) => ({
        product_id: Number(it.product_id),
        quantity: Number(it.quantity),
        inspection_status: it.inspection_status || undefined,
        refund_method: it.refund_method || undefined,
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 id="form-modal-title" className="text-lg font-semibold text-slate-900">
            Add Return
          </h2>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30" aria-label="Close dialog">
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-4">
          {/* ── Order & Reason ── */}
          <Field id="order_id" label="Sales Order" icon={faShoppingCart} error={errors}>
            <select
              id="order_id"
              {...register('order_id')}
              className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
                errors.order_id
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            >
              <option value="">Select sales order…</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  #{String(o.id).padStart(4, '0')} — {o.customer_name ?? o.customer?.name ?? 'Unknown'}
                </option>
              ))}
            </select>
          </Field>

          <Field id="reason" label="Reason" icon={faFileLines} error={errors}>
            <textarea
              id="reason"
              rows={3}
              placeholder="Reason for return…"
              {...register('reason')}
              className={`w-full pl-10 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors resize-none ${
                errors.reason
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
          </Field>

          {/* ── Items ── */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Return Items</p>
            {newItems.map((it, idx) => (
              <div key={idx} className="flex items-end gap-2">
                <div className="flex-1">
                  <select
                    value={it.product_id}
                    onChange={(e) => updateNewItem(idx, 'product_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}{p.sku ? ` (${p.sku})` : ''}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  min="1"
                  value={it.quantity}
                  onChange={(e) => updateNewItem(idx, 'quantity', e.target.value)}
                  className="w-16 px-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Qty"
                />
                <select
                  value={it.inspection_status}
                  onChange={(e) => updateNewItem(idx, 'inspection_status', e.target.value)}
                  className="w-28 px-2 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {INSPECTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select
                  value={it.refund_method}
                  onChange={(e) => updateNewItem(idx, 'refund_method', e.target.value)}
                  className="w-32 px-2 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {REFUND_METHOD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <Button
                  variant="ghost-danger"
                  onClick={() => removeItem(idx)}
                  disabled={newItems.length === 1}
                >
                  <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            <Button variant="ghost" onClick={addItem}>
              <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" /> Add Item
            </Button>
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Create Return
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
