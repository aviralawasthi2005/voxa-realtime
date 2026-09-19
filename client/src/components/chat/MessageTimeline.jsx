import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import Avatar from '../common/Avatar';
import {
  Check,
  CheckCheck,
  Clock,
  Reply,
  Smile,
  Trash2,
  Download,
  FileText,
} from 'lucide-react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '⚡', '😂', '👏'];

export const MessageTimeline = ({ searchQuery = '' }) => {
  const { messages, isLoadingMessages, reactToMessage, setReplyingTo } = useChatStore();
  const currentUser = useAuthStore((state) => state.user);

  const scrollRef = useRef(null);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const renderStatus = (msg) => {
    if (msg.sender?._id !== currentUser?._id) return null;

    if (msg.status === 'read' || (msg.readBy && msg.readBy.length > 1)) {
      return <CheckCheck className="w-3.5 h-3.5 text-brand-500 inline ml-1" title="Read" />;
    }
    if (msg.status === 'delivered' || (msg.deliveredTo && msg.deliveredTo.length > 1)) {
      return (
        <CheckCheck
          className="w-3.5 h-3.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle inline ml-1"
          title="Delivered"
        />
      );
    }
    if (msg.status === 'sent') {
      return (
        <Check
          className="w-3.5 h-3.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle inline ml-1"
          title="Sent"
        />
      );
    }
    return <Clock className="w-3 h-3 text-amber-500 inline ml-1" title="Sending..." />;
  };

  const formatDateDivider = (date) => {
    if (isToday(date)) return 'TODAY';
    if (isYesterday(date)) return 'YESTERDAY';
    return format(date, 'MMMM d, yyyy').toUpperCase();
  };

  if (isLoadingMessages && messages.length === 0) {
    return (
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="flex items-start gap-3 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-surface-light-subtle dark:bg-surface-dark-panel" />
          <div className="space-y-1.5 flex-1 max-w-sm">
            <div className="h-3 w-20 bg-surface-light-subtle dark:bg-surface-dark-panel rounded" />
            <div className="h-10 bg-surface-light-subtle dark:bg-surface-dark-panel rounded" />
          </div>
        </div>
        <div className="flex items-start gap-3 justify-end animate-pulse">
          <div className="space-y-1.5 max-w-sm flex-1">
            <div className="h-10 bg-surface-light-subtle dark:bg-surface-dark-panel rounded ml-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-surface-light-text dark:text-surface-dark-text bg-surface-light-bg dark:bg-surface-dark-bg"
    >
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-12 h-12 rounded-full border border-dashed border-surface-light-border dark:border-surface-dark-border flex items-center justify-center text-surface-light-textSubtle dark:text-surface-dark-textSubtle mb-3">
            <Smile className="w-5 h-5 text-brand-500" />
          </div>
          <p className="text-xs font-display font-medium text-surface-light-text dark:text-surface-dark-text">
            Start of conversation
          </p>
          <p className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted max-w-xs mt-1">
            Send a message, share a link or project note to begin.
          </p>
        </div>
      ) : (
        messages.map((msg, index) => {
          const prevMsg = messages[index - 1];
          const isFirstInGroup =
            !prevMsg ||
            prevMsg.sender?._id !== msg.sender?._id ||
            new Date(msg.createdAt) - new Date(prevMsg.createdAt) > 3 * 60 * 1000;

          const showDateDivider =
            !prevMsg || !isSameDay(new Date(msg.createdAt), new Date(prevMsg.createdAt));

          const isMine = msg.sender?._id === currentUser?._id;

          // System message
          if (msg.messageType === 'system') {
            return (
              <div key={msg._id} className="py-2 text-center">
                <span className="text-[11px] font-mono px-3 py-1 bg-surface-light-subtle dark:bg-surface-dark-subtle text-surface-light-textSubtle dark:text-surface-dark-textSubtle rounded border border-surface-light-border dark:border-surface-dark-border">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <React.Fragment key={msg._id}>
              {showDateDivider && (
                <div className="flex items-center my-6 gap-3">
                  <div className="flex-1 h-[1px] bg-surface-light-border dark:bg-surface-dark-border" />
                  <span className="text-[10px] font-mono tracking-widest text-surface-light-textSubtle dark:text-surface-dark-textSubtle font-semibold px-2">
                    {formatDateDivider(new Date(msg.createdAt))}
                  </span>
                  <div className="flex-1 h-[1px] bg-surface-light-border dark:bg-surface-dark-border" />
                </div>
              )}

              <div
                className={`flex flex-col group relative ${
                  isMine ? 'items-end' : 'items-start'
                }`}
              >
                {/* Sender Name for group chats if incoming & first in group */}
                {!isMine && isFirstInGroup && (
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-semibold font-display text-surface-light-text dark:text-surface-dark-text">
                      {msg.sender?.name}
                    </span>
                    <span className="text-[10px] font-mono text-surface-light-textSubtle dark:text-surface-dark-textSubtle">
                      @{msg.sender?.username}
                    </span>
                  </div>
                )}

                {/* Message Body Container */}
                <div className="relative flex items-start gap-2 max-w-[85%] sm:max-w-[70%]">
                  {/* Floating Action Menu on Hover */}
                  <div
                    className={`absolute top-0 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border shadow-float rounded px-1.5 py-0.5 z-10 ${
                      isMine ? 'right-0 -translate-x-2' : 'left-0 translate-x-2'
                    }`}
                  >
                    <button
                      onClick={() => setReplyingTo(msg)}
                      className="p-1 hover:text-brand-500 text-surface-light-textSubtle dark:text-surface-dark-textSubtle"
                      title="Reply"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveReactionMessageId(
                            activeReactionMessageId === msg._id ? null : msg._id
                          )
                        }
                        className="p-1 hover:text-brand-500 text-surface-light-textSubtle dark:text-surface-dark-textSubtle"
                        title="React"
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </button>

                      {/* Quick Emoji Picker Popover */}
                      {activeReactionMessageId === msg._id && (
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border shadow-modal rounded p-1 flex items-center gap-1 z-20">
                          {QUICK_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                reactToMessage(msg._id, emoji);
                                setActiveReactionMessageId(null);
                              }}
                              className="text-sm p-1 hover:scale-125 transition-transform"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Asymmetric Message Content */}
                  <div
                    className={`rounded-sm px-3.5 py-2 text-xs sm:text-[13px] leading-relaxed relative ${
                      isMine
                        ? 'bg-surface-light-subtle dark:bg-[#1E222B] text-surface-light-text dark:text-surface-dark-text border border-surface-light-border dark:border-surface-dark-border rounded-tr-none'
                        : 'bg-surface-light-panel dark:bg-surface-dark-subtle text-surface-light-text dark:text-surface-dark-text border border-surface-light-border dark:border-surface-dark-border rounded-tl-none shadow-fine'
                    }`}
                  >
                    {/* Quoted Reply Preview */}
                    {msg.replyTo && (
                      <div className="mb-2 p-2 bg-black/5 dark:bg-black/20 border-l-2 border-brand-500 rounded text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted">
                        <span className="font-semibold text-surface-light-text dark:text-surface-dark-text block">
                          {msg.replyTo.sender?.name || 'User'}
                        </span>
                        <span className="truncate block">{msg.replyTo.content}</span>
                      </div>
                    )}

                    {/* Image Attachments */}
                    {msg.attachments?.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {msg.attachments.map((att, i) => {
                          const isImg = att.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(att.url);
                          return isImg ? (
                            <img
                              key={i}
                              src={att.url}
                              alt={att.name || 'Attachment'}
                              className="max-h-60 rounded object-cover border border-surface-light-border dark:border-surface-dark-border cursor-pointer hover:opacity-95"
                              onClick={() => window.open(att.url, '_blank')}
                            />
                          ) : (
                            <a
                              key={i}
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 p-2 rounded bg-surface-light-subtle dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border text-xs text-brand-500 hover:underline"
                            >
                              <FileText className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{att.name || 'Download file'}</span>
                              <Download className="w-3.5 h-3.5 ml-auto text-surface-light-textSubtle dark:text-surface-dark-textSubtle" />
                            </a>
                          );
                        })}
                      </div>
                    )}

                    {/* Text Message Content */}
                    {msg.isDeleted ? (
                      <span className="italic text-surface-light-textSubtle dark:text-surface-dark-textSubtle">
                        This message was deleted
                      </span>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    )}

                    {/* Timestamp and Delivery/Read State */}
                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] font-mono text-surface-light-textSubtle dark:text-surface-dark-textSubtle select-none">
                      <span>{format(new Date(msg.createdAt), 'HH:mm')}</span>
                      {renderStatus(msg)}
                    </div>
                  </div>
                </div>

                {/* Reaction Badges */}
                {msg.reactions?.length > 0 && (
                  <div
                    className={`flex flex-wrap gap-1 mt-1 ${
                      isMine ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* Group identical emojis */}
                    {Object.entries(
                      msg.reactions.reduce((acc, r) => {
                        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => reactToMessage(msg._id, emoji)}
                        className="text-[11px] px-2 py-0.5 rounded-full border border-surface-light-border dark:border-surface-dark-border bg-surface-light-panel dark:bg-surface-dark-panel text-surface-light-text dark:text-surface-dark-text hover:border-brand-500 transition-colors flex items-center gap-1 shadow-fine"
                      >
                        <span>{emoji}</span>
                        {count > 1 && (
                          <span className="font-mono text-[10px] text-surface-light-textSubtle dark:text-surface-dark-textSubtle">
                            {count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })
      )}
    </div>
  );
};

export default MessageTimeline;
