import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faExclamationCircle, faXmark } from '@fortawesome/free-solid-svg-icons';

export default function Toast({ toast, onDismiss, duration = 3500 }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss, duration]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-red-50 border-red-200 text-red-700'
      }`}
    >
      <FontAwesomeIcon icon={isSuccess ? faCheck : faExclamationCircle} className="w-4 h-4 shrink-0" />
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="opacity-60 hover:opacity-100 transition-opacity"
      >
        <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
