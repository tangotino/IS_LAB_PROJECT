const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const passwordRoutes = require('./routes/passwordRoutes'); 
const { protect } = require('./middleware/authMiddleware'); 

dotenv.config();
connectDB();

const app = express();

// Enable CORS for your React app's origin
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your React app's URL if different
    credentials: true // Allow cookies to be sent if needed
}));

// Middleware to parse JSON requests
app.use(express.json());

// API routes
app.use('/api/users', userRoutes);
app.use('/api/passwords', protect, passwordRoutes); 

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
