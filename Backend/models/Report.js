const mongoose = require('mongoose');

// Simplified Report schema with proper index definitions
const reportSchema = new mongoose.Schema({
    reportId: {
        type: String,
        required: [true, 'Report ID is required'],
        unique: true,  // KEEP THIS - it creates the unique index
        index: true    // This is fine for basic indexing
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        index: true    // Single index definition
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    crimeType: {
        type: String,
        required: [true, 'Crime type is required'],
        trim: true
    },
    date: {
        type: Date,
        default: null
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
        maxlength: [1000, 'Location cannot exceed 1000 characters']
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
        uppercase: true,
        maxlength: [10, 'State code cannot exceed 10 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    evidence: {
        type: [String],
        default: [],
        validate: {
            validator: function(arr) {
                return arr.length <= 20;
            },
            message: 'Maximum 20 evidence files allowed'
        }
    },
    status: {
        type: String,
        default: 'registered',
        trim: true
    },
    assignedOfficer: {
        type: String,
        default: '',
        trim: true
    },
    priority: {
        type: String,
        default: 'medium',
        trim: true
    },
    notes: {
        type: [String],
        default: []
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for evidence count
reportSchema.virtual('evidenceCount').get(function() {
    return this.evidence ? this.evidence.length : 0;
});

// Virtual for formatted date
reportSchema.virtual('formattedCreatedAt').get(function() {
    return this.createdAt ? this.createdAt.toLocaleDateString('en-IN') : '';
});

// Pre-save middleware to update lastUpdated
reportSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.lastUpdated = new Date();
    }
    next();
});


// Compound indexes for better query performance
reportSchema.index({ email: 1, createdAt: -1 });        // User cases query
reportSchema.index({ state: 1, crimeType: 1 });         // Regional reports
reportSchema.index({ status: 1, createdAt: -1 });       // Admin dashboard
reportSchema.index({ createdAt: -1 });                  // General sorting


// Static method to get reports by email
reportSchema.statics.findByUser = function(email) {
    return this.find({ email: email.toLowerCase() }).sort({ createdAt: -1 });
};

// Instance method to add evidence
reportSchema.methods.addEvidence = function(filename) {
    if (this.evidence.length >= 20) {
        throw new Error('Maximum evidence files limit reached');
    }
    this.evidence.push(filename);
    return this.save();
};

// Instance method to update status with note
reportSchema.methods.updateStatus = function(newStatus, note = '') {
    this.status = newStatus;
    if (note) {
        this.notes.push(`${new Date().toISOString()}: Status changed to ${newStatus} - ${note}`);
    }
    return this.save();
};



// Create and export the model
const Report = mongoose.model('Report', reportSchema);

module.exports = Report;