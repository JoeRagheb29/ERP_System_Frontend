import { useEffect, useRef, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faFileLines, faFlag, faTrash, faPlus, faBox } from '@fortawesome/free-solid-svg-icons';
import { getCustomers } from '../../../api/sales.api';
import { getProducts } from '../../../api/inventory.api';
import { Field, Button } from '../../../shared/components';

const orderSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required.'),
  notes: z.string().optional(),
  status: z.string().optional(),
});

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

function getInputClass(errors, fieldName) {
  return `w-full pl-10 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
    errors[fieldName]
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
  }`;
}

export default function SalesOrderFormModal({ isOpen, onClose, onSave, order, saving }) {
  const submittingRef = useRef(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [newItems, setNewItems] = useState([{ product_id: '', quantity: 1, unit_price: '' }]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_id: '',
      notes: '',
      status: 'draft',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      const [custResult, prodResult] = await Promise.allSettled([
        getCustomers({ page_size: 100 }),
        getProducts({ page_size: 100 }),
      ]);
      if (cancelled) return;
      if (custResult.status === 'fulfilled') {
        const d = custResult.value;
        setCustomers(d?.items ?? d ?? []);
      } else {
        console.error('Failed to load customers for dropdown', custResult.reason);
      }
      if (prodResult.status === 'fulfilled') {
        const d = prodResult.value;
        setProducts(d?.items ?? d ?? []);
      } else {
        console.error('Failed to load products for dropdown', prodResult.reason);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      submittingRef.current = false;
      if (order) {
        reset({
          customer_id: order.customer_id?.toString() ?? '',
          notes: order.notes ?? '',
          status: order.status ?? 'draft',
        });
        setNewItems(
          (order.items ?? []).length > 0
            ? order.items.map((it) => ({
                product_id: it.product_id?.toString() ?? '',
                quantity: it.quantity ?? 1,
                unit_price: it.unit_price?.toString() ?? '',
              }))
            : [{ product_id: '', quantity: 1, unit_price: '' }]
        );
      } else {
        reset({
          customer_id: '',
          notes: '',
          status: 'draft',
        });
        setNewItems([{ product_id: '', quantity: 1, unit_price: '' }]);
      }
    }
  }, [isOpen, order, reset]);

  useEffect(() => {
    if (!saving) submittingRef.current = false;
  }, [saving]);

  // ── Dynamic item handlers ──
  const updateNewItem = (idx, field, value) =>
    setNewItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));

  const removeItem = (idx) =>
    setNewItems((prev) => prev.filter((_, i) => i !== idx));

  const addItem = () =>
    setNewItems((prev) => [...prev, { product_id: '', quantity: 1, unit_price: '' }]);

  const handleClose = useCallback(() => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to close?')) return;
    onClose();
  }, [isDirty, onClose]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    if (submittingRef.current) return;

    // Validate items
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
      if (!it.unit_price || Number(it.unit_price) <= 0) {
        alert('Each item must have a unit price greater than 0.');
        return;
      }
    }

    submittingRef.current = true;
    onSave({
      ...data,
      customer_id: Number(data.customer_id),
      items: validItems.map((it) => ({
        product_id: Number(it.product_id),
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price),
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 id="form-modal-title" className="text-lg font-semibold text-slate-900">
            {order ? 'Edit Sales Order' : 'Add Sales Order'}
          </h2>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30" aria-label="Close dialog">
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-4">
          {/* ── Customer & Status ── */}
          <div className="grid grid-cols-2 gap-4">
            <Field id="customer_id" label="Customer" icon={faUser} error={errors}>
              <select
                id="customer_id"
                {...register('customer_id')}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
                  errors.customer_id
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              >
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>

            <Field id="status" label="Status" icon={faFlag} error={errors}>
              <select
                id="status"
                {...register('status')}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
                  errors.status
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* ── Notes ── */}
          <Field id="notes" label="Notes" icon={faFileLines} error={errors}>
            <textarea
              id="notes"
              rows={3}
              placeholder="Order notes…"
              {...register('notes')}
              className={`w-full pl-10 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors resize-none ${
                errors.notes
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
          </Field>

          {/* ── Items ── */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Items</p>
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
                  className="w-20 px-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Qty"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={it.unit_price}
                  onChange={(e) => updateNewItem(idx, 'unit_price', e.target.value)}
                  className="w-24 px-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Price"
                />
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
              {order ? 'Update Order' : 'Create Order'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
