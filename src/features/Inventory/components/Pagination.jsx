import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default function Pagination({ page, pages, total, pageSize, onPageChange, disabled }) {
  if (pages <= 1) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <p className="text-sm text-slate-400 order-2 sm:order-1">
        Showing {total === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </p>
      <nav className="flex items-center gap-1 order-1 sm:order-2" aria-label="Pagination">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || disabled}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          aria-label="Previous page"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
              p === page ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages || disabled}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          aria-label="Next page"
        >
          <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
        </button>
      </nav>
    </div>
  );
}
