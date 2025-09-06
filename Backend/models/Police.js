const mongoose = require('mongoose');

const policeSchema = new mongoose.Schema({
    policeId: String,
    batchNo: String,
    rank: String,
    phone: String,
    station: String,
    email: String,
    password: String,
    isAdmin: { type: Boolean, default: false },
    resetCode: String,
    resetCodeExpires: Date,
    resetToken: String,
    resetTokenExpires: Date
});

module.exports = mongoose.model('Police', policeSchema);