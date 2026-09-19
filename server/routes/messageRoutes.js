import express from 'express';
import {
  getMessages,
  sendMessage,
  reactToMessage,
  markMessagesAsRead,
  uploadAttachment,
  deleteMessage,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/:conversationId', getMessages);
router.post('/', sendMessage);
router.post('/:id/react', reactToMessage);
router.patch('/:conversationId/read', markMessagesAsRead);
router.post('/upload', upload.single('file'), uploadAttachment);
router.delete('/:id', deleteMessage);

export default router;
