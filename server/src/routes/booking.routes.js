import express from 'express';
import { createBooking, getBookings, updateBookingStatus } from '../controllers/booking.controller.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/', getBookings);
router.put('/:id/status', updateBookingStatus);

export default router;