import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useNotificationStore } from '../store/useNotificationStore';
import socketService from '../services/socketService';

import NavigationBar from '../components/chat/NavigationBar';
import Sidebar from '../components/chat/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import MessageTimeline from '../components/chat/MessageTimeline';
import MessageComposer from '../components/chat/MessageComposer';
import ContextDrawer from '../components/chat/ContextDrawer';

import SearchModal from '../components/common/SearchModal';
import NewChatModal from '../components/modals/NewChatModal';
import NewGroupModal from '../components/modals/NewGroupModal';
import AddMemberModal from '../components/modals/AddMemberModal';
import ProfileModal from '../components/modals/ProfileModal';
import SettingsModal from '../components/modals/SettingsModal';
import NotificationCenterModal from '../components/modals/NotificationCenterModal';
import ToastContainer from '../components/common/ToastContainer';
import ConnectionBanner from '../components/common/ConnectionBanner';

import { Sparkles, MessageSquare } from 'lucide-react';

export const ChatAppPage = () => {
  const { user, token } = useAuthStore();
  const {
    fetchConversations,
    activeConversation,
    selectConversation,
    addReceivedMessage,
    setOnlineUsers,
    userCameOnline,
    userWentOffline,
    setUserTyping,
    removeUserTyping,
    setConnectionStatus,
    openAiChat,
  } = useChatStore();

  const { addToast } = useNotificationStore();

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Inspector & Mobile navigation state
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);

  // Initial data loading & socket connection
  useEffect(() => {
    fetchConversations();

    if (token) {
      const socket = socketService.connect(token);

      const handleOnlineList = (list) => setOnlineUsers(list);
      const handleUserOnline = (data) => userCameOnline(data.userId);
      const handleUserOffline = (data) => userWentOffline(data.userId);

      const handleReceiveMsg = (data) => {
        addReceivedMessage(data.conversationId, data.message);
      };

      const handleTyping = (data) => {
        setUserTyping(data.conversationId, data.user);
      };

      const handleStopTyping = (data) => {
        removeUserTyping(data.conversationId, data.userId);
      };

      const handleNotification = (data) => {
        addToast({
          title: data.title,
          body: data.body,
          sender: data.sender,
          conversationId: data.conversationId,
        });
      };

      socketService.on('onlineUsersList', handleOnlineList);
      socketService.on('userOnline', handleUserOnline);
      socketService.on('userOffline', handleUserOffline);
      socketService.on('receiveMessage', handleReceiveMsg);
      socketService.on('typing', handleTyping);
      socketService.on('stopTyping', handleStopTyping);
      socketService.on('newNotification', handleNotification);

      const unsubStatus = socketService.onStatusChange((st) => {
        setConnectionStatus(st);
      });

      return () => {
        socketService.off('onlineUsersList', handleOnlineList);
        socketService.off('userOnline', handleUserOnline);
        socketService.off('userOffline', handleUserOffline);
        socketService.off('receiveMessage', handleReceiveMsg);
        socketService.off('typing', handleTyping);
        socketService.off('stopTyping', handleStopTyping);
        socketService.off('newNotification', handleNotification);
        unsubStatus();
      };
    }
  }, [token]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K to open Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-surface-light-bg dark:bg-surface-dark-bg text-surface-light-text dark:text-surface-dark-text">
      {/* Network health bar */}
      <ConnectionBanner />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Icon Strip */}
        <NavigationBar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        {/* Conversations Sidebar (responsive) */}
        <Sidebar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenNewGroup={() => setIsNewGroupOpen(true)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Conversation Workspace Area */}
        <main
          className={`flex-1 flex flex-col min-w-0 bg-surface-light-bg dark:bg-surface-dark-bg relative h-full ${
            !activeConversation && 'hidden md:flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Header */}
              <ChatHeader
                onToggleContext={() => setIsContextOpen(!isContextOpen)}
                isContextOpen={isContextOpen}
                onBackToConversations={() => setIsMobileSidebarOpen(true)}
                onOpenSearchInChat={() => setIsSearchOpen(true)}
              />

              {/* Message Timeline */}
              <MessageTimeline />

              {/* Message Composer */}
              <MessageComposer />
            </>
          ) : (
            /* Elevated Empty State for when no conversation is selected on desktop */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none animate-in fade-in">
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-amber-600 to-purple-600 p-[2px] shadow-lg shadow-brand-500/10">
                  <div className="w-full h-full rounded-2xl bg-surface-light-panel dark:bg-[#111318] flex items-center justify-center text-brand-500">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              <h2 className="text-xl font-display font-bold text-surface-light-text dark:text-surface-dark-text tracking-tight">
                Welcome to VOXA Workspace
              </h2>
              <p className="text-xs sm:text-sm text-surface-light-textMuted dark:text-surface-dark-textMuted max-w-sm mt-1.5 mb-6 leading-relaxed">
                Connect seamlessly with colleagues in real time, or collaborate directly with your autonomous AI co-pilot.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => openAiChat()}
                  className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Ask VOXA AI</span>
                </button>
                <button
                  onClick={() => setIsNewChatOpen(true)}
                  className="px-4 py-2.5 bg-brand-500 text-white rounded-lg text-xs font-semibold hover:bg-brand-600 transition-all shadow-sm"
                >
                  Start Direct Chat
                </button>
                <button
                  onClick={() => setIsNewGroupOpen(true)}
                  className="px-4 py-2.5 bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border text-surface-light-text dark:text-surface-dark-text rounded-lg text-xs font-medium hover:border-brand-500 transition-colors"
                >
                  Create Channel
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Right Details/Context Inspector Drawer */}
        {activeConversation && isContextOpen && (
          <ContextDrawer
            isOpen={isContextOpen}
            onClose={() => setIsContextOpen(false)}
            onOpenAddMember={() => setIsAddMemberOpen(true)}
          />
        )}
      </div>

      {/* Floating Alerts Container */}
      <ToastContainer />

      {/* Modals & Dialogs */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
      <NewGroupModal isOpen={isNewGroupOpen} onClose={() => setIsNewGroupOpen(false)} />
      <AddMemberModal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

export default ChatAppPage;
