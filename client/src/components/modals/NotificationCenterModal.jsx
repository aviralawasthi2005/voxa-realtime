import React, { useEffect } from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useChatStore } from '../../store/useChatStore';
import Avatar from '../common/Avatar';
import { Bell, X, CheckCheck, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const NotificationCenterModal = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    isLoading,
  } = useNotificationStore();

  const selectConversation = useChatStore((state) => state.selectConversation);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = async (notif) => {
    if (notif.conversation) {
      await selectConversation(notif.conversation._id || notif.conversation);
      if (!notif.read) {
        await markAsRead(notif._id);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-sm bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded-lg shadow-modal overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3.5 border-b border-surface-light-border dark:border-surface-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-500" />
            <h3 className="text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-brand-500 text-white rounded-full text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllAsRead}
                  className="p-1 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text text-[11px] flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={clearAll}
                  className="p-1 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-rose-500 text-[11px]"
                  title="Clear all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-surface-light-textSubtle dark:text-surface-dark-textSubtle">
              No recent notifications.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleSelect(n)}
                className={`p-2.5 rounded flex items-start gap-2.5 cursor-pointer text-left transition-colors relative ${
                  n.read
                    ? 'hover:bg-surface-light-subtle dark:hover:bg-surface-dark-subtle'
                    : 'bg-brand-500/5 hover:bg-brand-500/10 border-l-2 border-brand-500'
                }`}
              >
                {n.sender ? (
                  <Avatar src={n.sender.avatar} name={n.sender.name} size="sm" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-surface-light-text dark:text-surface-dark-text truncate">
                      {n.title}
                    </span>
                    <span className="text-[10px] text-surface-light-textSubtle dark:text-surface-dark-textSubtle font-mono flex-shrink-0">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted truncate mt-0.5">
                    {n.body}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenterModal;
