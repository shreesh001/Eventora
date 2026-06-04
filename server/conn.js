const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI,({
    serverSelectionTimeoutMS: 5000
}))
.then(()=>{
    console.log("Database connected successfully");
})
.catch((err)=>{
    console.error("Database connection error:", err);
})