const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    numberOfSeats: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'not_paid'],
        default: 'not_paid'
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    razorpayOrderId: {
        type: String,
        default: null
    },
    razorpayPaymentId: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);