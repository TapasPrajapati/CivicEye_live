const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    crimeType: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        default: null
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    evidence: {
        type: [String], // Array of filenames
        default: [],
        validate: {
            validator: function(arr) {
                return arr.length <= 10; // Maximum 10 evidence files
            },
            message: 'Maximum 10 evidence files allowed'
        }
    },
    status: {
        type: String,
        enum: ['registered', 'under_review', 'investigating', 'resolved', 'closed'],
        default: 'registered'
    },
    assignedOfficer: {
        type: String,
        default: '',
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    notes: {
        type: [String], // Array of investigation notes
        default: []
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true, // This adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for evidence count
reportSchema.virtual('evidenceCount').get(function() {
    return this.evidence ? this.evidence.length : 0;
});

// Virtual for formatted creation date
reportSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Pre-save middleware to update lastUpdated
reportSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.lastUpdated = new Date();
    }
    next();
});

// Index for better query performance
reportSchema.index({ email: 1, createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ state: 1, crimeType: 1 });

// Method to add evidence file
reportSchema.methods.addEvidence = function(filename) {
    if (this.evidence.length >= 10) {
        throw new Error('Maximum evidence files limit reached');
    }
    this.evidence.push(filename);
    return this.save();
};

// Method to remove evidence file
reportSchema.methods.removeEvidence = function(filename) {
    this.evidence = this.evidence.filter(file => file !== filename);
    return this.save();
};

// Method to update status
reportSchema.methods.updateStatus = function(newStatus, note = '') {
    this.status = newStatus;
    if (note) {
        this.notes.push(`Status changed to ${newStatus}: ${note} (${new Date().toISOString()})`);
    }
    return this.save();
};

// Static method to get reports by status
reportSchema.statics.findByStatus = function(status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to get reports by user email
reportSchema.statics.findByUser = function(email) {
    return this.find({ email: email.toLowerCase() }).sort({ createdAt: -1 });
};

// Static method to get statistics
reportSchema.statics.getStatistics = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
    
    const result = {
        total: 0,
        registered: 0,
        under_review: 0,
        investigating: 0,
        resolved: 0,
        closed: 0
    };
    
    stats.forEach(stat => {
        result[stat._id] = stat.count;
        result.total += stat.count;
    });
    
    return result;
};

module.exports = mongoose.model('Report', reportSchema);