import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../../shared/components';

export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${danger ? 'bg-red-100' : 'bg-blue-100'}`}>
            <FontAwesomeIcon icon={faTriangleExclamation} className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-blue-600'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {message && <p className="text-sm text-slate-500 mt-2">{message}</p>}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
