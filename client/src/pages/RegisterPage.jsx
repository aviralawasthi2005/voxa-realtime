import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    setFormError('');
    const res = await register(formData);
    if (res.success) {
      navigate('/app');
    } else {
      setFormError(res.message);
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
            Create your account
          </h2>
          <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted mt-1">
            Join the real-time communication platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {formError && (
            <div className="p-2.5 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Elena Rostova"
              required
              className="w-full px-3 py-2 text-xs bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text placeholder-surface-light-textSubtle dark:placeholder-surface-dark-textSubtle"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="elenar"
              required
              pattern="[a-zA-Z0-9_]{3,30}"
              title="3-30 characters, alphanumeric and underscore only"
              className="w-full px-3 py-2 text-xs bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text placeholder-surface-light-textSubtle dark:placeholder-surface-dark-textSubtle"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="elena@example.com"
              required
              className="w-full px-3 py-2 text-xs bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text placeholder-surface-light-textSubtle dark:placeholder-surface-dark-textSubtle"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="•••••••• (at least 6 characters)"
                required
                minLength={6}
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

          <div>
            <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 text-xs bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text placeholder-surface-light-textSubtle dark:placeholder-surface-dark-textSubtle"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-brand-500 text-white rounded text-xs font-semibold hover:bg-brand-600 transition-colors shadow-fine flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted">
          Already registered?{' '}
          <Link to="/login" className="text-brand-500 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
