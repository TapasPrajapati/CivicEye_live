const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    crimeType: String,
    date: Date,
    location: String,
    description: String,
    evidence: [String],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);