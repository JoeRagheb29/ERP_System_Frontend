import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faBan,
  faClock,
  faCalendar,
} from '@fortawesome/free-solid-svg-icons';
import { getAttendanceStats } from '../../../api/attendance.api';

const cards = [
  {
    key: 'present_today',
    icon: faCheckCircle,
    title: 'Present Today',
    subtitle: 'On time arrivals',
    colorClass: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    key: 'absent_today',
    icon: faBan,
    title: 'Absent Today',
    subtitle: 'No show',
    colorClass: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  {
    key: 'late_today',
    icon: faClock,
    title: 'Late Today',
    subtitle: 'Arrived after start',
    colorClass: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    key: 'this_month',
    icon: faCalendar,
    title: 'This Month',
    subtitle: 'Total records',
    colorClass: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
];

export default function AttendanceStatsCards() {
  const [stats, setStats] = useState({
    present_today: 0,
    absent_today: 0,
    late_today: 0,
    this_month: 0,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAttendanceStats();
        if (!cancelled) setStats(data);
      } catch {
        // silently keep defaults
      }
    })();
    return () => { cancelled = true; };
  }, []);

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
