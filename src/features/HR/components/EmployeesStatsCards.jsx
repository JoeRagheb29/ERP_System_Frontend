import { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faCheckCircle,
  faBan,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';

const cards = [
  {
    key: 'totalEmployees',
    icon: faUsers,
    title: 'Total Employees',
    subtitle: 'All employees',
    colorClass: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    key: 'active',
    icon: faCheckCircle,
    title: 'Active',
    subtitle: 'Currently employed',
    colorClass: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    key: 'resigned',
    icon: faBan,
    title: 'Resigned',
    subtitle: 'No longer employed',
    colorClass: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  {
    key: 'departments',
    icon: faBuilding,
    title: 'Departments',
    subtitle: 'Unique departments',
    colorClass: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
];

export default function EmployeesStatsCards({ employees }) {
  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const active = employees.filter((e) => e.status === 'active').length;
    const resigned = employees.filter((e) => e.status === 'resigned').length;
    const departments = new Set(employees.map((e) => e.department).filter(Boolean)).size;

    return { totalEmployees, active, resigned, departments };
  }, [employees]);

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
