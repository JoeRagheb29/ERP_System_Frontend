import { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faHourglass,
  faCheckCircle,
  faBan,
} from '@fortawesome/free-solid-svg-icons';

const cards = [
  {
    key: 'total',
    icon: faClipboardList,
    title: 'Total Requests',
    subtitle: 'All leave requests',
    colorClass: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    key: 'pending',
    icon: faHourglass,
    title: 'Pending',
    subtitle: 'Awaiting review',
    colorClass: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    key: 'approved',
    icon: faCheckCircle,
    title: 'Approved',
    subtitle: 'Approved requests',
    colorClass: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    key: 'rejected',
    icon: faBan,
    title: 'Rejected',
    subtitle: 'Declined requests',
    colorClass: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
];

export default function LeaveRequestsStatsCards({ records }) {
  const stats = useMemo(() => {
    const total = records.length;
    const pending = records.filter((r) => r.status === 'pending').length;
    const approved = records.filter((r) => r.status === 'approved').length;
    const rejected = records.filter((r) => r.status === 'rejected').length;

    return { total, pending, approved, rejected };
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
                <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
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
