const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/booking');

dotenv.config();    


const app = express();
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://eventora-omega-six.vercel.app/'  
    ],
    credentials: true
}));
// Middleware to parse JSON bodies
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

// connect to database
require('./conn'); 

const PORT = process.env.PORT || 5001;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});