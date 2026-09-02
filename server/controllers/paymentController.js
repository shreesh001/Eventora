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
        if (booking.status !== 'pending' || booking.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'This booking has already been processed' });
        }

        const order = await razorpay.orders.create({
            amount: booking.amount * 100, // paise mein — ₹500 = 50000
            currency: 'INR',
            receipt: `receipt_${bookingId}`
        });

        // Bind the booking to this specific order so a signature from another
        // valid Razorpay order cannot be used to confirm it.
        booking.razorpayOrderId = order.id;
        await booking.save();

        res.json({ order, key: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};

// Verify payment signature
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment verification details' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status !== 'pending' || booking.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ message: 'Invalid or already processed payment order' });
        }

        // Signature verify karo — tamper proof
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest('hex');

        if (expectedSign !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid payment — signature mismatch' });
        }

        // Claim the pending booking atomically so duplicate verification calls
        // cannot consume seats more than once.
        const confirmedBooking = await Booking.findOneAndUpdate(
            { _id: bookingId, user: req.user._id, status: 'pending', razorpayOrderId: razorpay_order_id },
            {
                $set: {
                    status: 'confirmed',
                    paymentStatus: 'paid',
                    razorpayPaymentId: razorpay_payment_id
                }
            },
            { new: true }
        );
        if (!confirmedBooking) {
            return res.status(400).json({ message: 'Invalid or already processed payment order' });
        }

        // Use an atomic conditional decrement to prevent overselling when
        // multiple payments are verified at the same time.
        const event = await Event.findOneAndUpdate(
            { _id: confirmedBooking.event, availableSeats: { $gte: confirmedBooking.numberOfSeats } },
            { $inc: { availableSeats: -confirmedBooking.numberOfSeats } },
            { new: true }
        );
        if (!event) {
            await Booking.updateOne(
                { _id: confirmedBooking._id, razorpayPaymentId: razorpay_payment_id },
                { $set: { status: 'pending', paymentStatus: 'not_paid', razorpayPaymentId: null } }
            );
            return res.status(400).json({ message: 'Not enough seats available' });
        }

        res.json({ message: 'Payment verified! Booking confirmed.', booking: confirmedBooking });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
};

module.exports = { createOrder, verifyPayment };
