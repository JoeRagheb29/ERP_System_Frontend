import { useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faEnvelope, faPhone, faDollarSign, faMapMarkerAlt, faFlag } from '@fortawesome/free-solid-svg-icons';
import { Field, Button } from '../../../shared/components';

const PHONE_REGEX = /^[\d\s\-+().]{7,20}$/;

const customerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters.')
    .max(160, 'Name must be 160 characters or less.'),
  email: z.string()
    .min(1, 'Email address is required.')
    .email('Enter a valid email address (e.g., name@company.com).'),
  phone: z.string()
    .optional()
    .refine((val) => !val || PHONE_REGEX.test(val), {
      message: 'Enter a valid phone number (digits, spaces, +, -, parentheses).',
    }),
  credit_limit: z.coerce.number()
    .optional()
    .refine((val) => !val || val > 0, {
      message: 'Credit limit must be greater than 0.',
    }),
  address: z.string().optional(),
  status: z.string().optional(),
});

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

function getInputClass(errors, fieldName) {
  return `w-full pl-10 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
    errors[fieldName]
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
  }`;
}

export default function CustomerFormModal({ isOpen, onClose, onSave, customer, saving }) {
  const submittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      credit_limit: '',
      address: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (isOpen) {
      submittingRef.current = false;
      if (customer) {
        reset({
          name: customer.name ?? '',
          email: customer.email ?? '',
          phone: customer.phone ?? '',
          credit_limit: customer.credit_limit ?? '',
          address: customer.address ?? '',
          status: customer.status ?? 'active',
        });
      } else {
        reset({
          name: '',
          email: '',
          phone: '',
          credit_limit: '',
          address: '',
          status: 'active',
        });
      }
    }
  }, [isOpen, customer, reset]);

  useEffect(() => {
    if (!saving) submittingRef.current = false;
  }, [saving]);

  const handleClose = useCallback(() => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to close?')) return;
    onClose();
  }, [isDirty, onClose]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 id="form-modal-title" className="text-lg font-semibold text-slate-900">
            {customer ? 'Edit Customer' : 'Add Customer'}
          </h2>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30" aria-label="Close dialog">
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field id="name" label="Name" icon={faUser} error={errors}>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                autoFocus
                {...register('name')}
                className={getInputClass(errors, 'name')}
              />
            </Field>

            <Field id="email" label="Email" icon={faEnvelope} error={errors}>
              <input
                id="email"
                type="email"
                placeholder="john@company.com"
                {...register('email')}
                className={getInputClass(errors, 'email')}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field id="phone" label="Phone" icon={faPhone} error={errors}>
              <input
                id="phone"
                type="tel"
                placeholder="01012345678"
                {...register('phone')}
                className={getInputClass(errors, 'phone')}
              />
            </Field>

            <Field id="credit_limit" label="Credit Limit" icon={faDollarSign} error={errors}>
              <input
                id="credit_limit"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('credit_limit')}
                className={getInputClass(errors, 'credit_limit')}
              />
            </Field>
          </div>

          <Field id="address" label="Address" icon={faMapMarkerAlt} error={errors}>
            <textarea
              id="address"
              rows={2}
              placeholder="123 Main St, City"
              {...register('address')}
              className={`w-full pl-10 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors resize-none ${
                errors.address
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {customer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
