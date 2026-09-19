import User from '../models/User.js';

// @desc    Search users by name, username or email
// @route   GET /api/users/search?q=...
// @access  Private
export const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q ? req.query.q.trim() : '';
    if (!query) {
      return res.status(200).json({ success: true, data: { users: [] } });
    }

    const regex = new RegExp(query, 'i');
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ name: regex }, { username: regex }, { email: regex }],
    })
      .select('name username email avatar bio status lastSeen')
      .limit(20);

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (directory for starting chats)
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('name username email avatar bio status lastSeen')
      .sort({ name: 1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user profile
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name username email avatar bio status lastSeen createdAt preferences'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PATCH /api/users/me
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, status, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatar) user.avatar = avatar.trim();
    if (status) user.status = status;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   POST /api/users/avatar
// @access  Private
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded.',
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const user = await User.findById(req.user._id);
    user.avatar = fileUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully.',
      data: {
        avatarUrl: fileUrl,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
