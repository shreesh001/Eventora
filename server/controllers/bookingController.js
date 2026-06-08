const Booking = require('../models/Booking');
const Event = require('../models/event');
const OTP = require('../models/OTP');
const { sendbookingEmail, sendOTPEmail } = require('../utils/emailService');

// sending booking otp
const sendBookingOTP = async (req, res) => {
    try {
        await OTP.deleteMany({ email: req.user.email, action: 'event_booking' });

        const otpData = await OTP.create({
            email: req.user.email,
            otp: Math.floor(100000 + Math.random() * 900000).toString(),
            action: 'event_booking'
        });

        await sendOTPEmail(req.user.email, otpData.otp, 'event_booking');
        res.json({ message: 'OTP sent to your email for event booking.' });
    } catch (error) {
        console.error('Error sending booking OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
};

// check otp and book event
const bookEvent = async (req, res) => {
    try {
        const { eventId, otp, numberOfSeats = 1 } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        //exact seats check
        if (event.availableSeats < numberOfSeats) {
            return res.status(400).json({ message: 'Not enough seats available' });
        }

        const otpData = await OTP.findOne({ email: req.user.email, action: 'event_booking' });
        if (!otpData || otpData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const existingBooking = await Booking.findOne({ user: req.user._id, event: eventId, status: { $in: ['pending', 'confirmed'] } });
        if (existingBooking) {
            return res.status(400).json({ message: 'You have already booked this event' });
        }

        const booking = new Booking({
            user: req.user._id,
            event: event._id,
            numberOfSeats,
            status: 'pending',
            paymentStatus: 'not_paid',
            amount: event.ticketPrice * numberOfSeats
        });
        await booking.save();

        await OTP.deleteMany({ email: req.user.email, action: 'event_booking' });
        res.status(201).json({ message: 'Booking created successfully', booking });

    } catch (error) {
        console.error('Error booking event:', error);
        res.status(500).json({ message: 'Failed to book event. Please try again.' });
    }
};

// Admin confirms booking
const confirmBooking = async (req, res) => {
    try {
        const paymentStatus = req.body.paymentStatus;
        if (!['paid', 'not_paid'].includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name email')
            .populate('event', 'title');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending bookings can be confirmed' });
        }

        const event = await Event.findById(booking.event._id);
        if (event.availableSeats < booking.numberOfSeats) {
            return res.status(400).json({ message: 'Not enough seats available' });
        }

        booking.status = 'confirmed';
        booking.paymentStatus = paymentStatus;
        await booking.save();

        event.availableSeats -= booking.numberOfSeats;
        await event.save();

        await sendbookingEmail(booking.user.email, booking.user.name, booking.event.title);
        res.json({ message: 'Booking confirmed and email sent to user', booking });
    } catch (error) {
        console.error('Error confirming booking:', error);
        res.status(500).json({ message: 'Failed to confirm booking. Please try again.' });
    }
};

// get user's bookings
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('event', 'title date time location');
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Failed to fetch bookings. Please try again.' });
    }
};

// cancel booking
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('event');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only cancel your own bookings' });
        }
        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }
        if (booking.status === 'pending') {
            return res.status(400).json({ message: 'Pending bookings cannot be cancelled. Wait for admin confirmation first.' }); // ✅ clear message
        }

        booking.status = 'cancelled';
        await booking.save();

        const event = booking.event;
        event.availableSeats += booking.numberOfSeats;
        await event.save();

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Failed to cancel booking. Please try again.' });
    }
};

// get all bookings for admin
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('event', 'title date time location totalSeats availableSeats');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    sendBookingOTP,
    bookEvent,
    confirmBooking,
    getMyBookings,
    cancelBooking,
    getAllBookings
};