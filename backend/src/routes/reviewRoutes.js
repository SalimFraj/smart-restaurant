import express from 'express';
import { authenticate, adminOnly } from '../middleware/auth.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { emitNewReview, emitReviewResponse } from '../services/socketService.js';

const router = express.Router();

// @route   GET /api/v1/reviews
// @desc    Get all reviews (with filters)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { menuItem, rating, status = 'approved', page = 1, limit = 20 } = req.query;

        const query = { status };
        if (menuItem) query.menuItem = menuItem;
        if (rating) query.rating = parseInt(rating);

        const reviews = await Review.find(query)
            .populate('user', 'name')
            .populate('menuItem', 'name image')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Review.countDocuments(query);

        res.json({
            reviews,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/v1/reviews/menu-item/:id
// @desc    Get reviews for a specific menu item
// @access  Public
router.get('/menu-item/:id', async (req, res) => {
    try {
        const reviews = await Review.find({
            menuItem: req.params.id,
            status: 'approved',
        })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        const avgRating = await Review.calculateAverageRating(req.params.id);

        res.json({
            reviews,
            averageRating: avgRating,
            totalReviews: reviews.length,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/v1/reviews
// @desc    Create a review
// @access  Private
router.post('/', authenticate, async (req, res) => {
    try {
        const { menuItem, order, rating, title, comment, images } = req.body;

        // Check if user has ordered this item
        const orderExists = await Order.findOne({
            _id: order,
            user: req.user._id,
            'items.menuItem': menuItem,
            status: 'delivered',
        });

        if (!orderExists) {
            return res.status(400).json({ message: 'You can only review items you have ordered' });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({
            user: req.user._id,
            menuItem,
            order,
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this item' });
        }

        const review = await Review.create({
            user: req.user._id,
            menuItem,
            order,
            rating,
            title,
            comment,
            images: images || [],
            verifiedPurchase: true,
        });

        await review.populate('user', 'name');
        await review.populate('menuItem', 'name image');

        // Notify admins
        emitNewReview(review);

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/v1/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', authenticate, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { rating, title, comment, images } = req.body;

        review.rating = rating || review.rating;
        review.title = title || review.title;
        review.comment = comment || review.comment;
        review.images = images || review.images;

        await review.save();

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/v1/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await review.deleteOne();

        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/v1/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', authenticate, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const alreadyVoted = review.helpfulVotes.some(
            (vote) => vote.user.toString() === req.user._id.toString()
        );

        if (alreadyVoted) {
            return res.status(400).json({ message: 'Already voted' });
        }

        review.helpfulVotes.push({ user: req.user._id });
        await review.save();

        res.json({ helpfulCount: review.helpfulVotes.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/v1/reviews/:id/respond
// @desc    Add management response to review
// @access  Admin
router.put('/:id/respond', authenticate, adminOnly, async (req, res) => {
    try {
        const { response } = req.body;

        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.managementResponse = {
            response,
            respondedBy: req.user._id,
        };

        await review.save();

        // Notify user
        emitReviewResponse(review.user, review);

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/v1/reviews/:id/status
// @desc    Update review status
// @access  Admin
router.put('/:id/status', authenticate, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;

        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.status = status;
        await review.save();

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
