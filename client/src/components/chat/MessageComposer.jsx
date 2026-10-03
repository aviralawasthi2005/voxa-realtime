import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import socketService from '../../services/socketService';
import api from '../../services/api';
import {
  Send,
  Paperclip,
  Smile,
  X,
  FileText,
  Loader2,
  Sparkles,
  Bot,
  Code,
  HelpCircle,
  Wand2,
} from 'lucide-react';

const COMMON_EMOJIS = ['👍', '❤️', '🔥', '⚡', '🎉', '😊', '💡', '🚀', '🙌', '👀'];

const PROMPT_SUGGESTIONS = [
  { label: 'Explain this concept', text: 'Explain the following in simple terms with an example: ' },
  { label: 'Review & optimize code', text: 'Review this code snippet and suggest performance optimizations: \n```\n\n```' },
  { label: 'Draft clean email/announcement', text: 'Draft a professional and friendly message about: ' },
  { label: 'Debug error log', text: 'Help me debug this error message: \n' },
];

export const MessageComposer = () => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPromptMenu, setShowPromptMenu] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { activeConversation, sendMessage, replyingTo, setReplyingTo, isSending } =
    useChatStore();

  const isAiChat =
    activeConversation &&
    !activeConversation.isGroup &&
    activeConversation.participants?.some((p) => p.isBot || p.username === 'voxa_ai');

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeConversation?._id]);

  const handleTextChange = (e) => {
    const text = e.target.value;
    setContent(text);

    // Auto-adjust height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }

    // Emit typing indicator
    if (activeConversation) {
      socketService.emitTyping(activeConversation._id);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socketService.emitStopTyping(activeConversation._id);
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedAttachment = res.data.data.attachment;
      setAttachments((prev) => [...prev, uploadedAttachment]);
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if ((!content.trim() && attachments.length === 0) || isSending || isUploading) return;

    const textToSend = content.trim();
    const currentAttachments = [...attachments];

    setContent('');
    setAttachments([]);
    setShowEmojiPicker(false);
    setShowPromptMenu(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    if (activeConversation) {
      socketService.emitStopTyping(activeConversation._id);
    }

    try {
      await sendMessage(textToSend, currentAttachments);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Restore on failure
      setContent(textToSend);
      setAttachments(currentAttachments);
    }
  };

  const addEmoji = (emoji) => {
    setContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const insertPrompt = (promptText) => {
    setContent(promptText);
    setShowPromptMenu(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleMentionAi = () => {
    if (!content.includes('@ai')) {
      setContent((prev) => (prev ? `@ai ${prev}` : '@ai '));
    }
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  if (!activeConversation) return null;

  return (
    <footer className="p-3 sm:p-4 border-t border-surface-light-border dark:border-surface-dark-border bg-surface-light-panel dark:bg-surface-dark-subtle flex-shrink-0 relative">
      {/* Replying banner */}
      {replyingTo && (
        <div className="mb-2.5 px-3 py-1.5 bg-surface-light-subtle dark:bg-surface-dark-panel border-l-2 border-brand-500 rounded-md flex items-center justify-between text-xs animate-in slide-in-from-bottom-2">
          <div className="truncate">
            <span className="font-semibold text-surface-light-text dark:text-surface-dark-text mr-2">
              Replying to {replyingTo.sender?.name || 'User'}
            </span>
            <span className="text-surface-light-textMuted dark:text-surface-dark-textMuted">
              {replyingTo.content}
            </span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text p-1 ml-2 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="relative flex items-center gap-2 p-1.5 bg-surface-light-subtle dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border rounded-md text-xs pr-7 shadow-fine"
            >
              <FileText className="w-3.5 h-3.5 text-brand-500" />
              <span className="truncate max-w-[130px] font-medium">{att.name}</span>
              <button
                onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                className="absolute right-1 top-1.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-rose-500 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Prompt suggestions popover */}
      {showPromptMenu && (
        <div className="absolute bottom-full mb-2 left-4 bg-surface-light-panel dark:bg-surface-dark-panel border border-purple-500/30 shadow-modal rounded-xl p-2.5 max-w-sm w-full z-30 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-surface-light-border dark:border-surface-dark-border">
            <span className="text-xs font-semibold flex items-center gap-1.5 text-purple-400">
              <Sparkles className="w-3.5 h-3.5" />
              AI Prompt Starters
            </span>
            <button
              onClick={() => setShowPromptMenu(false)}
              className="p-1 hover:text-surface-light-text dark:hover:text-surface-dark-text text-surface-light-textSubtle dark:text-surface-dark-textSubtle"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {PROMPT_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => insertPrompt(item.text)}
                className="w-full text-left p-2 rounded-lg hover:bg-purple-500/10 hover:text-purple-400 transition-colors text-xs text-surface-light-text dark:text-surface-dark-text font-medium flex items-center justify-between group"
              >
                <span>{item.label}</span>
                <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Picker popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2 left-4 bg-surface-light-panel dark:bg-surface-dark-panel border border-surface-light-border dark:border-surface-dark-border shadow-modal rounded-xl p-2 flex flex-wrap gap-1 max-w-xs z-30 animate-in fade-in slide-in-from-bottom-2">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              className="text-lg p-1.5 hover:bg-surface-light-subtle dark:hover:bg-surface-dark-subtle rounded-md transition-transform hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2 bg-surface-light-bg dark:bg-surface-dark-bg border border-surface-light-border dark:border-surface-dark-border rounded-xl px-3 py-2 focus-within:border-brand-500/70 focus-within:ring-1 focus-within:ring-brand-500/20 transition-all shadow-inner">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-1.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text transition-colors flex-shrink-0 mb-0.5 rounded-md hover:bg-surface-light-panel dark:hover:bg-surface-dark-panel"
          title="Add attachment"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </button>

        {/* Emoji toggle */}
        <button
          type="button"
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowPromptMenu(false);
          }}
          className="p-1.5 text-surface-light-textSubtle dark:text-surface-dark-textSubtle hover:text-surface-light-text dark:hover:text-surface-dark-text transition-colors flex-shrink-0 mb-0.5 rounded-md hover:bg-surface-light-panel dark:hover:bg-surface-dark-panel"
          title="Add emoji"
        >
          <Smile className="w-4 h-4" />
        </button>

        {/* AI Prompts Helper Button */}
        <button
          type="button"
          onClick={() => {
            setShowPromptMenu(!showPromptMenu);
            setShowEmojiPicker(false);
          }}
          className={`p-1.5 transition-colors flex-shrink-0 mb-0.5 rounded-md hover:bg-purple-500/10 ${
            showPromptMenu ? 'text-purple-400 bg-purple-500/15' : 'text-purple-400/80 hover:text-purple-300'
          }`}
          title="AI prompts and templates"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Group @ai quick trigger chip */}
        {activeConversation.isGroup && (
          <button
            type="button"
            onClick={handleMentionAi}
            className="hidden sm:flex items-center gap-1 px-2 py-0.5 mb-1 rounded-md text-[10px] font-mono bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/30 transition-colors font-semibold"
            title="Ask VOXA AI in group"
          >
            <span>@ai</span>
          </button>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isAiChat
              ? 'Ask VOXA AI anything... (Enter to send, Shift+Enter for newline)'
              : activeConversation?.isGroup
              ? 'Write a message... (mention @ai to ask AI)'
              : 'Write a message... (Enter to send, Shift+Enter for newline)'
          }
          className="w-full bg-transparent text-xs sm:text-sm text-surface-light-text dark:text-surface-dark-text placeholder-surface-light-textSubtle dark:placeholder-surface-dark-textSubtle resize-none focus:outline-none max-h-36 py-1 leading-relaxed"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!content.trim() && attachments.length === 0) || isSending}
          className={`p-2 rounded-lg transition-all flex-shrink-0 mb-0.5 ${
            content.trim() || attachments.length > 0
              ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm hover:scale-105 active:scale-95'
              : 'text-surface-light-textSubtle dark:text-surface-dark-textSubtle opacity-50 cursor-not-allowed'
          }`}
          title="Send message"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </footer>
  );
};

export default MessageComposer;
