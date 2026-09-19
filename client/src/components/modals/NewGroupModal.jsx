import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import api from '../../services/api';
import Avatar from '../common/Avatar';
import { Users, X, Loader2, Check } from 'lucide-react';

export const NewGroupModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { createGroupChat } = useChatStore();

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setSelectedUserIds([]);
      setError('');
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data.users);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a group name.');
      return;
    }
    if (selectedUserIds.length === 0) {
      setError('Please select at least one member to join the group.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await createGroupChat(name.trim(), description.trim(), selectedUserIds);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-md bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded-lg shadow-modal overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-surface-light-border dark:border-surface-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold font-display text-surface-light-text dark:text-surface-dark-text">
              Create Group
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-2.5 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
              Group Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design & Architecture Sprint"
              className="w-full px-3 py-2 text-xs bg-surface-light-subtle dark:bg-surface-dark-subtle border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is the focus of this group conversation?"
              rows={2}
              className="w-full px-3 py-2 text-xs bg-surface-light-subtle dark:bg-surface-dark-subtle border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-2">
              Select Members ({selectedUserIds.length} selected)
            </label>

            <div className="max-h-44 overflow-y-auto space-y-1 border border-surface-light-border dark:border-surface-dark-border rounded p-1.5 bg-surface-light-subtle/50 dark:bg-surface-dark-subtle/30">
              {isLoading ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                </div>
              ) : (
                users.map((user) => {
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
                })
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs bg-brand-500 text-white rounded font-medium hover:bg-brand-600 transition-colors flex items-center gap-1.5 shadow-fine"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Group</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewGroupModal;
