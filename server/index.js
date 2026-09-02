const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');

dotenv.config();    


const app = express();
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || origin.endsWith('.vercel.app') || origin === 'http://localhost:5173') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
// Middleware to parse JSON bodies
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);

// connect to database
require('./conn'); 

const PORT = process.env.PORT || 5001;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});
