import { useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faIdBadge, faEnvelope, faPhone, faBriefcase, faBuilding, faDollarSign, faCalendar, faFlag } from '@fortawesome/free-solid-svg-icons';
import { Field, Button } from '../../../shared/components';

const PHONE_REGEX = /^[\d\s\-+().]{7,20}$/;

const employeeSchema = z.object({
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters.')
    .max(160, 'Full name must be 160 characters or less.'),
  employee_number: z.string()
    .min(1, 'Employee number is required.')
    .max(30, 'Employee number must be 30 characters or less.'),
  email: z.string()
    .min(1, 'Email address is required.')
    .email('Enter a valid email address (e.g., name@company.com).'),
  phone_number: z.string()
    .optional()
    .refine((val) => !val || PHONE_REGEX.test(val), {
      message: 'Enter a valid phone number (digits, spaces, +, -, parentheses).',
    }),
  job_title: z.string().optional(),
  department: z.string().optional(),
  salary: z.coerce.number()
    .positive('Salary must be greater than 0.'),
  hire_date: z.string()
    .min(1, 'Hire date is required.')
    .refine((val) => !val || new Date(val) <= new Date(new Date().toDateString()), {
      message: 'Hire date cannot be in the future.',
    }),
  status: z.string().optional(),
});

const DEPARTMENTS = [
  { value: '', label: 'No department' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'sales', label: 'Sales' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'resigned', label: 'Resigned' },
];

function getInputClass(errors, fieldName) {
  return `w-full pl-10 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
    errors[fieldName]
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
  }`;
}

export default function EmployeeFormModal({ isOpen, onClose, onSave, employee, saving }) {
  const submittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      full_name: '',
      employee_number: '',
      email: '',
      phone_number: '',
      job_title: '',
      department: '',
      salary: '',
      hire_date: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (isOpen) {
      submittingRef.current = false;
      if (employee) {
        reset({
          full_name: employee.full_name ?? '',
          employee_number: employee.employee_number ?? '',
          email: employee.email ?? '',
          phone_number: employee.phone_number ?? '',
          job_title: employee.job_title ?? '',
          department: employee.department ?? '',
          salary: employee.salary ?? '',
          hire_date: employee.hire_date ?? '',
          status: employee.status ?? 'active',
        });
      } else {
        reset({
          full_name: '',
          employee_number: '',
          email: '',
          phone_number: '',
          job_title: '',
          department: '',
          salary: '',
          hire_date: '',
          status: 'active',
        });
      }
    }
  }, [isOpen, employee, reset]);

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
            {employee ? 'Edit Employee' : 'Add Employee'}
          </h2>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30" aria-label="Close dialog">
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field id="full_name" label="Full Name" icon={faUser} error={errors}>
              <input
                id="full_name"
                type="text"
                placeholder="John Doe"
                autoFocus
                {...register('full_name')}
                className={getInputClass(errors, 'full_name')}
              />
            </Field>

            <Field id="employee_number" label="Employee #" icon={faIdBadge} error={errors}>
              <input
                id="employee_number"
                type="text"
                placeholder="EMP-001"
                {...register('employee_number')}
                className={getInputClass(errors, 'employee_number')}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field id="email" label="Email" icon={faEnvelope} error={errors}>
              <input
                id="email"
                type="email"
                placeholder="john@company.com"
                {...register('email')}
                className={getInputClass(errors, 'email')}
              />
            </Field>

            <Field id="phone_number" label="Phone" icon={faPhone} error={errors}>
              <input
                id="phone_number"
                type="tel"
                placeholder="01012345678"
                {...register('phone_number')}
                className={getInputClass(errors, 'phone_number')}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field id="job_title" label="Job Title" icon={faBriefcase} error={errors}>
              <input
                id="job_title"
                type="text"
                placeholder="Software Engineer"
                {...register('job_title')}
                className={getInputClass(errors, 'job_title')}
              />
            </Field>

            <Field id="department" label="Department" icon={faBuilding} error={errors}>
              <select
                id="department"
                {...register('department')}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
                  errors.department
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.value} value={dept.value}>{dept.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field id="salary" label="Salary" icon={faDollarSign} error={errors}>
              <input
                id="salary"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                {...register('salary')}
                className={getInputClass(errors, 'salary')}
              />
            </Field>

            <Field id="hire_date" label="Hire Date" icon={faCalendar} error={errors}>
              <input
                id="hire_date"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                {...register('hire_date')}
                className={getInputClass(errors, 'hire_date')}
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {employee ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
