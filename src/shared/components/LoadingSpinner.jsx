import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function LoadingSpinner({ text = 'Loading…', className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center py-14 ${className}`}
    >
      <FontAwesomeIcon icon={faSpinner} className="animate-spin w-6 h-6 text-slate-300 mb-3" />
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}
