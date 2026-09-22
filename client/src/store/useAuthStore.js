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

      // Handle 2FA Challenge requirement
      if (res.data.requires2FA) {
        set({ isLoading: false });
        return {
          success: true,
          requires2FA: true,
          email: res.data.data.email,
          tempToken: res.data.data.tempToken,
          previewOtp: res.data.data.previewOtp,
        };
      }

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
      const data = err.response?.data;
      if (data?.requiresVerification) {
        set({ isLoading: false });
        return {
          success: false,
          requiresVerification: true,
          email: data.data?.email || data.email,
          previewOtp: data.data?.previewOtp,
          message: data.message || 'Please verify your email address.',
        };
      }

      const message = data?.message || 'Login failed. Please verify your credentials.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  register: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', formData);
      set({ isLoading: false });

      if (res.data.data?.requiresVerification) {
        return {
          success: true,
          requiresVerification: true,
          email: res.data.data.email,
          previewOtp: res.data.data.previewOtp,
        };
      }

      const { user, token } = res.data.data;
      localStorage.setItem('voxa_token', token);
      localStorage.setItem('voxa_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
      });

      socketService.connect(token);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  verifyOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
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
      return { success: true, message: res.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed. Please check your code.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  resendOtp: async (email) => {
    try {
      const res = await api.post('/auth/resend-otp', { email });
      return {
        success: true,
        message: res.data.message,
        previewOtp: res.data.data?.previewOtp,
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to resend verification code.',
      };
    }
  },

  verify2FA: async (tempToken, otp) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/verify-2fa', { tempToken, otp });
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
      return { success: true, message: res.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid two-factor code.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  resend2FA: async (tempToken) => {
    try {
      const res = await api.post('/auth/resend-2fa', { tempToken });
      return {
        success: true,
        message: res.data.message,
        previewOtp: res.data.data?.previewOtp,
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to resend 2FA code.',
      };
    }
  },

  request2FAActivation: async () => {
    try {
      const res = await api.post('/auth/2fa/request-activation');
      return {
        success: true,
        message: res.data.message,
        previewOtp: res.data.data?.previewOtp,
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to dispatch activation code.',
      };
    }
  },

  toggle2FA: async ({ enable, otp, password }) => {
    try {
      const res = await api.post('/auth/2fa/toggle', { enable, otp, password });
      const twoFactorEnabled = res.data.data?.twoFactorEnabled;

      set((state) => {
        const nextUser = state.user ? { ...state.user, twoFactorEnabled } : state.user;
        if (nextUser) {
          localStorage.setItem('voxa_user', JSON.stringify(nextUser));
        }
        return { user: nextUser };
      });

      return { success: true, message: res.data.message, twoFactorEnabled };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update two-factor settings.',
      };
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
