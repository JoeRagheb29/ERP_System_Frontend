import { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDollarSign,
  faUsers,
  faCheckCircle,
  faHourglass,
  faBan,
  faClock,
  faArrowTrendDown,
} from '@fortawesome/free-solid-svg-icons';

function formatSalary(value) {
  if (value == null) return '$0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const cards = [
  {
    key: 'totalPayroll',
    icon: faDollarSign,
    title: 'Total Payroll',
    subtitle: 'Gross salaries',
    colorClass: 'bg-blue-50',
    iconColor: 'text-blue-600',
    format: (v) => formatSalary(v),
  },
  {
    key: 'totalEmployees',
    icon: faUsers,
    title: 'Total Employees',
    subtitle: 'Employees',
    colorClass: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    format: (v) => String(v),
  },
  {
    key: 'paidPayrolls',
    icon: faCheckCircle,
    title: 'Paid Payrolls',
    subtitle: 'Completed payrolls',
    colorClass: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    format: (v) => String(v),
  },
  {
    key: 'pendingPayrolls',
    icon: faHourglass,
    title: 'Pending Payrolls',
    subtitle: 'Awaiting payment',
    colorClass: 'bg-amber-50',
    iconColor: 'text-amber-600',
    format: (v) => String(v),
  },
  {
    key: 'cancelledPayrolls',
    icon: faBan,
    title: 'Cancelled Payrolls',
    subtitle: 'Cancelled records',
    colorClass: 'bg-rose-50',
    iconColor: 'text-rose-600',
    format: (v) => String(v),
  },
  {
    key: 'totalOvertimeCost',
    icon: faClock,
    title: 'Total Overtime Cost',
    subtitle: 'Extra hours',
    colorClass: 'bg-violet-50',
    iconColor: 'text-violet-600',
    format: (v) => formatSalary(v),
  },
  {
    key: 'totalDeductions',
    icon: faArrowTrendDown,
    title: 'Total Deductions',
    subtitle: 'Absence + Manual',
    colorClass: 'bg-orange-50',
    iconColor: 'text-orange-600',
    format: (v) => formatSalary(v),
  },
];

export default function PayrollStatsCards({ records }) {
  const stats = useMemo(() => {
    const totalPayroll = records.reduce((sum, r) => sum + (r.gross_salary || 0), 0);
    const totalEmployees = records.length;
    const paidPayrolls = records.filter((r) => r.status === 'paid').length;
    const pendingPayrolls = records.filter((r) => r.status === 'pending').length;
    const cancelledPayrolls = records.filter((r) => r.status === 'cancelled').length;

    const totalOvertimeCost = records.reduce((sum, r) => {
      if (r.gross_salary == null) return sum;
      return sum + Math.max(0, r.gross_salary - (r.basic_salary || 0) - (r.bonus || 0) - (r.allowance || 0));
    }, 0);

    const totalDeductions = records.reduce((sum, r) => {
      if (r.gross_salary == null || r.net_salary == null) return sum;
      const absenceDeduction = Math.max(0, r.gross_salary - r.net_salary - (r.deductions || 0));
      return sum + absenceDeduction + (r.deductions || 0);
    }, 0);

    return {
      totalPayroll,
      totalEmployees,
      paidPayrolls,
      pendingPayrolls,
      cancelledPayrolls,
      totalOvertimeCost,
      totalDeductions,
    };
  }, [records]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const value = stats[card.key];
        return (
          <div
            key={card.key}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500 mb-1 truncate">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {card.format(value)}
                </h3>
              </div>
              <div
                className={`p-3 rounded-xl flex items-center justify-center shrink-0 ml-3 ${card.colorClass}`}
              >
                <FontAwesomeIcon icon={card.icon} className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}
