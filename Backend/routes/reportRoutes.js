const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Enhanced file filter with better error messages
const fileFilter = (req, file, cb) => {
    console.log('Processing file:', file.originalname, 'Type:', file.mimetype); // Debug log
    
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} not allowed. Only images, PDF, and Word documents are allowed.`));
    }
};

// Configure multer with enhanced settings
const upload = multer({
    storage,
    fileFilter,
    limits: { 
        fileSize: 10 * 1024 * 1024, // 10 MB max
        files: 10 // Allow up to 10 files (5 regular uploads + 5 camera photos)
    }
});

// Middleware to handle multer errors
const handleUploadErrors = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        console.error('Multer error:', error);
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB per file.'
            });
        } else if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 10 files allowed.'
            });
        }
    } else if (error) {
        console.error('Upload error:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    next();
};

// Enhanced middleware to log request details
const logRequest = (req, res, next) => {
    console.log('=== Report Submission Request ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Body keys:', Object.keys(req.body));
    console.log('Files count:', req.files ? req.files.length : 0);
    if (req.files) {
        req.files.forEach((file, index) => {
            console.log(`File ${index}:`, {
                fieldname: file.fieldname,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            });
        });
    }
    console.log('================================');
    next();
};

// Report submission route with enhanced error handling
router.post('/submit-report', 
    logRequest,
    upload.fields([
        { name: 'evidence', maxCount: 5 },
        { name: 'photo_0', maxCount: 1 },
        { name: 'photo_1', maxCount: 1 },
        { name: 'photo_2', maxCount: 1 },
        { name: 'photo_3', maxCount: 1 },
        { name: 'photo_4', maxCount: 1 }
    ]),
    handleUploadErrors,
    reportController.submitReport
);

// Alternative route for handling individual photo uploads
router.post('/submit-report-simple', 
    logRequest,
    upload.array('files', 10), // Handle all files in a single array
    handleUploadErrors,
    reportController.submitReport
);

// Get user cases route
router.get('/user-cases', reportController.getUserCases);

// Get single report by ID
router.get('/:reportId', reportController.getReportById);

// Debug route to get all reports (remove in production)
router.get('/admin/all-reports', reportController.getAllReports);

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Reports service is running',
        timestamp: new Date().toISOString(),
        uploadsDir: uploadsDir
    });
});

module.exports = router;