import React from 'react';

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

const dotSizeClasses = {
  xs: 'w-1.5 h-1.5 bottom-0 right-0 border',
  sm: 'w-2 h-2 bottom-0 right-0 border',
  md: 'w-2.5 h-2.5 bottom-0.5 right-0.5 border-[1.5px]',
  lg: 'w-3 h-3 bottom-0.5 right-0.5 border-2',
  xl: 'w-3.5 h-3.5 bottom-1 right-1 border-2',
  '2xl': 'w-4 h-4 bottom-1 right-1 border-2',
};

export const Avatar = ({
  src,
  name = 'User',
  size = 'md',
  isOnline = false,
  status = null, // 'online' | 'offline' | 'away' | 'busy'
  showStatus = false,
  className = '',
}) => {
  const resolvedOnline = status ? status === 'online' : isOnline;

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const getStatusColor = () => {
    if (status === 'away') return 'bg-amber-500';
    if (status === 'busy') return 'bg-rose-500';
    if (resolvedOnline) return 'bg-emerald-500';
    return 'bg-zinc-400 dark:bg-zinc-600';
  };

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover border border-surface-light-border dark:border-surface-dark-border`}
          onError={(e) => {
            // Fallback to text initials if image URL fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}

      <div
        style={{ display: src ? 'none' : 'flex' }}
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full bg-surface-light-subtle dark:bg-surface-dark-subtle border border-surface-light-border dark:border-surface-dark-border items-center justify-center font-display font-medium text-surface-light-text dark:text-surface-dark-text`}
      >
        {getInitials(name)}
      </div>

      {showStatus && (
        <span
          className={`absolute rounded-full border-surface-light-bg dark:border-surface-dark-bg ${getStatusColor()} ${
            dotSizeClasses[size] || dotSizeClasses.md
          } ${resolvedOnline ? 'presence-pulse' : ''}`}
          title={status || (resolvedOnline ? 'Online' : 'Offline')}
        />
      )}
    </div>
  );
};

export default Avatar;
