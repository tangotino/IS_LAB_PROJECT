const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Import the User model

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;

    // Check if the token is in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token
            token = req.headers.authorization.split(' ')[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get the user from the database
            req.user = await User.findById(decoded.id).select('-password'); // Exclude password from the user data
            next(); // Continue to the next middleware or route handler
        } catch (error) {
            console.error('Authentication error:', error);
            res.status(401).json({ success: false, message: 'Not authorized' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};
console.log('Loaded authMiddleware:', protect);


module.exports = {protect}; // Ensure this line is correct
