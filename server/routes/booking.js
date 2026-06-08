const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { getAllBookings, bookEvent, sendBookingOTP, 
        getMyBookings, cancelBooking, confirmBooking } = require('../controllers/bookingController');

router.post('/', protect, bookEvent);
router.post('/send-otp', protect, sendBookingOTP);
router.get('/my', protect, getMyBookings);                   
router.get('/all', protect, admin, getAllBookings);          
router.put('/:id/confirm', protect, admin, confirmBooking); 
router.delete('/:id', protect, cancelBooking);

module.exports = router;