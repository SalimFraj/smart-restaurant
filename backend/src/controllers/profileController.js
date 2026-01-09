import User from '../models/User.js';
import Order from '../models/Order.js';

// Get user profile with populated favorites
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('favorites', 'name price image category dietary');

        // Get order count and total spent
        const orders = await Order.find({ user: req.user._id });
        const orderStats = {
            totalOrders: orders.length,
            totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0)
        };

        res.json({
            success: true,
            data: {
                ...user.toJSON(),
                orderStats
            }
        });
    } catch (error) {
        next(error);
    }
};

// Update user profile info
export const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, address, dietaryPreferences } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (dietaryPreferences) updateData.dietaryPreferences = dietaryPreferences;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).populate('favorites', 'name price image category dietary');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// Add item to favorites
export const addFavorite = async (req, res, next) => {
    try {
        const { menuItemId } = req.params;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { favorites: menuItemId } },
            { new: true }
        ).populate('favorites', 'name price image category dietary');

        res.json({
            success: true,
            message: 'Added to favorites',
            data: user.favorites
        });
    } catch (error) {
        next(error);
    }
};

// Remove item from favorites
export const removeFavorite = async (req, res, next) => {
    try {
        const { menuItemId } = req.params;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { favorites: menuItemId } },
            { new: true }
        ).populate('favorites', 'name price image category dietary');

        res.json({
            success: true,
            message: 'Removed from favorites',
            data: user.favorites
        });
    } catch (error) {
        next(error);
    }
};

// Get user's favorites
export const getFavorites = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('favorites', 'name price image category dietary description available');

        res.json({
            success: true,
            data: user.favorites || []
        });
    } catch (error) {
        next(error);
    }
};
