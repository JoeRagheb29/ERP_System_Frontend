import { useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark, faUser, faIdBadge, faBuilding, faBriefcase,
  faCalendar, faFlag, faDollarSign, faCalculator,
  faClock, faClipboardList, faFileLines,
} from '@fortawesome/free-solid-svg-icons';
import { StatusBadge } from '../../../shared/components';

function formatSalary(value) {
  if (value == null) return '\u2014';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateTime(value) {
  if (!value) return '\u2014';
  const d = new Date(value);
  return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function DetailRow({ icon, label, value, children }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
        <FontAwesomeIcon icon={icon} className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        {children || <p className="text-sm font-medium text-slate-800 mt-0.5">{value ?? '\u2014'}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2 px-0 py-3">
      <FontAwesomeIcon icon={icon} className="w-4 h-4 text-slate-400" />
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
    </div>
  );
}

export default function PayrollDetailsModal({ isOpen, onClose, record }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !record) return null;

  const basicSalary = record.basic_salary;
  const bonus = record.bonus ?? 0;
  const allowance = record.allowance ?? 0;
  const deductions = record.deductions ?? 0;
  const grossSalary = record.gross_salary;
  const netSalary = record.net_salary;

  const overtimePay = grossSalary != null
    ? Math.max(0, grossSalary - basicSalary - bonus - allowance)
    : 0;

  const absenceDeduction = (grossSalary != null && netSalary != null)
    ? Math.max(0, grossSalary - netSalary - deductions)
    : 0;

  const workingDays = (record.days_worked != null && record.absences != null)
    ? record.days_worked + record.absences
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payroll-detail-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden mx-4 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 id="payroll-detail-title" className="text-lg font-semibold text-slate-900">
            Payroll Details
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30"
            aria-label="Close dialog"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {/* ── Employee Information ── */}
          <SectionHeader icon={faUser} title="Employee Information" />
          <div className="space-y-1 pl-0">
            <DetailRow icon={faUser} label="Employee Name">
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{record.employee_name}</p>
            </DetailRow>
            <DetailRow icon={faIdBadge} label="Employee Number" value={record.employee_number} />
            <DetailRow icon={faBuilding} label="Department">
              <p className="text-sm font-medium text-slate-800 mt-0.5 capitalize">{record.department ?? '\u2014'}</p>
            </DetailRow>
            <DetailRow icon={faBriefcase} label="Job Title" value={record.job_title} />
          </div>

          {/* ── Payroll Period ── */}
          <SectionHeader icon={faCalendar} title="Payroll Period" />
          <div className="space-y-1 pl-0">
            <DetailRow icon={faCalendar} label="Month">
              <p className="text-sm font-medium text-slate-800 mt-0.5 capitalize">{record.month ?? '\u2014'}</p>
            </DetailRow>
            <DetailRow icon={faCalendar} label="Year" value={record.year} />
            <DetailRow icon={faFlag} label="Payroll Status">
              <div className="mt-1">
                <StatusBadge status={record.status} />
              </div>
            </DetailRow>
          </div>

          {/* ── Salary Breakdown ── */}
          <SectionHeader icon={faDollarSign} title="Salary Breakdown" />
          <div className="space-y-1 pl-0">
            <DetailRow icon={faDollarSign} label="Basic Salary" value={formatSalary(basicSalary)} />
            <DetailRow icon={faDollarSign} label="Bonus" value={formatSalary(bonus)} />
            <DetailRow icon={faDollarSign} label="Allowance" value={formatSalary(allowance)} />
            <DetailRow icon={faDollarSign} label="Overtime Pay" value={formatSalary(overtimePay)} />
            <DetailRow icon={faCalculator} label="Absence Deduction" value={formatSalary(absenceDeduction)} />
            <DetailRow icon={faCalculator} label="Manual Deduction" value={formatSalary(deductions)} />
            <DetailRow icon={faDollarSign} label="Gross Salary" value={formatSalary(grossSalary)} />
            <DetailRow icon={faDollarSign} label="Net Salary">
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{formatSalary(netSalary)}</p>
            </DetailRow>
          </div>

          {/* ── Attendance Summary ── */}
          <SectionHeader icon={faClipboardList} title="Attendance Summary" />
          <div className="space-y-1 pl-0">
            <DetailRow icon={faCalendar} label="Working Days" value={workingDays != null ? String(workingDays) : '\u2014'} />
            <DetailRow icon={faClipboardList} label="Present Days" value={record.days_worked != null ? String(record.days_worked) : '\u2014'} />
            <DetailRow icon={faClipboardList} label="Absent Days" value={record.absences != null ? String(record.absences) : '\u2014'} />
            <DetailRow icon={faClipboardList} label="Leave Days" value={record.leave_days != null ? String(record.leave_days) : '\u2014'} />
            <DetailRow icon={faClock} label="Overtime Hours" value={record.overtime_hours != null ? String(record.overtime_hours) : '\u2014'} />
          </div>

          {/* ── Additional Information ── */}
          <SectionHeader icon={faFileLines} title="Additional Information" />
          <div className="space-y-1 pl-0">
            <DetailRow icon={faFileLines} label="Notes" value={record.notes} />
            <DetailRow icon={faClock} label="Created At" value={formatDateTime(record.created_at)} />
            <DetailRow icon={faClock} label="Updated At" value={formatDateTime(record.updated_at)} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
