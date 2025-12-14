import express from 'express';
import {
  createFeedback,
  getMyFeedback,
  getAllFeedback
} from '../controllers/feedbackController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { validate, feedbackSchema } from '../middleware/validate.js';

const router = express.Router();

router.post('/', authenticate, validate(feedbackSchema), createFeedback);
router.get('/my-feedback', authenticate, getMyFeedback);
router.get('/all', authenticate, adminOnly, getAllFeedback);

export default router;

