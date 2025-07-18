const fs = require('fs');
const path = require('path');
const Report = require('../models/Report');
const transporter = require('../config/email');

exports.submitReport = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        console.log('Uploaded Files:', req.files);

        const {
            name, email, phone, crimeType, date,
            location, state, description
        } = req.body;

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
            date,
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
                Date: ${date}
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
