import express from 'express';
import {
  getConversations,
  getConversationById,
  createDirectConversation,
  getOrCreateAiConversation,
  createGroupConversation,
  updateGroup,
  addMembers,
  removeMember,
  togglePin,
} from '../controllers/conversationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getConversations);
router.post('/ai', getOrCreateAiConversation);
router.get('/:id', getConversationById);
router.post('/direct', createDirectConversation);
router.post('/group', createGroupConversation);
router.patch('/:id/group', updateGroup);
router.post('/:id/members', addMembers);
router.delete('/:id/members/:userId', removeMember);
router.post('/:id/pin', togglePin);

export default router;
