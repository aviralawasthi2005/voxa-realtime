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
  Hash,
  ChevronDown,
  ChevronRight,
  Bot,
  Plus,
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
  const [collapseGroups, setCollapseGroups] = useState(false);
  const [collapseDirect, setCollapseDirect] = useState(false);

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

  // Separate AI conversation, Groups, and Direct Messages
  const aiConversation = conversations.find(
    (c) =>
      !c.isGroup &&
      c.participants?.some((p) => p.isBot || p.username === 'voxa_ai')
  );

  const groupConversations = conversations.filter((c) => c.isGroup);
  const directConversations = conversations.filter(
    (c) =>
      !c.isGroup &&
      !c.participants?.some((p) => p.isBot || p.username === 'voxa_ai')
  );

  const filterMatches = (c) => {
    if (!filterText.trim()) return true;
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
  };

  const filteredGroups = groupConversations.filter(filterMatches);
  const filteredDirect = directConversations.filter(filterMatches);
  const showAiInSearch = !filterText.trim() || 'voxa ai assistant bot'.includes(filterText.toLowerCase());

  const renderConversationItem = (c, isAi = false) => {
    const isSelected = activeConversation?._id === c._id;
    let title = c.name;
    let avatarSrc = c.avatar;
    let isOnline = false;

    if (!c.isGroup) {
      const other = c.participants?.find((p) => p._id !== currentUser?._id);
      title = other?.name || (isAi ? 'VOXA AI' : 'Direct Chat');
      avatarSrc = other?.avatar;
      isOnline = isAi ? true : (other ? onlineUsers.has(other._id) || other.status === 'online' : false);
    }

    const unreadCount = c.unreadCounts?.[currentUser?._id] || 0;
    const lastMsg = c.lastMessage;
    const lastMsgContent = lastMsg?.isDeleted
      ? 'This message was deleted'
      : lastMsg?.content || (lastMsg?.attachments?.length ? 'Shared attachment' : isAi ? 'AI Co-pilot ready' : 'No messages yet');

    return (
      <div
        key={c._id}
        onClick={() => {
          selectConversation(c);
          onCloseMobile();
        }}
        className={`group w-full px-3 py-2.5 rounded-lg flex items-center gap-3 cursor-pointer text-left transition-all duration-150 relative ${
          isSelected
            ? 'bg-brand-500/10 dark:bg-brand-500/15 text-surface-light-text dark:text-surface-dark-text border border-brand-500/30 shadow-fine'
            : isAi
            ? 'bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 text-surface-light-text dark:text-surface-dark-text'
            : 'hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel/80 border border-transparent'
        }`}
      >
        {c.isGroup ? (
          <div className="w-10 h-10 rounded-lg bg-surface-light-subtle dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border flex items-center justify-center text-surface-light-textMuted dark:text-surface-dark-textMuted group-hover:text-brand-500 transition-colors flex-shrink-0">
            <Hash className="w-5 h-5" />
          </div>
        ) : isAi ? (
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
            showStatus={true}
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`text-xs font-semibold truncate ${isSelected ? 'text-brand-500 dark:text-brand-400' : 'text-surface-light-text dark:text-surface-dark-text'}`}>
                {title}
              </span>
              {isAi && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase font-bold tracking-wider flex-shrink-0">
                  ⚡ AI
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
              <span className="flex-shrink-0 min-w-4 h-4 px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside
      className={`w-full md:w-80 lg:w-88 flex-shrink-0 flex flex-col h-full bg-surface-light-panel dark:bg-surface-dark-subtle border-r border-surface-light-border dark:border-surface-dark-border select-none ${
        isMobileOpen ? 'flex' : 'hidden md:flex'
      }`}
    >
      {/* Top Brand & Actions Header */}
      <div className="p-3.5 border-b border-surface-light-border dark:border-surface-dark-border flex items-center justify-between bg-surface-light-panel dark:bg-surface-dark-subtle">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className="flex items-center gap-1.5 focus:outline-none group"
          >
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white font-display font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
              V
            </div>
            <span className="font-display font-bold text-base tracking-tight text-surface-light-text dark:text-surface-dark-text">
              VOXA
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mb-1" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSearch}
            className="p-1.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel rounded-md transition-colors"
            title="Global search (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenNewChat}
            className="p-1.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel rounded-md transition-colors"
            title="New direct chat"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenNewGroup}
            className="p-1.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel rounded-md transition-colors"
            title="New channel / group"
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
            placeholder="Search chats, channels, AI..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-light-subtle dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border text-surface-light-text dark:text-surface-dark-text rounded-md focus-ring placeholder-surface-light-textSubtle dark:placeholder-surface-dark-textSubtle transition-all"
          />
        </div>

        {/* Standard Navigation Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-surface-light-subtle dark:bg-surface-dark-panel rounded-md border border-surface-light-border/60 dark:border-surface-dark-border/60 text-[11px] font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1 text-center rounded transition-all ${
              activeTab === 'all'
                ? 'bg-surface-light-panel dark:bg-surface-dark-subtle text-surface-light-text dark:text-surface-dark-text shadow-fine font-semibold'
                : 'text-surface-light-textMuted dark:text-surface-dark-textMuted hover:text-surface-light-text dark:hover:text-surface-dark-text'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-1 text-center rounded transition-all ${
              activeTab === 'direct'
                ? 'bg-surface-light-panel dark:bg-surface-dark-subtle text-surface-light-text dark:text-surface-dark-text shadow-fine font-semibold'
                : 'text-surface-light-textMuted dark:text-surface-dark-textMuted hover:text-surface-light-text dark:hover:text-surface-dark-text'
            }`}
          >
            DMs ({directConversations.length})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-1 text-center rounded transition-all ${
              activeTab === 'groups'
                ? 'bg-surface-light-panel dark:bg-surface-dark-subtle text-surface-light-text dark:text-surface-dark-text shadow-fine font-semibold'
                : 'text-surface-light-textMuted dark:text-surface-dark-textMuted hover:text-surface-light-text dark:hover:text-surface-dark-text'
            }`}
          >
            Groups ({groupConversations.length})
          </button>
        </div>
      </div>

      {/* Main Conversation Stream with Common Section Hierarchy */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-1">
        {isLoadingConversations && conversations.length === 0 ? (
          <div className="p-4 space-y-3 animate-pulse">
            <div className="h-12 bg-surface-light-subtle dark:bg-surface-dark-panel rounded-lg" />
            <div className="h-12 bg-surface-light-subtle dark:bg-surface-dark-panel rounded-lg" />
            <div className="h-12 bg-surface-light-subtle dark:bg-surface-dark-panel rounded-lg" />
          </div>
        ) : (
          <>
            {/* 1. AI Assistant Section */}
            {(activeTab === 'all' || activeTab === 'direct') && showAiInSearch && (
              <div className="space-y-1">
                <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono tracking-wider font-bold text-purple-400 uppercase">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    AI Assistant
                  </span>
                  <span className="text-[9px] px-1 rounded bg-purple-500/15 text-purple-400 font-mono">
                    GPT-4o
                  </span>
                </div>

                {aiConversation ? (
                  renderConversationItem(aiConversation, true)
                ) : (
                  <div
                    onClick={() => {
                      openAiChat();
                      onCloseMobile();
                    }}
                    className="w-full px-3 py-2.5 rounded-lg flex items-center gap-3 cursor-pointer text-left transition-all duration-150 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-cyan-500/10 hover:border-purple-500/40 border border-purple-500/20 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[2px] shadow-sm flex-shrink-0">
                      <div className="w-full h-full rounded-full bg-[#111318] flex items-center justify-center text-purple-300">
                        <Bot className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-surface-light-text dark:text-surface-dark-text group-hover:text-purple-400 transition-colors">
                          VOXA AI
                        </span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold uppercase">
                          Bot
                        </span>
                      </div>
                      <p className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted truncate">
                        Instant answers, code & chat assistance
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Channels & Groups Section */}
            {(activeTab === 'all' || activeTab === 'groups') && (
              <div className="space-y-1">
                <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono tracking-wider font-bold text-surface-light-textSubtle dark:text-surface-dark-textSubtle uppercase">
                  <button
                    onClick={() => setCollapseGroups(!collapseGroups)}
                    className="flex items-center gap-1 hover:text-surface-light-text dark:hover:text-surface-dark-text transition-colors"
                  >
                    {collapseGroups ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                    <span>Channels & Groups ({filteredGroups.length})</span>
                  </button>
                  <button
                    onClick={onOpenNewGroup}
                    className="p-0.5 hover:text-brand-500 rounded transition-colors"
                    title="Create Group"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!collapseGroups && (
                  <div className="space-y-1">
                    {filteredGroups.length === 0 ? (
                      <div className="px-3 py-2 text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted italic">
                        No groups yet. Click + to create one.
                      </div>
                    ) : (
                      filteredGroups.map((c) => renderConversationItem(c, false))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. Direct Messages Section */}
            {(activeTab === 'all' || activeTab === 'direct') && (
              <div className="space-y-1">
                <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono tracking-wider font-bold text-surface-light-textSubtle dark:text-surface-dark-textSubtle uppercase">
                  <button
                    onClick={() => setCollapseDirect(!collapseDirect)}
                    className="flex items-center gap-1 hover:text-surface-light-text dark:hover:text-surface-dark-text transition-colors"
                  >
                    {collapseDirect ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                    <span>Direct Messages ({filteredDirect.length})</span>
                  </button>
                  <button
                    onClick={onOpenNewChat}
                    className="p-0.5 hover:text-brand-500 rounded transition-colors"
                    title="Start Direct Chat"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!collapseDirect && (
                  <div className="space-y-1">
                    {filteredDirect.length === 0 ? (
                      <div className="px-3 py-2 text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted italic">
                        No direct messages yet.
                      </div>
                    ) : (
                      filteredDirect.map((c) => renderConversationItem(c, false))
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer shortcut tip */}
      <div className="p-2.5 border-t border-surface-light-border dark:border-surface-dark-border text-[10px] text-surface-light-textSubtle dark:text-surface-dark-textSubtle flex items-center justify-between font-mono bg-surface-light-panel dark:bg-surface-dark-subtle">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>VOXA v1.0</span>
        </span>
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1 hover:text-surface-light-text dark:hover:text-surface-dark-text transition-colors"
        >
          <Command className="w-3 h-3" />
          <span>+ K search</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
