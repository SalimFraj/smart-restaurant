import Reservation from '../models/Reservation.js';
import { emitNewReservation, emitReservationUpdate } from '../services/socketService.js';

export const createReservation = async (req, res, next) => {
  try {
    const { date, time, guests, specialRequests, contactPhone, contactEmail, eventType = 'regular', eventDetails } = req.body;

    // Check for duplicate reservation (same user, date, and time)
    const existingReservation = await Reservation.findOne({
      user: req.user._id,
      date: new Date(date),
      time,
      status: { $in: ['pending', 'approved'] }, // Only check active reservations
    });

    if (existingReservation) {
      return res.status(400).json({
        message: 'You already have a reservation for this date and time'
      });
    }

    const reservation = await Reservation.create({
      user: req.user._id,
      date: new Date(date),
      time,
      guests,
      eventType,
      eventDetails,
      specialRequests,
      contactPhone,
      contactEmail
    });

    // Populate user for notification
    await reservation.populate('user', 'name email');

    // Notify admins
    emitNewReservation(reservation);

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

export const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .sort({ date: -1, time: -1 });

    res.json({ success: true, count: reservations.length, data: reservations });
  } catch (error) {
    next(error);
  }
};

export const getAllReservations = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const reservations = await Reservation.find(filter)
      .populate('user', 'name email')
      .sort({ date: 1, time: 1 });

    res.json({ success: true, count: reservations.length, data: reservations });
  } catch (error) {
    next(error);
  }
};

export const updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Manually populate to handle deleted user reference
    await reservation.populate('user', 'name email').catch(() => { });

    // Notify user only if user reference still exists
    if (reservation.user && reservation.user._id) {
      emitReservationUpdate(reservation.user._id, reservation);
    }

    res.json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

