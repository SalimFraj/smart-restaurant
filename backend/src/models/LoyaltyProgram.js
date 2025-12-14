import mongoose from 'mongoose';

const loyaltyProgramSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    points: {
        type: Number,
        default: 0,
        min: 0,
    },
    tier: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum'],
        default: 'bronze',
    },
    totalSpent: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalOrders: {
        type: Number,
        default: 0,
        min: 0,
    },
    rewards: [{
        type: {
            type: String,
            enum: ['discount', 'free_item', 'free_delivery', 'cashback'],
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
        description: String,
        expiresAt: Date,
        usedAt: Date,
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
    }],
    referralCode: {
        type: String,
        unique: true,
        sparse: true,
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    referrals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: true,
});

// Calculate tier based on total spent
loyaltyProgramSchema.methods.updateTier = function () {
    if (this.totalSpent >= 1000) {
        this.tier = 'platinum';
    } else if (this.totalSpent >= 500) {
        this.tier = 'gold';
    } else if (this.totalSpent >= 200) {
        this.tier = 'silver';
    } else {
        this.tier = 'bronze';
    }
};

// Add points from order
loyaltyProgramSchema.methods.addPointsFromOrder = function (orderTotal) {
    const pointsPerDollar = {
        bronze: 1,
        silver: 1.5,
        gold: 2,
        platinum: 3,
    };

    const points = Math.floor(orderTotal * pointsPerDollar[this.tier]);
    this.points += points;
    this.totalSpent += orderTotal;
    this.totalOrders += 1;

    this.updateTier();

    return points;
};

// Redeem points for reward
loyaltyProgramSchema.methods.redeemReward = function (rewardType, pointsCost) {
    if (this.points < pointsCost) {
        throw new Error('Insufficient points');
    }

    this.points -= pointsCost;

    const rewardConfigs = {
        discount_10: { type: 'discount', value: 10, points: 100 },
        discount_20: { type: 'discount', value: 20, points: 200 },
        free_delivery: { type: 'free_delivery', value: 5, points: 50 },
        cashback_5: { type: 'cashback', value: 5, points: 150 },
    };

    const config = rewardConfigs[rewardType];
    if (config) {
        this.rewards.push({
            type: config.type,
            value: config.value,
            description: `$${config.value} ${config.type}`,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });
    }
};

// Generate unique referral code
loyaltyProgramSchema.pre('save', async function (next) {
    if (!this.referralCode && this.isNew) {
        const code = `REF${this.user.toString().slice(-6).toUpperCase()}`;
        this.referralCode = code;
    }
    next();
});

// Indexes
loyaltyProgramSchema.index({ user: 1 });
loyaltyProgramSchema.index({ referralCode: 1 });
loyaltyProgramSchema.index({ tier: 1 });

const LoyaltyProgram = mongoose.model('LoyaltyProgram', loyaltyProgramSchema);

export default LoyaltyProgram;
