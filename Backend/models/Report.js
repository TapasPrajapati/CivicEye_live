const mongoose = require('mongoose');

// Simple and robust Report schema
const reportSchema = new mongoose.Schema({
    reportId: {
        type: String,
        required: [true, 'Report ID is required'],
        unique: true,
        index: true
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
        index: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    crimeType: {
        type: String,
        required: [true, 'Crime type is required'],
        trim: true,
        enum: {
            values: [
                'theft', 'burglary', 'robbery', 'assault', 'vandalism', 
                'fraud', 'harassment', 'domestic_violence', 'drug_offense', 
                'cybercrime', 'traffic_violation', 'noise_complaint', 'other'
            ],
            message: 'Invalid crime type'
        }
    },
    date: {
        type: Date,
        default: null,
        validate: {
            validator: function(value) {
                return !value || value <= new Date();
            },
            message: 'Date cannot be in the future'
        }
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
        maxlength: [500, 'Location cannot exceed 500 characters']
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
        uppercase: true,
        maxlength: [3, 'State code cannot exceed 3 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [20, 'Description must be at least 20 characters'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    evidence: {
        type: [String],
        default: [],
        validate: {
            validator: function(arr) {
                return arr.length <= 10;
            },
            message: 'Maximum 10 evidence files allowed'
        }
    },
    status: {
        type: String,
        enum: {
            values: ['registered', 'under_review', 'investigating', 'resolved', 'closed'],
            message: 'Invalid status'
        },
        default: 'registered'
    },
    assignedOfficer: {
        type: String,
        default: '',
        trim: true
    },
    priority: {
        type: String,
        enum: {
            values: ['low', 'medium', 'high', 'urgent'],
            message: 'Invalid priority level'
        },
        default: 'medium'
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
    timestamps: true, // Automatically adds createdAt and updatedAt
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

// Index for better query performance
reportSchema.index({ email: 1, createdAt: -1 });
reportSchema.index({ state: 1, crimeType: 1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportId: 1 }, { unique: true });

// Static method to get reports by email
reportSchema.statics.findByUser = function(email) {
    return this.find({ email: email.toLowerCase() }).sort({ createdAt: -1 });
};

// Static method to get basic statistics
reportSchema.statics.getBasicStats = async function() {
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

// Instance method to add evidence
reportSchema.methods.addEvidence = function(filename) {
    if (this.evidence.length >= 10) {
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

// Error handling middleware
reportSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('Report ID already exists. Please try again.'));
    } else {
        next(error);
    }
});

// Create and export the model
const Report = mongoose.model('Report', reportSchema);

module.exports = Report;