const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendbookingEmail = async (userEmail, userName, eventTitle) => {
    try {
        const mailOPtions = { 
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Booking Confirmation',
            html: `
        <h2>Hi ${userName}!</h2>
        <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
        <p>Thank you for choosing Eventora.</p>
        `
        };
        await transporter.sendMail(mailOPtions);
        console.log(`Booking confirmation email sent to ${userEmail}`);
    }
    catch (err) {
        console.error("Error sending email:", err);
    }
};

const sendOTPEmail = async (userEmail, otp, type) => {
    try {
        const actionText = type === 'account_verification' ? 'Account Verification' : 'Event Booking';
        const msg = type === 'account_verification' ? "Use this OTP to verify your account on Eventora." : "Use this OTP to confirm your event booking on Eventora.";
        
        const mailOPtions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Your OTP for ${actionText}`,
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #111;">${actionText}</h2>
                    <p style="color: #555; font-size: 16px;">${msg}</p>
                    <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOPtions);
        console.log(`OTP email sent to ${userEmail} for ${actionText}`);
    }
    catch (err) {
        console.error("Error sending email:", err);
    }
}

module.exports = { sendbookingEmail, sendOTPEmail };