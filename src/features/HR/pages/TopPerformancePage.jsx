import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

export default function TopPerformancePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faStar} className="text-blue-500 w-5 h-5" />
            Top Performance
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Track and compare employee performance.
          </p>
        </div>
      </div>
    </div>
  );
}