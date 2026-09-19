import express from 'express';
import {
  searchUsers,
  getUsers,
  getUserById,
  updateProfile,
  uploadAvatar,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/', getUsers);
router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.patch('/me', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

export default router;
