import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// Map of userId -> Set of socket IDs (to support multiple tabs/devices)
const onlineUsers = new Map();

export const initSocket = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1] ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid authentication token: ' + err.message));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();

    // Track user socket
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal user notification room
    socket.join(`user:${userId}`);

    // Update status in DB if first connection
    if (onlineUsers.get(userId).size === 1) {
      await User.findByIdAndUpdate(userId, { status: 'online' });
      // Broadcast to everyone that user is now online
      io.emit('userOnline', {
        userId,
        status: 'online',
      });
    }

    // Send currently online user IDs to the connected client
    const onlineIds = Array.from(onlineUsers.keys());
    socket.emit('onlineUsersList', onlineIds);

    // Join specific conversation room
    socket.on('joinConversation', (conversationId) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    // Leave specific conversation room
    socket.on('leaveConversation', (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    // Real-time typing indicators
    socket.on('typing', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit('typing', {
        conversationId,
        user: {
          _id: socket.user._id,
          name: socket.user.name,
          username: socket.user.username,
        },
      });
    });

    socket.on('stopTyping', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit('stopTyping', {
        conversationId,
        userId: socket.user._id,
      });
    });

    // Real-time message broadcast
    socket.on('sendMessage', async (data) => {
      try {
        const { conversationId, message } = data;
        if (!conversationId || !message) return;

        // Broadcast to everyone in conversation room (including sender or to others)
        io.to(`conversation:${conversationId}`).emit('receiveMessage', {
          conversationId,
          message,
        });

        // Broadcast notification to conversation participants outside the room
        const conv = await Conversation.findById(conversationId).select('participants name isGroup');
        if (conv) {
          conv.participants.forEach((pId) => {
            const pIdStr = pId.toString();
            if (pIdStr !== userId) {
              io.to(`user:${pIdStr}`).emit('newNotification', {
                conversationId,
                title: conv.isGroup ? conv.name : socket.user.name,
                body: message.content || 'Sent an attachment',
                sender: {
                  _id: socket.user._id,
                  name: socket.user.name,
                  avatar: socket.user.avatar,
                },
                message,
              });
            }
          });
        }
      } catch (err) {
        console.error('Error broadcasting message:', err);
      }
    });

    // Message delivered status
    socket.on('messageDelivered', async ({ messageId, conversationId }) => {
      try {
        if (!messageId) return;
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { deliveredTo: socket.user._id },
        });

        io.to(`conversation:${conversationId}`).emit('messageDelivered', {
          messageId,
          conversationId,
          userId: socket.user._id,
        });
      } catch (err) {
        console.error('Error handling messageDelivered:', err);
      }
    });

    // Message read receipt
    socket.on('messageRead', async ({ conversationId, messageIds }) => {
      try {
        if (!conversationId) return;

        io.to(`conversation:${conversationId}`).emit('messageRead', {
          conversationId,
          messageIds,
          userId: socket.user._id,
          readAt: new Date(),
        });
      } catch (err) {
        console.error('Error handling messageRead:', err);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          const lastSeen = new Date();
          await User.findByIdAndUpdate(userId, {
            status: 'offline',
            lastSeen,
          });

          // Broadcast userOffline event
          io.emit('userOffline', {
            userId,
            lastSeen,
          });
        }
      }
    });
  });
};
