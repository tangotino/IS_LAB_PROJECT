const mongoose = require('mongoose');

// Define the password schema
const passwordSchema = new mongoose.Schema({
    user: {  // Change from userId to user for consistency
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the User model
    },
    website: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Create the Password model
const Password = mongoose.model('Password', passwordSchema);
module.exports = Password;
