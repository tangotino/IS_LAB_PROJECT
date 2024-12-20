const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Password = require('../models/passwordModel'); // Import the Password model
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const registerUser = async (req, res) => {
    console.log("Request Body:", req.body);
    const { name, email, password, enable2FA } = req.body;

    // Ensure all fields are provided
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create a new user and save immediately to avoid redundant saves
    const user = new User({
        name,
        email,
        password, // The password will be hashed automatically in the model
        twoFAEnabled: enable2FA || false,
    });
    await user.save();

    // Only generate a TOTP secret and QR code if 2FA is enabled
    if (user.twoFAEnabled) {
        const secret = speakeasy.generateSecret({ length: 4 });
        user.totpSecret = secret.base32;
        
        // Save the TOTP secret
        await user.save();

        console.log("Generated TOTP Secret:", secret.base32);  // Logs the secret to the console
        console.log("TOTP Auth URL:", secret.otpauth_url);

        // Generate a QR code for the user to scan
        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

        // Send the JWT token, QR code URL, and TOTP secret to the user
        res.status(201).json({ 
            success: true, 
            token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }), 
            qrCodeUrl,
            totpSecret: secret.base32 // Include the TOTP secret
        });
    } else {
        // If 2FA is not enabled, just send the token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({ success: true, token });
    }
};


// Login user
// Login user
// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const MAX_ATTEMPTS = 3;
    const LOCK_TIME = 5 * 60 * 1000;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Handle lock and failed attempts logic...
    if (user.lockUntil && user.lockUntil > Date.now()) {
        const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000);
        return res.status(403).json({ success: false, message: `Account is locked. Try again in ${remainingTime} seconds.` });
    }

    if (user.lockUntil && user.lockUntil < Date.now()) {
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
    }

    const passwordMatches = await user.comparePassword(password.trim());
    if (!passwordMatches) {
        user.failedLoginAttempts += 1;

        if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
            user.lockUntil = Date.now() + LOCK_TIME;
            await user.save();
            return res.status(403).json({ success: false, message: `Account locked due to too many failed attempts. Try again in 5 minutes.` });
        }

        await user.save();
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // If TOTP is enabled, indicate TOTP is required
    if (user.twoFAEnabled) {
        return res.status(200).json({ success: true, message: 'TOTP required', totpRequired: true, email });
    }

    // Generate a JWT token if no TOTP is required
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token: jwtToken });
};


// Fetch passwords for the authenticated user
const fetchPasswords = async (req, res) => {
    try {
        // Fetch passwords belonging to the authenticated user
        const passwords = await Password.find({ user: req.user.id });
        res.json({ success: true, data: passwords });
    } catch (error) {
        console.error('Error fetching passwords:', error); // Log the error for debugging
        res.status(500).json({ success: false, message: 'Failed to fetch passwords' });
    }
};

// Save a new password for the authenticated user
const savePassword = async (req, res) => {
    const { website, password } = req.body; // Get the website and password from request body

    // Ensure both fields are provided
    if (!website || !password) {
        return res.status(400).json({ success: false, message: 'Website and password are required' });
    }

    try {
        // Create a new password entry with the associated user ID
        const newPassword = new Password({
            website,
            password,
            user: req.user.id, // Associate the password with the authenticated user
        });

        await newPassword.save(); // Save the new password
        res.status(201).json({ success: true, message: 'Password saved successfully' });
    } catch (error) {
        console.error('Error saving password:', error); // Log the error for debugging
        res.status(500).json({ success: false, message: 'Failed to save password' });
    }
};

// Verify TOTP code
const verifyTotp = async (req, res) => {
    const { email, token } = req.body; // Expecting email and token for 2FA

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or token' });
    }

    // Verify the TOTP token
    const verified = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token,
        window: 1, // Allow for a 1-step time variance
    });

    if (!verified) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Generate a JWT token
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token: jwtToken });
};


module.exports = { registerUser, loginUser, fetchPasswords, savePassword,verifyTotp };
