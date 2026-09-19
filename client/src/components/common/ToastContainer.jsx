import React from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useChatStore } from '../../store/useChatStore';
import Avatar from './Avatar';
import { X, MessageSquare } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useNotificationStore();
  const selectConversation = useChatStore((state) => state.selectConversation);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 md:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => {
            if (toast.conversationId) {
              selectConversation(toast.conversationId);
              removeToast(toast.id);
            }
          }}
          className="pointer-events-auto bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border text-surface-light-text dark:text-surface-dark-text p-3.5 rounded-md shadow-float flex items-start gap-3 cursor-pointer hover:border-brand-500/50 transition-all duration-200 transform translate-y-0"
        >
          {toast.sender ? (
            <Avatar src={toast.sender.avatar} name={toast.sender.name} size="sm" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold font-display truncate">
                {toast.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                className="text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text p-0.5"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted truncate mt-0.5">
              {toast.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
