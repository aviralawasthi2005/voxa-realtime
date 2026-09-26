import React, { useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import Avatar from '../common/Avatar';
import {
  MessageSquarePlus,
  Users,
  Search,
  Check,
  CheckCheck,
  Pin,
  Clock,
  Sparkles,
  Command,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

export const Sidebar = ({
  onOpenSearch,
  onOpenNewChat,
  onOpenNewGroup,
  isMobileOpen = false,
  onCloseMobile = () => {},
}) => {
  const {
    conversations,
    activeConversation,
    selectConversation,
    openAiChat,
    onlineUsers,
    activeTab,
    setActiveTab,
    isLoadingConversations,
  } = useChatStore();

  const currentUser = useAuthStore((state) => state.user);
  const [filterText, setFilterText] = useState('');

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isToday(date)) {
        return format(date, 'HH:mm');
      }
      if (isYesterday(date)) {
        return 'Yesterday';
      }
      return format(date, 'MMM d');
    } catch {
      return '';
    }
  };

  const filteredConversations = conversations.filter((c) => {
    // Tab filtering
    if (activeTab === 'direct' && c.isGroup) return false;
    if (activeTab === 'groups' && !c.isGroup) return false;

    // Search text filtering
    if (!filterText) return true;
    const q = filterText.toLowerCase();

    if (c.isGroup) {
      return (
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }

    const otherParticipant = c.participants?.find((p) => p._id !== currentUser?._id);
    return (
      otherParticipant?.name?.toLowerCase().includes(q) ||
      otherParticipant?.username?.toLowerCase().includes(q)
    );
  });

  return (
    <aside
      className={`w-full md:w-80 lg:w-88 flex-shrink-0 flex flex-col h-full bg-surface-light-panel dark:bg-surface-dark-subtle border-r border-surface-light-border dark:border-surface-dark-border select-none ${
        isMobileOpen ? 'flex' : 'hidden md:flex'
      }`}
    >
      {/* Top Header */}
      <div className="p-3.5 border-b border-surface-light-border dark:border-surface-dark-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className="flex items-center gap-1.5 focus:outline-none"
          >
            <span className="font-display font-bold text-lg tracking-tight text-surface-light-text dark:text-surface-dark-text">
              VOXA
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block mb-1" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSearch}
            className="p-1.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel rounded transition-colors"
            title="Global search (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenNewChat}
            className="p-1.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel rounded transition-colors"
            title="New direct chat"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenNewGroup}
            className="p-1.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel rounded transition-colors"
            title="New group"
          >
            <Users className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Quick Search */}
      <div className="px-3 pt-3 pb-2 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter conversations..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-light-subtle dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border text-surface-light-text dark:text-surface-dark-text rounded focus-ring placeholder-surface-light-textSubtle dark:placeholder-surface-dark-textSubtle"
          />
        </div>

        {/* VOXA AI Quick Launch Banner */}
        <div
          onClick={() => {
            openAiChat();
            onCloseMobile();
          }}
          className="group relative cursor-pointer p-2 rounded-md border border-purple-500/25 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-cyan-500/10 hover:border-purple-500/50 hover:from-purple-500/15 hover:to-cyan-500/15 transition-all shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shadow-sm">
                <img
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=VoxaAI&backgroundColor=7c3aed,06b6d4"
                  alt="VOXA AI"
                  className="w-full h-full rounded-full bg-surface-dark-subtle"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-surface-light-panel dark:ring-surface-dark-subtle" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-display font-semibold text-surface-light-text dark:text-surface-dark-text tracking-tight group-hover:text-purple-400 transition-colors">
                  VOXA AI Assistant
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase font-bold tracking-wider">
                  Bot
                </span>
              </div>
              <p className="text-[10px] text-surface-light-textMuted dark:text-surface-dark-textMuted truncate">
                Instant code, insights & chat assistance
              </p>
            </div>

            <Sparkles className="w-3.5 h-3.5 text-purple-400 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all flex-shrink-0" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-surface-light-subtle dark:bg-surface-dark-panel rounded border border-surface-light-border/60 dark:border-surface-dark-border/60 text-[11px] font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1 text-center rounded transition-colors ${
              activeTab === 'all'
                ? 'bg-surface-light-panel dark:bg-surface-dark-subtle text-surface-light-text dark:text-surface-dark-text shadow-fine font-semibold'
                : 'text-surface-light-textMuted dark:text-surface-dark-textMuted hover:text-surface-light-text dark:hover:text-surface-dark-text'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-1 text-center rounded transition-colors ${
              activeTab === 'direct'
                ? 'bg-surface-light-panel dark:bg-surface-dark-subtle text-surface-light-text dark:text-surface-dark-text shadow-fine font-semibold'
                : 'text-surface-light-textMuted dark:text-surface-dark-textMuted hover:text-surface-light-text dark:hover:text-surface-dark-text'
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-1 text-center rounded transition-colors ${
              activeTab === 'groups'
                ? 'bg-surface-light-panel dark:bg-surface-dark-subtle text-surface-light-text dark:text-surface-dark-text shadow-fine font-semibold'
                : 'text-surface-light-textMuted dark:text-surface-dark-textMuted hover:text-surface-light-text dark:hover:text-surface-dark-text'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {isLoadingConversations && conversations.length === 0 ? (
          <div className="p-6 text-center text-xs text-surface-light-textSubtle dark:text-surface-dark-textSubtle animate-pulse space-y-3">
            <div className="h-12 bg-surface-light-subtle dark:bg-surface-dark-panel rounded" />
            <div className="h-12 bg-surface-light-subtle dark:bg-surface-dark-panel rounded" />
            <div className="h-12 bg-surface-light-subtle dark:bg-surface-dark-panel rounded" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-surface-light-subtle dark:bg-surface-dark-panel flex items-center justify-center text-surface-light-textSubtle dark:text-surface-dark-textSubtle mb-2.5">
              <Sparkles className="w-4 h-4 text-brand-500" />
            </div>
            <h4 className="text-xs font-display font-semibold text-surface-light-text dark:text-surface-dark-text">
              Your conversations are quiet.
            </h4>
            <p className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted mt-1 mb-3">
              Start something new with colleagues or friends.
            </p>
            <button
              onClick={onOpenNewChat}
              className="px-3 py-1.5 text-xs bg-surface-light-subtle dark:bg-surface-dark-panel hover:bg-brand-500 hover:text-white border border-surface-light-border dark:border-surface-dark-border rounded font-medium transition-colors"
            >
              Start conversation
            </button>
          </div>
        ) : (
          filteredConversations.map((c) => {
            const isSelected = activeConversation?._id === c._id;
            let title = c.name;
            let avatarSrc = c.avatar;
            let isOnline = false;

            let isAi = false;

            if (!c.isGroup) {
              const other = c.participants?.find((p) => p._id !== currentUser?._id);
              title = other?.name || 'Direct Chat';
              avatarSrc = other?.avatar;
              isAi = other?.isBot || other?.username === 'voxa_ai';
              isOnline = isAi ? true : (other ? onlineUsers.has(other._id) || other.status === 'online' : false);
            }

            const unreadCount = c.unreadCounts?.[currentUser?._id] || 0;
            const lastMsg = c.lastMessage;
            const lastMsgContent = lastMsg?.isDeleted
              ? 'This message was deleted'
              : lastMsg?.content || (lastMsg?.attachments?.length ? 'Attachment' : 'No messages yet');

            return (
              <div
                key={c._id}
                onClick={() => {
                  selectConversation(c);
                  onCloseMobile();
                }}
                className={`w-full p-2.5 rounded-md flex items-start gap-3 cursor-pointer text-left transition-colors relative group ${
                  isSelected
                    ? 'bg-surface-light-subtle dark:bg-surface-dark-panel border-l-2 border-l-brand-500 shadow-fine'
                    : 'hover:bg-surface-light-subtle/70 dark:hover:bg-surface-dark-panel/60'
                }`}
              >
                <Avatar
                  src={avatarSrc}
                  name={title}
                  size="md"
                  isOnline={isOnline}
                  showStatus={!c.isGroup}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <span className="text-xs font-semibold truncate text-surface-light-text dark:text-surface-dark-text">
                        {title}
                      </span>
                      {isAi && (
                        <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold uppercase flex-shrink-0">
                          AI
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-surface-light-textSubtle dark:text-surface-dark-textSubtle font-mono flex-shrink-0">
                      {formatTimestamp(lastMsg?.createdAt || c.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted truncate leading-relaxed">
                      {c.isGroup && lastMsg?.sender && (
                        <span className="font-medium text-surface-light-text dark:text-surface-dark-text mr-1">
                          {lastMsg.sender._id === currentUser?._id ? 'You:' : `${lastMsg.sender.name.split(' ')[0]}:`}
                        </span>
                      )}
                      {lastMsgContent}
                    </p>

                    {unreadCount > 0 && (
                      <span className="flex-shrink-0 min-w-4 h-4 px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer shortcut tip */}
      <div className="p-2.5 border-t border-surface-light-border dark:border-surface-dark-border text-[10px] text-surface-light-textSubtle dark:text-surface-dark-textSubtle flex items-center justify-between font-mono">
        <span>VOXA v1.0</span>
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1 hover:text-surface-light-text dark:hover:text-surface-dark-text"
        >
          <Command className="w-3 h-3" />
          <span>+ K to search</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
