import express from 'express';
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  verify2FA,
  resend2FA,
  request2FAActivation,
  toggle2FA,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

router.post('/login', login);
router.post('/verify-2fa', verify2FA);
router.post('/resend-2fa', resend2FA);

router.post('/2fa/request-activation', protect, request2FAActivation);
router.post('/2fa/toggle', protect, toggle2FA);

router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.patch('/update-password', protect, updatePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
