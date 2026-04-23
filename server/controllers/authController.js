import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';

// Configuration for cookies used in authentication
// httpOnly: true makes the cookie inaccessible to client-side scripts, preventing XSS attacks
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
};

/**
 * Register a new user
 * 1. Hashes the password using bcrypt for security
 * 2. Saves user to database
 * 3. Generates a JWT token for immediate login
 */
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing Details" });
    }

    try {
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        // Hash password before saving to DB
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        // Create JWT token containing the user's unique ID
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Set the token in a cookie
        res.cookie('token', token, cookieOptions);

        // Send a welcome email (non-blocking in a real app, but synchronous here for simplicity)
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Our App!',
            text: `Welcome to our app. Your account has been successfully created with the email: ${email}`
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

/**
 * Log in an existing user
 * 1. Verifies if user exists
 * 2. Compares provided password with hashed password in DB
 * 3. Returns a JWT token via cookie
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: 'Email and password are required' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'Invalid email' });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, cookieOptions);
        return res.json({ success: true });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

/**
 * Logout user by clearing the authentication cookie
 */
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', cookieOptions);
        return res.json({ success: true, message: "Logged out" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

/**
 * Generate and send a 6-digit OTP for email verification
 */
export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (user.isAccountVerified) {
            return res.json({ success: false, message: 'Account already verified' });
        }

        // Generate 6-digit OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // OTP valid for 24 hours

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            html: EMAIL_VERIFY_TEMPLATE.replace('{{otp}}', otp).replace('{{email}}', user.email)
        };

        await transporter.sendMail(mailOptions);
        return res.json({ success: true, message: 'Verification OTP sent to your email' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

/**
 * Verify account using the OTP sent to email
 */
export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP expired' });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({ success: true, message: 'Email verified successfully' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

/**
 * Check if the current user session is valid (authenticated)
 */
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

/**
 * Send OTP for Password Reset
 */
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: 'Email is required' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // Reset OTP valid for 15 minutes

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            html: PASSWORD_RESET_TEMPLATE.replace('{{otp}}', otp).replace('{{email}}', user.email)
        };

        await transporter.sendMail(mailOptions);
        return res.json({ success: true, message: 'Password reset OTP sent to your email' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

/**
 * Verify OTP specifically for the password reset flow
 */
export const verifyResetOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.json({ success: false, message: 'Email and OTP are required' });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }
        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP expired' });
        }
        return res.json({ success: true });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

/**
 * Change user password using verified OTP
 */
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Email, OTP and new password are required' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP expired' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();
        return res.json({ success: true, message: 'Password has been reset successfully' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}