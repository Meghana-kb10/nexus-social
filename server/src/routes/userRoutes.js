import express from 'express';
import {
  toggleFollow,
  getSuggestedUsers,
  getNotifications,
  getUserProfile
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected user routes
router.post('/:userId/follow', protect, toggleFollow);
router.get('/suggestions', protect, getSuggestedUsers);
router.get('/notifications', protect, getNotifications);
router.get('/:userId/profile', protect, getUserProfile);

export default router;
