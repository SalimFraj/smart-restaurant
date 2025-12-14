import express from 'express';
import rateLimit from 'express-rate-limit';
import { getRecommendations, chat } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const aiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many AI requests, please try again later'
});

router.post('/recommend', aiRateLimit, getRecommendations);
router.post('/chat', aiRateLimit, chat);

export default router;

