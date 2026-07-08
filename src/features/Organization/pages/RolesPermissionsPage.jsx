import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../../api/client';
import { useAuthStore } from '../../../store/auth.store';
import { ROLES } from '../constants/rolesPermissions.constants';
import MembersSection from '../components/MembersSection';
import RoleReferencePanel from '../components/RoleReferencePanel';
import { Toast } from '../../../shared/components';

export default function RolesPermissionsPage() {
  const { user: currentUser, permissions } = useAuthStore();
  const isOwner = permissions?.role === 'owner';
  const isManager = ['hr_manager', 'inventory_manager', 'sales_manager'].includes(permissions?.role);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [previewRole, setPreviewRole] = useState(ROLES[0]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadMembers = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await apiClient.get('/organization/members');
        if (!cancelled) setMembers(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.detail ?? 'Failed to load organization members.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMembers();

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get('/organization/members');
      setMembers(data);
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to load organization members.');
    } finally {
      setLoading(false);
    }
  };

  const dismissToast = useCallback(() => setToast(null), []);

  // ── Assign role ───────────────────────────────────────────────────────────

  const handleSaveRole = async (userId, { role, department }) => {
    setSavingId(userId);
    try {
      await apiClient.put(`/organization/members/${userId}/role`, { role, department });
      setMembers((prevMembers) => prevMembers.map((member) => (
        member.id === userId ? { ...member, role, department } : member
      )));
      setEditingId(null);
      setToast({ type: 'success', message: role ? `Role '${role}' assigned successfully.` : 'Role unassigned.' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail ?? 'Failed to update role.' });
    } finally {
      setSavingId(null);
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();

    if (!newUserId.trim()) return;

    setAdding(true);
    try {
      await apiClient.post(`/organization/members/${newUserId.trim()}`);
      setToast({ type: 'success', message: `User ID ${newUserId} added to organization successfully.` });
      setNewUserId('');
      setShowAddModal(false);
      fetchMembers();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail ?? 'Failed to add user to organization.' });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the organization?`)) return;

    setDeletingId(userId);
    try {
      await apiClient.delete(`/organization/members/${userId}`);
      setMembers((prevMembers) => prevMembers.filter((member) => member.id !== userId));
      setToast({ type: 'success', message: `${name} removed from organization.` });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail ?? 'Failed to remove user.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faShieldHalved} className="text-blue-500 w-5 h-5" />
            Roles & Permissions
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage team members and their access levels within the organization.
          </p>
        </div>
        {!loading && (
          <button
            onClick={fetchMembers}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors self-start sm:self-auto"
          >
            <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
            Refresh
          </button>
        )}
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <MembersSection
          members={members}
          currentUser={currentUser}
          isOwner={isOwner}
          isManager={isManager}
          loading={loading}
          error={error}
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          newUserId={newUserId}
          setNewUserId={setNewUserId}
          adding={adding}
          onAddMember={handleAddMember}
          editingId={editingId}
          setEditingId={setEditingId}
          savingId={savingId}
          deletingId={deletingId}
          onSaveRole={handleSaveRole}
          onRemoveMember={handleRemoveMember}
        />

        <RoleReferencePanel
          previewRole={previewRole}
          onPreviewChange={setPreviewRole}
        />
      </div>
    </div>
  );
}
