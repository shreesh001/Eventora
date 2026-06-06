const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { bookEvent, sendBookingOTP, getMyBookings, cancelBooking, confirmBooking } = require('../controllers/bookingController');

router.post('/',protect, bookEvent);
router.post('/send-otp', protect, sendBookingOTP);
router.get('/mybookings', protect, getMyBookings);
router.delete('/:id', protect, cancelBooking);
router.put('/:id/confirm', protect, admin, confirmBooking);


module.exports = router;