const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// Report submission route
router.post('/submit-report', upload.array('evidence'), reportController.submitReport);

module.exports = router;