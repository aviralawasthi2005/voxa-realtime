import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Eye, EyeOff, Loader2, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setFormError('Please fill in both email/username and password.');
      return;
    }

    setFormError('');
    const res = await login(identifier.trim(), password);
    if (res.success) {
      navigate('/app');
    } else {
      setFormError(res.message);
    }
  };

  const handleQuickFill = async (email) => {
    setIdentifier(email);
    setPassword('password123');
    setFormError('');
    const res = await login(email, 'password123');
    if (res.success) {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-surface-light-bg dark:bg-surface-dark-bg text-surface-light-text dark:text-surface-dark-text select-none">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-brand-500 text-white flex items-center justify-center font-display font-black text-sm shadow-fine">
              V
            </div>
            <span className="font-display font-bold text-xl tracking-tight">VOXA</span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
            Sign in to your workspace
          </h2>
          <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted mt-1">
            Real-time communication for distributed teams.
          </p>
        </div>

        {/* Quick Demo Pre-seed Pill Bar */}
        <div className="p-3 rounded border border-surface-light-border dark:border-surface-dark-border bg-surface-light-panel dark:bg-surface-dark-panel text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-brand-500 font-semibold font-display text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Accounts (Click to login)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('alex@voxa.com')}
              className="p-1.5 rounded bg-surface-light-subtle dark:bg-surface-dark-subtle hover:bg-brand-500 hover:text-white transition-colors text-left"
            >
              <div className="font-medium truncate">Alex Johnson</div>
              <div className="text-[10px] text-surface-light-textSubtle dark:text-surface-dark-textSubtle truncate">
                alex@voxa.com
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('sarah@voxa.com')}
              className="p-1.5 rounded bg-surface-light-subtle dark:bg-surface-dark-subtle hover:bg-brand-500 hover:text-white transition-colors text-left"
            >
              <div className="font-medium truncate">Sarah Miller</div>
              <div className="text-[10px] text-surface-light-textSubtle dark:text-surface-dark-textSubtle truncate">
                sarah@voxa.com
              </div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
              Email or Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="alex@voxa.com or alexj"
              required
              className="w-full px-3 py-2 text-xs bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text placeholder-surface-light-textSubtle dark:placeholder-surface-dark-textSubtle"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-brand-500 hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 text-xs bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text placeholder-surface-light-textSubtle dark:placeholder-surface-dark-textSubtle pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-brand-500 text-white rounded text-xs font-semibold hover:bg-brand-600 transition-colors shadow-fine flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-brand-500 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
