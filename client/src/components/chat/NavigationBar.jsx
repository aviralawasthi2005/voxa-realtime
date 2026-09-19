import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import Avatar from '../common/Avatar';
import {
  MessageSquare,
  Search,
  Bell,
  Settings,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';

export const NavigationBar = ({
  onOpenSearch,
  onOpenSettings,
  onOpenProfile,
  onOpenNotifications,
}) => {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const unreadNotifications = useNotificationStore((state) => state.unreadCount);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="w-14 sm:w-16 h-full flex flex-col items-center justify-between py-4 bg-surface-light-bg dark:bg-surface-dark-bg border-r border-surface-light-border dark:border-surface-dark-border flex-shrink-0 select-none z-30">
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center gap-6">
        <div className="w-9 h-9 rounded bg-brand-500 text-white flex items-center justify-center font-display font-black text-base shadow-fine">
          V
        </div>

        {/* Primary nav buttons */}
        <div className="flex flex-col items-center gap-2">
          <button
            className="p-2.5 rounded text-brand-500 bg-brand-500/10 transition-colors"
            title="Conversations"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenSearch}
            className="p-2.5 rounded text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel transition-colors"
            title="Search (Ctrl+K)"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-surface-light-bg dark:ring-surface-dark-bg" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text hover:bg-surface-light-subtle dark:hover:bg-surface-dark-panel transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={logout}
          className="p-2.5 rounded text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* User Profile Avatar */}
        <div
          onClick={onOpenProfile}
          className="pt-2 border-t border-surface-light-border dark:border-surface-dark-border cursor-pointer group"
          title="My Profile"
        >
          <Avatar
            src={user?.avatar}
            name={user?.name}
            size="sm"
            isOnline={user?.status === 'online'}
            showStatus={true}
            className="group-hover:scale-105 transition-transform"
          />
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
