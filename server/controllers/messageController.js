import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Notification from '../models/Notification.js';
import { triggerAiReplyIfNeeded } from '../services/aiService.js';

// @desc    Get paginated messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 40;
    const skip = (page - 1) * limit;

    // Verify user is in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: { $in: [req.user._id] },
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to messages in this conversation.',
      });
    }

    const totalMessages = await Message.countDocuments({ conversation: conversationId });

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name username avatar isBot')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name username isBot' },
      })
      .populate('reactions.user', 'name username avatar');

    // Return in chronological order (oldest first for rendering)
    const orderedMessages = messages.reverse();

    res.status(200).json({
      success: true,
      data: {
        messages: orderedMessages,
        pagination: {
          page,
          limit,
          totalMessages,
          totalPages: Math.ceil(totalMessages / limit),
          hasMore: totalMessages > skip + limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, attachments = [], replyTo, messageType = 'text' } = req.body;

    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'Conversation ID is required.' });
    }

    if (!content && attachments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message must contain text content or an attachment.',
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: { $in: [req.user._id] },
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Conversation not found or you are not a participant.',
      });
    }

    // Create the message
    let message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content: content ? content.trim() : '',
      messageType: attachments.length > 0 && !content ? 'image' : messageType,
      attachments,
      replyTo: replyTo || null,
      status: 'sent',
      deliveredTo: [req.user._id],
      readBy: [{ user: req.user._id, readAt: new Date() }],
    });

    // Update conversation lastMessage & unread count for other participants
    conversation.lastMessage = message._id;
    conversation.participants.forEach((pId) => {
      if (pId.toString() !== req.user._id.toString()) {
        const currentCount = conversation.unreadCounts?.get(pId.toString()) || 0;
        conversation.unreadCounts.set(pId.toString(), currentCount + 1);
      }
    });

    await conversation.save();

    message = await Message.findById(message._id)
      .populate('sender', 'name username avatar isBot')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name username isBot' },
      });

    // Create notifications for other participants
    const otherParticipants = conversation.participants.filter(
      (p) => p.toString() !== req.user._id.toString()
    );

    const notifPromises = otherParticipants.map((recipientId) =>
      Notification.create({
        recipient: recipientId,
        sender: req.user._id,
        type: 'message',
        conversation: conversationId,
        message: message._id,
        title: conversation.isGroup ? `${conversation.name}` : `${req.user.name}`,
        body: content || 'Sent an attachment',
      })
    );
    await Promise.all(notifPromises);

    // Trigger AI response asynchronously if in AI chat or @ai mention
    const io = req.app?.get('io');
    triggerAiReplyIfNeeded({ message, conversation, io });

    res.status(201).json({
      success: true,
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or toggle emoji reaction to message
// @route   POST /api/messages/:id/react
// @access  Private
export const reactToMessage = async (req, res, next) => {
  try {
    const { emoji } = req.body;
    if (!emoji) {
      return res.status(400).json({ success: false, message: 'Emoji is required.' });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    const userIdStr = req.user._id.toString();
    const existingIndex = message.reactions.findIndex(
      (r) => r.user.toString() === userIdStr && r.emoji === emoji
    );

    if (existingIndex > -1) {
      // User already reacted with this emoji -> toggle off
      message.reactions.splice(existingIndex, 1);
    } else {
      // Add reaction
      message.reactions.push({
        user: req.user._id,
        emoji,
      });
    }

    await message.save();

    const updated = await Message.findById(message._id)
      .populate('sender', 'name username avatar')
      .populate('reactions.user', 'name username avatar');

    res.status(200).json({
      success: true,
      data: { message: updated },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all messages in a conversation as read by current user
// @route   PATCH /api/messages/:conversationId/read
// @access  Private
export const markMessagesAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Reset unread count in conversation
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      conversation.unreadCounts.set(userId.toString(), 0);
      await conversation.save();
    }

    // Update unread messages where this user is not in readBy
    await Message.updateMany(
      {
        conversation: conversationId,
        'readBy.user': { $ne: userId },
      },
      {
        $push: {
          readBy: { user: userId, readAt: new Date() },
        },
        $set: { status: 'read' },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload message attachment (image/doc)
// @route   POST /api/messages/upload
// @access  Private
export const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const attachment = {
      url: fileUrl,
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    };

    res.status(200).json({
      success: true,
      data: { attachment },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message (soft delete)
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages.',
      });
    }

    message.isDeleted = true;
    message.content = 'This message was deleted';
    message.attachments = [];
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted.',
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};
