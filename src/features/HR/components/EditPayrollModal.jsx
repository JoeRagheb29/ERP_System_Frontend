import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark, faDollarSign, faFileLines, faFlag,
  faUser, faBuilding, faCalendar, faCalculator,
} from '@fortawesome/free-solid-svg-icons';
import { Field, Button } from '../../../shared/components';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

function formatSalary(value) {
  if (value == null) return '\u2014';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right">{value ?? '\u2014'}</span>
    </div>
  );
}

export default function EditPayrollModal({ isOpen, onClose, onSave, record, saving }) {
  const [form, setForm] = useState({
    bonus: record?.bonus ?? 0,
    allowance: record?.allowance ?? 0,
    deductions: record?.deductions ?? 0,
    notes: record?.notes ?? '',
    status: record?.status ?? 'pending',
  });
  const [errors, setErrors] = useState({});

  if (!isOpen || !record) return null;

  const overtimePay = record.gross_salary != null
    ? Math.max(0, record.gross_salary - record.basic_salary - (record.bonus ?? 0) - (record.allowance ?? 0))
    : 0;

  const absenceDeduction = (record.gross_salary != null && record.net_salary != null)
    ? Math.max(0, record.gross_salary - record.net_salary - (record.deductions ?? 0))
    : 0;

  const validate = () => {
    const next = {};
    const b = parseFloat(form.bonus);
    const a = parseFloat(form.allowance);
    const d = parseFloat(form.deductions);
    if (isNaN(b) || b < 0) next['edit-bonus'] = { message: 'Must be 0 or greater.' };
    if (isNaN(a) || a < 0) next['edit-allowance'] = { message: 'Must be 0 or greater.' };
    if (isNaN(d) || d < 0) next['edit-deductions'] = { message: 'Must be 0 or greater.' };
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(record.id, {
      bonus: String(parseFloat(form.bonus)),
      allowance: String(parseFloat(form.allowance)),
      deductions: String(parseFloat(form.deductions)),
      notes: form.notes,
      status: form.status,
    });
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-payroll-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden mx-4 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 id="edit-payroll-title" className="text-lg font-semibold text-slate-900">
            Edit Payroll
          </h2>
          <button
            onClick={handleClose}
            disabled={saving}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30"
            aria-label="Close dialog"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* ── Employee Summary (read-only) ── */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">{record.employee_name}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <FontAwesomeIcon icon={faBuilding} className="w-3 h-3" />
                <span className="capitalize">{record.department ?? '\u2014'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
                <span className="capitalize">{record.month} {record.year}</span>
              </div>
            </div>
            <div className="border-t border-slate-200/60 my-2 pt-2 grid grid-cols-2 gap-x-4 gap-y-1">
              <SummaryRow label="Basic Salary" value={formatSalary(record.basic_salary)} />
              <SummaryRow label="Overtime Pay" value={formatSalary(overtimePay)} />
              <SummaryRow label="Absence Deduction" value={formatSalary(absenceDeduction)} />
              <SummaryRow label="Gross Salary" value={formatSalary(record.gross_salary)} />
              <SummaryRow label="Manual Deduction" value={formatSalary(record.deductions)} />
              <SummaryRow label="Net Salary" value={formatSalary(record.net_salary)} />
            </div>
          </div>

          {/* ── Editable Fields ── */}
          <Field id="edit-bonus" label="Bonus" icon={faDollarSign} error={errors}>
            <input
              id="edit-bonus"
              type="number"
              min="0"
              step="0.01"
              value={form.bonus}
              onChange={(e) => { setForm((prev) => ({ ...prev, bonus: e.target.value })); setErrors((prev) => ({ ...prev, 'edit-bonus': undefined })); }}
              className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
                errors['edit-bonus']
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
          </Field>

          <Field id="edit-allowance" label="Allowance" icon={faDollarSign} error={errors}>
            <input
              id="edit-allowance"
              type="number"
              min="0"
              step="0.01"
              value={form.allowance}
              onChange={(e) => { setForm((prev) => ({ ...prev, allowance: e.target.value })); setErrors((prev) => ({ ...prev, 'edit-allowance': undefined })); }}
              className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
                errors['edit-allowance']
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
          </Field>

          <Field id="edit-deductions" label="Manual Deduction" icon={faCalculator} error={errors}>
            <input
              id="edit-deductions"
              type="number"
              min="0"
              step="0.01"
              value={form.deductions}
              onChange={(e) => { setForm((prev) => ({ ...prev, deductions: e.target.value })); setErrors((prev) => ({ ...prev, 'edit-deductions': undefined })); }}
              className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
                errors['edit-deductions']
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
          </Field>

          <Field id="edit-notes" label="Notes" icon={faFileLines}>
            <textarea
              id="edit-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              placeholder="Add notes…"
            />
          </Field>

          <Field id="edit-status" label="Payroll Status" icon={faFlag}>
            <select
              id="edit-status"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
          <Button onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
