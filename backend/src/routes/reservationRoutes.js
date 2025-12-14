import express from 'express';
import {
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus
} from '../controllers/reservationController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { validate, reservationSchema } from '../middleware/validate.js';

const router = express.Router();

router.post('/', authenticate, validate(reservationSchema), createReservation);
router.get('/my-reservations', authenticate, getMyReservations);
router.get('/all', authenticate, adminOnly, getAllReservations);
router.put('/:id/status', authenticate, adminOnly, updateReservationStatus);

export default router;

