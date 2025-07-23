const fs = require('fs');
const path = require('path');
const Report = require('../models/Report');
const transporter = require('../config/email');

// Submit new report
exports.submitReport = async (req, res) => {
    try {
        const { name, email, phone, crimeType, date, time, location, state, description } = req.body;
        
        // Process evidence files
        const evidence = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => evidence.push(file.filename));
        }

        // Process base64 images
        const base64Images = Object.entries(req.body)
            .filter(([key]) => key.startsWith('cameraImage'))
            .map(([_, val]) => val);
        
        base64Images.forEach((base64Data, index) => {
            const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(cleanBase64, 'base64');
            const fileName = `camera_${Date.now()}_${index}.jpg`;
            fs.writeFileSync(path.join('uploads', fileName), buffer);
            evidence.push(fileName);
        });

        // Generate report ID
        const reportId = `${state}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        
        // Create and save report
        const newReport = new Report({
            reportId, name, email, phone, crimeType,
            date: date && time ? `${date}T${time}:00` : null,
            location, state, description, evidence
        });
        
        await newReport.save();

        // Send confirmation email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Report Submitted: ${reportId}`,
            text: `Thank you for submitting your report.\n\nReport ID: ${reportId}`
        });

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully',
            reportId
        });

    } catch (error) {
        console.error('Report submission failed:', error);
        res.status(400).json({
            success: false,
            message: error.message
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
        if (!userEmail) return res.status(400).json({ message: 'Email required' });

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
            .select('reportId name email crimeType status createdAt')
            .lean();

        res.status(200).json({
            success: true,
            reports,
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