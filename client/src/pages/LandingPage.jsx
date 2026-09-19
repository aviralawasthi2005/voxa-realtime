import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  MessageSquare,
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
  Lock,
  Radio,
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const handleQuickDemo = async (email) => {
    const res = await login(email, 'password123');
    if (res.success) {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-light-bg dark:bg-surface-dark-bg text-surface-light-text dark:text-surface-dark-text transition-colors">
      {/* Top Editorial Nav */}
      <header className="border-b border-surface-light-border dark:border-surface-dark-border px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-brand-500 text-white flex items-center justify-center font-display font-black text-base shadow-fine">
            V
          </div>
          <span className="font-display font-bold text-lg tracking-tight">VOXA</span>
        </div>

        <nav className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <Link
              to="/app"
              className="px-4 py-2 bg-brand-500 text-white rounded text-xs font-semibold hover:bg-brand-600 transition-colors shadow-fine flex items-center gap-1.5"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-medium text-surface-light-textMuted dark:text-surface-dark-textMuted hover:text-surface-light-text dark:hover:text-surface-dark-text transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-brand-500 text-white rounded text-xs font-semibold hover:bg-brand-600 transition-colors shadow-fine flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-16 sm:pt-24 pb-16 max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-surface-light-border dark:border-surface-dark-border bg-surface-light-panel dark:bg-surface-dark-panel text-[11px] font-mono mb-6 text-brand-500">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>REAL-TIME ENGINE · WEBSOCKET PROTOCOL</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tightest leading-[1.08] max-w-3xl text-surface-light-text dark:text-surface-dark-text">
          Conversations that stay in motion.
        </h1>

        <p className="mt-6 text-sm sm:text-base text-surface-light-textMuted dark:text-surface-dark-textMuted max-w-xl leading-relaxed">
          VOXA is a communication workspace engineered with editorial restraint. Zero cluttered bubble spam, instant socket presence, and tactile real-time synchronization.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="px-5 py-3 bg-brand-500 text-white rounded text-xs sm:text-sm font-semibold hover:bg-brand-600 transition-all shadow-float flex items-center gap-2"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => handleQuickDemo('alex@voxa.com')}
            className="px-5 py-3 bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded text-xs sm:text-sm font-medium hover:border-brand-500 transition-all"
          >
            Launch Demo as Alex
          </button>

          <button
            onClick={() => handleQuickDemo('sarah@voxa.com')}
            className="px-5 py-3 bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded text-xs sm:text-sm font-medium hover:border-brand-500 transition-all text-surface-light-textMuted dark:text-surface-dark-textMuted"
          >
            Launch Demo as Sarah
          </button>
        </div>
      </section>

      {/* Realistic Product Interface Mockup Preview */}
      <section className="px-4 sm:px-6 pb-24 max-w-6xl mx-auto w-full">
        <div className="rounded-lg border border-surface-light-border dark:border-surface-dark-border bg-surface-light-panel dark:bg-surface-dark-subtle shadow-modal overflow-hidden">
          {/* Top Window chrome */}
          <div className="px-4 py-2.5 bg-surface-light-subtle dark:bg-surface-dark-bg border-b border-surface-light-border dark:border-surface-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] font-mono text-surface-light-textSubtle dark:text-surface-dark-textSubtle ml-2">
                voxa.workspace // core-channel
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-500 font-medium">100% SYNCED</span>
            </div>
          </div>

          {/* Inner UI Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
            {/* Conversations list column */}
            <div className="hidden md:block md:col-span-4 border-r border-surface-light-border dark:border-surface-dark-border p-3 space-y-1.5 bg-surface-light-subtle/50 dark:bg-surface-dark-panel/40">
              <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-surface-light-textSubtle dark:text-surface-dark-textSubtle">
                Active Channels
              </div>

              <div className="p-2.5 rounded bg-surface-light-panel dark:bg-surface-dark-panel border-l-2 border-brand-500 shadow-fine">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold font-display">Design & Architecture Core</span>
                  <span className="text-[10px] font-mono text-surface-light-textSubtle dark:text-surface-dark-textSubtle">14:20</span>
                </div>
                <p className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted truncate mt-0.5">
                  Sarah: Live presence updates are syncing instantly...
                </p>
              </div>

              <div className="p-2.5 rounded hover:bg-surface-light-panel/60 dark:hover:bg-surface-dark-panel/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Sarah Miller</span>
                  <span className="text-[10px] font-mono text-surface-light-textSubtle dark:text-surface-dark-textSubtle">14:15</span>
                </div>
                <p className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted truncate mt-0.5">
                  Incredible. Let us make sure the typing indicator...
                </p>
              </div>

              <div className="p-2.5 rounded hover:bg-surface-light-panel/60 dark:hover:bg-surface-dark-panel/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Marcus Chen</span>
                  <span className="text-[10px] font-mono text-surface-light-textSubtle dark:text-surface-dark-textSubtle">12:30</span>
                </div>
                <p className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted truncate mt-0.5">
                  Space Grotesk on the titles adds serious character.
                </p>
              </div>
            </div>

            {/* Main Chat timeline preview */}
            <div className="col-span-1 md:col-span-8 flex flex-col justify-between p-4 sm:p-6 bg-surface-light-bg dark:bg-surface-dark-bg">
              <div className="space-y-4">
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-[1px] bg-surface-light-border dark:border-surface-dark-border" />
                  <span className="text-[10px] font-mono tracking-widest text-surface-light-textSubtle dark:text-surface-dark-textSubtle">
                    TODAY
                  </span>
                  <div className="flex-1 h-[1px] bg-surface-light-border dark:border-surface-dark-border" />
                </div>

                <div className="flex flex-col items-start max-w-[80%]">
                  <span className="text-[11px] font-semibold font-display mb-1">Elena Rostova</span>
                  <div className="p-3 bg-surface-light-panel dark:bg-surface-dark-subtle border border-surface-light-border dark:border-surface-dark-border rounded text-xs leading-relaxed shadow-fine">
                    Notice how comfortable the compact message spacing is for long discussions. No oversized bubble padding.
                    <div className="text-[10px] font-mono text-surface-light-textSubtle dark:text-surface-dark-textSubtle text-right mt-1">
                      14:18
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end max-w-[80%] ml-auto">
                  <div className="p-3 bg-surface-light-subtle dark:bg-[#1E222B] border border-surface-light-border dark:border-surface-dark-border rounded text-xs leading-relaxed">
                    And the dark theme obsidian palette is gentle on the eyes late at night.
                    <div className="text-[10px] font-mono text-surface-light-textSubtle dark:text-surface-dark-textSubtle text-right mt-1 flex items-center justify-end gap-1">
                      <span>14:19</span>
                      <CheckCircle2 className="w-3 h-3 text-brand-500 inline" />
                    </div>
                  </div>
                  <div className="flex gap-1 mt-1">
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full border border-surface-light-border dark:border-surface-dark-border bg-surface-light-panel dark:bg-surface-dark-panel">
                      🖤 1
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full border border-surface-light-border dark:border-surface-dark-border bg-surface-light-panel dark:bg-surface-dark-panel">
                      ⚡ 2
                    </span>
                  </div>
                </div>

                {/* Simulated typing indicator */}
                <div className="flex items-center gap-1.5 text-xs text-brand-500 font-medium pt-2">
                  <span>Sarah is typing</span>
                  <span className="flex items-center gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-brand-500 animate-typing-1" />
                    <span className="w-1 h-1 rounded-full bg-brand-500 animate-typing-2" />
                    <span className="w-1 h-1 rounded-full bg-brand-500 animate-typing-3" />
                  </span>
                </div>
              </div>

              {/* Mock Composer */}
              <div className="mt-6 flex items-center gap-2 p-2 bg-surface-light-panel dark:bg-surface-dark-subtle border border-surface-light-border dark:border-surface-dark-border rounded">
                <input
                  type="text"
                  disabled
                  placeholder="Type a message or press Ctrl+K to search..."
                  className="bg-transparent text-xs text-surface-light-text dark:text-surface-dark-text w-full focus:outline-none"
                />
                <button
                  onClick={() => handleQuickDemo('alex@voxa.com')}
                  className="px-3 py-1 bg-brand-500 text-white rounded text-xs font-semibold hover:bg-brand-600 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="px-6 py-16 max-w-6xl mx-auto border-t border-surface-light-border dark:border-surface-dark-border w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded bg-brand-500/10 text-brand-500 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold font-display">Sub-100ms Latency</h3>
            <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted leading-relaxed">
              Native WebSocket events for live typing, instant delivery ticks, and read state synchronization across all connected tabs.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded bg-brand-500/10 text-brand-500 flex items-center justify-center mb-3">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold font-display">Group Coordination</h3>
            <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted leading-relaxed">
              Create private project rooms, assign administrative controls, add or remove members seamlessly, and view shared media.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded bg-brand-500/10 text-brand-500 flex items-center justify-center mb-3">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold font-display">Security by Architecture</h3>
            <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted leading-relaxed">
              Bcrypt salted password hashing, stateless JWT authorization, HTTP-only guards, and sanitized payloads at every boundary.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-surface-light-border dark:border-surface-dark-border px-6 py-8 text-center text-xs text-surface-light-textSubtle dark:text-surface-dark-textSubtle max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm text-surface-light-text dark:text-surface-dark-text">VOXA</span>
          <span>· Real-time messaging platform</span>
        </div>
        <p className="font-mono text-[11px]">Designed with human editorial precision.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
