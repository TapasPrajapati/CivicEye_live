const fs = require('fs');
const path = require('path');
const Report = require('../models/Report');

// Submit new report with extensive debugging
exports.submitReport = async (req, res) => {
    console.log('=== REPORT SUBMISSION DEBUG START ===');
    
    try {
        // Log all incoming data
        console.log('Request body keys:', Object.keys(req.body));
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('Request files:', req.files ? req.files.length : 'No files');
        if (req.files) {
            req.files.forEach((file, index) => {
                console.log(`File ${index}:`, {
                    fieldname: file.fieldname,
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    filename: file.filename
                });
            });
        }

        const { name, email, phone, crimeType, date, time, location, state, description } = req.body;
        
        // Validate required fields
        if (!name || !email || !phone || !crimeType || !location || !state || !description) {
            console.log('Missing required fields:', { name: !!name, email: !!email, phone: !!phone, crimeType: !!crimeType, location: !!location, state: !!state, description: !!description });
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        console.log('Basic validation passed');
        
        // Process evidence files from regular uploads
        const evidence = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                evidence.push(file.filename);
                console.log('Added uploaded file to evidence:', file.filename);
            });
        }

        // Check for base64 images in various possible locations
        console.log('Checking for base64 images...');
        
        // Method 1: Check body for photo_ fields
        Object.keys(req.body).forEach(key => {
            console.log(`Checking key: ${key}, type: ${typeof req.body[key]}, length: ${req.body[key] ? req.body[key].length : 0}`);
            if (key.startsWith('photo_') && req.body[key] && req.body[key].includes('data:image/')) {
                console.log(`Found base64 image in ${key}`);
                try {
                    const base64Data = req.body[key];
                    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
                    const buffer = Buffer.from(cleanBase64, 'base64');
                    const fileName = `camera_${Date.now()}_${key}.jpg`;
                    
                    // Ensure uploads directory exists
                    const uploadsDir = path.join(__dirname, '..', 'uploads');
                    if (!fs.existsSync(uploadsDir)) {
                        fs.mkdirSync(uploadsDir, { recursive: true });
                        console.log('Created uploads directory');
                    }
                    
                    const filePath = path.join(uploadsDir, fileName);
                    fs.writeFileSync(filePath, buffer);
                    evidence.push(fileName);
                    console.log(`Successfully saved camera image: ${fileName}, size: ${buffer.length} bytes`);
                } catch (imageError) {
                    console.error(`Error processing base64 image from ${key}:`, imageError);
                }
            }
        });

        // Method 2: Check for camera-images field (JSON string)
        if (req.body['camera-images']) {
            console.log('Found camera-images field:', req.body['camera-images']);
            try {
                const cameraImages = JSON.parse(req.body['camera-images']);
                if (Array.isArray(cameraImages) && cameraImages.length > 0) {
                    console.log(`Processing ${cameraImages.length} camera images from JSON`);
                    cameraImages.forEach((base64Data, index) => {
                        if (base64Data && base64Data.includes('data:image/')) {
                            try {
                                const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
                                const buffer = Buffer.from(cleanBase64, 'base64');
                                const fileName = `camera_json_${Date.now()}_${index}.jpg`;
                                
                                const uploadsDir = path.join(__dirname, '..', 'uploads');
                                if (!fs.existsSync(uploadsDir)) {
                                    fs.mkdirSync(uploadsDir, { recursive: true });
                                }
                                
                                const filePath = path.join(uploadsDir, fileName);
                                fs.writeFileSync(filePath, buffer);
                                evidence.push(fileName);
                                console.log(`Successfully saved camera image from JSON: ${fileName}`);
                            } catch (err) {
                                console.error(`Error processing camera image ${index}:`, err);
                            }
                        }
                    });
                }
            } catch (jsonError) {
                console.error('Error parsing camera-images JSON:', jsonError);
            }
        }

        console.log(`Total evidence files collected: ${evidence.length}`);
        console.log('Evidence files:', evidence);

        // Generate report ID
        const reportId = `${state}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        console.log('Generated report ID:', reportId);
        
        // Prepare report data
        const reportData = {
            reportId,
            name,
            email,
            phone,
            crimeType,
            date: date && time ? `${date}T${time}:00` : null,
            location,
            state,
            description,
            evidence,
            status: 'registered'
        };
        
        console.log('Report data to save:', JSON.stringify(reportData, null, 2));
        
        // Create and save report
        const newReport = new Report(reportData);
        const savedReport = await newReport.save();
        
        console.log('Report saved successfully with ID:', savedReport._id);

        // Try to send email (don't fail if this fails)
        try {
            // Only try to send email if transporter is configured
            if (process.env.EMAIL_USER) {
                const transporter = require('../config/email');
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
                console.log('Confirmation email sent successfully');
            } else {
                console.log('Email not configured, skipping email send');
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
                evidenceFiles: evidence
            }
        };
        
        console.log('Sending success response:', JSON.stringify(response, null, 2));
        res.status(201).json(response);
        
        console.log('=== REPORT SUBMISSION DEBUG END ===');

    } catch (error) {
        console.error('=== ERROR IN REPORT SUBMISSION ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('=== END ERROR ===');
        
        res.status(500).json({
            success: false,
            message: 'Report submission failed. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            debug: process.env.NODE_ENV === 'development' ? {
                name: error.name,
                stack: error.stack
            } : undefined
        });
    }
};

// Other controller methods remain the same
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