import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrder,
  updateOrderStatus
} from '../controllers/orderController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { validate, orderSchema, updateOrderStatusSchema } from '../middleware/validate.js';

const router = express.Router();

router.post('/', authenticate, validate(orderSchema), createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/all', authenticate, adminOnly, getAllOrders);
router.get('/:id', authenticate, getOrder);
router.put('/:id/status', authenticate, adminOnly, validate(updateOrderStatusSchema), updateOrderStatus);

export default router;

