import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faXmark, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, employee, deleting }) {
  const [confirmText, setConfirmText] = useState('');

  const handleConfirm = () => {
    if (confirmText !== 'DELETE') return;
    onConfirm(employee.id);
  };

  if (!isOpen || !employee) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faTriangleExclamation} className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="delete-modal-title" className="text-lg font-semibold text-slate-900">Delete Employee</h2>
            <p className="text-sm text-slate-500 mt-2">
              You are about to delete <span className="font-medium text-slate-700">{employee.full_name}</span> (Emp #{employee.employee_number}). This action cannot be undone.
            </p>
          </div>
          <button onClick={onClose} disabled={deleting} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-slate-400/30" aria-label="Close dialog">
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5">
          <label htmlFor="delete-confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
            Type <span className="font-bold text-red-600">DELETE</span> to confirm
          </label>
          <input
            id="delete-confirm"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            autoFocus
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 placeholder-slate-300"
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmText !== 'DELETE' || deleting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500/40"
          >
            {deleting ? (
              <><FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" /> Deleting…</>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
