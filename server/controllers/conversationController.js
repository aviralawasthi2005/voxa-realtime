import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { getOrCreateAiUser } from '../services/aiService.js';

// @desc    Get all conversations for the authenticated user
// @route   GET /api/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .populate('participants', 'name username email avatar status lastSeen')
      .populate('admin', 'name username email avatar')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username avatar' },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single conversation by ID
// @route   GET /api/conversations/:id
// @access  Private
export const getConversationById = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: { $in: [req.user._id] },
    })
      .populate('participants', 'name username email avatar status lastSeen bio')
      .populate('admin', 'name username email avatar')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username avatar' },
      });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied.',
      });
    }

    res.status(200).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or access 1-on-1 direct conversation
// @route   POST /api/conversations/direct
// @access  Private
export const createDirectConversation = async (req, res, next) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required.',
      });
    }

    if (recipientId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create a direct conversation with yourself.',
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found.',
      });
    }

    // Check if direct conversation already exists
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [req.user._id, recipientId], $size: 2 },
    })
      .populate('participants', 'name username email avatar status lastSeen bio')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username avatar' },
      });

    if (!conversation) {
      conversation = await Conversation.create({
        isGroup: false,
        participants: [req.user._id, recipientId],
        unreadCounts: {
          [req.user._id.toString()]: 0,
          [recipientId.toString()]: 0,
        },
      });

      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        'name username email avatar status lastSeen bio'
      );
    }

    res.status(200).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or create 1-on-1 conversation with VOXA AI Bot
// @route   POST /api/conversations/ai
// @access  Private
export const getOrCreateAiConversation = async (req, res, next) => {
  try {
    const aiUser = await getOrCreateAiUser();
    if (!aiUser) {
      return res.status(500).json({
        success: false,
        message: 'Could not initialize AI Bot.',
      });
    }

    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [req.user._id, aiUser._id], $size: 2 },
    })
      .populate('participants', 'name username email avatar status lastSeen bio isBot')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username avatar isBot' },
      });

    if (!conversation) {
      conversation = await Conversation.create({
        isGroup: false,
        participants: [req.user._id, aiUser._id],
        unreadCounts: {
          [req.user._id.toString()]: 0,
          [aiUser._id.toString()]: 0,
        },
      });

      // Send initial welcome message from VOXA AI
      const firstName = req.user?.name ? req.user.name.split(' ')[0] : 'there';
      const welcomeMsg = await Message.create({
        conversation: conversation._id,
        sender: aiUser._id,
        content: `Hello ${firstName}! 👋 I am **VOXA AI**, your built-in intelligent co-pilot.\n\nAsk me anything from coding and debugging to drafting messages or brainstorming ideas. You can also mention \`@ai\` in any group chat to invite me to the discussion!\n\nHow can I help you today?`,
        messageType: 'text',
        status: 'sent',
        deliveredTo: [aiUser._id],
        readBy: [{ user: aiUser._id, readAt: new Date() }],
      });

      conversation.lastMessage = welcomeMsg._id;
      await conversation.save();

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name username email avatar status lastSeen bio isBot')
        .populate({
          path: 'lastMessage',
          populate: { path: 'sender', select: 'name username avatar isBot' },
        });
    }

    res.status(200).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new group conversation
// @route   POST /api/conversations/group
// @access  Private
export const createGroupConversation = async (req, res, next) => {
  try {
    const { name, description, participants = [], avatar } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required.',
      });
    }

    // Ensure creator is in participants array and remove duplicates
    const memberIds = Array.from(
      new Set([req.user._id.toString(), ...participants.map((p) => p.toString())])
    );

    if (memberIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'A group conversation requires at least 2 members.',
      });
    }

    const defaultAvatar =
      avatar ||
      `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=22252a,1e293b`;

    const unreadMap = {};
    memberIds.forEach((id) => {
      unreadMap[id] = 0;
    });

    let conversation = await Conversation.create({
      isGroup: true,
      name: name.trim(),
      description: description ? description.trim() : '',
      avatar: defaultAvatar,
      admin: req.user._id,
      participants: memberIds,
      unreadCounts: unreadMap,
    });

    // Create system message for group creation
    const systemMsg = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      content: `${req.user.name} created the group "${name.trim()}".`,
      messageType: 'system',
      status: 'sent',
    });

    conversation.lastMessage = systemMsg._id;
    await conversation.save();

    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name username email avatar status lastSeen bio')
      .populate('admin', 'name username email avatar')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username avatar' },
      });

    res.status(201).json({
      success: true,
      message: 'Group created successfully.',
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update group details (name, description, avatar)
// @route   PATCH /api/conversations/:id/group
// @access  Private
export const updateGroup = async (req, res, next) => {
  try {
    const { name, description, avatar } = req.body;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation || !conversation.isGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group conversation not found.',
      });
    }

    // Verify user is in the group
    if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group.',
      });
    }

    if (name) conversation.name = name.trim();
    if (description !== undefined) conversation.description = description.trim();
    if (avatar) conversation.avatar = avatar.trim();

    await conversation.save();

    const updated = await Conversation.findById(conversation._id)
      .populate('participants', 'name username email avatar status lastSeen bio')
      .populate('admin', 'name username email avatar')
      .populate('lastMessage');

    res.status(200).json({
      success: true,
      message: 'Group details updated.',
      data: { conversation: updated },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add members to group
// @route   POST /api/conversations/:id/members
// @access  Private
export const addMembers = async (req, res, next) => {
  try {
    const { userIds } = req.body;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation || !conversation.isGroup) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide user IDs to add.' });
    }

    const currentParticipantStrings = conversation.participants.map((p) => p.toString());
    const newMembers = userIds.filter((id) => !currentParticipantStrings.includes(id.toString()));

    if (newMembers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Selected users are already members of this group.',
      });
    }

    conversation.participants.push(...newMembers);
    await conversation.save();

    const addedUsers = await User.find({ _id: { $in: newMembers } }).select('name');
    const addedNames = addedUsers.map((u) => u.name).join(', ');

    // Add system message
    const sysMsg = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      content: `${req.user.name} added ${addedNames} to the group.`,
      messageType: 'system',
      status: 'sent',
    });

    conversation.lastMessage = sysMsg._id;
    await conversation.save();

    const updated = await Conversation.findById(conversation._id)
      .populate('participants', 'name username email avatar status lastSeen bio')
      .populate('admin', 'name username email avatar')
      .populate('lastMessage');

    res.status(200).json({
      success: true,
      message: 'Members added successfully.',
      data: { conversation: updated, systemMessage: sysMsg },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from group or leave group
// @route   DELETE /api/conversations/:id/members/:userId
// @access  Private
export const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation || !conversation.isGroup) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    const isAdmin = conversation.admin?.toString() === req.user._id.toString();
    const isSelf = req.user._id.toString() === userId.toString();

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Only the group admin can remove other members.',
      });
    }

    const targetUser = await User.findById(userId);

    conversation.participants = conversation.participants.filter(
      (p) => p.toString() !== userId.toString()
    );

    // If admin leaves, assign new admin if participants remain
    if (conversation.admin?.toString() === userId.toString() && conversation.participants.length > 0) {
      conversation.admin = conversation.participants[0];
    }

    const actionText = isSelf
      ? `${targetUser?.name || 'A member'} left the group.`
      : `${req.user.name} removed ${targetUser?.name || 'a member'} from the group.`;

    const sysMsg = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      content: actionText,
      messageType: 'system',
      status: 'sent',
    });

    conversation.lastMessage = sysMsg._id;
    await conversation.save();

    const updated = await Conversation.findById(conversation._id)
      .populate('participants', 'name username email avatar status lastSeen bio')
      .populate('admin', 'name username email avatar')
      .populate('lastMessage');

    res.status(200).json({
      success: true,
      message: isSelf ? 'Left group successfully.' : 'Member removed successfully.',
      data: { conversation: updated, systemMessage: sysMsg },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle pin conversation for current user
// @route   POST /api/conversations/:id/pin
// @access  Private
export const togglePin = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const userIdStr = req.user._id.toString();
    const isPinned = conversation.pinnedBy.some((id) => id.toString() === userIdStr);

    if (isPinned) {
      conversation.pinnedBy = conversation.pinnedBy.filter((id) => id.toString() !== userIdStr);
    } else {
      conversation.pinnedBy.push(req.user._id);
    }

    await conversation.save();

    res.status(200).json({
      success: true,
      data: { pinned: !isPinned },
    });
  } catch (error) {
    next(error);
  }
};
