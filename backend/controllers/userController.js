const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Password = require('../models/passwordModel'); // Import the Password model
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Register user
const registerUser = async (req, res) => {
    console.log("Request Body:", req.body);
    const { name, email, password } = req.body;

    // Ensure all fields are provided
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create a new user (the password will be hashed automatically)
    const user = new User({
        name,
        email,
        password, // Just save the plain password; it will be hashed in the model
    });

    // Continue with TOTP and saving the user...
    const secret = speakeasy.generateSecret({ length: 20 });
    user.totpSecret = secret.base32;

    // Generate a QR code for the user to scan
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    await user.save(); // The password is hashed automatically in the model

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // Send the JWT token and QR code URL to the user
    res.status(201).json({ success: true, token, qrCodeUrl });
};


// Login user
// Login user
const loginUser = async (req, res) => {
    const { email, password, token } = req.body; // Expecting token for 2FA

    console.log("Request Body:", req.body); // Log the incoming login request

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    console.log("User found:", user); // Log the user object if found

    // Check if password matches
    const passwordMatches = await bcrypt.compare(password.trim(), user.password);
    console.log("Provided password:", password);
    console.log("Stored hashed password:", user.password);
    if (!passwordMatches) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if TOTP is required
    if (user.totpSecret) {
        if (!token) {
            return res.status(401).json({ success: false, message: 'TOTP token required' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.totpSecret,
            encoding: 'base32',
            token, // This is the token you expect from the user
            window: 1, // Allow for a 1-step time variance
        });

        if (!verified) {
            return res.status(401).json({ success: false, message: 'Invalid TOTP token' });
        }
    }

    // Generate a JWT token
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
