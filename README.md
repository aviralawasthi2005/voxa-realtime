# VOXA — Real-Time Messaging Platform

[![Repository](https://img.shields.io/badge/GitHub-aviralawasthi2005%2Fvoxa--realtime-181717?style=flat&logo=github)](https://github.com/aviralawasthi2005/voxa-realtime)
[![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Socket.io-blue?style=flat)](#-system-architecture)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **"Conversations that stay in motion."**
> A modern real-time communication platform built with the MERN stack and Socket.io, designed with human editorial restraint, high-density workspaces, and tactile responsiveness.

---

## ✦ Features

- **Real-Time Messaging**: Sub-100ms bidirectional event loop via Socket.io rooms without polling.
- **Presence & Activity Tracking**: Online/offline indicators, heartbeats, and status indicators (`online`, `away`, `busy`, `offline`).
- **Typing Indicators**: Smoothly debounced 3-dot animation (`Alex is typing...`).
- **Read & Delivery Receipts**: Sending clock, sent tick, delivered double-tick, and read colored receipts.
- **One-to-One & Group Chats**: Private direct channels and rich group spaces with member administration, descriptions, and avatars.
- **Emoji Reactions & Quoted Replies**: Asymmetric message bubbles with reaction badges and reply threading.
- **Global Command Search (`Ctrl+K` / `Cmd+K`)**: Rapidly search People, Groups, and message history.
- **Real-Time Toast Notifications**: Floating alerts with one-click navigation to the relevant conversation.
- **Dedicated Light & Dark Themes**: Independently styled Obsidian slate and Warm Alabaster surfaces.
- **Responsive Mobile Layout**: Single active context interaction model with drawer sidebar.
- **Secure Authentication**: Bcrypt password hashing, stateless JWT authorization, and input sanitation.

---

## ✦ System Architecture

```
voxa/
├── server/
│   ├── config/             # DB connection with automatic embedded memory fallback
│   ├── controllers/        # auth, user, conversation, message, notification, search
│   ├── middleware/         # JWT protect, error handling, multer file upload
│   ├── models/             # User, Conversation, Message, Notification schemas
│   ├── routes/             # Clean REST routing modules
│   ├── sockets/            # Socket.io real-time engine (presence, typing, rooms, receipts)
│   ├── utils/              # JWT signing, seed data with pre-populated active channels
│   └── server.js           # Server entry point
└── client/
    ├── src/
    │   ├── components/     # Reusable UI primitives, modals, composer, timeline, sidebars
    │   ├── hooks/          # Socket lifecycle & responsive listeners
    │   ├── pages/          # Landing, Login, Register, Forgot/Reset Password, ChatApp
    │   ├── services/       # Axios API client, SocketService singleton
    │   ├── store/          # Zustand stores (useAuthStore, useChatStore, useNotificationStore, useThemeStore)
    │   └── styles/         # Editorial design tokens, Space Grotesk + Plus Jakarta Sans fonts
    └── package.json
```

---

## ✦ Design System & Editorial Philosophy

1. **Distinctive Font Pairing**:
   - **Space Grotesk**: Bold, structural display typography for branding, headers, dates, and numerals.
   - **Plus Jakarta Sans**: High-density, crystal-clear readability for messages and conversations.
2. **Restrained Color Hierarchy**:
   - Primary: Warm terracotta / copper accent (`#CF6646`)
   - Neutral Surfaces: Warm alabaster (`#F8F7F4`) in Light mode; deep obsidian slate (`#0E0F12` / `#15171C`) in Dark mode.
   - Fine 1px architectural borders avoiding repetitive cards or generic gradient bubbles.
3. **Ergonomic Message Timeline**:
   - Asymmetric message shapes with compact margins rather than bloated bubble padding.
   - Grouped consecutive messages with date dividers (`TODAY`, `YESTERDAY`).
   - Delivery ticks: Sending (clock), Sent (single tick), Delivered (double tick), Read (colored double tick).
   - Emoji reactions and quoted reply previews.

---

## ✦ Instant Pre-Seeded Accounts for Testing

The platform automatically seeds four realistic user accounts upon startup:

| Name | Email / Username | Password | Role |
| :--- | :--- | :--- | :--- |
| **Alex Johnson** | `alex@voxa.com` / `alexj` | `password123` | Staff Product Designer |
| **Sarah Miller** | `sarah@voxa.com` / `sarahm` | `password123` | Systems & Protocol Engineer |
| **Marcus Chen** | `marcus@voxa.com` / `marcusc` | `password123` | Frontend Architect |
| **Elena Rostova** | `elena@voxa.com` / `elenar` | `password123` | Creative Technologist |

---

## ✦ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/aviralawasthi2005/voxa-realtime.git
cd voxa-realtime
```

### 2. Start Backend Server
```bash
cd server
npm install
npm start
```
*Runs on `http://localhost:5000`. If no local MongoDB URI is provided in `server/.env`, it automatically runs an embedded in-memory MongoDB engine for zero-configuration testing.*

### 3. Start Frontend Application
In a second terminal:
```bash
cd client
npm install
npm run dev
```
*Runs on `http://localhost:5173/` with automated proxy to backend API and socket events.*

---

## ✦ Real-Time WebSocket Events

- `connection` / `disconnect`: Updates database presence & broadcasts `userOnline` / `userOffline`
- `joinConversation` / `leaveConversation`: Manages conversation rooms
- `typing` / `stopTyping`: Debounced real-time typing indicators with 3-dot animation
- `sendMessage` / `receiveMessage`: Instant message delivery across open conversations
- `messageDelivered` / `messageRead`: Real-time receipt tracking
- `newNotification`: In-app floating toast alerts with direct jump to conversation

---

## ✦ REST API Reference

- `POST /api/auth/register` — Create new account
- `POST /api/auth/login` — Sign in and receive JWT
- `GET /api/auth/me` — Current authenticated user profile
- `GET /api/conversations` — User conversations list
- `POST /api/conversations/direct` — Start or retrieve 1-on-1 chat
- `POST /api/conversations/group` — Create group conversation
- `GET /api/messages/:conversationId` — Paginated message history
- `POST /api/messages` — Send message with attachments
- `POST /api/messages/:id/react` — Toggle emoji reaction
- `PATCH /api/messages/:conversationId/read` — Mark conversation as read
- `GET /api/search?q=...` — Global command search (People, Groups, Messages)
- `GET /api/notifications` — Notification stream and unread counts

---

## ✦ License

This project is open-source under the [MIT License](LICENSE).
