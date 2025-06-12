const Report = require('../models/Report');
const transporter = require('../config/email');

exports.submitReport = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        console.log('Uploaded Files:', req.files);

        const reportData = req.body;
        reportData.evidence = req.files.map(file => file.path);

        console.log('Report Data:', reportData);

        const newReport = new Report(reportData);
        await newReport.save();
        
        // Send email notification (non-blocking)
        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'pesak481@gmail.com',
            subject: 'New FIR Submitted - CivicEye',
            text: `New FIR Submitted:
                Name: ${reportData.name}
                Email: ${reportData.email}
                Phone: ${reportData.phone}
                Crime Type: ${reportData.crimeType}
                Date: ${reportData.date}
                Location: ${reportData.location}
                Description: ${reportData.description}
                Submitted At: ${new Date().toLocaleString()}`
        }).then(info => {
            console.log('Email sent:', info.response);
        }).catch(error => {
            console.error('Email failed:', error);
        });

        console.log('Report Saved:', newReport);

        res.status(201).json({ 
            message: 'Report submitted successfully', 
            reportId: newReport._id 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(400).send(error.message);
    }
};