const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const passwordRoutes = require('./routes/passwordRoutes'); // Import password routes
const { protect } = require('./middleware/authMiddleware'); // Import protect middleware

dotenv.config();

// Log the MongoDB URI to the console (optional for debugging)
console.log('MONGO_URI:', process.env.MONGO_URI);

// Connect to the database
connectDB();

const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Simple test route to verify request body parsing
app.post('/test', (req, res) => {
    console.log('Request Body:', req.body);
    res.json({ success: true, data: req.body });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/passwords', protect, passwordRoutes); // Add password routes protected by middleware

// Error handling for unsupported routes
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err); // Log the error for debugging
    res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
