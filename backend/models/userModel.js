const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the Password schema
const passwordSchema = new mongoose.Schema({
    website: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

// Define the User schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Ensure that the name field is required
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure that the email is unique
        lowercase: true, // Convert email to lowercase
    },
    password: {
        type: String,
        required: true, // This is the login password
    },
    passwords: [passwordSchema], // Array of passwords associated with the user

    // Fields for 2FA
    totpSecret: {
        type: String, // Store the secret for TOTP
        required: false, // Not required until 2FA is enabled
    },
    twoFAEnabled: {
        type: Boolean,
        default: false, // Default is disabled
    },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next(); // Skip hashing if the password has not been modified
    }
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next(); // Proceed to save the user
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password); // Compare passwords
};

// Create the User model
const User = mongoose.model('User', userSchema);
module.exports = User;
