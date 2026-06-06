const user = require('../models/user');
const OTP = require('../models/OTP');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { sendbookingEmail, sendOTPEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken');

const generateToken = (id, email, role) => {
    return jwt.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn: '3d' });
}

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create new user
        const userData = new user({
            name,
            email,
            password: hashedPassword
        })
        await userData.save();

        // Generate OTP and save to DB
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpData = new OTP({
            email,
            otp: otpCode,
            action: 'account_verification'
        });
        await otpData.save();

        // Send OTP email
        await sendOTPEmail(email, otpCode, 'account_verification');
        res.status(201).json({
            message: "Please verify your email.",
            email: userData.email
        });
    }
    catch (err) {
        console.error("error while registering user:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await user.findOne({ email });

        // check if email does not exist
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid email" });
        }

        // check if password is correct
        const hashedPassword = existingUser.password;
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // check if account is verified 
        if (!existingUser.verified && existingUser.role === 'user') {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            await OTP.deleteMany({ email, action: 'account_verification' });
            const otpData = new OTP({
                email,
                otp: otpCode,
                action: 'account_verification'
            });
            await otpData.save();
            await sendOTPEmail(email, otpCode, 'account_verification');
            return res.status(403).json({ message: "Account not verified. Please check your email for the OTP to verify your account.", email: existingUser.email });
        }

        return res.status(200).json(
            {
                message: "Login successful",
                _id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
                token: generateToken(existingUser._id, existingUser.email, existingUser.role)
            }
        );
    }
    catch (err) {
        console.log("error while logging in user:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};


const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        //find otp in DB
        const otpRecord = await OTP.findOne({ email, otp, action: 'account_verification' });
        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        //update user as verified
        const existingUser = await user.findOneAndUpdate({ email }, { verified: true }, { new: true });

        //delete otp record
        await OTP.deleteOne({ email, otp, action: 'account_verification' });

        res.status(200).json(
            {
                message: "Account verified successfully. You can now log in.",
                _id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
                token: generateToken(existingUser._id, existingUser.email, existingUser.role)
            }
        );
    }
    catch (err) {
        console.error("Error while verifying OTP:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { registerUser, loginUser, verifyOTP };  

