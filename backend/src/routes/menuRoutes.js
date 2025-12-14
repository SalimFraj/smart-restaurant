import express from 'express';
import {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { validate, menuItemSchema } from '../middleware/validate.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getMenuItems);
router.get('/:id', getMenuItem);
router.post('/', authenticate, adminOnly, upload.single('image'), validate(menuItemSchema), createMenuItem);
router.put('/:id', authenticate, adminOnly, upload.single('image'), validate(menuItemSchema), updateMenuItem);
router.delete('/:id', authenticate, adminOnly, deleteMenuItem);

export default router;


