import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotification,
  clearAll,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:id', clearNotification);
router.delete('/', clearAll);

export default router;
