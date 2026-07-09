import { useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faCalendar, faClock, faFlag, faComment } from '@fortawesome/free-solid-svg-icons';
import { Field, Button } from '../../../shared/components';

const attendanceSchema = z.object({
  employee_id: z.coerce.number({ invalid_type_error: 'Employee is required.' }).positive('Employee is required.'),
  attendance_date: z.string().min(1, 'Date is required.'),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  status: z.string().min(1, 'Status is required.'),
  notes: z.string().optional(),
});

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'leave', label: 'Leave' },
  { value: 'holiday', label: 'Holiday' },
];

function getInputClass(errors, fieldName) {
  return `w-full pl-10 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
    errors[fieldName]
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
  }`;
}

export default function AttendanceFormModal({ isOpen, onClose, onSave, record, saving, employees }) {
  const submittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      employee_id: '',
      attendance_date: '',
      check_in_time: '',
      check_out_time: '',
      status: 'present',
      notes: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      submittingRef.current = false;
      if (record) {
        reset({
          employee_id: record.employee_id ?? '',
          attendance_date: record.attendance_date ?? '',
          check_in_time: record.check_in_time ? record.check_in_time.substring(0, 5) : '',
          check_out_time: record.check_out_time ? record.check_out_time.substring(0, 5) : '',
          status: record.status ?? 'present',
          notes: record.notes ?? '',
        });
      } else {
        reset({
          employee_id: '',
          attendance_date: '',
          check_in_time: '',
          check_out_time: '',
          status: 'present',
          notes: '',
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
      attendance_date: data.attendance_date,
      status: data.status,
      check_in_time: data.check_in_time || undefined,
      check_out_time: data.check_out_time || undefined,
      notes: data.notes || undefined,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 id="form-modal-title" className="text-lg font-semibold text-slate-900">
            {record ? 'Edit Attendance Record' : 'Add Attendance Record'}
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

          <div className="grid grid-cols-2 gap-4">
            <Field id="attendance_date" label="Date" icon={faCalendar} error={errors}>
              <input
                id="attendance_date"
                type="date"
                {...register('attendance_date')}
                className={getInputClass(errors, 'attendance_date')}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field id="check_in_time" label="Check In" icon={faClock} error={errors}>
              <input
                id="check_in_time"
                type="time"
                {...register('check_in_time')}
                className={getInputClass(errors, 'check_in_time')}
              />
            </Field>

            <Field id="check_out_time" label="Check Out" icon={faClock} error={errors}>
              <input
                id="check_out_time"
                type="time"
                {...register('check_out_time')}
                className={getInputClass(errors, 'check_out_time')}
              />
            </Field>
          </div>

          <Field id="notes" label="Notes" icon={faComment} error={errors}>
            <textarea
              id="notes"
              rows={3}
              placeholder="Optional notes..."
              {...register('notes')}
              className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors resize-none ${
                errors.notes
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
              {record ? 'Update Record' : 'Add Record'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}