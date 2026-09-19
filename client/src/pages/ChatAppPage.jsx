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
            /* Empty State for when no conversation is selected on desktop */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
              <div className="w-14 h-14 rounded-full bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border flex items-center justify-center text-brand-500 mb-4 shadow-fine">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-base sm:text-lg font-display font-semibold text-surface-light-text dark:text-surface-dark-text">
                Select a conversation
              </h2>
              <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted max-w-sm mt-1 mb-5">
                Choose a direct dialogue from the left column or start a new group discussion.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsNewChatOpen(true)}
                  className="px-4 py-2 bg-brand-500 text-white rounded text-xs font-medium hover:bg-brand-600 transition-colors shadow-fine"
                >
                  Start Conversation
                </button>
                <button
                  onClick={() => setIsNewGroupOpen(true)}
                  className="px-4 py-2 bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded text-xs font-medium hover:border-brand-500 transition-colors"
                >
                  Create Group
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
