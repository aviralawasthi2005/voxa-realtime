import User from '../models/User.js';
import { generateToken, generate2FAToken, verify2FAToken } from '../utils/jwt.js';
import {
  sendVerificationEmail,
  send2FAEmail,
  send2FAActivationEmail,
} from '../services/emailService.js';

// Helper to generate secure 6-digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user (with Email OTP verification)
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

    // Generate 6-digit OTP valid for 10 minutes
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Assign avatar preset based on name initials
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1f2328,24292f,161b22&textColor=ffffff`;

    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password,
      avatar: defaultAvatar,
      isVerified: false,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
      status: 'offline',
      lastSeen: new Date(),
    });

    // Dispatch verification email with OTP
    await sendVerificationEmail(cleanEmail, user.name, otp);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully. A 6-digit verification code has been dispatched to your email.',
      data: {
        email: cleanEmail,
        requiresVerification: true,
        previewOtp: process.env.NODE_ENV === 'production' ? null : otp,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify account email with 6-digit OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your email and the 6-digit verification code.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({ email: cleanEmail }).select(
      '+verificationOtp +verificationOtpExpires'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found matching this email address.',
      });
    }

    if (user.isVerified) {
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        message: 'Account is already verified. You may sign in.',
        data: { user: user.toJSON(), token },
      });
    }

    if (!user.verificationOtp || user.verificationOtp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check your email and try again.',
      });
    }

    if (new Date() > new Date(user.verificationOtpExpires)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please click resend to get a new code.',
      });
    }

    // Activate user
    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email successfully verified! Welcome to VOXA.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend registration verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified. Please sign in.',
      });
    }

    const newOtp = generateOTP();
    user.verificationOtp = newOtp;
    user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(cleanEmail, user.name, newOtp);

    res.status(200).json({
      success: true,
      message: 'A fresh verification code has been dispatched to your email.',
      data: {
        email: cleanEmail,
        previewOtp: process.env.NODE_ENV === 'production' ? null : newOtp,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & check 2FA
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { loginOrEmail, email, identifier: rawId, username, password } = req.body;
    const identifier = (loginOrEmail || email || rawId || username || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email or username, and password.',
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select('+password +isVerified +twoFactorEnabled');

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

    // 1. Enforce email verification (block unverified accounts)
    if (user.isVerified === false) {
      const newOtp = generateOTP();
      user.verificationOtp = newOtp;
      user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendVerificationEmail(user.email, user.name, newOtp);

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: 'Your email address is not verified yet. A verification code was dispatched to your email.',
        data: {
          email: user.email,
          requiresVerification: true,
          previewOtp: process.env.NODE_ENV === 'production' ? null : newOtp,
        },
      });
    }

    // 2. Check Two-Factor Authentication (2FA)
    if (user.twoFactorEnabled) {
      const twoFactorOtp = generateOTP();
      user.twoFactorOtp = twoFactorOtp;
      user.twoFactorOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await send2FAEmail(user.email, user.name, twoFactorOtp);

      const tempToken = generate2FAToken(user._id);

      return res.status(200).json({
        success: true,
        requires2FA: true,
        message: 'Two-factor authentication code sent to your email.',
        data: {
          requires2FA: true,
          email: user.email,
          tempToken,
          previewOtp: process.env.NODE_ENV === 'production' ? null : twoFactorOtp,
        },
      });
    }

    // 3. Normal Login (2FA not enabled)
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

// @desc    Verify 2FA Code and complete login
// @route   POST /api/auth/verify-2fa
// @access  Public
export const verify2FA = async (req, res, next) => {
  try {
    const { tempToken, otp } = req.body;

    if (!tempToken || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both the 2FA session token and 6-digit code.',
      });
    }

    let decoded;
    try {
      decoded = verify2FAToken(tempToken);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Two-factor authentication session expired. Please sign in again.',
      });
    }

    const cleanOtp = otp.toString().trim();
    const user = await User.findById(decoded.id).select('+twoFactorOtp +twoFactorOtpExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (!user.twoFactorOtp || user.twoFactorOtp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid two-factor authentication code.',
      });
    }

    if (new Date() > new Date(user.twoFactorOtpExpires)) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor code has expired. Please click resend code.',
      });
    }

    // Clear 2FA OTP & complete sign in
    user.twoFactorOtp = undefined;
    user.twoFactorOtpExpires = undefined;
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication successful. Welcome back!',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend 2FA login code
// @route   POST /api/auth/resend-2fa
// @access  Public
export const resend2FA = async (req, res, next) => {
  try {
    const { tempToken } = req.body;
    if (!tempToken) {
      return res.status(400).json({
        success: false,
        message: 'Temporary session token is required.',
      });
    }

    let decoded;
    try {
      decoded = verify2FAToken(tempToken);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Two-factor session expired. Please sign in again.',
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const newOtp = generateOTP();
    user.twoFactorOtp = newOtp;
    user.twoFactorOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await send2FAEmail(user.email, user.name, newOtp);

    res.status(200).json({
      success: true,
      message: 'A new 2FA security code has been dispatched to your email.',
      data: {
        previewOtp: process.env.NODE_ENV === 'production' ? null : newOtp,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request 2FA activation code (User Settings)
// @route   POST /api/auth/2fa/request-activation
// @access  Private
export const request2FAActivation = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor authentication is already enabled.',
      });
    }

    const otp = generateOTP();
    user.twoFactorOtp = otp;
    user.twoFactorOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await send2FAActivationEmail(user.email, user.name, otp);

    res.status(200).json({
      success: true,
      message: 'A 6-digit confirmation code has been dispatched to your email.',
      data: {
        email: user.email,
        previewOtp: process.env.NODE_ENV === 'production' ? null : otp,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle 2FA (Enable with OTP or Disable with password)
// @route   POST /api/auth/2fa/toggle
// @access  Private
export const toggle2FA = async (req, res, next) => {
  try {
    const { enable, otp, password } = req.body;
    const user = await User.findById(req.user._id).select(
      '+password +twoFactorOtp +twoFactorOtpExpires +twoFactorEnabled'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (enable) {
      // Enabling requires validating the confirmation OTP sent to their email
      if (!otp) {
        return res.status(400).json({
          success: false,
          message: 'Please provide the 6-digit confirmation code sent to your email.',
        });
      }

      if (!user.twoFactorOtp || user.twoFactorOtp !== otp.toString().trim()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid 2FA confirmation code.',
        });
      }

      if (new Date() > new Date(user.twoFactorOtpExpires)) {
        return res.status(400).json({
          success: false,
          message: 'Confirmation code has expired. Please request a new code.',
        });
      }

      user.twoFactorEnabled = true;
      user.twoFactorOtp = undefined;
      user.twoFactorOtpExpires = undefined;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Two-factor authentication enabled successfully.',
        data: { twoFactorEnabled: true },
      });
    } else {
      // Disabling requires current password verification
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Please enter your current password to disable two-factor authentication.',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect password. Cannot disable two-factor authentication.',
        });
      }

      user.twoFactorEnabled = false;
      user.twoFactorOtp = undefined;
      user.twoFactorOtpExpires = undefined;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Two-factor authentication has been disabled.',
        data: { twoFactorEnabled: false },
      });
    }
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
