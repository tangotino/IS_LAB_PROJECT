const Password = require('../models/passwordModel');
const crypto = require('crypto');

const algorithm = 'aes-256-cbc'; // Choose encryption algorithm
const key = crypto.randomBytes(32); // Key should be stored securely
const iv = crypto.randomBytes(16); // Initialization vector

// Debugging logs
console.log('Password controller loaded');

// Save password
const savePassword = async (req, res) => {
    console.log('savePassword function called'); // Debugging log
    const { website, password } = req.body;

    // Encrypt password
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encryptedPassword = cipher.update(password, 'utf8', 'hex');
    encryptedPassword += cipher.final('hex');

    const newPassword = new Password({
        user: req.user.id, // Associate password with the authenticated user
        website,
        password: encryptedPassword,
    });

    try {
        console.log('Saving password for user:', req.user.id); // Debugging log
        await newPassword.save();
        res.status(201).json({ success: true, message: 'Password saved successfully!' });
    } catch (error) {
        console.error('Error saving password:', error);
        res.status(500).json({ success: false, message: 'Failed to save password' });
    }
};

// Fetch passwords
const fetchPasswords = async (req, res) => {
    console.log('fetchPasswords called'); // Log when this function is called
    try {
        const userId = req.user._id; // Get the authenticated user's ID
        console.log('User ID:', userId); // Log the user ID for debugging
        
        const passwords = await Password.find({ user: userId }); // Fetch passwords for the user
        console.log('Fetched passwords:', passwords); // Log the fetched passwords

        res.status(200).json({
            success: true,
            data: passwords,
        });
    } catch (error) {
        console.error('Error fetching passwords:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { savePassword, fetchPasswords };
