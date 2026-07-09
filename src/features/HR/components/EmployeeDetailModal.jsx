import { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark, faUser, faIdBadge, faEnvelope, faPhone, faBriefcase,
  faBuilding, faDollarSign, faCalendar, faFlag, faClock,
  faCamera, faTrash, faUpload, faDownload, faFile, faFilePdf,
  faFileWord, faFileImage, faFileLines, faHistory, faSpinner,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { getAttachmentDownloadUrl, uploadProfilePhoto, removeProfilePhoto, getAttachments, deleteAttachment, uploadAttachment, getActivityLogs, fetchProfilePhoto } from '../../../api/hr.api';
import { useAuthStore } from '../../../store/auth.store';
import checkPermission from '../../../RBAC/checkPermission.util';

const STATUS_THEME = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  resigned: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
};

const ATTACHMENT_LABELS = {
  cv: 'CV',
  contract: 'Employment Contract',
  national_id: 'National ID',
  passport: 'Passport',
  other: 'Other',
};

const FILE_TYPE_ICONS = {
  'application/pdf': faFilePdf,
  'application/msword': faFileWord,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': faFileWord,
  'image/jpeg': faFileImage,
  'image/png': faFileImage,
  'image/gif': faFileImage,
  'text/plain': faFileLines,
};

function formatSalary(value) {
  if (value == null) return '\u2014';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value) {
  if (!value) return '\u2014';
  const d = new Date(value);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(value) {
  if (!value) return '\u2014';
  const d = new Date(value);
  return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DetailRow({ icon, label, value, children }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
        <FontAwesomeIcon icon={icon} className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        {children || <p className="text-sm font-medium text-slate-800 mt-0.5">{value ?? '\u2014'}</p>}
      </div>
    </div>
  );
}

function DropZone({ onFile, accept, label, disabled }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }, [onFile, disabled]);

  const handleChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    if (inputRef.current) inputRef.current.value = '';
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
        dragging ? 'border-blue-400 bg-blue-50' : disabled ? 'border-slate-200 bg-slate-50 cursor-not-allowed' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
      }`}
    >
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" disabled={disabled} />
      <FontAwesomeIcon icon={faUpload} className={`w-5 h-5 mb-1 ${disabled ? 'text-slate-300' : 'text-slate-400'}`} />
      <p className={`text-xs ${disabled ? 'text-slate-300' : 'text-slate-500'}`}>{label}</p>
    </div>
  );
}

function SectionHeader({ icon, title, action }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={icon} className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

export default function EmployeeDetailModal({ isOpen, onClose, employee, onEdit }) {
  if (!isOpen || !employee) return null;

  const { permissions } = useAuthStore();
  const canEdit = checkPermission(permissions, 'employees') && permissions?.role !== 'employee';

  const [activeTab, setActiveTab] = useState('details');
  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'attachments', label: 'Attachments' },
    { key: 'activity', label: 'Activity' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 id="detail-modal-title" className="text-lg font-semibold text-slate-900">Employee Details</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30" aria-label="Close dialog">
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && <DetailsTab employee={employee} onEdit={onEdit} canEdit={canEdit} onClose={onClose} />}
          {activeTab === 'attachments' && <AttachmentsTab employee={employee} canEdit={canEdit} />}
          {activeTab === 'activity' && <ActivityTab employee={employee} />}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={() => { onClose(); onEdit(employee); }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              Edit Employee
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailsTab({ employee, onEdit, canEdit, onClose }) {
  const [photoSrc, setPhotoSrc] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [photoToast, setPhotoToast] = useState(null);
  const photoInputRef = useRef(null);
  const blobUrlRef = useRef(null);

  const fetchPhoto = useCallback(async (empId) => {
    try {
      const blob = await fetchProfilePhoto(empId);
      const url = URL.createObjectURL(blob);
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = url;
      setPhotoSrc(url);
    } catch {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setPhotoSrc(null);
    }
  }, []);

  useEffect(() => {
    if (employee?.profile_photo_path) {
      fetchPhoto(employee.id);
    } else {
      setPhotoSrc(null);
    }
  }, [employee, fetchPhoto]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const initials = employee?.full_name
    ? employee.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handlePhotoUpload = async (file) => {
    if (!canEdit) return;

    // Show local preview immediately from the selected file
    const localUrl = URL.createObjectURL(file);
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = localUrl;
    setPhotoSrc(localUrl);

    setPhotoUploading(true);
    setPhotoProgress(0);
    try {
      await uploadProfilePhoto(employee.id, file, (e) => {
        if (e.total) setPhotoProgress(Math.round((e.loaded / e.total) * 100));
      });
      await fetchPhoto(employee.id);
    } catch (err) {
      setPhotoToast({ type: 'error', message: err?.response?.data?.detail || err?.message || 'Failed to upload photo' });
      // revert to the server-stored photo
      await fetchPhoto(employee.id);
    } finally {
      setPhotoUploading(false);
      setPhotoProgress(0);
    }
  };

  const handlePhotoRemove = async () => {
    if (!canEdit) return;
    try {
      await removeProfilePhoto(employee.id);
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setPhotoSrc(null);
    } catch (err) {
      setPhotoToast({ type: 'error', message: err?.response?.data?.detail || err?.message || 'Failed to remove photo' });
    }
  };

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoUpload(file);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  return (
    <div className="px-6 py-4">
      {photoToast && (
        <div className={`mb-4 flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium ${
          photoToast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700'
        }`}>
          <span>{photoToast.message}</span>
          <button onClick={() => setPhotoToast(null)} className="ml-3 text-current opacity-60 hover:opacity-100 font-bold">&times;</button>
        </div>
      )}
      {/* Profile Photo */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
        <div className="relative shrink-0">
          {photoUploading ? (
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : photoSrc ? (
            <img src={photoSrc} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
              onError={() => setPhotoSrc(null)} />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold border-2 border-slate-200">
              {initials}
            </div>
          )}
          {canEdit && !photoUploading && (
            <div className="absolute -bottom-1 -right-1 flex gap-1">
              <button
                onClick={() => photoInputRef.current?.click()}
                className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
                title="Upload photo"
              >
                <FontAwesomeIcon icon={faCamera} className="w-3 h-3" />
              </button>
              {photoSrc && (
                <button
                  onClick={handlePhotoRemove}
                  className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-red-600 hover:border-red-300 transition-colors"
                  title="Remove photo"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
          <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleFilePick} className="hidden" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-slate-900">{employee.full_name}</p>
          <p className="text-sm text-slate-500">{employee.job_title || employee.department || ''}</p>
        </div>
      </div>

      {/* Progress bar */}
      {photoUploading && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
          <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${photoProgress}%` }} />
        </div>
      )}

      {/* Details */}
      <div className="space-y-1">
        <DetailRow icon={faIdBadge} label="Employee Number" value={employee.employee_number} />
        <DetailRow icon={faEnvelope} label="Email" value={employee.email} />
        <DetailRow icon={faPhone} label="Phone" value={employee.phone_number || '\u2014'} />
        <DetailRow icon={faBuilding} label="Department" value={employee.department ? employee.department.charAt(0).toUpperCase() + employee.department.slice(1) : '\u2014'} />
        <DetailRow icon={faBriefcase} label="Job Title" value={employee.job_title || '\u2014'} />
        <DetailRow icon={faDollarSign} label="Salary" value={formatSalary(employee.salary)} />
        <DetailRow icon={faCalendar} label="Hire Date" value={formatDate(employee.hire_date)} />
        <DetailRow icon={faFlag} label="Status">
          {(() => {
            const theme = STATUS_THEME[employee.status] ?? { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' };
            return (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${theme.bg} ${theme.text} mt-1`}>
                <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                {employee.status ? employee.status.charAt(0).toUpperCase() + employee.status.slice(1) : 'Unknown'}
              </span>
            );
          })()}
        </DetailRow>
        <DetailRow icon={faClock} label="Created At" value={formatDateTime(employee.created_at)} />
        <DetailRow icon={faClock} label="Updated At" value={formatDateTime(employee.updated_at)} />
      </div>
    </div>
  );
}

function AttachmentsTab({ employee, canEdit }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState('cv');
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const loadAttachments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAttachments(employee.id);
      setAttachments(data);
    } catch {
      setError('Failed to load attachments.');
    } finally {
      setLoading(false);
    }
  }, [employee.id]);

  useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  const handleUpload = async (file) => {
    if (!canEdit) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      await uploadAttachment(employee.id, file, uploadType, (e) => {
        if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      });
      setToast({ type: 'success', message: 'File uploaded successfully.' });
      loadAttachments();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ type: 'error', message: typeof detail === 'string' ? detail : 'Upload failed.' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!canEdit) return;
    try {
      await deleteAttachment(employee.id, attachmentId);
      setToast({ type: 'success', message: 'Attachment deleted.' });
      loadAttachments();
    } catch {
      setToast({ type: 'error', message: 'Failed to delete attachment.' });
    }
  };

  return (
    <div className="px-6 py-4 space-y-4">
      {toast && (
        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      {/* Upload section */}
      {canEdit && (
        <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-600">Document Type:</label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {Object.entries(ATTACHMENT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <DropZone
            onFile={handleUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt"
            label="Drag & drop a file here, or click to browse (PDF, DOC, images, TXT)"
            disabled={uploading}
          />
          {uploading && (
            <div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-1">Uploading... {uploadProgress}%</p>
            </div>
          )}
        </div>
      )}

      {/* Attachment list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 text-slate-400 animate-spin" />
          <span className="ml-2 text-sm text-slate-500">Loading attachments...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={loadAttachments} className="text-sm text-blue-600 hover:underline mt-2">Retry</button>
        </div>
      ) : attachments.length === 0 ? (
        <div className="text-center py-8">
          <FontAwesomeIcon icon={faFile} className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm text-slate-400">No attachments yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((att) => {
            const Icon = FILE_TYPE_ICONS[att.content_type] || faFile;
            return (
              <div key={att.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <FontAwesomeIcon icon={Icon} className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{att.file_name}</p>
                  <p className="text-[11px] text-slate-400">
                    {ATTACHMENT_LABELS[att.file_type] || att.file_type}
                    {att.file_size ? ` \u00b7 ${formatFileSize(att.file_size)}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={getAttachmentDownloadUrl(employee.id, att.id)}
                    download
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Download"
                  >
                    <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
                  </a>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(att.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActivityTab({ employee }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getActivityLogs(employee.id);
        if (!cancelled) setActivities(data);
      } catch {
        if (!cancelled) setError('Failed to load activity log.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [employee.id]);

  const actionLabels = {
    created: { label: 'Created', bg: 'bg-emerald-50 text-emerald-700', icon: faCheck },
    updated: { label: 'Updated', bg: 'bg-blue-50 text-blue-700', icon: faCheck },
    deleted: { label: 'Deleted', bg: 'bg-red-50 text-red-700', icon: faTrash },
    photo_updated: { label: 'Photo Updated', bg: 'bg-indigo-50 text-indigo-700', icon: faCamera },
    photo_removed: { label: 'Photo Removed', bg: 'bg-orange-50 text-orange-700', icon: faCamera },
    attachment_uploaded: { label: 'Attachment Uploaded', bg: 'bg-purple-50 text-purple-700', icon: faUpload },
    attachment_deleted: { label: 'Attachment Deleted', bg: 'bg-pink-50 text-pink-700', icon: faTrash },
    bulk_deleted: { label: 'Bulk Deleted', bg: 'bg-red-50 text-red-700', icon: faTrash },
    bulk_status_changed: { label: 'Bulk Status Changed', bg: 'bg-amber-50 text-amber-700', icon: faFlag },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 text-slate-400 animate-spin" />
        <span className="ml-2 text-sm text-slate-500">Loading activity log...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faHistory} className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-sm text-slate-400">No activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <div className="relative">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100" />
        <div className="space-y-4">
          {activities.map((act) => {
            const meta = actionLabels[act.action] || { label: act.action, bg: 'bg-slate-50 text-slate-700', icon: faHistory };
            return (
              <div key={act.id} className="relative flex items-start gap-4 pl-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${meta.bg}`}>
                  <FontAwesomeIcon icon={meta.icon} className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-medium text-slate-800">{meta.label}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(act.timestamp)}</p>
                  {act.old_value && act.new_value && (
                    <div className="mt-1 p-2 bg-slate-50 rounded-lg text-xs text-slate-500 font-mono">
                      <p>Changed: {Object.keys(JSON.parse(typeof act.old_value === 'string' ? act.old_value : '{}')).join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}