import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connectionListeners = new Set();
    this.status = 'disconnected'; // 'connected' | 'reconnecting' | 'disconnected'
  }

  connect(token) {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL ||
      (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? `http://${window.location.hostname}:5000`
        : window.location.origin);

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      this.status = 'connected';
      this.notifyStatusChange('connected');
    });

    this.socket.on('disconnect', (reason) => {
      this.status = 'disconnected';
      this.notifyStatusChange('disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      this.status = 'reconnecting';
      this.notifyStatusChange('reconnecting', error.message);
    });

    this.socket.io.on('reconnect_attempt', () => {
      this.status = 'reconnecting';
      this.notifyStatusChange('reconnecting');
    });

    this.socket.io.on('reconnect', () => {
      this.status = 'connected';
      this.notifyStatusChange('connected');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.status = 'disconnected';
      this.notifyStatusChange('disconnected');
    }
  }

  onStatusChange(callback) {
    this.connectionListeners.add(callback);
    callback(this.status);
    return () => this.connectionListeners.delete(callback);
  }

  notifyStatusChange(status, detail) {
    this.connectionListeners.forEach((cb) => cb(status, detail));
  }

  joinConversation(conversationId) {
    if (this.socket && this.socket.connected && conversationId) {
      this.socket.emit('joinConversation', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.socket.connected && conversationId) {
      this.socket.emit('leaveConversation', conversationId);
    }
  }

  emitTyping(conversationId) {
    if (this.socket && this.socket.connected && conversationId) {
      this.socket.emit('typing', { conversationId });
    }
  }

  emitStopTyping(conversationId) {
    if (this.socket && this.socket.connected && conversationId) {
      this.socket.emit('stopTyping', { conversationId });
    }
  }

  emitSendMessage(conversationId, message) {
    if (this.socket && this.socket.connected && conversationId && message) {
      this.socket.emit('sendMessage', { conversationId, message });
    }
  }

  emitMessageDelivered(messageId, conversationId) {
    if (this.socket && this.socket.connected && messageId) {
      this.socket.emit('messageDelivered', { messageId, conversationId });
    }
  }

  emitMessageRead(conversationId, messageIds) {
    if (this.socket && this.socket.connected && conversationId) {
      this.socket.emit('messageRead', { conversationId, messageIds });
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketService = new SocketService();
export default socketService;
