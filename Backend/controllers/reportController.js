const fs = require('fs');
const path = require('path');
const Report = require('../models/Report');
const transporter = require('../config/email');

exports.submitReport = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        console.log('Uploaded Files:', req.files);

        const {
            name, email, phone, crimeType, date, time,
            location, state, description
        } = req.body;

        // Combine date and time into a datetime string
        const incidentDateTime = date && time ? `${date}T${time}:00` : null;

        const evidence = [];

        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                evidence.push(file.filename); 
            });
        }

        const base64Images = Object.entries(req.body)
            .filter(([key]) => key.startsWith('cameraImage'))
            .map(([_, val]) => val);

        base64Images.forEach((base64Data, index) => {
            const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(cleanBase64, 'base64');
            const fileName = `camera_${Date.now()}_${index}.jpg`;
            const filePath = path.join('uploads', fileName);

            fs.writeFileSync(filePath, buffer); 
            evidence.push(fileName); // Add filename to evidence list
        });

        const random6Digits = Math.floor(100000 + Math.random() * 900000);
        const year = new Date().getFullYear();
        const reportId = `${state}-${year}-${random6Digits}`;

        const newReport = new Report({
            reportId, 
            name,
            email,
            phone,
            crimeType,
            date: incidentDateTime,
            location,
            state,
            description,
            evidence
        });

        await newReport.save();

        // ✅ 4. Send email confirmation
        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'pesak481@gmail.com',
            subject: `New Report Submitted: ${newReport.reportId}`,
            text: `A new report has been filed.\n\nDetails:\n
                Name: ${name}
                Email: ${email}
                Phone: ${phone}
                Crime Type: ${crimeType}
                Date: ${incidentDateTime || 'N/A'}
                Location: ${location}
                State: ${state}
                Report ID: ${newReport.reportId}
                Submitted At: ${new Date().toLocaleString()}
            `
        }).then(info => {
            console.log('Email sent:', info.response);
        }).catch(error => {
            console.error('Email failed:', error);
        });

        res.status(201).json({
            message: 'Report submitted successfully',
            reportId: newReport.reportId
        });
    } catch (error) {
        console.error('Report submission failed:', error);
        res.status(400).send(error.message);
    }
};

exports.getUserCases = async (req, res) => {
    try {
        // Get user email from the request (you might want to get this from JWT token)
        const userEmail = req.query.email || req.body.email;
        
        console.log('Looking for cases with email:', userEmail);
        
        if (!userEmail) {
            return res.status(400).json({ message: 'User email is required' });
        }

        // First, let's see all reports in the database
        const allReports = await Report.find({}).select('email reportId createdAt');
        console.log('All reports in database:', allReports.map(r => ({ email: r.email, reportId: r.reportId })));

        // Find all reports for this user
        const userCases = await Report.find({ email: userEmail })
            .sort({ createdAt: -1 }) // Most recent first
            .select('-__v'); // Exclude version field

        console.log('Found cases for user:', userCases.length);

        // Transform the data to match frontend expectations
        const cases = userCases.map(report => ({
            reportId: report.reportId,
            crimeType: report.crimeType,
            date: report.date,
            time: report.time || 'N/A',
            location: report.location,
            state: report.state,
            description: report.description,
            status: report.status || 'registered', // Default to registered if no status
            evidence: report.evidence || [],
            createdAt: report.createdAt
        }));

        res.status(200).json({
            message: 'User cases retrieved successfully',
            cases: cases,
            debug: {
                requestedEmail: userEmail,
                totalReportsInDB: allReports.length,
                userReportsFound: userCases.length
            }
        });
    } catch (error) {
        console.error('Error fetching user cases:', error);
        res.status(500).json({ message: 'Failed to fetch user cases' });
    }
};

exports.getAllReports = async (req, res) => {
    try {
        const allReports = await Report.find({}).select('email reportId name crimeType createdAt');
        
        res.status(200).json({
            message: 'All reports retrieved',
            reports: allReports,
            count: allReports.length
        });
    } catch (error) {
        console.error('Error fetching all reports:', error);
        res.status(500).json({ message: 'Failed to fetch all reports' });
    }
};
