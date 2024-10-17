const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyTotp, fetchPasswords, savePassword } = require('../controllers/userController'); // Include the verifyTotp function
const { protect } = require('../middleware/authMiddleware'); // Make sure this path is correct

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser); // Keep this as is, the loginUser function now handles TOTP

// TOTP verification route
router.post('/verify-totp', verifyTotp); // New route for TOTP verification

console.log('Protect middleware:', protect);
console.log('Is protect a function?', typeof protect === 'function');

// Protect the following routes
router.use(protect); // Apply the middleware to all subsequent routes

// Fetch passwords route
router.get('/passwords', fetchPasswords); // Changed to '/passwords'

// Save password route
router.post('/passwords', savePassword); // Changed to '/passwords'

module.exports = router;
