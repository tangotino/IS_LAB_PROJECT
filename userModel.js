const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Ensure that the name field is required
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure that the email is unique
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true }); // Optional: Adds createdAt and updatedAt fields

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

const User = mongoose.model('User', userSchema);
module.exports = User;
