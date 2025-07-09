// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    crimeType: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    evidence: [String],
    status: { 
        type: String, 
        enum: ['pending', 'investigating', 'resolved'], 
        default: 'pending' 
    },
    assignedOfficer: { type: String, default: '' },
    firNumber: { 
        type: String,
        unique: true
    },
    createdAt: { type: Date, default: Date.now }
});

// Generate FIR number before saving
reportSchema.pre('save', function(next) {
    if (!this.firNumber) {
        const year = new Date().getFullYear().toString().slice(-2);
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        this.firNumber = `FIR${year}${randomNum}`;
    }
    next();
});

module.exports = mongoose.model('Report', reportSchema);