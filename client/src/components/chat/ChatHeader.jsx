import React from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import Avatar from '../common/Avatar';
import {
  Phone,
  Video,
  Search,
  Sidebar as SidebarIcon,
  ChevronLeft,
  Users,
  MoreVertical,
} from 'lucide-react';

export const ChatHeader = ({
  onToggleContext,
  isContextOpen,
  onBackToConversations,
  onOpenSearchInChat,
}) => {
  const { activeConversation, onlineUsers, typingUsers } = useChatStore();
  const currentUser = useAuthStore((state) => state.user);

  if (!activeConversation) return null;

  let title = activeConversation.name;
  let subtitle = '';
  let avatarSrc = activeConversation.avatar;
  let isOnline = false;

  if (activeConversation.isGroup) {
    const memberCount = activeConversation.participants?.length || 0;
    subtitle = `${memberCount} members`;
  } else {
    const other = activeConversation.participants?.find((p) => p._id !== currentUser?._id);
    title = other?.name || 'Direct Chat';
    avatarSrc = other?.avatar;
    isOnline = other ? onlineUsers.has(other._id) || other.status === 'online' : false;
    subtitle = isOnline ? 'Active now' : other?.bio || 'Offline';
  }

  // Active typing indicators for this conversation
  const typers = (typingUsers[activeConversation._id] || []).filter(
    (u) => u._id !== currentUser?._id
  );

  return (
    <header className="h-16 px-4 border-b border-surface-light-border dark:border-surface-dark-border bg-surface-light-panel dark:bg-surface-dark-subtle flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Back button */}
        <button
          onClick={onBackToConversations}
          className="md:hidden p-1.5 -ml-1 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text rounded"
          title="Back to conversations"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <Avatar
          src={avatarSrc}
          name={title}
          size="md"
          isOnline={isOnline}
          showStatus={!activeConversation.isGroup}
        />

        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-semibold font-display text-surface-light-text dark:text-surface-dark-text truncate">
            {title}
          </h2>

          {/* Typing state or presence subtitle */}
          {typers.length > 0 ? (
            <div className="flex items-center gap-1 text-[11px] text-brand-500 font-medium">
              <span>
                {typers.length === 1
                  ? `${typers[0].name.split(' ')[0]} is typing`
                  : `${typers.length} people typing`}
              </span>
              <span className="flex items-center gap-0.5 ml-0.5">
                <span className="w-1 h-1 rounded-full bg-brand-500 animate-typing-1" />
                <span className="w-1 h-1 rounded-full bg-brand-500 animate-typing-2" />
                <span className="w-1 h-1 rounded-full bg-brand-500 animate-typing-3" />
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenSearchInChat}
          className="p-2 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel rounded transition-colors"
          title="Search messages in conversation"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleContext}
          className={`p-2 rounded transition-colors ${
            isContextOpen
              ? 'bg-surface-light-subtle dark:bg-surface-dark-panel text-brand-500'
              : 'text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel'
          }`}
          title="Conversation details"
        >
          <SidebarIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
