const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Event = require('../models/event');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
const createOrder = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const order = await razorpay.orders.create({
            amount: booking.amount * 100, // paise mein — ₹500 = 50000
            currency: 'INR',
            receipt: `receipt_${bookingId}`
        });

        res.json({ order, key: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};

// Verify payment signature
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        // Signature verify karo — tamper proof
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest('hex');

        if (expectedSign !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid payment — signature mismatch' });
        }

        // Booking update karo
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = 'confirmed';
        booking.paymentStatus = 'paid';
        booking.razorpayOrderId = razorpay_order_id;
        booking.razorpayPaymentId = razorpay_payment_id;
        await booking.save();

        // Available seats update karo
        const event = await Event.findById(booking.event);
        event.availableSeats -= booking.numberOfSeats;
        await event.save();

        res.json({ message: 'Payment verified! Booking confirmed.', booking });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
};

module.exports = { createOrder, verifyPayment };