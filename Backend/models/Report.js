const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const reportSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    crimeType: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    state: { type: String, required: true }, // For reportId
    description: { type: String, required: true },
    evidence: [String],
    firId: { type: Number, unique: true },
    status: { 
        type: String, 
        enum: ['registered', 'approved', 'officer-assigned', 'investigating', 'resolved'], 
        default: 'registered' 
    },
    assignedOfficer: { type: String, default: '' },
    reportId: {  // ✅ Replaces firNumber
        type: String,
        unique: true,
        required: true
    },
    createdAt: { type: Date, default: Date.now }
});

reportSchema.pre('save', function(next) {
    if (!this.reportId && this.state) {
        const stateCode = this.state.trim().slice(0, 2).toUpperCase(); 
        const year = new Date().getFullYear(); 
        const randomNumber = Math.floor(100000 + Math.random() * 900000); // Ex: 825771
        this.reportId = `${stateCode}-${year}-${randomNumber}`;
    }
    next();
});

reportSchema.plugin(AutoIncrement, { inc_field: 'firId' });
module.exports = mongoose.model('Report', reportSchema);
