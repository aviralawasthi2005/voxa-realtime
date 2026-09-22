import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  KeyRound,
  AlertCircle,
} from 'lucide-react';

export const LoginPage = () => {
  const [step, setStep] = useState('credentials'); // 'credentials' | '2fa' | 'unverified'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // 2FA state
  const [twoFactorOtp, setTwoFactorOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [previewOtp, setPreviewOtp] = useState(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Unverified account state
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const {
    login,
    verify2FA,
    resend2FA,
    verifyOtp,
    resendOtp,
    isLoading,
  } = useAuthStore();
  const navigate = useNavigate();

  // 2FA Resend Countdown
  useEffect(() => {
    let interval = null;
    if (step === '2fa' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setFormError('Please fill in both email/username and password.');
      return;
    }

    setFormError('');
    const res = await login(identifier.trim(), password);

    if (res.success) {
      if (res.requires2FA) {
        setStep('2fa');
        setTempToken(res.tempToken);
        setUserEmail(res.email);
        setPreviewOtp(res.previewOtp || null);
        setResendTimer(60);
        setCanResend(false);
      } else {
        navigate('/app');
      }
    } else {
      if (res.requiresVerification) {
        setUnverifiedEmail(res.email || identifier);
        setPreviewOtp(res.previewOtp || null);
        setStep('unverified');
      } else {
        setFormError(res.message);
      }
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    if (!twoFactorOtp.trim() || twoFactorOtp.trim().length < 6) {
      setFormError('Please enter the 6-digit security code.');
      return;
    }

    setFormError('');
    const res = await verify2FA(tempToken, twoFactorOtp.trim());
    if (res.success) {
      navigate('/app');
    } else {
      setFormError(res.message);
    }
  };

  const handleResend2FA = async () => {
    if (!canResend) return;
    setFormError('');
    setStatusMessage('Dispatching new 2FA code...');

    const res = await resend2FA(tempToken);
    if (res.success) {
      setStatusMessage('A fresh 2FA code has been sent to your email.');
      if (res.previewOtp) setPreviewOtp(res.previewOtp);
      setResendTimer(60);
      setCanResend(false);
    } else {
      setFormError(res.message);
    }
  };

  const handleVerifyAccountOtp = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim() || verificationCode.trim().length < 6) {
      setFormError('Please enter the 6-digit code sent to your email.');
      return;
    }

    setFormError('');
    const res = await verifyOtp(unverifiedEmail, verificationCode.trim());
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
      if (res.requires2FA) {
        setStep('2fa');
        setTempToken(res.tempToken);
        setUserEmail(res.email);
        setPreviewOtp(res.previewOtp || null);
        setResendTimer(60);
        setCanResend(false);
      } else {
        navigate('/app');
      }
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
            {step === 'credentials' && 'Sign in to your workspace'}
            {step === '2fa' && 'Two-Factor Authentication'}
            {step === 'unverified' && 'Verify your account'}
          </h2>
          <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted mt-1">
            {step === 'credentials' && 'Real-time communication for distributed teams.'}
            {step === '2fa' && `Enter the 6-digit security code sent to ${userEmail}`}
            {step === 'unverified' && `Complete email verification for ${unverifiedEmail}`}
          </p>
        </div>

        {/* STEP 1: CREDENTIALS */}
        {step === 'credentials' && (
          <>
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
          </>
        )}

        {/* STEP 2: 2FA CHALLENGE */}
        {step === '2fa' && (
          <form onSubmit={handle2FASubmit} className="space-y-4">
            <div className="p-3 rounded bg-brand-500/10 border border-brand-500/20 text-brand-500 flex items-center gap-2.5 text-xs">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span>Two-factor authentication is active on this account. Enter the 6-digit code sent to your email.</span>
            </div>

            {formError && (
              <div className="p-2.5 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded">
                {formError}
              </div>
            )}

            {statusMessage && (
              <div className="p-2.5 text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded">
                {statusMessage}
              </div>
            )}

            {previewOtp && (
              <div
                onClick={() => setTwoFactorOtp(previewOtp)}
                className="p-2 rounded bg-surface-light-subtle dark:bg-surface-dark-panel border border-brand-500/40 text-xs flex items-center justify-between cursor-pointer hover:bg-brand-500/5 transition-colors"
                title="Click to auto-fill development 2FA code"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-brand-500" />
                  <span className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted">
                    Dev 2FA Code: <strong className="text-brand-500 font-mono tracking-wider">{previewOtp}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-brand-500 font-medium">Click to fill</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1.5 text-center">
                6-Digit Security Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={twoFactorOtp}
                onChange={(e) => setTwoFactorOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••••"
                autoFocus
                required
                className="w-full text-center text-2xl font-mono tracking-[0.4em] py-3 bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-brand-500 font-bold placeholder-surface-light-textSubtle dark:placeholder-surface-dark-textSubtle"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || twoFactorOtp.length < 6}
              className="w-full py-2.5 px-4 bg-brand-500 text-white rounded text-xs font-semibold hover:bg-brand-600 transition-colors shadow-fine flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Verify & Access Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={handleResend2FA}
                disabled={!canResend}
                className={`flex items-center gap-1 font-medium ${
                  canResend
                    ? 'text-brand-500 hover:underline'
                    : 'text-surface-light-textSubtle dark:text-surface-dark-textSubtle cursor-not-allowed'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${!canResend && 'opacity-60'}`} />
                <span>{canResend ? 'Resend 2FA code' : `Resend in ${resendTimer}s`}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: UNVERIFIED ACCOUNT RECOVERY */}
        {step === 'unverified' && (
          <form onSubmit={handleVerifyAccountOtp} className="space-y-4">
            <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center gap-2.5 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>Your account requires email verification before signing in. We've sent a 6-digit code.</span>
            </div>

            {formError && (
              <div className="p-2.5 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded">
                {formError}
              </div>
            )}

            {previewOtp && (
              <div
                onClick={() => setVerificationCode(previewOtp)}
                className="p-2 rounded bg-surface-light-subtle dark:bg-surface-dark-panel border border-brand-500/40 text-xs flex items-center justify-between cursor-pointer hover:bg-brand-500/5 transition-colors"
                title="Click to auto-fill development code"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-brand-500" />
                  <span className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted">
                    Dev Code: <strong className="text-brand-500 font-mono tracking-wider">{previewOtp}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-brand-500 font-medium">Click to fill</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1.5 text-center">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••••"
                autoFocus
                required
                className="w-full text-center text-2xl font-mono tracking-[0.4em] py-3 bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-brand-500 font-bold placeholder-surface-light-textSubtle dark:placeholder-surface-dark-textSubtle"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || verificationCode.length < 6}
              className="w-full py-2.5 px-4 bg-brand-500 text-white rounded text-xs font-semibold hover:bg-brand-600 transition-colors shadow-fine flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Verify Email & Log In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="text-xs text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text"
              >
                Back to sign in
              </button>
            </div>
          </form>
        )}

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
