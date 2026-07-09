import { useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faCalendar, faFlag, faComment } from '@fortawesome/free-solid-svg-icons';
import { Field, Button } from '../../../shared/components';

const leaveSchema = z.object({
  employee_id: z.coerce.number({ invalid_type_error: 'Employee is required.' }).positive('Employee is required.'),
  leave_type: z.string().min(1, 'Leave type is required.'),
  start_date: z.string().min(1, 'Start date is required.'),
  end_date: z.string().min(1, 'End date is required.'),
  reason: z.string().optional(),
}).refine(
  (data) => !data.start_date || !data.end_date || new Date(data.end_date) >= new Date(data.start_date),
  { message: 'End date must be on or after start date.', path: ['end_date'] }
);

const LEAVE_TYPE_OPTIONS = [
  { value: 'annual', label: 'Annual' },
  { value: 'sick', label: 'Sick' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'maternity', label: 'Maternity' },
  { value: 'paternity', label: 'Paternity' },
];

function getInputClass(errors, fieldName) {
  return `w-full pl-10 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
    errors[fieldName]
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
  }`;
}

export default function LeaveRequestFormModal({ isOpen, onClose, onSave, record, saving, employees }) {
  const submittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      employee_id: '',
      leave_type: 'annual',
      start_date: '',
      end_date: '',
      reason: '',
    },
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');

  let calculatedDays = null;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end >= start) {
      calculatedDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }
  }

  useEffect(() => {
    if (isOpen) {
      submittingRef.current = false;
      if (record) {
        reset({
          employee_id: record.employee_id ?? '',
          leave_type: record.leave_type ?? 'annual',
          start_date: record.start_date ?? '',
          end_date: record.end_date ?? '',
          reason: record.reason ?? '',
        });
      } else {
        reset({
          employee_id: '',
          leave_type: 'annual',
          start_date: '',
          end_date: '',
          reason: '',
        });
      }
    }
  }, [isOpen, record, reset]);

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
    const employeeId = record ? record.employee_id : data.employee_id;
    const payload = {
      employee_id: employeeId,
      leave_type: data.leave_type,
      start_date: data.start_date,
      end_date: data.end_date,
      reason: data.reason || undefined,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 id="form-modal-title" className="text-lg font-semibold text-slate-900">
            {record ? 'Edit Leave Request' : 'Add Leave Request'}
          </h2>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30" aria-label="Close dialog">
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-4">
          <Field id="employee_id" label="Employee" icon={faUser} error={errors}>
            {employees.length > 0 ? (
              <select
                id="employee_id"
                disabled={!!record}
                {...register('employee_id')}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
                  errors.employee_id
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              >
                <option value="">Select an employee...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_number})</option>
                ))}
              </select>
            ) : record ? (
              <div className="pl-10 py-2 text-sm text-slate-600 font-medium">
                {record.employee_name}
              </div>
            ) : (
              <div className="pl-10 py-2 text-sm text-slate-400">
                No employees available.
              </div>
            )}
          </Field>

          <Field id="leave_type" label="Leave Type" icon={faFlag} error={errors}>
            <select
              id="leave_type"
              {...register('leave_type')}
              className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
                errors.leave_type
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            >
              {LEAVE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field id="start_date" label="Start Date" icon={faCalendar} error={errors}>
              <input
                id="start_date"
                type="date"
                {...register('start_date')}
                className={getInputClass(errors, 'start_date')}
              />
            </Field>

            <Field id="end_date" label="End Date" icon={faCalendar} error={errors}>
              <input
                id="end_date"
                type="date"
                {...register('end_date')}
                className={getInputClass(errors, 'end_date')}
              />
            </Field>
          </div>

          {calculatedDays !== null && (
            <p className="text-xs text-slate-400 text-center">
              Total: <span className="font-semibold text-slate-600">{calculatedDays}</span> day{calculatedDays !== 1 ? 's' : ''}
            </p>
          )}

          <Field id="reason" label="Reason" icon={faComment} error={errors}>
            <textarea
              id="reason"
              rows={3}
              placeholder="Reason for leave (optional)..."
              {...register('reason')}
              className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors resize-none ${
                errors.reason
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
          </Field>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {record ? 'Update Request' : 'Add Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
