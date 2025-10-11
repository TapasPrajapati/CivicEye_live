const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    console.log(`Processing file: ${file.originalname}, type: ${file.mimetype}, field: ${file.fieldname}`);
    
    const allowedTypes = [
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/gif',
        'application/pdf', 
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.log(`Rejected file type: ${file.mimetype}`);
        cb(new Error(`File type ${file.mimetype} not allowed. Only images, PDF, and Word documents are supported.`));
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 10 // Max 10 files total
    }
});

// Error handling middleware
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        console.error('Multer error:', error);
        
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Maximum size is 10MB per file.'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Too many files. Maximum 10 files allowed.'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Unexpected file field.'
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: `Upload error: ${error.message}`
                });
        }
    } else if (error) {
        console.error('Other upload error:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'File upload error'
        });
    }
    next();
};

// Request logging middleware
const logRequest = (req, res, next) => {
    console.log('\n=== INCOMING REQUEST ===');
    console.log('Time:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Content-Length:', req.get('Content-Length'));
    console.log('Body keys:', Object.keys(req.body || {}));
    
    if (req.files) {
        if (Array.isArray(req.files)) {
            console.log('Files (array):', req.files.length);
            req.files.forEach((file, i) => {
                console.log(`  File ${i}:`, {
                    fieldname: file.fieldname,
                    originalname: file.originalname,
                    size: file.size,
                    mimetype: file.mimetype
                });
            });
        } else if (typeof req.files === 'object') {
            console.log('Files (object):', Object.keys(req.files));
            Object.entries(req.files).forEach(([field, files]) => {
                console.log(`  Field ${field}:`, files.length, 'files');
                files.forEach((file, i) => {
                    console.log(`    File ${i}:`, {
                        originalname: file.originalname,
                        size: file.size,
                        mimetype: file.mimetype
                    });
                });
            });
        }
    } else {
        console.log('Files: none');
    }
    console.log('========================\n');
    next();
};

// Main report submission route
router.post('/submit-report', 
    logRequest,
    upload.any(), // Accept any files with any field names
    handleMulterError,
    reportController.submitReport
);

// Alternative route with specific field names (backup)
router.post('/submit-report-alt',
    logRequest, 
    upload.fields([
        { name: 'evidence', maxCount: 5 },
        { name: 'photo_0', maxCount: 1 },
        { name: 'photo_1', maxCount: 1 },
        { name: 'photo_2', maxCount: 1 },
        { name: 'photo_3', maxCount: 1 },
        { name: 'photo_4', maxCount: 1 }
    ]),
    handleMulterError,
    reportController.submitReport
);

// Get user cases
router.get('/user-cases', reportController.getUserCases);

// Get specific report by ID
router.get('/:reportId', reportController.getReportById);

// Admin route to get all reports
router.get('/admin/all', reportController.getAllReports);

// Health check route
router.get('/health/check', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Reports API is running',
        timestamp: new Date().toISOString(),
        uploadsDir: uploadsDir,
        uploadsExists: fs.existsSync(uploadsDir)
    });
});

// Test route for debugging
router.post('/test', logRequest, (req, res) => {
    res.json({
        success: true,
        message: 'Test route working',
        body: req.body,
        files: req.files ? {
            count: Array.isArray(req.files) ? req.files.length : Object.keys(req.files).length,
            details: req.files
        } : null
    });
});

module.exports = router;