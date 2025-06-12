const Report = require('../models/Report');

exports.submitReport = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        console.log('Uploaded Files:', req.files);

        const reportData = req.body;
        reportData.evidence = req.files.map(file => file.path);

        console.log('Report Data:', reportData);

        const newReport = new Report(reportData);
        await newReport.save();

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