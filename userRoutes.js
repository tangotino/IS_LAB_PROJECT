const express = require('express');
const router = express.Router();
const { registerUser, loginUser, fetchPasswords, savePassword } = require('../controllers/userController'); // Ensure this path is correct
const {protect} = require('../middleware/authMiddleware'); // Make sure this path is correct


// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

console.log('Protect middleware:', protect);
console.log('Is protect a function?', typeof protect === 'function');


// Protect the following routes
router.use(protect); // Apply the middleware to all subsequent routes

// Fetch passwords route
router.get('/passwords', fetchPasswords); // Changed to '/passwords'

// Save password route
router.post('/passwords', savePassword); // Changed to '/passwords'

module.exports = router;
