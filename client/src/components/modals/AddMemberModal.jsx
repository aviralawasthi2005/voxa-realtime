import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import api from '../../services/api';
import Avatar from '../common/Avatar';
import { UserPlus, X, Loader2, Check } from 'lucide-react';

export const AddMemberModal = ({ isOpen, onClose }) => {
  const { activeConversation, addMembersToGroup } = useChatStore();
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedUserIds([]);
      setError('');
      fetchCandidates();
    }
  }, [isOpen, activeConversation?._id]);

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users');
      const allUsers = res.data.data.users;
      // Filter out users already in activeConversation
      const currentParticipantIds = (activeConversation?.participants || []).map((p) =>
        p._id.toString()
      );
      const candidates = allUsers.filter((u) => !currentParticipantIds.includes(u._id.toString()));
      setUsers(candidates);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uId) => uId !== id) : [...prev, id]
    );
  };

  const handleAdd = async () => {
    if (selectedUserIds.length === 0) return;

    setIsSubmitting(true);
    setError('');

    try {
      await addMembersToGroup(activeConversation._id, selectedUserIds);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add members.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !activeConversation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-md bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded-lg shadow-modal overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-surface-light-border dark:border-surface-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold font-display text-surface-light-text dark:text-surface-dark-text">
              Add Members to {activeConversation.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {error && (
            <div className="p-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-xs text-surface-light-textSubtle dark:text-surface-dark-textSubtle">
              All contacts are already members of this group.
            </div>
          ) : (
            <div className="space-y-1">
              {users.map((user) => {
                const isSelected = selectedUserIds.includes(user._id);

                return (
                  <div
                    key={user._id}
                    onClick={() => toggleUser(user._id)}
                    className={`p-2 rounded flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-brand-500/10 border border-brand-500/30'
                        : 'hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar src={user.avatar} name={user.name} size="sm" />
                      <div>
                        <div className="text-xs font-medium text-surface-light-text dark:text-surface-dark-text">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-surface-light-textMuted dark:text-surface-dark-textMuted">
                          @{user.username}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'border-surface-light-border dark:border-surface-dark-border'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-surface-light-border dark:border-surface-dark-border flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={selectedUserIds.length === 0 || isSubmitting}
            className="px-4 py-1.5 text-xs bg-brand-500 text-white rounded font-medium hover:bg-brand-600 transition-colors flex items-center gap-1.5 shadow-fine disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Add Selected ({selectedUserIds.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
