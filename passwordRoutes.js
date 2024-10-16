const express = require('express');
const { addPassword, getPasswords } = require('../controllers/passwordController');
const { protect } = require('../middleware/authMiddleware'); // Middleware to protect routes
const router = express.Router();

router.post('/passwords', protect, addPassword); // Add password route
router.get('/passwords', protect, getPasswords); // Get passwords route

module.exports = router;
