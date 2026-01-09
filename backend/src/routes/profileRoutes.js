import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
    getProfile,
    updateProfile,
    addFavorite,
    removeFavorite,
    getFavorites
} from '../controllers/profileController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/', getProfile);
router.put('/', updateProfile);

// Favorites routes
router.get('/favorites', getFavorites);
router.post('/favorites/:menuItemId', addFavorite);
router.delete('/favorites/:menuItemId', removeFavorite);

export default router;
