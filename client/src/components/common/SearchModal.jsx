import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import api from '../../services/api';
import Avatar from './Avatar';
import { Search, Users, MessageSquare, Hash, X, ArrowRight, Loader2 } from 'lucide-react';

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ people: [], groups: [], messages: [] });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const { createDirectChat, selectConversation } = useChatStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ people: [], groups: [], messages: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ people: [], groups: [], messages: [] });
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
        setResults(res.data.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Global shortcut Ctrl+K / Cmd+K handled in parent or here
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectPerson = async (user) => {
    await createDirectChat(user._id);
    onClose();
  };

  const handleSelectGroup = async (group) => {
    await selectConversation(group);
    onClose();
  };

  const handleSelectMessage = async (msg) => {
    await selectConversation(msg.conversation._id);
    onClose();
  };

  const hasResults =
    results.people.length > 0 || results.groups.length > 0 || results.messages.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded-lg shadow-modal overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header bar */}
        <div className="p-4 border-b border-surface-light-border dark:border-surface-dark-border flex items-center gap-3">
          <Search className="w-5 h-5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, conversations, or messages..."
            className="w-full bg-transparent text-surface-light-text dark:text-surface-dark-text placeholder-surface-light-textSubtle dark:placeholder-surface-dark-textSubtle text-sm focus:outline-none"
          />
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-brand-500" />}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono border border-surface-light-border dark:border-surface-dark-border text-surface-light-textSubtle dark:text-surface-dark-textSubtle rounded">
            ESC
          </span>
        </div>

        {/* Search body */}
        <div className="p-2 overflow-y-auto flex-1 space-y-4">
          {!query && (
            <div className="py-12 text-center text-surface-light-textSubtle dark:text-surface-dark-textSubtle text-xs">
              Type at least 2 characters to search across VOXA.
            </div>
          )}

          {query && !isLoading && !hasResults && (
            <div className="py-12 text-center text-surface-light-textSubtle dark:text-surface-dark-textSubtle text-xs">
              No results found for "<span className="text-surface-light-text dark:text-surface-dark-text font-medium">{query}</span>"
            </div>
          )}

          {/* People Section */}
          {results.people.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-display font-semibold uppercase tracking-wider text-surface-light-textSubtle dark:text-surface-dark-textSubtle">
                People
              </div>
              <div className="space-y-0.5">
                {results.people.map((person) => (
                  <button
                    key={person._id}
                    onClick={() => handleSelectPerson(person)}
                    className="w-full flex items-center justify-between p-2.5 rounded hover:bg-surface-light-subtle dark:hover:bg-surface-dark-subtle text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={person.avatar}
                        name={person.name}
                        size="sm"
                        isOnline={person.status === 'online'}
                        showStatus={true}
                      />
                      <div>
                        <div className="text-xs font-semibold text-surface-light-text dark:text-surface-dark-text">
                          {person.name}
                        </div>
                        <div className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted">
                          @{person.username} · {person.bio || 'VOXA member'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle group-hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Groups Section */}
          {results.groups.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-display font-semibold uppercase tracking-wider text-surface-light-textSubtle dark:text-surface-dark-textSubtle">
                Groups
              </div>
              <div className="space-y-0.5">
                {results.groups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => handleSelectGroup(group)}
                    className="w-full flex items-center justify-between p-2.5 rounded hover:bg-surface-light-subtle dark:hover:bg-surface-dark-subtle text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-surface-light-text dark:text-surface-dark-text">
                          {group.name}
                        </div>
                        <div className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted">
                          {group.participants?.length || 0} members · {group.description || 'Group chat'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle group-hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Section */}
          {results.messages.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-display font-semibold uppercase tracking-wider text-surface-light-textSubtle dark:text-surface-dark-textSubtle">
                Messages
              </div>
              <div className="space-y-0.5">
                {results.messages.map((msg) => (
                  <button
                    key={msg._id}
                    onClick={() => handleSelectMessage(msg)}
                    className="w-full flex items-start justify-between p-2.5 rounded hover:bg-surface-light-subtle dark:hover:bg-surface-dark-subtle text-left transition-colors group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-surface-light-subtle dark:bg-surface-dark-subtle text-surface-light-textSubtle dark:text-surface-dark-textSubtle flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-surface-light-text dark:text-surface-dark-text">
                            {msg.sender?.name}
                          </span>
                          <span className="text-[10px] text-surface-light-textSubtle dark:text-surface-dark-textSubtle">
                            in {msg.conversation?.isGroup ? msg.conversation.name : 'direct chat'}
                          </span>
                        </div>
                        <p className="text-xs text-surface-light-textMuted dark:text-surface-dark-textMuted truncate mt-0.5">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle group-hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2 mt-1" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
