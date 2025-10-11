const fs = require('fs');
const path = require('path');

// Make sure to import your Report model correctly
let Report;
try {
    Report = require('../models/Report');
} catch (error) {
    console.error('Error importing Report model:', error);
    // Fallback - create a simple model if import fails
    const mongoose = require('mongoose');
    
    const reportSchema = new mongoose.Schema({
        reportId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        crimeType: { type: String, required: true },
        date: { type: Date },
        location: { type: String, required: true },
        state: { type: String, required: true },
        description: { type: String, required: true },
        evidence: { type: [String], default: [] },
        status: { type: String, default: 'registered' }
    }, { timestamps: true });
    
    Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
}

// Submit new report - ROBUST VERSION
exports.submitReport = async (req, res) => {
    console.log('=== REPORT SUBMISSION START ===');
    
    try {
        // Extract basic fields with validation
        const { 
            name, 
            email, 
            phone, 
            crimeType, 
            date, 
            time, 
            location, 
            state, 
            description,
            consent 
        } = req.body;

        // Quick validation
        const missingFields = [];
        if (!name?.trim()) missingFields.push('name');
        if (!email?.trim()) missingFields.push('email');
        if (!phone?.trim()) missingFields.push('phone');
        if (!crimeType?.trim()) missingFields.push('crimeType');
        if (!location?.trim()) missingFields.push('location');
        if (!state?.trim()) missingFields.push('state');
        if (!description?.trim()) missingFields.push('description');

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Generate unique report ID
        const reportId = `${state.toUpperCase()}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

        // Process evidence files quickly
        const evidence = [];
        
        // Handle regular file uploads
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach((file) => {
                evidence.push(file.filename);
            });
        }

        // Handle multer.fields() format
        if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
            Object.keys(req.files).forEach(fieldName => {
                const fileArray = req.files[fieldName];
                if (Array.isArray(fileArray)) {
                    fileArray.forEach((file) => {
                        evidence.push(file.filename);
                    });
                }
            });
        }

        // Prepare report data
        const reportData = {
            reportId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            crimeType: crimeType.trim(),
            date: (date && time) ? new Date(`${date}T${time}:00`) : null,
            location: location.trim(),
            state: state.trim().toUpperCase(),
            description: description.trim(),
            evidence: evidence,
            status: 'registered'
        };

        // Save to database FIRST
        const newReport = new Report(reportData);
        const savedReport = await newReport.save();
        
        console.log('Report saved successfully:', savedReport.reportId);

        // SEND SUCCESS RESPONSE IMMEDIATELY
        const response = {
            success: true,
            message: 'Report submitted successfully',
            reportId: reportId,
            evidenceCount: evidence.length,
            data: {
                reportId,
                status: 'registered',
                evidenceFiles: evidence,
                submittedAt: new Date().toISOString()
            }
        };

        console.log('Sending success response immediately');
        res.status(201).json(response);

        // PROCESS HEAVY OPERATIONS AFTER RESPONSE (NON-BLOCKING)
        setImmediate(async () => {
            try {
                // Process base64 camera images AFTER response
                if (req.body['camera-images']) {
                    const cameraImages = JSON.parse(req.body['camera-images'] || '[]');
                    const additionalFiles = [];
                    
                    for (let i = 0; i < cameraImages.length; i++) {
                        const base64Data = cameraImages[i];
                        const fileName = await processBase64ImageAsync(base64Data, `camera_${i}_${Date.now()}`);
                        if (fileName) {
                            additionalFiles.push(fileName);
                        }
                    }
                    
                    // Update report with additional files
                    if (additionalFiles.length > 0) {
                        await Report.findByIdAndUpdate(savedReport._id, {
                            $push: { evidence: { $each: additionalFiles } }
                        });
                        console.log('Added camera images:', additionalFiles.length);
                    }
                }

                // Send confirmation email AFTER response
                if (process.env.EMAIL_USER) {
                    const transporter = require('../config/email');
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: `Report Submitted: ${reportId}`,
                        html: `
                            <h2>Report Submission Confirmation</h2>
                            <p>Dear ${name},</p>
                            <p>Thank you for submitting your report to CivicEye.</p>
                            <p><strong>Report ID:</strong> ${reportId}</p>
                            <p><strong>Status:</strong> Registered</p>
                            <p>You will receive updates as your case progresses.</p>
                            <p>Best regards,<br>CivicEye Team</p>
                        `
                    });
                    console.log('Confirmation email sent after response');
                }
            } catch (asyncError) {
                console.error('Post-response processing error:', asyncError);
                // Don't affect the main response
            }
        });

        console.log('=== REPORT SUBMISSION SUCCESS (FAST) ===');

    } catch (error) {
        console.error('=== REPORT SUBMISSION ERROR ===');
        console.error('Error:', error.message);
        
        let statusCode = 500;
        let message = 'Report submission failed. Please try again.';

        if (error.name === 'ValidationError') {
            statusCode = 400;
            message = `Validation error: ${error.message}`;
        } else if (error.code === 11000) {
            statusCode = 409;
            message = 'Report ID already exists. Please try again.';
        }

        res.status(statusCode).json({
            success: false,
            message: message
        });
    }
};


// Get report by ID
exports.getReportById = async (req, res) => {
    try {
        console.log('Fetching report by ID:', req.params.reportId);
        
        const report = await Report.findOne({ reportId: req.params.reportId });
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: `Report ${req.params.reportId} not found`
            });
        }

        res.status(200).json({
            success: true,
            data: {
                reportId: report.reportId,
                name: report.name,
                email: report.email,
                phone: report.phone,
                crimeType: report.crimeType,
                date: report.date,
                location: report.location,
                state: report.state,
                description: report.description,
                status: report.status || 'registered',
                evidence: report.evidence || [],
                createdAt: report.createdAt,
                updatedAt: report.updatedAt,
                assignedOfficer: report.assignedOfficer || ''
            }
        });
    } catch (error) {
        console.error('Error fetching report by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch report'
        });
    }
};

// Get user cases
exports.getUserCases = async (req, res) => {
    try {
        const userEmail = req.query.email || req.body.email;
        
        if (!userEmail) {
            return res.status(400).json({ 
                success: false,
                message: 'Email parameter is required' 
            });
        }

        console.log('Fetching cases for user:', userEmail);

        const cases = await Report.find({ 
            email: userEmail.toLowerCase() 
        })
        .sort({ createdAt: -1 })
        .select('-__v')
        .lean();

        console.log(`Found ${cases.length} cases for user`);

        res.status(200).json({
            success: true,
            count: cases.length,
            cases: cases.map(c => ({
                ...c,
                status: c.status || 'registered',
                evidence: c.evidence || [],
                evidenceCount: (c.evidence || []).length
            }))
        });
    } catch (error) {
        console.error('Error fetching user cases:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user cases'
        });
    }
};

// Get all reports (admin/debug)
exports.getAllReports = async (req, res) => {
    try {
        console.log('Fetching all reports...');
        
        const reports = await Report.find({})
            .select('reportId name email crimeType status createdAt evidence')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: reports.length,
            reports: reports.map(report => ({
                ...report,
                evidenceCount: report.evidence ? report.evidence.length : 0
            }))
        });
    } catch (error) {
        console.error('Error fetching all reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reports'
        });
    }
};

// OPTIMIZED REPORT CONTROLLER - FAST RESPONSE VERSION
exports.submitReport = async (req, res) => {
    console.log('=== REPORT SUBMISSION START ===');
    
    try {
        // Extract basic fields with validation
        const { 
            name, 
            email, 
            phone, 
            crimeType, 
            date, 
            time, 
            location, 
            state, 
            description,
            consent 
        } = req.body;

        // Quick validation
        const missingFields = [];
        if (!name?.trim()) missingFields.push('name');
        if (!email?.trim()) missingFields.push('email');
        if (!phone?.trim()) missingFields.push('phone');
        if (!crimeType?.trim()) missingFields.push('crimeType');
        if (!location?.trim()) missingFields.push('location');
        if (!state?.trim()) missingFields.push('state');
        if (!description?.trim()) missingFields.push('description');

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Generate unique report ID
        const reportId = `${state.toUpperCase()}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

        // Process evidence files quickly
        const evidence = [];
        
        // Handle regular file uploads
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach((file) => {
                evidence.push(file.filename);
            });
        }

        // Handle multer.fields() format
        if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
            Object.keys(req.files).forEach(fieldName => {
                const fileArray = req.files[fieldName];
                if (Array.isArray(fileArray)) {
                    fileArray.forEach((file) => {
                        evidence.push(file.filename);
                    });
                }
            });
        }

        // Prepare report data
        const reportData = {
            reportId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            crimeType: crimeType.trim(),
            date: (date && time) ? new Date(`${date}T${time}:00`) : null,
            location: location.trim(),
            state: state.trim().toUpperCase(),
            description: description.trim(),
            evidence: evidence,
            status: 'registered'
        };

        // Save to database FIRST
        const newReport = new Report(reportData);
        const savedReport = await newReport.save();
        
        console.log('Report saved successfully:', savedReport.reportId);

        // SEND SUCCESS RESPONSE IMMEDIATELY
        const response = {
            success: true,
            message: 'Report submitted successfully',
            reportId: reportId,
            evidenceCount: evidence.length,
            data: {
                reportId,
                status: 'registered',
                evidenceFiles: evidence,
                submittedAt: new Date().toISOString()
            }
        };

        console.log('Sending success response immediately');
        res.status(201).json(response);

        // PROCESS HEAVY OPERATIONS AFTER RESPONSE (NON-BLOCKING)
        setImmediate(async () => {
            try {
                // Process base64 camera images AFTER response
                if (req.body['camera-images']) {
                    const cameraImages = JSON.parse(req.body['camera-images'] || '[]');
                    const additionalFiles = [];
                    
                    for (let i = 0; i < cameraImages.length; i++) {
                        const base64Data = cameraImages[i];
                        const fileName = await processBase64ImageAsync(base64Data, `camera_${i}_${Date.now()}`);
                        if (fileName) {
                            additionalFiles.push(fileName);
                        }
                    }
                    
                    // Update report with additional files
                    if (additionalFiles.length > 0) {
                        await Report.findByIdAndUpdate(savedReport._id, {
                            $push: { evidence: { $each: additionalFiles } }
                        });
                        console.log('Added camera images:', additionalFiles.length);
                    }
                }

                // Send confirmation email AFTER response
                if (process.env.EMAIL_USER) {
                    const transporter = require('../config/email');
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: `Report Submitted: ${reportId}`,
                        html: `
                            <h2>Report Submission Confirmation</h2>
                            <p>Dear ${name},</p>
                            <p>Thank you for submitting your report to CivicEye.</p>
                            <p><strong>Report ID:</strong> ${reportId}</p>
                            <p><strong>Status:</strong> Registered</p>
                            <p>You will receive updates as your case progresses.</p>
                            <p>Best regards,<br>CivicEye Team</p>
                        `
                    });
                    console.log('Confirmation email sent after response');
                }
            } catch (asyncError) {
                console.error('Post-response processing error:', asyncError);
                // Don't affect the main response
            }
        });

        console.log('=== REPORT SUBMISSION SUCCESS (FAST) ===');

    } catch (error) {
        console.error('=== REPORT SUBMISSION ERROR ===');
        console.error('Error:', error.message);
        
        let statusCode = 500;
        let message = 'Report submission failed. Please try again.';

        if (error.name === 'ValidationError') {
            statusCode = 400;
            message = `Validation error: ${error.message}`;
        } else if (error.code === 11000) {
            statusCode = 409;
            message = 'Report ID already exists. Please try again.';
        }

        res.status(statusCode).json({
            success: false,
            message: message
        });
    }
};

// Async function to process base64 images
async function processBase64ImageAsync(base64Data, identifier) {
    return new Promise((resolve) => {
        try {
            if (!base64Data || !base64Data.includes('data:image/')) {
                resolve(null);
                return;
            }

            const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(cleanBase64, 'base64');
            const fileName = `camera_${identifier}.jpg`;
            
            const fs = require('fs');
            const path = require('path');
            const uploadsDir = path.join(__dirname, '..', 'uploads');
            
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            const filePath = path.join(uploadsDir, fileName);
            fs.writeFileSync(filePath, buffer);
            
            console.log(`Saved camera image: ${fileName}`);
            resolve(fileName);
        } catch (error) {
            console.error(`Error processing image ${identifier}:`, error.message);
            resolve(null);
        }
    });
}