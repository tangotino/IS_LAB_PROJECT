const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Password = require('../models/passwordModel'); // Import the Password model

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

    // Create a new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ success: true, token });
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
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

module.exports = { registerUser, loginUser, fetchPasswords, savePassword };
