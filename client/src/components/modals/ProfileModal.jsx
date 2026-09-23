import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Avatar from '../common/Avatar';
import api from '../../services/api';
import { User, X, Camera, Loader2, Check } from 'lucide-react';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [status, setStatus] = useState(user?.status || 'online');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      setStatus(user.status || 'online');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await updateProfile({ avatar: res.data.data.avatarUrl });
      setSuccessMessage('Avatar updated successfully.');
    } catch (err) {
      setErrorMessage('Failed to upload avatar.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await updateProfile({
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        status,
      });
      if (res.success) {
        setSuccessMessage('Profile saved.');
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save profile changes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-md bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded-lg shadow-modal overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-surface-light-border dark:border-surface-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold font-display text-surface-light-text dark:text-surface-dark-text">
              Personal Profile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {successMessage && (
            <div className="p-2.5 text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded">
              {errorMessage}
            </div>
          )}

          {/* Avatar center */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <Avatar src={user.avatar} name={user.name} size="2xl" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Change Avatar"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <p className="text-[11px] text-surface-light-textSubtle dark:text-surface-dark-textSubtle mt-2 font-mono">
              @{user.username} · {user.email}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface-light-subtle dark:bg-surface-dark-subtle border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
              Username Handle
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-surface-light-textSubtle dark:text-surface-dark-textSubtle select-none">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full pl-7 pr-3 py-2 text-xs font-mono bg-surface-light-subtle dark:bg-surface-dark-subtle border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text"
                placeholder="username"
                minLength={3}
                maxLength={30}
                required
              />
            </div>
            <p className="text-[10px] text-surface-light-textSubtle dark:text-surface-dark-textSubtle mt-1">
              3-30 characters: letters, numbers, and underscores. Used for @mentions and search.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
              Bio / Focus
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs bg-surface-light-subtle dark:bg-surface-dark-subtle border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold font-display text-surface-light-text dark:text-surface-dark-text mb-1">
              Availability Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface-light-subtle dark:bg-surface-dark-subtle border border-surface-light-border dark:border-surface-dark-border rounded focus-ring text-surface-light-text dark:text-surface-dark-text"
            >
              <option value="online">Online · Available</option>
              <option value="away">Away · Be right back</option>
              <option value="busy">Busy · In focus session</option>
              <option value="offline">Invisible / Offline</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs bg-brand-500 text-white rounded font-medium hover:bg-brand-600 transition-colors flex items-center gap-1.5 shadow-fine"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
