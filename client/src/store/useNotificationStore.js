import { create } from 'zustand';
import api from '../services/api';

export const useNotificationStore = create((set, get) => ({
  toasts: [],
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  addToast: ({ title, body, sender, conversationId }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const toast = { id, title, body, sender, conversationId };

    set((state) => ({
      toasts: [...state.toasts.slice(-4), toast], // Keep max 5 visible
      unreadCount: state.unreadCount + 1,
    }));

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 5000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/notifications');
      set({
        notifications: res.data.data.notifications,
        unreadCount: res.data.data.unreadCount,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (e) {}
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (e) {}
  },

  clearNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
      }));
    } catch (e) {}
  },
}));
