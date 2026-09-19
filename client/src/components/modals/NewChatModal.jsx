import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import api from '../../services/api';
import Avatar from '../common/Avatar';
import { Search, X, Loader2, MessageSquarePlus } from 'lucide-react';

export const NewChatModal = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createDirectChat, onlineUsers } = useChatStore();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setQuery('');
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

  const handleSelectUser = async (userId) => {
    setIsSubmitting(true);
    try {
      await createDirectChat(userId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-md bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded-lg shadow-modal overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-surface-light-border dark:border-surface-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold font-display text-surface-light-text dark:text-surface-dark-text">
              New Conversation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 border-b border-surface-light-border dark:border-surface-dark-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find by name or username..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-light-subtle dark:bg-surface-dark-subtle border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-surface-light-textSubtle dark:text-surface-dark-textSubtle">
              No contacts found matching "{query}".
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isOnline = onlineUsers.has(user._id) || user.status === 'online';

              return (
                <button
                  key={user._id}
                  disabled={isSubmitting}
                  onClick={() => handleSelectUser(user._id)}
                  className="w-full p-2.5 rounded hover:bg-surface-light-subtle dark:hover:bg-surface-dark-subtle flex items-center justify-between text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={user.avatar}
                      name={user.name}
                      size="md"
                      isOnline={isOnline}
                      showStatus={true}
                    />
                    <div>
                      <div className="text-xs font-semibold text-surface-light-text dark:text-surface-dark-text">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted">
                        @{user.username}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    Chat
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
