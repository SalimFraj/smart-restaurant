import express from 'express';
import rateLimit from 'express-rate-limit';
import { getRecommendations, chat, getPairings, getOrderEstimate } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const aiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: 'Too many AI requests, please try again later'
});

router.post('/recommend', aiRateLimit, getRecommendations);
router.post('/chat', aiRateLimit, chat);
router.post('/pairings', aiRateLimit, getPairings);
router.get('/estimate', getOrderEstimate);

export default router;

