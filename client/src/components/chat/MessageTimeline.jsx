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
  Download,
  FileText,
  Copy,
  Sparkles,
  Bot,
} from 'lucide-react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '⚡', '😂', '👏'];

const AI_SUGGESTIONS = [
  { label: '⚡ Explain WebSockets', prompt: 'Explain how WebSockets work and why they are ideal for real-time chat.' },
  { label: '⚛ React useDebounce Hook', prompt: 'Write an efficient React custom hook for useDebounce with clear usage example.' },
  { label: '🛡 How does 2FA work?', prompt: 'How does Two-Factor Authentication work in VOXA and how can I set it up?' },
  { label: '📝 Draft Product Announcement', prompt: 'Draft a concise, modern announcement message for launching our real-time messaging workspace.' },
];

// Rich Markdown and Code Block Renderer for Messages
const FormattedMessageContent = ({ content, isAi }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!content) return null;

  // Split content by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', text: content.slice(lastIndex, match.index) });
    }
    parts.push({
      type: 'code',
      lang: match[1] || 'code',
      code: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', text: content.slice(lastIndex) });
  }

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to format inline bold, inline code, and lists
  const formatTextSnippet = (text) => {
    return text.split('\n').map((line, lineIdx) => {
      // Header check
      if (line.startsWith('### ')) {
        return (
          <h4 key={lineIdx} className="font-display font-bold text-sm text-surface-light-text dark:text-surface-dark-text mt-2.5 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={lineIdx} className="font-display font-bold text-base text-surface-light-text dark:text-surface-dark-text mt-3 mb-1">
            {line.replace('## ', '')}
          </h3>
        );
      }

      // Bullet points
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().slice(2) : line;

      // Inline code and bold parsing
      const renderedParts = [];
      const inlineRegex = /(\*\*.*?\*\*|`.*?`)/g;
      let inlineLast = 0;
      let inlineMatch;

      while ((inlineMatch = inlineRegex.exec(cleanLine)) !== null) {
        if (inlineMatch.index > inlineLast) {
          renderedParts.push(cleanLine.slice(inlineLast, inlineMatch.index));
        }
        const token = inlineMatch[0];
        if (token.startsWith('**') && token.endsWith('**')) {
          renderedParts.push(
            <strong key={inlineMatch.index} className="font-semibold text-surface-light-text dark:text-surface-dark-text">
              {token.slice(2, -2)}
            </strong>
          );
        } else if (token.startsWith('`') && token.endsWith('`')) {
          renderedParts.push(
            <code key={inlineMatch.index} className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-black/10 dark:bg-black/30 text-purple-400 border border-purple-500/20">
              {token.slice(1, -1)}
            </code>
          );
        }
        inlineLast = inlineMatch.index + token.length;
      }
      if (inlineLast < cleanLine.length) {
        renderedParts.push(cleanLine.slice(inlineLast));
      }

      return (
        <span key={lineIdx} className={`block ${isBullet ? 'pl-3.5 relative before:content-["•"] before:absolute before:left-0 before:text-brand-500' : ''}`}>
          {renderedParts.length > 0 ? renderedParts : cleanLine}
        </span>
      );
    });
  };

  return (
    <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed">
      {parts.map((p, idx) => {
        if (p.type === 'code') {
          return (
            <div
              key={idx}
              className="my-2 rounded-md overflow-hidden border border-purple-500/30 bg-[#0d0f14] dark:bg-[#0d0f14] text-[#e6edf3] font-mono text-[12px] shadow-sm"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-purple-500/20 text-[10px] text-surface-dark-textMuted uppercase font-semibold">
                <span className="text-purple-400">{p.lang || 'code'}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(p.code, idx)}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedIndex === idx ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed scrollbar-thin">
                <code>{p.code}</code>
              </pre>
            </div>
          );
        }
        return <div key={idx}>{formatTextSnippet(p.text)}</div>;
      })}
    </div>
  );
};

export const MessageTimeline = ({ searchQuery = '' }) => {
  const { messages, isLoadingMessages, reactToMessage, setReplyingTo, activeConversation, sendMessage } = useChatStore();
  const currentUser = useAuthStore((state) => state.user);

  const scrollRef = useRef(null);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const isAiChat =
    activeConversation &&
    !activeConversation.isGroup &&
    activeConversation.participants?.some((p) => p.isBot || p.username === 'voxa_ai');

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
      {/* AI Bot Quick Suggestions Prompt Grid (when in AI chat and few messages) */}
      {isAiChat && messages.length <= 2 && (
        <div className="mb-4 p-4 rounded-lg border border-purple-500/25 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-cyan-500/10 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-display font-semibold text-purple-400 uppercase tracking-wider">
              VOXA AI Quick Prompts
            </span>
          </div>
          <p className="text-[11px] text-surface-light-textMuted dark:text-surface-dark-textMuted mb-3">
            Click any suggestion below to start an interactive discussion with VOXA AI:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AI_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(item.prompt)}
                className="text-left p-2.5 rounded-md border border-purple-500/20 bg-surface-light-panel dark:bg-surface-dark-panel hover:border-purple-500/50 hover:bg-purple-500/10 transition-all text-xs font-medium text-surface-light-text dark:text-surface-dark-text shadow-fine flex items-center justify-between group"
              >
                <span>{item.label}</span>
                <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity text-[11px]">
                  →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

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
          const isAiSender = msg.sender?.isBot || msg.sender?.username === 'voxa_ai';

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
                  <div className="flex-1 h-[1px] bg-surface-light-border dark:border-surface-dark-border" />
                  <span className="text-[10px] font-mono tracking-widest text-surface-light-textSubtle dark:text-surface-dark-textSubtle font-semibold px-2">
                    {formatDateDivider(new Date(msg.createdAt))}
                  </span>
                  <div className="flex-1 h-[1px] bg-surface-light-border dark:border-surface-dark-border" />
                </div>
              )}

              <div
                className={`flex flex-col group relative ${
                  isMine ? 'items-end' : 'items-start'
                }`}
              >
                {/* Sender Name for group chats or AI incoming */}
                {!isMine && isFirstInGroup && (
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-semibold font-display text-surface-light-text dark:text-surface-dark-text">
                      {msg.sender?.name}
                    </span>
                    {isAiSender ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase font-bold tracking-wider">
                        AI Bot
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-surface-light-textSubtle dark:text-surface-dark-textSubtle">
                        @{msg.sender?.username}
                      </span>
                    )}
                  </div>
                )}

                {/* Message Body Container */}
                <div className="relative flex items-start gap-2 max-w-[88%] sm:max-w-[75%]">
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
                        : isAiSender
                        ? 'bg-gradient-to-br from-purple-500/5 to-cyan-500/5 dark:bg-[#151722] text-surface-light-text dark:text-surface-dark-text border border-purple-500/25 rounded-tl-none shadow-fine'
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
                    ) : isAiSender ? (
                      <FormattedMessageContent content={msg.content} isAi={true} />
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
