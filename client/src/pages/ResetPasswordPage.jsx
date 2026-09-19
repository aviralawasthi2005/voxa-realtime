import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Loader2, Check } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const qEmail = searchParams.get('email');
    const qToken = searchParams.get('token');
    if (qEmail) setEmail(qEmail);
    if (qToken) setResetToken(qToken);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await api.post('/auth/reset-password', {
        email,
        resetToken,
        newPassword,
      });
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-surface-light-bg dark:bg-surface-dark-bg text-surface-light-text dark:text-surface-dark-text select-none">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-brand-500 text-white flex items-center justify-center font-display font-black text-sm shadow-fine">
              V
            </div>
            <span className="font-display font-bold text-xl tracking-tight">VOXA</span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
            Create new password
          </h2>
          <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted mt-1">
            Choose a strong password for your account.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-4 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs space-y-2 text-center">
            <Check className="w-6 h-6 mx-auto" />
            <p className="font-semibold">Password reset successfully!</p>
            <p className="text-surface-light-textMuted dark:text-surface-dark-textMuted">
              Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-2.5 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
                Account Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@voxa.com"
                required
                className="w-full px-3 py-2 text-xs bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
                Reset Token
              </label>
              <input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Paste token if provided"
                className="w-full px-3 py-2 text-xs bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text font-mono text-[11px]"
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
                placeholder="•••••••• (min 6 characters)"
                required
                minLength={6}
                className="w-full px-3 py-2 text-xs bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text"
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
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 text-xs bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-brand-500 text-white rounded text-xs font-semibold hover:bg-brand-600 transition-colors shadow-fine flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Reset Password & Log In</span>
              )}
            </button>
          </form>
        )}

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted hover:text-surface-light-text dark:hover:text-surface-dark-text transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
