const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const router = express.Router();

// Route for user registration
router.post('/register', registerUser);  // Pass directly to the controller

// Route for user login
router.post('/login', loginUser);  // Pass directly to the controller

module.exports = router;
