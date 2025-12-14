import Feedback from '../models/Feedback.js';
import { analyzeSentiment } from '../services/groqService.js';
import { emitNewFeedback } from '../services/socketService.js';

export const createFeedback = async (req, res, next) => {
  try {
    const { order, rating, comment } = req.body;

    // Analyze sentiment using AI
    const sentimentResult = await analyzeSentiment(comment);

    const feedback = await Feedback.create({
      user: req.user._id,
      order,
      rating,
      comment,
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.score
    });

    // Populate user for notification
    await feedback.populate('user', 'name email');

    // Notify admins
    emitNewFeedback(feedback);

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};

export const getMyFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id })
      .populate('order', 'totalAmount status')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (error) {
    next(error);
  }
};

export const getAllFeedback = async (req, res, next) => {
  try {
    const { sentiment } = req.query;
    const filter = sentiment ? { sentiment } : {};

    const feedbacks = await Feedback.find(filter)
      .populate('user', 'name email')
      .populate('order', 'totalAmount status')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (error) {
    next(error);
  }
};

