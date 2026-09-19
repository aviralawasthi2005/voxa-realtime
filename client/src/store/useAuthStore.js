import { create } from 'zustand';
import api from '../services/api';
import socketService from '../services/socketService';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('voxa_user') || 'null'),
  token: localStorage.getItem('voxa_token') || null,
  isAuthenticated: !!localStorage.getItem('voxa_token'),
  isLoading: false,
  error: null,

  login: async (loginOrEmail, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { loginOrEmail, password });
      const { user, token } = res.data.data;

      localStorage.setItem('voxa_token', token);
      localStorage.setItem('voxa_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      // Connect real-time socket
      socketService.connect(token);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  register: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', formData);
      const { user, token } = res.data.data;

      localStorage.setItem('voxa_token', token);
      localStorage.setItem('voxa_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      socketService.connect(token);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Proceed even if network request fails
    }
    socketService.disconnect();
    localStorage.removeItem('voxa_token');
    localStorage.removeItem('voxa_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  fetchMe: async () => {
    const token = localStorage.getItem('voxa_token');
    if (!token) return;

    try {
      const res = await api.get('/auth/me');
      const user = res.data.data.user;
      localStorage.setItem('voxa_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
      socketService.connect(token);
    } catch (err) {
      if (err.response?.status === 401) {
        get().logout();
      }
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.patch('/users/me', data);
      const updatedUser = res.data.data.user;
      localStorage.setItem('voxa_user', JSON.stringify(updatedUser));
      set({ user: updatedUser, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  updatePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const res = await api.patch('/auth/update-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (res.data.data?.token) {
        localStorage.setItem('voxa_token', res.data.data.token);
        set({ token: res.data.data.token });
      }
      return { success: true, message: 'Password updated successfully.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update password.',
      };
    }
  },

  clearError: () => set({ error: null }),
}));
