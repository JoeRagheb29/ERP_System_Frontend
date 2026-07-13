import { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrophy,
  faChartLine,
  faStar,
  faClock,
} from '@fortawesome/free-solid-svg-icons';

export default function PerformanceStatsCards({ stats }) {
  const values = useMemo(() => ({
    topPerformer: stats?.top_performer_name
      ? `${stats.top_performer_name} (${stats.top_performer_rate}%)`
      : '\u2014',
    avgRate: stats?.avg_attendance_rate ?? 0,
    perfectCount: stats?.perfect_attendance_count ?? 0,
    mostLate: stats?.most_late_name
      ? `${stats.most_late_name} (${stats.most_late_count}x)`
      : '\u2014',
  }), [stats]);

  const cards = [
    {
      key: 'topPerformer',
      icon: faTrophy,
      title: 'Top Performer This Month',
      subtitle: 'Highest attendance rate',
      colorClass: 'bg-amber-50',
      iconColor: 'text-amber-600',
      format: (v) => v,
    },
    {
      key: 'avgRate',
      icon: faChartLine,
      title: 'Average Attendance Rate',
      subtitle: 'Across all employees',
      colorClass: 'bg-blue-50',
      iconColor: 'text-blue-600',
      format: (v) => `${v}%`,
    },
    {
      key: 'perfectCount',
      icon: faStar,
      title: 'Perfect Attendance',
      subtitle: 'Zero absences this month',
      colorClass: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      format: (v) => String(v),
    },
    {
      key: 'mostLate',
      icon: faClock,
      title: 'Most Late Arrivals',
      subtitle: 'Highest late count',
      colorClass: 'bg-orange-50',
      iconColor: 'text-orange-600',
      format: (v) => v,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const value = values[card.key];
        return (
          <div
            key={card.key}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500 mb-1 truncate">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-800 truncate">
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
