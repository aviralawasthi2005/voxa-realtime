import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Loader2, Mail, Check } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMessage('');
    setSuccessInfo(null);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccessInfo(res.data.data);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to dispatch reset request.');
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
            Reset your password
          </h2>
          <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted mt-1">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        {successInfo ? (
          <div className="p-4 rounded border border-surface-light-border dark:border-surface-dark-border bg-surface-light-panel dark:bg-surface-dark-panel space-y-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-500 font-semibold">
              <Check className="w-4 h-4" />
              <span>Reset instructions issued</span>
            </div>
            <p className="text-surface-light-textMuted dark:text-surface-dark-textMuted">
              {successInfo.hint}
            </p>
            <div className="p-2 bg-surface-light-subtle dark:bg-surface-dark-subtle rounded font-mono text-[10px] break-all border border-surface-light-border dark:border-surface-dark-border">
              Token: {successInfo.resetToken}
            </div>
            <Link
              to={`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(
                successInfo.resetToken
              )}`}
              className="block w-full py-2 bg-brand-500 text-white text-center rounded font-semibold hover:bg-brand-600 transition-colors"
            >
              Continue to Reset Form
            </Link>
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
                className="w-full px-3 py-2 text-xs bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text placeholder-surface-light-textSubtle dark:placeholder-surface-dark-textSubtle"
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
                <span>Send Recovery Instructions</span>
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

export default ForgotPasswordPage;
