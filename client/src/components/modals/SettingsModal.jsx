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
  ShieldCheck,
  ShieldAlert,
  Bell,
  LogOut,
  Check,
  Loader2,
  KeyRound,
  Lock,
} from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useThemeStore();
  const {
    user,
    updatePassword,
    logout,
    request2FAActivation,
    toggle2FA,
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState('appearance'); // 'appearance' | 'security' | 'notifications'

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secSuccess, setSecSuccess] = useState('');
  const [secError, setSecError] = useState('');
  const [isSubmittingSec, setIsSubmittingSec] = useState(false);

  // 2FA Management State
  const [twoFactorStage, setTwoFactorStage] = useState('idle'); // 'idle' | 'activating' | 'deactivating'
  const [twoFactorActivationOtp, setTwoFactorActivationOtp] = useState('');
  const [twoFactorDisablePassword, setTwoFactorDisablePassword] = useState('');
  const [twoFactorSuccess, setTwoFactorSuccess] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [isSubmitting2FA, setIsSubmitting2FA] = useState(false);
  const [dev2FAOtp, setDev2FAOtp] = useState(null);

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

  const handleStart2FAActivation = async () => {
    setIsSubmitting2FA(true);
    setTwoFactorError('');
    setTwoFactorSuccess('');

    const res = await request2FAActivation();
    setIsSubmitting2FA(false);

    if (res.success) {
      setTwoFactorStage('activating');
      setTwoFactorSuccess('A 6-digit confirmation code was sent to your email.');
      if (res.previewOtp) setDev2FAOtp(res.previewOtp);
    } else {
      setTwoFactorError(res.message);
    }
  };

  const handleConfirm2FAActivation = async (e) => {
    e.preventDefault();
    if (!twoFactorActivationOtp.trim() || twoFactorActivationOtp.trim().length < 6) {
      setTwoFactorError('Please enter the 6-digit confirmation code.');
      return;
    }

    setIsSubmitting2FA(true);
    setTwoFactorError('');
    setTwoFactorSuccess('');

    const res = await toggle2FA({
      enable: true,
      otp: twoFactorActivationOtp.trim(),
    });

    setIsSubmitting2FA(false);

    if (res.success) {
      setTwoFactorSuccess('Two-factor authentication is now active on your account!');
      setTwoFactorStage('idle');
      setTwoFactorActivationOtp('');
      setDev2FAOtp(null);
    } else {
      setTwoFactorError(res.message);
    }
  };

  const handleConfirm2FADisable = async (e) => {
    e.preventDefault();
    if (!twoFactorDisablePassword) {
      setTwoFactorError('Please enter your current password to disable 2FA.');
      return;
    }

    setIsSubmitting2FA(true);
    setTwoFactorError('');
    setTwoFactorSuccess('');

    const res = await toggle2FA({
      enable: false,
      password: twoFactorDisablePassword,
    });

    setIsSubmitting2FA(false);

    if (res.success) {
      setTwoFactorSuccess('Two-factor authentication has been disabled.');
      setTwoFactorStage('idle');
      setTwoFactorDisablePassword('');
    } else {
      setTwoFactorError(res.message);
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
            <span>Security & 2FA</span>
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
              {activeTab === 'security' ? 'Security & Two-Factor Authentication' : activeTab}
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

            {/* SECURITY & 2FA */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* 2FA SECTION */}
                <div className="p-4 rounded border border-surface-light-border dark:border-surface-dark-border bg-surface-light-subtle/50 dark:bg-surface-dark-subtle/50 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text">
                          Two-Factor Authentication (2FA)
                        </span>
                        {user?.twoFactorEnabled ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-semibold border border-emerald-500/20 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Enabled
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-400 text-[10px] font-medium border border-zinc-500/20">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted leading-relaxed">
                        {user?.twoFactorEnabled
                          ? 'Your workspace is secured. A 6-digit code sent to your email is required at login.'
                          : 'Require a 6-digit email security code whenever you sign in.'}
                      </p>
                    </div>

                    {twoFactorStage === 'idle' && (
                      <button
                        type="button"
                        onClick={
                          user?.twoFactorEnabled
                            ? () => setTwoFactorStage('deactivating')
                            : handleStart2FAActivation
                        }
                        disabled={isSubmitting2FA}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors shadow-fine flex items-center gap-1.5 flex-shrink-0 ${
                          user?.twoFactorEnabled
                            ? 'bg-surface-light-panel dark:bg-surface-dark-panel border border-rose-500/40 text-rose-500 hover:bg-rose-500/10'
                            : 'bg-brand-500 text-white hover:bg-brand-600'
                        }`}
                      >
                        {isSubmitting2FA && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>{user?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}</span>
                      </button>
                    )}
                  </div>

                  {twoFactorSuccess && (
                    <div className="p-2 text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{twoFactorSuccess}</span>
                    </div>
                  )}

                  {twoFactorError && (
                    <div className="p-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded">
                      {twoFactorError}
                    </div>
                  )}

                  {/* Dev Code Quick Fill */}
                  {dev2FAOtp && twoFactorStage === 'activating' && (
                    <div
                      onClick={() => setTwoFactorActivationOtp(dev2FAOtp)}
                      className="p-2 rounded bg-surface-light-panel dark:bg-surface-dark-panel border border-brand-500/40 text-xs flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted">
                        Dev 2FA Code: <strong className="text-brand-500 font-mono">{dev2FAOtp}</strong>
                      </span>
                      <span className="text-[10px] text-brand-500 font-medium">Click to fill</span>
                    </div>
                  )}

                  {/* ACTIVATING 2FA STEP */}
                  {twoFactorStage === 'activating' && (
                    <form onSubmit={handleConfirm2FAActivation} className="space-y-3 pt-2 border-t border-surface-light-border dark:border-surface-dark-border">
                      <div>
                        <label className="block text-xs font-semibold text-surface-light-text dark:text-surface-dark-text mb-1">
                          Enter 6-Digit Confirmation Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={twoFactorActivationOtp}
                          onChange={(e) => setTwoFactorActivationOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="••••••"
                          autoFocus
                          required
                          className="w-full text-center font-mono tracking-widest px-3 py-2 text-sm bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-brand-500 font-bold"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTwoFactorStage('idle');
                            setTwoFactorError('');
                            setDev2FAOtp(null);
                          }}
                          className="px-3 py-1.5 text-xs text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting2FA || twoFactorActivationOtp.length < 6}
                          className="px-3.5 py-1.5 text-xs bg-brand-500 text-white rounded font-medium hover:bg-brand-600 transition-colors shadow-fine flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isSubmitting2FA && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>Confirm & Activate 2FA</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* DEACTIVATING 2FA STEP */}
                  {twoFactorStage === 'deactivating' && (
                    <form onSubmit={handleConfirm2FADisable} className="space-y-3 pt-2 border-t border-surface-light-border dark:border-surface-dark-border">
                      <div>
                        <label className="block text-xs font-semibold text-surface-light-text dark:text-surface-dark-text mb-1">
                          Enter Account Password to Confirm Deactivation
                        </label>
                        <input
                          type="password"
                          value={twoFactorDisablePassword}
                          onChange={(e) => setTwoFactorDisablePassword(e.target.value)}
                          placeholder="Current password"
                          autoFocus
                          required
                          className="w-full px-3 py-2 text-xs bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTwoFactorStage('idle');
                            setTwoFactorError('');
                          }}
                          className="px-3 py-1.5 text-xs text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting2FA || !twoFactorDisablePassword}
                          className="px-3.5 py-1.5 text-xs bg-rose-500 text-white rounded font-medium hover:bg-rose-600 transition-colors shadow-fine flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isSubmitting2FA && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>Disable 2FA</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* CHANGE PASSWORD FORM */}
                <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
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
              </div>
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
