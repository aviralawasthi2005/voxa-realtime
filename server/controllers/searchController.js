import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// @desc    Global search across users, groups, conversations, and messages
// @route   GET /api/search?q=...
// @access  Private
export const globalSearch = async (req, res, next) => {
  try {
    const query = req.query.q ? req.query.q.trim() : '';

    if (!query || query.length < 2) {
      return res.status(200).json({
        success: true,
        data: {
          people: [],
          groups: [],
          messages: [],
        },
      });
    }

    const regex = new RegExp(query, 'i');
    const userId = req.user._id;

    // Search people
    const peoplePromise = User.find({
      _id: { $ne: userId },
      $or: [{ name: regex }, { username: regex }, { email: regex }],
    })
      .select('name username email avatar status bio')
      .limit(8);

    // Search user's groups
    const groupsPromise = Conversation.find({
      isGroup: true,
      participants: { $in: [userId] },
      $or: [{ name: regex }, { description: regex }],
    })
      .populate('participants', 'name username avatar')
      .limit(8);

    // Search user's message history in conversations they belong to
    // First get conversation IDs the user is in
    const userConvs = await Conversation.find({ participants: { $in: [userId] } }).select('_id');
    const convIds = userConvs.map((c) => c._id);

    const messagesPromise = Message.find({
      conversation: { $in: convIds },
      content: regex,
      isDeleted: { $ne: true },
    })
      .populate('sender', 'name username avatar')
      .populate('conversation', 'name isGroup participants')
      .sort({ createdAt: -1 })
      .limit(10);

    const [people, groups, messages] = await Promise.all([
      peoplePromise,
      groupsPromise,
      messagesPromise,
    ]);

    res.status(200).json({
      success: true,
      data: {
        people,
        groups,
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
};
