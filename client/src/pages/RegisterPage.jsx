import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  MailCheck,
  RefreshCw,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';

export const RegisterPage = () => {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [previewOtp, setPreviewOtp] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const { register, verifyOtp, resendOtp, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegisterSubmit = async (e) => {
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
      if (res.requiresVerification) {
        setPendingEmail(res.email || formData.email);
        setPreviewOtp(res.previewOtp || null);
        setStep('otp');
        setResendTimer(60);
        setCanResend(false);
      } else {
        navigate('/app');
      }
    } else {
      setFormError(res.message);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      setFormError('Please enter the 6-digit code sent to your email.');
      return;
    }

    setFormError('');
    const res = await verifyOtp(pendingEmail, otp.trim());
    if (res.success) {
      navigate('/app');
    } else {
      setFormError(res.message);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setFormError('');
    setStatusMessage('Dispatching new verification code...');

    const res = await resendOtp(pendingEmail);
    if (res.success) {
      setStatusMessage('A fresh verification code has been dispatched to your email.');
      if (res.previewOtp) {
        setPreviewOtp(res.previewOtp);
      }
      setResendTimer(60);
      setCanResend(false);
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-surface-light-bg dark:bg-surface-dark-bg text-surface-light-text dark:text-surface-dark-text select-none">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-brand-500 text-white flex items-center justify-center font-display font-black text-sm shadow-fine">
              V
            </div>
            <span className="font-display font-bold text-xl tracking-tight">VOXA</span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
            {step === 'form' ? 'Create your account' : 'Verify your email'}
          </h2>
          <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted mt-1">
            {step === 'form'
              ? 'Join the real-time communication platform.'
              : `Enter the 6-digit code sent to ${pendingEmail}`}
          </p>
        </div>

        {/* STEP 1: REGISTRATION FORM */}
        {step === 'form' ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
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
                  <span>Create Account & Send Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: 6-DIGIT EMAIL OTP VERIFICATION */
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            {formError && (
              <div className="p-2.5 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded">
                {formError}
              </div>
            )}

            {statusMessage && (
              <div className="p-2.5 text-xs text-brand-500 bg-brand-500/10 border border-brand-500/20 rounded flex items-center gap-2">
                <MailCheck className="w-4 h-4" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* In-development quick fill helper */}
            {previewOtp && (
              <div
                onClick={() => setOtp(previewOtp)}
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
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••••"
                autoFocus
                required
                className="w-full text-center text-2xl font-mono tracking-[0.4em] py-3 bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-brand-500 font-bold placeholder-surface-light-textSubtle dark:placeholder-surface-dark-textSubtle"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="w-full py-2.5 px-4 bg-brand-500 text-white rounded text-xs font-semibold hover:bg-brand-600 transition-colors shadow-fine flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Verify & Enter Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit details</span>
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className={`flex items-center gap-1 font-medium ${
                  canResend
                    ? 'text-brand-500 hover:underline'
                    : 'text-surface-light-textSubtle dark:text-surface-dark-textSubtle cursor-not-allowed'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${!canResend && 'opacity-60'}`} />
                <span>{canResend ? 'Resend code' : `Resend in ${resendTimer}s`}</span>
              </button>
            </div>
          </form>
        )}

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
