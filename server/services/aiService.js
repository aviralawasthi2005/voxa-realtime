import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

let cachedAiUser = null;

/**
 * Retrieve or create the system VOXA AI Bot user
 */
export const getOrCreateAiUser = async () => {
  if (cachedAiUser) return cachedAiUser;

  try {
    let aiUser = await User.findOne({ username: 'voxa_ai' });
    if (!aiUser) {
      aiUser = await User.create({
        name: 'VOXA AI',
        username: 'voxa_ai',
        email: 'ai@voxa.local',
        password: 'voxa_system_ai_bot_secure_password_2026',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=VoxaAI&backgroundColor=7c3aed,06b6d4',
        bio: 'VOXA Built-in AI Co-Pilot. Instant answers, code assistance, summaries & creative thinking.',
        status: 'online',
        isVerified: true,
        isBot: true,
        preferences: { theme: 'dark', notifications: false, sound: false },
      });
      console.log('[AI Service] Initialized VOXA AI Bot user in database.');
    } else if (!aiUser.isBot) {
      aiUser.isBot = true;
      await aiUser.save();
    }

    cachedAiUser = aiUser;
    return aiUser;
  } catch (error) {
    console.error('[AI Service] Error initializing AI user:', error.message);
    return null;
  }
};

/**
 * Intelligent Fallback Response Engine
 * Provides immediate, rich answers when no external API key is provided
 */
const generateLocalResponse = (cleanPrompt, senderName = 'there') => {
  const p = cleanPrompt.toLowerCase().trim();

  // 1. Greetings & Introductions
  if (/^(hi|hello|hey|greetings|yo|sup|good (morning|afternoon|evening))\b/.test(p)) {
    return `Hello ${senderName}! 👋 I am **VOXA AI**, your built-in intelligent co-pilot.\n\nI can assist you with:\n- **Writing & Refining Code** (React, Node.js, WebSockets, MongoDB, Tailwind)\n- **Explaining Complex Concepts** or debugging errors\n- **Brainstorming Ideas** & drafting documentation or announcements\n- **Summarizing Conversations** and message threads\n\nHow can I help you today?`;
  }

  if (p.includes('who are you') || p.includes('what are you') || p.includes('your name')) {
    return `I am **VOXA AI**, an autonomous artificial intelligence assistant embedded into the VOXA real-time communication platform. I'm here to streamline your workflows, write code, answer queries, and collaborate seamlessly in both 1-on-1 dialogues and group discussions!`;
  }

  if (p.includes('what can you do') || p.includes('help') || p.includes('features')) {
    return `Here are some of the things you can ask me:\n\n1. **💻 Coding Assistance:** Ask for code snippets, architecture design, or debugging in JavaScript, Python, React, Go, etc.\n2. **⚡ Real-time Architecture:** Inquire about WebSockets, socket reconnection strategies, or exponential backoff.\n3. **📝 Content Drafting:** Ask me to write project updates, release notes, or formal emails.\n4. **👥 Group Collaboration:** Mention \`@ai\` in any group chat to invite me to summarize discussions or provide input.\n\nTry asking: *"How do WebSockets work?"* or *"Write a React hook for debounce."*`;
  }

  // 2. VOXA Platform Specific Queries
  if (p.includes('voxa') || p.includes('platform') || p.includes('2fa') || p.includes('otp')) {
    if (p.includes('2fa') || p.includes('two factor') || p.includes('security')) {
      return `### 🛡 VOXA Two-Factor Authentication (2FA)\n\nVOXA features email-based 2FA security:\n- **Setup:** Go to **Settings (Gear Icon)** $\\rightarrow$ **Security** $\\rightarrow$ toggle **Two-Factor Authentication**.\n- **Activation:** A 6-digit confirmation code is dispatched to your registered email to verify ownership.\n- **Login Challenge:** Once activated, every sign-in requires entering a temporary 6-digit OTP code before access is granted.`;
    }
    return `### ⚡ About VOXA\n\nVOXA is a modern, real-time messaging platform designed for effortless communication. Key highlights:\n- **Low Latency:** Instant message delivery powered by WebSocket bi-directional channels.\n- **Editorial Design:** Obsidian dark palette, refined typography, and distraction-free spatial layouts.\n- **Built-in Security:** Verification OTPs, optional Two-Factor Authentication, and bcrypt password hashing.\n- **Integrated AI:** Continuous assistance right within your conversations!`;
  }

  // 3. Technical / Coding Questions
  if (p.includes('websocket') || p.includes('socket.io') || p.includes('real-time') || p.includes('realtime')) {
    return `### ⚡ WebSockets vs. HTTP Polling\n\n**WebSockets** provide a persistent, full-duplex TCP connection between client and server, avoiding HTTP request overhead.\n\n\`\`\`javascript
// Client connection example with Socket.io
import { io } from 'socket.io-client';

const socket = io('https://your-server.com', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('Connected with socket ID:', socket.id);
});

socket.on('receiveMessage', (data) => {
  console.log('New message received in real-time:', data.message);
});
\`\`\`\n\n**Benefits in VOXA:**\n- Sub-50ms message latency\n- Instant typing indicators and online presence updates\n- Immediate delivery & read receipt notifications.`;
  }

  if (p.includes('debounce') || p.includes('throttle')) {
    return `### ⏱ JavaScript Debounce Function\n\nA debounce function delays invoking a callback until after a specified wait time has elapsed since the last time it was invoked.\n\n\`\`\`javascript
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
\`\`\`\n\n**Use case in VOXA:** Debouncing search input and user typing events to prevent flooding the server with keystroke sockets!`;
  }

  if (p.includes('react') || p.includes('useeffect') || p.includes('usestate') || p.includes('hook')) {
    return `### ⚛ React Custom Hook Example: \`useDebounce\`\n\nHere is an efficient custom React hook for debouncing values:\n\n\`\`\`jsx
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
\`\`\`\n\n**Usage:**\n\`\`\`jsx
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 350);

useEffect(() => {
  if (debouncedQuery) searchUsers(debouncedQuery);
}, [debouncedQuery]);
\`\`\``;
  }

  if (p.includes('mongodb') || p.includes('mongoose') || p.includes('database')) {
    return `### 🍃 MongoDB Indexing & Optimization Tips\n\n1. **Index Query Fields:** Always create compound indexes for frequently filtered queries, e.g. \`{ conversation: 1, createdAt: -1 }\`.\n2. **Lean Queries:** Use \`.lean()\` when read-only performance is critical to bypass Mongoose document hydration.\n3. **Pagination:** Prefer keyset cursor pagination (\`_id < lastId\`) over \`skip()\` for large datasets.\n4. **Projection:** Only select needed fields with \`.select('name avatar username')\`.`;
  }

  // 4. Creative / General Queries
  if (p.includes('joke')) {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs! 🪲",
      "There are 10 types of people in the world: those who understand binary, and those who don't. 😄",
      "Why did the JavaScript developer wear glasses? Because they didn't C#! 👓",
      "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?' 🍺",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // General default response
  return `### 💡 VOXA AI Response\n\nYou asked:\n> "${cleanPrompt}"\n\nHere is what you should keep in mind:\n- For technical tasks, breaking the problem into modular components ensures high maintainability and testability.\n- If you need code snippets, let me know the language or framework (e.g. React, Node.js, Python, CSS).\n- If this is a project or product question, feel free to ask for draft copy, architecture recommendations, or step-by-step guides.\n\n*Tip: You can add \`GEMINI_API_KEY\` or \`OPENAI_API_KEY\` to your \`server/.env\` file to power me with external cloud LLMs!*`;
};

/**
 * Generate AI Response using Gemini API, OpenAI API, or Local Engine
 */
export const generateAIResponse = async ({
  prompt,
  history = [],
  senderName = 'User',
  isGroup = false,
  conversationName = '',
}) => {
  // Clean prompt: remove @ai / @voxa_ai tags
  const cleanPrompt = prompt
    .replace(/@voxa_ai/gi, '')
    .replace(/@ai/gi, '')
    .replace(/@voxa/gi, '')
    .trim();

  const systemInstruction = `You are VOXA AI, the intelligent, sleek real-time assistant embedded directly into the VOXA communication platform.
Tone: Knowledgeable, concise, polite, modern, and helpful.
Format: Use clean Markdown (code blocks with syntax highlighting, bullet points, and headers).
${isGroup ? `You are participating in a group conversation named "${conversationName}". You were mentioned by ${senderName}.` : `You are speaking directly with ${senderName}.`}`;

  // 1. Try Google Gemini API if key is present
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey && geminiKey.trim().length > 10) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`;

      // Build contents array with brief conversation context
      const contents = [];
      
      // Add recent history (up to last 6 messages)
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-6).forEach((h) => {
          if (h.content) {
            contents.push({
              role: h.isAi ? 'model' : 'user',
              parts: [{ text: h.content }],
            });
          }
        });
      }

      // Add current user prompt
      contents.push({
        role: 'user',
        parts: [{ text: cleanPrompt || prompt }],
      });

      const payload = {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          return candidate.trim();
        }
      } else {
        const errText = await response.text();
        console.warn('[AI Service] Gemini API returned error:', response.status, errText);
      }
    } catch (err) {
      console.warn('[AI Service] Gemini API request failed:', err.message);
    }
  }

  // 2. Try OpenAI API if key is present
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey && openAiKey.trim().length > 10) {
    try {
      const messages = [{ role: 'system', content: systemInstruction }];
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-6).forEach((h) => {
          if (h.content) {
            messages.push({
              role: h.isAi ? 'assistant' : 'user',
              content: h.content,
            });
          }
        });
      }
      messages.push({ role: 'user', content: cleanPrompt || prompt });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return reply.trim();
        }
      }
    } catch (err) {
      console.warn('[AI Service] OpenAI API request failed:', err.message);
    }
  }

  // 3. Fallback to Local AI Engine
  return generateLocalResponse(cleanPrompt || prompt, senderName);
};

/**
 * Handle checking if an incoming message should trigger an AI bot response,
 * and if so, emit typing indicators and dispatch the AI reply.
 */
export const triggerAiReplyIfNeeded = async ({ message, conversation, io }) => {
  try {
    const aiUser = await getOrCreateAiUser();
    if (!aiUser) return;

    // Check if the message is from the AI itself (avoid infinite loops)
    if (message.sender?._id?.toString() === aiUser._id.toString()) {
      return;
    }

    const conversationId = conversation._id.toString();

    // Check if AI is in the conversation participants
    const isAiParticipant = conversation.participants.some(
      (p) => (p._id ? p._id.toString() : p.toString()) === aiUser._id.toString()
    );

    const content = message.content || '';
    const hasMention =
      /@ai\b/i.test(content) ||
      /@voxa_ai\b/i.test(content) ||
      /@voxa\b/i.test(content) ||
      content.trim().startsWith('/ai ');

    // Determine if AI should reply:
    // Case A: 1-on-1 direct conversation with AI Bot
    // Case B: Group conversation where AI was explicitly mentioned
    const shouldReply = (!conversation.isGroup && isAiParticipant) || (conversation.isGroup && hasMention);

    if (!shouldReply) {
      return;
    }

    // Emit 'typing' event from VOXA AI to the room
    if (io) {
      io.to(`conversation:${conversationId}`).emit('typing', {
        conversationId,
        user: {
          _id: aiUser._id,
          name: aiUser.name,
          username: aiUser.username,
          avatar: aiUser.avatar,
          isBot: true,
        },
      });
    }

    // Fetch brief recent conversation history for context
    const recentMessages = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('sender', 'name username');

    const history = recentMessages.reverse().map((m) => ({
      content: m.content,
      isAi: m.sender?._id?.toString() === aiUser._id.toString(),
      senderName: m.sender?.name || 'User',
    }));

    // Realistic typing delay (600ms - 1200ms)
    await new Promise((resolve) => setTimeout(resolve, 850));

    // Generate AI response
    const replyText = await generateAIResponse({
      prompt: content,
      history,
      senderName: message.sender?.name || 'there',
      isGroup: conversation.isGroup,
      conversationName: conversation.name || 'Group Chat',
    });

    // Save AI response message to database
    let aiMessage = await Message.create({
      conversation: conversation._id,
      sender: aiUser._id,
      content: replyText,
      messageType: 'text',
      replyTo: message._id,
      status: 'sent',
      deliveredTo: [aiUser._id],
      readBy: [{ user: aiUser._id, readAt: new Date() }],
    });

    // Update conversation lastMessage & unreadCounts
    conversation.lastMessage = aiMessage._id;
    conversation.participants.forEach((pId) => {
      const idStr = pId._id ? pId._id.toString() : pId.toString();
      if (idStr !== aiUser._id.toString()) {
        const currentCount = conversation.unreadCounts?.get(idStr) || 0;
        conversation.unreadCounts?.set(idStr, currentCount + 1);
      }
    });
    await conversation.save();

    aiMessage = await Message.findById(aiMessage._id)
      .populate('sender', 'name username avatar isBot')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name username isBot' },
      });

    // Emit stopTyping and receiveMessage via Socket.io
    if (io) {
      io.to(`conversation:${conversationId}`).emit('stopTyping', {
        conversationId,
        userId: aiUser._id,
      });

      io.to(`conversation:${conversationId}`).emit('receiveMessage', {
        conversationId,
        message: aiMessage,
      });

      // Notify other participants outside the active view
      conversation.participants.forEach((pId) => {
        const idStr = pId._id ? pId._id.toString() : pId.toString();
        if (idStr !== aiUser._id.toString()) {
          io.to(`user:${idStr}`).emit('newNotification', {
            conversationId,
            title: conversation.isGroup ? `${conversation.name}` : aiUser.name,
            body: replyText.slice(0, 100),
            sender: {
              _id: aiUser._id,
              name: aiUser.name,
              avatar: aiUser.avatar,
              isBot: true,
            },
            message: aiMessage,
          });
        }
      });
    }

    console.log(`[AI Service] Dispatched AI reply to conversation ${conversationId}`);
  } catch (error) {
    console.error('[AI Service] Error in triggerAiReplyIfNeeded:', error);
  }
};
