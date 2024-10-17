const express = require('express');
const { savePassword, fetchPasswords } = require('../controllers/passwordController'); // Import controller functions
const { protect } = require('../middleware/authMiddleware'); // Middleware to protect routes

const router = express.Router();

// Route to save a password
router.post('/', protect, async (req, res) => {
    console.log('Accessing savePassword route');
    try {
        // Call the savePassword function from the controller
        await savePassword(req, res);
    } catch (error) {
        console.error('Error in savePassword route:', error);
        res.status(500).json({ success: false, message: 'Server error while saving password' });
    }
});

// Route to get passwords for the authenticated user
router.get('/', protect, async (req, res) => {
    console.log('Accessing fetchPasswords route');
    try {
        // Call the fetchPasswords function from the controller
        await fetchPasswords(req, res);
    } catch (error) {
        console.error('Error in fetchPasswords route:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching passwords' });
    }
});

module.exports = router;
