const fs = require('fs');
const path = require('path');
const Report = require('../models/Report');
const transporter = require('../config/email');

// Submit new report
exports.submitReport = async (req, res) => {
    try {
        const { name, email, phone, crimeType, date, time, location, state, description } = req.body;
        
        console.log('Received report submission:', { name, email, crimeType }); // Debug log
        
        // Process evidence files from regular file uploads
        const evidence = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                evidence.push(file.filename);
                console.log('Added uploaded file:', file.filename); // Debug log
            });
        }

        // Process base64 images from camera captures
        const base64Images = [];
        
        // Check for base64 image data in request body
        Object.keys(req.body).forEach(key => {
            if (key.startsWith('photo_') || key.startsWith('cameraImage')) {
                const base64Data = req.body[key];
                if (base64Data && base64Data.includes('data:image/')) {
                    base64Images.push(base64Data);
                }
            }
        });

        // Also check for files with base64 data
        if (req.files) {
            req.files.forEach(file => {
                if (file.fieldname && file.fieldname.startsWith('photo_')) {
                    // This handles base64 images sent as files
                    evidence.push(file.filename);
                }
            });
        }
        
        // Process base64 images and save them as files
        base64Images.forEach((base64Data, index) => {
            try {
                const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(cleanBase64, 'base64');
                const fileName = `camera_${Date.now()}_${index}.jpg`;
                const filePath = path.join('uploads', fileName);
                
                // Ensure uploads directory exists
                const uploadsDir = path.join(__dirname, '..', 'uploads');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }
                
                fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
                evidence.push(fileName);
                console.log('Saved camera image:', fileName); // Debug log
            } catch (imageError) {
                console.error('Error processing base64 image:', imageError);
                // Continue processing other images even if one fails
            }
        });

        // Generate report ID
        const reportId = `${state}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        
        console.log('Generated report ID:', reportId); // Debug log
        console.log('Evidence files:', evidence); // Debug log
        
        // Create and save report
        const newReport = new Report({
            reportId,
            name,
            email,
            phone,
            crimeType,
            date: date && time ? `${date}T${time}:00` : null,
            location,
            state,
            description,
            evidence: evidence, // This will now include all uploaded files and camera photos
            status: 'registered',
            createdAt: new Date()
        });
        
        const savedReport = await newReport.save();
        console.log('Report saved successfully:', savedReport._id); // Debug log

        // Send confirmation email (with error handling)
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Report Submitted: ${reportId}`,
                html: `
                    <h2>Report Submission Confirmation</h2>
                    <p>Thank you for submitting your report.</p>
                    <p><strong>Report ID:</strong> ${reportId}</p>
                    <p><strong>Status:</strong> Registered</p>
                    <p>You will receive updates as your case progresses.</p>
                `
            });
            console.log('Confirmation email sent to:', email); // Debug log
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the entire request if email fails
        }

        // Send success response with proper status
        res.status(201).json({
            success: true,
            message: 'Report submitted successfully',
            reportId: reportId,
            evidenceCount: evidence.length,
            data: {
                reportId,
                status: 'registered',
                evidenceFiles: evidence
            }
        });

    } catch (error) {
        console.error('Report submission failed:', error);
        
        // Send proper error response
        res.status(500).json({
            success: false,
            message: 'Report submission failed. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get report by ID
exports.getReportById = async (req, res) => {
    try {
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
                assignedOfficer: report.assignedOfficer || ''
            }
        });
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
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
                message: 'Email required' 
            });
        }

        const cases = await Report.find({ email: userEmail })
            .sort({ createdAt: -1 })
            .select('-__v')
            .lean();

        res.status(200).json({
            success: true,
            cases: cases.map(c => ({
                ...c,
                status: c.status || 'registered',
                evidence: c.evidence || []
            }))
        });
    } catch (error) {
        console.error('Error fetching user cases:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cases'
        });
    }
};

// Get all reports (admin)
exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find({})
            .select('reportId name email crimeType status createdAt evidence')
            .lean();

        res.status(200).json({
            success: true,
            reports: reports.map(report => ({
                ...report,
                evidenceCount: report.evidence ? report.evidence.length : 0
            })),
            count: reports.length
        });
    } catch (error) {
        console.error('Error fetching all reports:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};