import { create } from 'zustand';
import api from '../services/api';
import socketService from '../services/socketService';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: new Set(),
  typingUsers: {}, // conversationId -> array of users
  connectionStatus: 'connected',
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSending: false,
  replyingTo: null,
  activeTab: 'all', // 'all' | 'direct' | 'groups'

  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setReplyingTo: (message) => set({ replyingTo: message }),

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const res = await api.get('/conversations');
      const convs = res.data.data.conversations;
      set({ conversations: convs, isLoadingConversations: false });
      return convs;
    } catch (err) {
      set({ isLoadingConversations: false });
      return [];
    }
  },

  selectConversation: async (convOrId) => {
    const prevConv = get().activeConversation;
    if (prevConv) {
      socketService.leaveConversation(prevConv._id);
    }

    let targetConv = null;
    if (typeof convOrId === 'string') {
      targetConv = get().conversations.find((c) => c._id === convOrId);
      if (!targetConv) {
        try {
          const res = await api.get(`/conversations/${convOrId}`);
          targetConv = res.data.data.conversation;
        } catch (e) {}
      }
    } else {
      targetConv = convOrId;
    }

    if (!targetConv) return;

    set({ activeConversation: targetConv, messages: [], replyingTo: null });
    socketService.joinConversation(targetConv._id);

    // Fetch messages for this conversation
    get().fetchMessages(targetConv._id);

    // Mark as read
    get().markConversationRead(targetConv._id);
  },

  fetchMessages: async (conversationId) => {
    set({ isLoadingMessages: true });
    try {
      const res = await api.get(`/messages/${conversationId}?limit=60`);
      set({
        messages: res.data.data.messages,
        isLoadingMessages: false,
      });
    } catch (err) {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (content, attachments = [], replyToId = null) => {
    const { activeConversation, replyingTo } = get();
    if (!activeConversation) return;

    const actualReplyTo = replyToId || (replyingTo ? replyingTo._id : null);
    set({ isSending: true });

    try {
      const res = await api.post('/messages', {
        conversationId: activeConversation._id,
        content,
        attachments,
        replyTo: actualReplyTo,
      });

      const newMsg = res.data.data.message;

      // Optimistically append message to active conversation timeline
      set((state) => ({
        messages: [...state.messages, newMsg],
        replyingTo: null,
        isSending: false,
      }));

      // Broadcast via socket to room
      socketService.emitSendMessage(activeConversation._id, newMsg);

      // Update conversation in sidebar list
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === activeConversation._id
            ? { ...c, lastMessage: newMsg, updatedAt: new Date().toISOString() }
            : c
        ),
      }));

      return newMsg;
    } catch (err) {
      set({ isSending: false });
      throw err;
    }
  },

  addReceivedMessage: (conversationId, message) => {
    const { activeConversation, messages, conversations } = get();

    // If message is for currently open conversation, append if not already present
    if (activeConversation && activeConversation._id === conversationId) {
      const exists = messages.some((m) => m._id === message._id);
      if (!exists) {
        set({ messages: [...messages, message] });
        get().markConversationRead(conversationId);
      }
    }

    // Update conversation list lastMessage and sort
    const convIndex = conversations.findIndex((c) => c._id === conversationId);
    if (convIndex > -1) {
      const updatedConv = {
        ...conversations[convIndex],
        lastMessage: message,
        updatedAt: new Date().toISOString(),
      };

      // Increment unread count if conversation is not active
      if (!activeConversation || activeConversation._id !== conversationId) {
        // Will be reflected on fetch or local state
      }

      const restConvs = conversations.filter((c) => c._id !== conversationId);
      set({ conversations: [updatedConv, ...restConvs] });
    } else {
      // Fetch fresh conversation list to capture newly initiated chat
      get().fetchConversations();
    }
  },

  reactToMessage: async (messageId, emoji) => {
    try {
      const res = await api.post(`/messages/${messageId}/react`, { emoji });
      const updated = res.data.data.message;

      set((state) => ({
        messages: state.messages.map((m) => (m._id === messageId ? updated : m)),
      }));
    } catch (err) {
      console.error('Failed to react to message', err);
    }
  },

  markConversationRead: async (conversationId) => {
    try {
      await api.patch(`/messages/${conversationId}/read`);
      set((state) => ({
        conversations: state.conversations.map((c) => {
          if (c._id === conversationId) {
            return {
              ...c,
              unreadCounts: { ...c.unreadCounts, [localStorage.getItem('voxa_user_id')]: 0 },
            };
          }
          return c;
        }),
      }));
      socketService.emitMessageRead(conversationId, []);
    } catch (e) {}
  },

  createDirectChat: async (recipientId) => {
    try {
      const res = await api.post('/conversations/direct', { recipientId });
      const conv = res.data.data.conversation;

      // Update conversations list
      const exists = get().conversations.some((c) => c._id === conv._id);
      if (!exists) {
        set((state) => ({ conversations: [conv, ...state.conversations] }));
      }

      await get().selectConversation(conv);
      return conv;
    } catch (err) {
      throw err;
    }
  },

  openAiChat: async () => {
    try {
      const res = await api.post('/conversations/ai');
      const conv = res.data.data.conversation;

      const exists = get().conversations.some((c) => c._id === conv._id);
      if (!exists) {
        set((state) => ({ conversations: [conv, ...state.conversations] }));
      } else {
        set((state) => ({
          conversations: state.conversations.map((c) => (c._id === conv._id ? conv : c)),
        }));
      }

      await get().selectConversation(conv);
      return conv;
    } catch (err) {
      console.error('Failed to open VOXA AI chat:', err);
      throw err;
    }
  },

  createGroupChat: async (name, description, participants, avatar) => {
    try {
      const res = await api.post('/conversations/group', {
        name,
        description,
        participants,
        avatar,
      });
      const conv = res.data.data.conversation;

      set((state) => ({ conversations: [conv, ...state.conversations] }));
      await get().selectConversation(conv);
      return conv;
    } catch (err) {
      throw err;
    }
  },

  updateGroupDetails: async (conversationId, data) => {
    try {
      const res = await api.patch(`/conversations/${conversationId}/group`, data);
      const updated = res.data.data.conversation;

      set((state) => ({
        conversations: state.conversations.map((c) => (c._id === conversationId ? updated : c)),
        activeConversation: state.activeConversation?._id === conversationId ? updated : state.activeConversation,
      }));
      return updated;
    } catch (err) {
      throw err;
    }
  },

  addMembersToGroup: async (conversationId, userIds) => {
    try {
      const res = await api.post(`/conversations/${conversationId}/members`, { userIds });
      const updated = res.data.data.conversation;

      set((state) => ({
        conversations: state.conversations.map((c) => (c._id === conversationId ? updated : c)),
        activeConversation: state.activeConversation?._id === conversationId ? updated : state.activeConversation,
      }));
      return updated;
    } catch (err) {
      throw err;
    }
  },

  removeMemberFromGroup: async (conversationId, userId) => {
    try {
      const res = await api.delete(`/conversations/${conversationId}/members/${userId}`);
      const updated = res.data.data.conversation;

      set((state) => ({
        conversations: state.conversations.map((c) => (c._id === conversationId ? updated : c)),
        activeConversation: state.activeConversation?._id === conversationId ? updated : state.activeConversation,
      }));
      return updated;
    } catch (err) {
      throw err;
    }
  },

  // Online status management
  setOnlineUsers: (userIds) => {
    set({ onlineUsers: new Set(userIds) });
  },

  userCameOnline: (userId) => {
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.add(userId);
      return { onlineUsers: next };
    });
  },

  userWentOffline: (userId) => {
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    });
  },

  // Typing indicators
  setUserTyping: (conversationId, user) => {
    set((state) => {
      const currentList = state.typingUsers[conversationId] || [];
      const exists = currentList.some((u) => u._id === user._id);
      if (exists) return state;

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...currentList, user],
        },
      };
    });
  },

  removeUserTyping: (conversationId, userId) => {
    set((state) => {
      const currentList = state.typingUsers[conversationId] || [];
      const filtered = currentList.filter((u) => u._id !== userId);

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: filtered,
        },
      };
    });
  },
}));
