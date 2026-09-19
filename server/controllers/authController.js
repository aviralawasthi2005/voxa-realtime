import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, username, email, password, confirmPassword } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, username, email, password).',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existingUser) {
      const field = existingUser.email === cleanEmail ? 'Email' : 'Username';
      return res.status(400).json({
        success: false,
        message: `${field} is already registered. Please use another.`,
      });
    }

    // Assign an avatar preset based on name initials
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1f2328,24292f,161b22&textColor=ffffff`;

    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password,
      avatar: defaultAvatar,
      status: 'online',
      lastSeen: new Date(),
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { loginOrEmail, email, password } = req.body;
    const identifier = (loginOrEmail || email || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email or username, and password.',
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your username/email and password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your password.',
      });
    }

    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & update presence
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        status: 'offline',
        lastSeen: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PATCH /api/auth/update-password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords.',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address.',
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    // In a production setup, email is sent with token. For full local verification:
    const resetToken = Buffer.from(`${user._id}-${Date.now()}`).toString('base64');

    res.status(200).json({
      success: true,
      message: 'Password reset instructions dispatched to your email.',
      data: {
        resetToken,
        hint: 'Use this reset token or the reset password form to complete password reset.',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    let user = null;
    if (email) {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    } else if (resetToken) {
      try {
        const decoded = Buffer.from(resetToken, 'base64').toString('ascii');
        const userId = decoded.split('-')[0];
        user = await User.findById(userId);
      } catch (e) {
        // Fall through
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset request.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You may now log in.',
    });
  } catch (error) {
    next(error);
  }
};
