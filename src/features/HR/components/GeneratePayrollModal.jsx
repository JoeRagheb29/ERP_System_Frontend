import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faMoneyBillWave, faCalendar, faUser } from '@fortawesome/free-solid-svg-icons';
import { Field, Button } from '../../../shared/components';

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const YEARS = [
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
];

export default function GeneratePayrollModal({ isOpen, onClose, onGenerate, generating }) {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [employeeId, setEmployeeId] = useState('');
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleGenerate = () => {
    const next = {};
    if (!month) next['payroll-month'] = { message: 'Month is required.' };
    if (!year) next['payroll-year'] = { message: 'Year is required.' };
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onGenerate({ month, year, employeeId });
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
      aria-labelledby="generate-payroll-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faMoneyBillWave} className="w-5 h-5 text-blue-500" />
            <h2 id="generate-payroll-title" className="text-lg font-semibold text-slate-900">
              Generate Payroll
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30"
            aria-label="Close dialog"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Field id="payroll-month" label="Month" icon={faCalendar} error={errors}>
            <select
              id="payroll-month"
              value={month}
              onChange={(e) => { setMonth(e.target.value); setErrors((prev) => ({ ...prev, 'payroll-month': undefined })); }}
              className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 appearance-none cursor-pointer transition-colors ${
                errors['payroll-month']
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </Field>

          <Field id="payroll-year" label="Year" icon={faCalendar} error={errors}>
            <select
              id="payroll-year"
              value={year}
              onChange={(e) => { setYear(e.target.value); setErrors((prev) => ({ ...prev, 'payroll-year': undefined })); }}
              className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 appearance-none cursor-pointer transition-colors ${
                errors['payroll-year']
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            >
              {YEARS.map((y) => (
                <option key={y.value} value={y.value}>{y.label}</option>
              ))}
            </select>
          </Field>

          <Field id="payroll-employee" label="Employee" icon={faUser}>
            <select
              id="payroll-employee"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
            >
              <option value="">All Employees</option>
            </select>
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <Button onClick={handleClose} disabled={generating}>Cancel</Button>
          <Button variant="primary" onClick={handleGenerate} loading={generating}>Generate</Button>
        </div>
      </div>
    </div>
  );
}
