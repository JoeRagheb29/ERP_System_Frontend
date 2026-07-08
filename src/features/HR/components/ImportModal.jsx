import { useState, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faDownload, faUpload, faCheck, faExclamationTriangle, faSpinner, faFileImport } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../../shared/components';

const ACCEPTED_FORMATS = '.xlsx,.csv';

export default function ImportModal({ isOpen, onClose, onImport, onDownloadTemplate, importing }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState(null);
  const [importError, setImportError] = useState(null);
  const fileRef = useRef(null);

  const reset = useCallback(() => {
    setFile(null);
    setResult(null);
    setImportError(null);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setImportError(null);
    try {
      const res = await onImport(file);
      setResult(res);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setImportError(typeof detail === 'string' ? detail : 'Import failed. Please check the file and try again.');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await onDownloadTemplate();
    } catch {
      // error handled by hook
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="import-modal-title">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 id="import-modal-title" className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <FontAwesomeIcon icon={faFileImport} className="text-blue-500 w-5 h-5" />
            Import Employees
          </h2>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30" aria-label="Close">
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {result ? (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${
                result.failed === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                <FontAwesomeIcon icon={result.failed === 0 ? faCheck : faExclamationTriangle} className="w-5 h-5" />
                <div>
                  <p className="font-medium">{result.imported} of {result.total} rows imported.</p>
                  {result.failed > 0 && <p className="text-xs mt-0.5">{result.failed} row(s) skipped.</p>}
                </div>
              </div>

              {result.errors?.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  <p className="text-sm font-semibold text-slate-700">Error details:</p>
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      Row {err.row}: {err.reasons}
                    </p>
                  ))}
                </div>
              )}

              <Button variant="primary" onClick={handleClose}>
                Done
              </Button>
            </div>
          ) : (
            <>
              {importError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {importError}
                </div>
              )}

              <p className="text-sm text-slate-500">
                Upload an XLSX or CSV file. Download the template first to see the required format.
              </p>

              <Button onClick={handleDownloadTemplate}>
                <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
                Download Template
              </Button>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-blue-400 bg-blue-50/50'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPTED_FORMATS}
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div>
                    <FontAwesomeIcon icon={faCheck} className="w-8 h-8 text-emerald-500 mb-2" />
                    <p className="text-sm font-medium text-slate-700">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <FontAwesomeIcon icon={faUpload} className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-600">Drop file here or click to browse</p>
                    <p className="text-xs text-slate-400 mt-1">Supports .xlsx and .csv</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button onClick={handleClose}>Cancel</Button>
                <Button variant="primary" onClick={handleImport} disabled={!file} loading={importing}>
                  <FontAwesomeIcon icon={faUpload} className="w-3.5 h-3.5" />
                  Import
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
