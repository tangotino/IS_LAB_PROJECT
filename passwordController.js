const Password = require('../models/passwordModel');
const crypto = require('crypto');

const algorithm = 'aes-256-cbc'; // Choose encryption algorithm
const key = crypto.randomBytes(32); // Key should be stored securely
const iv = crypto.randomBytes(16); // Initialization vector

// Add password
const addPassword = async (req, res) => {
    const { website, password } = req.body;

    // Encrypt password
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encryptedPassword = cipher.update(password, 'utf8', 'hex');
    encryptedPassword += cipher.final('hex');

    const newPassword = new Password({
        userId: req.user.id, // Assuming you have middleware to set req.user
        website,
        password: encryptedPassword,
    });

    await newPassword.save();
    res.status(201).json({ success: true, message: 'Password saved successfully!' });
};

// Get passwords
const getPasswords = async (req, res) => {
    const passwords = await Password.find({ userId: req.user.id });
    res.status(200).json({ success: true, data: passwords });
};

module.exports = { addPassword, getPasswords };
