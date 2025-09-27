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
        // Log incoming request details
        console.log('Headers:', req.headers);
        console.log('Body keys:', Object.keys(req.body));
        console.log('Files:', req.files ? req.files.length : 0);
        console.log('Content-Type:', req.get('Content-Type'));

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

        // Detailed field validation
        const missingFields = [];
        if (!name || name.trim() === '') missingFields.push('name');
        if (!email || email.trim() === '') missingFields.push('email');
        if (!phone || phone.trim() === '') missingFields.push('phone');
        if (!crimeType || crimeType.trim() === '') missingFields.push('crimeType');
        if (!location || location.trim() === '') missingFields.push('location');
        if (!state || state.trim() === '') missingFields.push('state');
        if (!description || description.trim() === '') missingFields.push('description');

        if (missingFields.length > 0) {
            console.log('Missing required fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        console.log('All required fields present');

        // Process evidence files
        const evidence = [];
        
        // Handle regular file uploads
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            req.files.forEach((file, index) => {
                console.log(`Processing uploaded file ${index}:`, {
                    fieldname: file.fieldname,
                    originalname: file.originalname,
                    filename: file.filename,
                    size: file.size
                });
                evidence.push(file.filename);
            });
        }

        // Handle multer.fields() format
        if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
            Object.keys(req.files).forEach(fieldName => {
                const fileArray = req.files[fieldName];
                if (Array.isArray(fileArray)) {
                    fileArray.forEach((file, index) => {
                        console.log(`Processing field file ${fieldName}[${index}]:`, {
                            fieldname: file.fieldname,
                            originalname: file.originalname,
                            filename: file.filename,
                            size: file.size
                        });
                        evidence.push(file.filename);
                    });
                }
            });
        }

        // Process base64 camera images from form body
        const processBase64Image = (base64Data, identifier) => {
            try {
                if (!base64Data || !base64Data.includes('data:image/')) {
                    return null;
                }

                const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(cleanBase64, 'base64');
                const fileName = `camera_${identifier}_${Date.now()}.jpg`;
                
                // Ensure uploads directory exists
                const uploadsDir = path.join(__dirname, '..', 'uploads');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                    console.log('Created uploads directory:', uploadsDir);
                }
                
                const filePath = path.join(uploadsDir, fileName);
                fs.writeFileSync(filePath, buffer);
                
                console.log(`Saved camera image: ${fileName}, size: ${buffer.length} bytes`);
                return fileName;
            } catch (error) {
                console.error(`Error processing base64 image ${identifier}:`, error.message);
                return null;
            }
        };

        // Check for individual photo fields
        Object.keys(req.body).forEach(key => {
            if (key.startsWith('photo_') && req.body[key]) {
                const fileName = processBase64Image(req.body[key], key);
                if (fileName) {
                    evidence.push(fileName);
                }
            }
        });

        // Check for camera-images JSON field
        if (req.body['camera-images']) {
            try {
                const cameraImages = JSON.parse(req.body['camera-images']);
                if (Array.isArray(cameraImages)) {
                    console.log(`Processing ${cameraImages.length} camera images from JSON`);
                    cameraImages.forEach((base64Data, index) => {
                        const fileName = processBase64Image(base64Data, `json_${index}`);
                        if (fileName) {
                            evidence.push(fileName);
                        }
                    });
                }
            } catch (jsonError) {
                console.error('Error parsing camera-images JSON:', jsonError.message);
            }
        }

        console.log(`Total evidence files collected: ${evidence.length}`);
        console.log('Evidence files:', evidence);

        // Generate unique report ID
        const reportId = `${state.toUpperCase()}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        console.log('Generated report ID:', reportId);

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

        console.log('Report data prepared:', JSON.stringify({
            ...reportData,
            evidence: `${evidence.length} files`
        }, null, 2));

        // Create and save report
        console.log('Creating new report document...');
        const newReport = new Report(reportData);
        
        console.log('Saving to database...');
        const savedReport = await newReport.save();
        
        console.log('Report saved successfully:', {
            id: savedReport._id,
            reportId: savedReport.reportId,
            evidenceCount: savedReport.evidence.length
        });

        // Try to send confirmation email (optional)
        try {
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
                        <p><strong>Evidence Files:</strong> ${evidence.length}</p>
                        <p>You will receive updates as your case progresses.</p>
                        <p>Best regards,<br>CivicEye Team</p>
                    `
                });
                console.log('Confirmation email sent successfully');
            }
        } catch (emailError) {
            console.error('Email sending failed (continuing anyway):', emailError.message);
        }

        // Send success response
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

        console.log('Sending success response');
        res.status(201).json(response);
        
        console.log('=== REPORT SUBMISSION SUCCESS ===');

    } catch (error) {
        console.error('=== REPORT SUBMISSION ERROR ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Handle specific error types
        let statusCode = 500;
        let message = 'Report submission failed. Please try again.';

        if (error.name === 'ValidationError') {
            statusCode = 400;
            message = `Validation error: ${error.message}`;
        } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            statusCode = 500;
            message = 'Database error. Please try again.';
        } else if (error.code === 11000) {
            statusCode = 409;
            message = 'Report ID already exists. Please try again.';
        }

        console.error('=== END ERROR ===');

        res.status(statusCode).json({
            success: false,
            message: message,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            debug: process.env.NODE_ENV === 'development' ? {
                name: error.name,
                stack: error.stack.split('\n').slice(0, 3).join('\n')
            } : undefined
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