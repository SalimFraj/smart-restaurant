import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        comment: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        images: [{
            type: String,
        }],
        helpfulVotes: {
            type: Number,
            default: 0,
        },
        votedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        verifiedPurchase: {
            type: Boolean,
            default: false,
        },
        response: {
            text: String,
            respondedAt: Date,
            respondedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
reviewSchema.index({ menuItem: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function (menuItemId) {
    const result = await this.aggregate([
        { $match: { menuItem: menuItemId, status: 'approved' } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
            },
        },
    ]);

    return result.length > 0 ? result[0] : { avgRating: 0, totalReviews: 0 };
};

const Review = mongoose.model('Review', reviewSchema);

export default Review;
