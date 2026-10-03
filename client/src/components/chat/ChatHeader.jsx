import React from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import Avatar from '../common/Avatar';
import {
  Search,
  Sidebar as SidebarIcon,
  ChevronLeft,
  Users,
  Sparkles,
  Bot,
  RotateCcw,
  Zap,
} from 'lucide-react';

export const ChatHeader = ({
  onToggleContext,
  isContextOpen,
  onBackToConversations,
  onOpenSearchInChat,
}) => {
  const { activeConversation, onlineUsers, typingUsers, fetchMessages } = useChatStore();
  const currentUser = useAuthStore((state) => state.user);

  if (!activeConversation) return null;

  let title = activeConversation.name;
  let subtitle = '';
  let avatarSrc = activeConversation.avatar;
  let isOnline = false;
  let isAi = false;

  if (activeConversation.isGroup) {
    const memberCount = activeConversation.participants?.length || 0;
    subtitle = `${memberCount} members · ${activeConversation.description || 'Group conversation'}`;
  } else {
    const other = activeConversation.participants?.find((p) => p._id !== currentUser?._id);
    isAi = other?.isBot || other?.username === 'voxa_ai';
    title = isAi ? 'VOXA AI' : (other?.name || 'Direct Chat');
    avatarSrc = other?.avatar;
    isOnline = isAi ? true : (other ? onlineUsers.has(other._id) || other.status === 'online' : false);
    subtitle = isAi
      ? 'Dual Engine · Ready to reason, code & assist'
      : isOnline
      ? 'Active now'
      : other?.bio || 'Offline';
  }

  // Active typing indicators for this conversation
  const typers = (typingUsers[activeConversation._id] || []).filter(
    (u) => u._id !== currentUser?._id
  );

  return (
    <header className="h-16 px-4 border-b border-surface-light-border dark:border-surface-dark-border bg-surface-light-panel dark:bg-surface-dark-subtle flex items-center justify-between flex-shrink-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Back button */}
        <button
          onClick={onBackToConversations}
          className="md:hidden p-1.5 -ml-1 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text rounded-md transition-colors"
          title="Back to conversations"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {isAi ? (
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[2px] shadow-sm">
              <div className="w-full h-full rounded-full bg-[#111318] flex items-center justify-center text-purple-300">
                <Bot className="w-5 h-5" />
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface-light-panel dark:ring-surface-dark-subtle" />
          </div>
        ) : (
          <Avatar
            src={avatarSrc}
            name={title}
            size="md"
            isOnline={isOnline}
            showStatus={!activeConversation.isGroup}
          />
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold font-display text-surface-light-text dark:text-surface-dark-text truncate">
              {title}
            </h2>
            {isAi && (
              <span className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-400 border border-purple-500/30 font-bold uppercase tracking-wider flex-shrink-0">
                <Sparkles className="w-2.5 h-2.5" />
                Copilot
              </span>
            )}
          </div>

          {/* Typing state or presence subtitle */}
          {typers.length > 0 ? (
            <div className="flex items-center gap-1.5 text-[11px] text-brand-500 font-medium">
              <span>
                {typers.length === 1
                  ? `${typers[0].name.split(' ')[0]} is typing`
                  : `${typers.length} people typing`}
              </span>
              <span className="flex items-center gap-0.5">
                <span className="w-1 h-1 rounded-full bg-brand-500 animate-typing-1" />
                <span className="w-1 h-1 rounded-full bg-brand-500 animate-typing-2" />
                <span className="w-1 h-1 rounded-full bg-brand-500 animate-typing-3" />
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted truncate flex items-center gap-1.5">
              {isOnline && !activeConversation.isGroup && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block flex-shrink-0"></span>
              )}
              <span>{subtitle}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {isAi && (
          <button
            onClick={() => fetchMessages(activeConversation._id)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted hover:text-purple-400 hover:bg-purple-500/10 rounded-md border border-surface-light-border dark:border-surface-dark-border transition-colors font-medium mr-1"
            title="Refresh AI chat messages"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        )}

        <button
          onClick={onOpenSearchInChat}
          className="p-2 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel rounded-md transition-colors"
          title="Search in this conversation"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleContext}
          className={`p-2 rounded-md transition-colors ${
            isContextOpen
              ? 'bg-surface-light-subtle dark:bg-surface-dark-panel text-brand-500'
              : 'text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel'
          }`}
          title="Details and media"
        >
          <SidebarIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
