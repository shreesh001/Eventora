const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();    


const app = express();
app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);

// connect to database
require('./conn'); 

const PORT = process.env.PORT || 5000;


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});