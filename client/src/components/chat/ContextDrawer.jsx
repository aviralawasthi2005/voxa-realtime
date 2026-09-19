import React, { useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import Avatar from '../common/Avatar';
import {
  X,
  Users,
  UserPlus,
  ShieldCheck,
  LogOut,
  Trash2,
  Calendar,
  Mail,
  Edit2,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';

export const ContextDrawer = ({ isOpen, onClose, onOpenAddMember }) => {
  const {
    activeConversation,
    onlineUsers,
    updateGroupDetails,
    removeMemberFromGroup,
  } = useChatStore();
  const currentUser = useAuthStore((state) => state.user);

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descText, setDescText] = useState('');

  if (!isOpen || !activeConversation) return null;

  const isAdmin = activeConversation.admin?._id === currentUser?._id;

  const handleSaveDescription = async () => {
    try {
      await updateGroupDetails(activeConversation._id, { description: descText });
      setIsEditingDesc(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemove = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      await removeMemberFromGroup(activeConversation._id, userId);
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      await removeMemberFromGroup(activeConversation._id, currentUser._id);
      onClose();
    }
  };

  return (
    <aside className="w-full sm:w-72 lg:w-80 h-full border-l border-surface-light-border dark:border-surface-dark-border bg-surface-light-panel dark:bg-surface-dark-subtle flex flex-col flex-shrink-0 select-none z-20">
      {/* Header */}
      <div className="h-16 px-4 border-b border-surface-light-border dark:border-surface-dark-border flex items-center justify-between">
        <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-surface-light-text dark:text-surface-dark-text">
          {activeConversation.isGroup ? 'Group Information' : 'Contact Details'}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile Card / Identity */}
        <div className="flex flex-col items-center text-center pb-2">
          {activeConversation.isGroup ? (
            <Avatar
              src={activeConversation.avatar}
              name={activeConversation.name}
              size="2xl"
              className="mb-3"
            />
          ) : (
            (() => {
              const other = activeConversation.participants?.find((p) => p._id !== currentUser?._id);
              const isOnline = other ? onlineUsers.has(other._id) || other.status === 'online' : false;
              return (
                <Avatar
                  src={other?.avatar}
                  name={other?.name}
                  size="2xl"
                  isOnline={isOnline}
                  showStatus={true}
                  className="mb-3"
                />
              );
            })()
          )}

          <h4 className="text-sm font-semibold font-display text-surface-light-text dark:text-surface-dark-text">
            {activeConversation.isGroup
              ? activeConversation.name
              : activeConversation.participants?.find((p) => p._id !== currentUser?._id)?.name}
          </h4>

          {!activeConversation.isGroup && (
            <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted mt-0.5">
              @{activeConversation.participants?.find((p) => p._id !== currentUser?._id)?.username}
            </p>
          )}
        </div>

        {/* Bio or Description */}
        <div className="space-y-2 border-t border-surface-light-border dark:border-surface-dark-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-display font-semibold uppercase tracking-wider text-surface-light-textSubtle dark:text-surface-dark-textSubtle">
              {activeConversation.isGroup ? 'Group Description' : 'About'}
            </span>
            {activeConversation.isGroup && isAdmin && !isEditingDesc && (
              <button
                onClick={() => {
                  setDescText(activeConversation.description || '');
                  setIsEditingDesc(true);
                }}
                className="text-xs text-brand-500 hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {isEditingDesc ? (
            <div className="space-y-2">
              <textarea
                value={descText}
                onChange={(e) => setDescText(e.target.value)}
                className="w-full text-xs p-2 bg-surface-light-subtle dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text"
                rows={3}
              />
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => setIsEditingDesc(false)}
                  className="px-2 py-1 text-xs text-surface-light-textSubtle dark:text-surface-dark-textSubtle"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDescription}
                  className="px-2.5 py-1 text-xs bg-brand-500 text-white rounded font-medium flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted leading-relaxed">
              {activeConversation.isGroup
                ? activeConversation.description || 'No description provided.'
                : activeConversation.participants?.find((p) => p._id !== currentUser?._id)?.bio ||
                  'Exploring conversations on VOXA.'}
            </p>
          )}
        </div>

        {/* Details List */}
        {!activeConversation.isGroup && (
          <div className="space-y-3 border-t border-surface-light-border dark:border-surface-dark-border pt-4 text-xs">
            {(() => {
              const other = activeConversation.participants?.find((p) => p._id !== currentUser?._id);
              return (
                <>
                  <div className="flex items-center gap-2.5 text-surface-light-textMuted dark:text-surface-dark-textMuted">
                    <Mail className="w-4 h-4 text-surface-light-textSubtle dark:text-surface-dark-textSubtle" />
                    <span>{other?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-surface-light-textMuted dark:text-surface-dark-textMuted">
                    <Calendar className="w-4 h-4 text-surface-light-textSubtle dark:text-surface-dark-textSubtle" />
                    <span>
                      Joined {other?.createdAt ? format(new Date(other.createdAt), 'MMMM yyyy') : 'Recently'}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Group Members List */}
        {activeConversation.isGroup && (
          <div className="space-y-3 border-t border-surface-light-border dark:border-surface-dark-border pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-display font-semibold uppercase tracking-wider text-surface-light-textSubtle dark:text-surface-dark-textSubtle">
                Members ({activeConversation.participants?.length || 0})
              </span>
              <button
                onClick={onOpenAddMember}
                className="text-xs text-brand-500 hover:underline flex items-center gap-1 font-medium"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-2">
              {activeConversation.participants?.map((member) => {
                const isMemberAdmin = activeConversation.admin?._id === member._id;
                const isSelf = member._id === currentUser?._id;
                const isOnline = onlineUsers.has(member._id) || member.status === 'online';

                return (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        src={member.avatar}
                        name={member.name}
                        size="sm"
                        isOnline={isOnline}
                        showStatus={true}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-surface-light-text dark:text-surface-dark-text truncate">
                            {member.name}
                          </span>
                          {isSelf && (
                            <span className="text-[10px] text-surface-light-textSubtle dark:text-surface-dark-textSubtle font-mono">
                              (You)
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-surface-light-textMuted dark:text-surface-dark-textMuted truncate block">
                          @{member.username}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isMemberAdmin && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-brand-500/10 text-brand-500 rounded font-medium flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      )}
                      {isAdmin && !isSelf && (
                        <button
                          onClick={() => handleRemove(member._id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-rose-500 transition-opacity"
                          title="Remove from group"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Leave Group button */}
            <div className="pt-4">
              <button
                onClick={handleLeaveGroup}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded border border-rose-500/20 font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave Group</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ContextDrawer;
