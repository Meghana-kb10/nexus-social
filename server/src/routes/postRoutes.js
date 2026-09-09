import express from 'express';
import {
  createPost,
  getFeed,
  getPostById,
  toggleLike,
  addComment,
  getTrendingHashtags
} from '../controllers/postController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (with optional auth on feed so logged-in users can filter by 'following')
router.get('/', optionalAuth, getFeed);
router.get('/trending/hashtags', getTrendingHashtags);
router.get('/:id', getPostById);

// Protected routes
router.post('/', protect, createPost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);

export default router;
