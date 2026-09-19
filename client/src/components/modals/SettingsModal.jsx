import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import {
  Settings,
  X,
  Sun,
  Moon,
  Laptop,
  Shield,
  Bell,
  LogOut,
  Check,
  Loader2,
} from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useThemeStore();
  const { user, updatePassword, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState('appearance'); // 'appearance' | 'security' | 'notifications'

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secSuccess, setSecSuccess] = useState('');
  const [secError, setSecError] = useState('');
  const [isSubmittingSec, setIsSubmittingSec] = useState(false);

  // Notification Preferences
  const [notifSound, setNotifSound] = useState(true);
  const [notifDesktop, setNotifDesktop] = useState(true);

  if (!isOpen) return null;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSecError('New passwords do not match.');
      return;
    }

    setIsSubmittingSec(true);
    setSecError('');
    setSecSuccess('');

    try {
      const res = await updatePassword(currentPassword, newPassword, confirmPassword);
      if (res.success) {
        setSecSuccess('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSecError(res.message);
      }
    } catch (err) {
      setSecError('Failed to change password.');
    } finally {
      setIsSubmittingSec(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-xl bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded-lg shadow-modal overflow-hidden flex flex-col md:flex-row max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation column */}
        <div className="w-full md:w-48 bg-surface-light-subtle dark:bg-surface-dark-subtle border-b md:border-b-0 md:border-r border-surface-light-border dark:border-surface-dark-border p-3 space-y-1">
          <div className="px-3 py-2 text-xs font-display font-bold uppercase tracking-wider text-surface-light-textSubtle dark:text-surface-dark-textSubtle">
            Settings
          </div>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-colors ${
              activeTab === 'appearance'
                ? 'bg-surface-light-panel dark:bg-surface-dark-panel text-brand-500 font-semibold shadow-fine'
                : 'text-surface-light-textMuted dark:text-surface-dark-textMuted hover:text-surface-light-text dark:hover:text-surface-dark-text'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Appearance</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-colors ${
              activeTab === 'security'
                ? 'bg-surface-light-panel dark:bg-surface-dark-panel text-brand-500 font-semibold shadow-fine'
                : 'text-surface-light-textMuted dark:text-surface-dark-textMuted hover:text-surface-light-text dark:hover:text-surface-dark-text'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-colors ${
              activeTab === 'notifications'
                ? 'bg-surface-light-panel dark:bg-surface-dark-panel text-brand-500 font-semibold shadow-fine'
                : 'text-surface-light-textMuted dark:text-surface-dark-textMuted hover:text-surface-light-text dark:hover:text-surface-dark-text'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>
        </div>

        {/* Content column */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b border-surface-light-border dark:border-surface-dark-border flex items-center justify-between">
            <h3 className="text-sm font-semibold font-display text-surface-light-text dark:text-surface-dark-text capitalize">
              {activeTab}
            </h3>
            <button
              onClick={onClose}
              className="text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-6">
            {/* APPEARANCE */}
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
                    Interface Theme
                  </h4>
                  <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted">
                    Select an independently crafted color mode for long focus sessions.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-3 rounded border flex flex-col items-center gap-2 transition-all ${
                      theme === 'light'
                        ? 'border-brand-500 bg-brand-500/5 text-brand-500'
                        : 'border-surface-light-border dark:border-surface-dark-border hover:border-surface-light-textSubtle dark:hover:border-surface-dark-textSubtle'
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    <span className="text-xs font-medium">Light</span>
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-3 rounded border flex flex-col items-center gap-2 transition-all ${
                      theme === 'dark'
                        ? 'border-brand-500 bg-brand-500/5 text-brand-500'
                        : 'border-surface-light-border dark:border-surface-dark-border hover:border-surface-light-textSubtle dark:hover:border-surface-dark-textSubtle'
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span className="text-xs font-medium">Dark</span>
                  </button>

                  <button
                    onClick={() => setTheme('system')}
                    className={`p-3 rounded border flex flex-col items-center gap-2 transition-all ${
                      theme === 'system'
                        ? 'border-brand-500 bg-brand-500/5 text-brand-500'
                        : 'border-surface-light-border dark:border-surface-dark-border hover:border-surface-light-textSubtle dark:hover:border-surface-dark-textSubtle'
                    }`}
                  >
                    <Laptop className="w-5 h-5" />
                    <span className="text-xs font-medium">System</span>
                  </button>
                </div>
              </div>
            )}

            {/* SECURITY */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
                    Change Password
                  </h4>
                  <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted">
                    Update your account credentials using bcrypt hashing protection.
                  </p>
                </div>

                {secSuccess && (
                  <div className="p-2 text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{secSuccess}</span>
                  </div>
                )}

                {secError && (
                  <div className="p-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded">
                    {secError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-surface-light-subtle dark:bg-surface-dark-subtle border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 text-xs bg-surface-light-subtle dark:bg-surface-dark-subtle border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-surface-light-subtle dark:bg-surface-dark-subtle border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingSec}
                    className="px-4 py-1.5 text-xs bg-brand-500 text-white rounded font-medium hover:bg-brand-600 transition-colors flex items-center gap-1.5 shadow-fine"
                  >
                    {isSubmittingSec && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
                    Notification Preferences
                  </h4>
                  <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted">
                    Configure real-time alerts and toast notifications.
                  </p>
                </div>

                <div className="space-y-3 border-t border-surface-light-border dark:border-surface-dark-border pt-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-surface-light-text dark:text-surface-dark-text">
                        Desktop Toasts
                      </div>
                      <div className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted">
                        Display incoming message cards on screen
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifDesktop}
                      onChange={(e) => setNotifDesktop(e.target.checked)}
                      className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-surface-light-text dark:text-surface-dark-text">
                        Audio Signals
                      </div>
                      <div className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted">
                        Play subtle chime upon incoming direct messages
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifSound}
                      onChange={(e) => setNotifSound(e.target.checked)}
                      className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
