const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    age: Number,
    mobile: String,
    email: String,
    password: String,
    resetCode: String,
    resetCodeExpires: Date,
    resetToken: String,
    resetTokenExpires: Date
});

module.exports = mongoose.model('User', userSchema);