import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faExclamationCircle, faPen, faRefresh, faSpinner, faTrash, faTriangleExclamation, faUserGear, faUserPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import RoleBadge from './RoleBadge';
import DeptBadge from './DeptBadge';
import UserAvatar from './UserAvatar';
import RoleEditor from './RoleEditor';

export default function MembersSection({
  members,
  currentUser,
  isOwner,
  isManager,
  loading,
  error,
  showAddModal,
  setShowAddModal,
  newUserId,
  setNewUserId,
  adding,
  onAddMember,
  editingId,
  setEditingId,
  savingId,
  deletingId,
  onSaveRole,
  onRemoveMember,
  onRefresh,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <FontAwesomeIcon icon={faUserGear} className="text-slate-400 w-4 h-4" />
          <p className="text-sm font-semibold text-slate-800">
            {isManager ? `${currentUser?.department?.toUpperCase() ?? ''} Department Members` : 'Organization Members'}
          </p>
          {!loading && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
              {members.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => setShowAddModal(!showAddModal)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <FontAwesomeIcon icon={faUserPlus} className="w-3.5 h-3.5" />
              Add Member
            </button>
          )}
          {!isOwner && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <FontAwesomeIcon icon={faTriangleExclamation} className="w-3 h-3" />
              {isManager ? `Department: ${currentUser?.department?.toUpperCase()}` : 'View only'}
            </div>
          )}
          {!loading && onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
              Refresh
            </button>
          )}
        </div>
      </div>

      {showAddModal && (
        <form onSubmit={onAddMember} className="p-4 bg-blue-50/50 border-b border-blue-100 flex items-center gap-3 flex-wrap animate-in slide-in-from-top-1 duration-150">
          <div className="flex-1 min-w-50">
            <label className="block text-[11px] font-semibold text-blue-900 uppercase tracking-wider mb-1">
              Add User by ID
            </label>
            <input
              type="number"
              placeholder="Enter User ID (e.g. 2)..."
              value={newUserId}
              onChange={(event) => setNewUserId(event.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            />
          </div>
          <div className="flex items-center gap-2 self-end">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adding || !newUserId.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {adding ? <FontAwesomeIcon icon={faSpinner} className="animate-spin w-3 h-3" /> : <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />}
              Add User
            </button>
          </div>
        </form>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin w-5 h-5 mr-2" />
          Loading members…
        </div>
      )}

      {!loading && error && (
        <div className="m-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Failed to load members</p>
            <p className="text-xs mt-0.5 opacity-80">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <ul className="divide-y divide-slate-100">
          {members.map((member) => {
            const isCurrentUser = member.id === currentUser?.id;
            const isEditing = editingId === member.id;
            const isSaving = savingId === member.id;
            const isOwnerMember = member.role === 'owner';
            const canEdit = isOwner && !isCurrentUser && !isOwnerMember;
            const memberName = member.first_name ? `${member.first_name} ${member.last_name ?? ''}`.trim() : member.username;

            return (
              <li key={member.id} className="px-6 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-4">
                  <UserAvatar user={member} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800 truncate">{memberName}</p>
                      {isCurrentUser && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-medium">You</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{member.email}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      <RoleBadge role={member.role} />
                      {member.department && <DeptBadge dept={member.department} />}
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingId(isEditing ? null : member.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                            isEditing
                              ? 'bg-blue-100 text-blue-600'
                              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                          }`}
                          title="Edit role"
                        >
                          <FontAwesomeIcon icon={isEditing ? faXmark : faPen} className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRemoveMember(member.id, memberName)}
                          disabled={deletingId === member.id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Remove from organization"
                        >
                          {deletingId === member.id ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin w-3.5 h-3.5" />
                          ) : (
                            <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <RoleEditor
                    member={member}
                    saving={isSaving}
                    onSave={onSaveRole}
                    onCancel={() => setEditingId(null)}
                  />
                )}
              </li>
            );
          })}

          {members.length === 0 && (
            <li className="px-6 py-12 text-center text-slate-400 text-sm">
              No members found in your organization.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
